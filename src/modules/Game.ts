import * as THREE from "three";
import { DestructibleProjectile } from "./entities/projectile/DestructibleProjectile";
import { Entity } from "./entities/base/Entity";
import { EntityManager } from "./entities/manager/EntityManager";
import { IndestructibleProjectile } from "./entities/projectile/IndestructibleProjectile";
import { Player, PlayerEvent } from "./entities/Player";
import { PlayerProjectile } from "./entities/projectile/PlayerProjectile";
import { ProjectileManager } from "./entities/manager/ProjectileManager";
import { GameTime } from "./GameTime";
import { PlayerControls } from "./PlayerControls";
import { Enemy, EnemyEvent } from "./entities/Enemy";
import { IProjectileManager } from "./entities/manager/IProjectileManager";
import { IEntityManager } from "./entities/manager/IEntityManager";
import { PlayerGeometry } from "./geometry/PlayerGeometry";
import { HealthIndicator } from "./entities/HealthIndicator";
import { AudioProvider } from "./AudioProvider";
import { UiManager } from "./UiManager";
import { LevelManager } from "./LevelManager";
import { Renderer } from "./Renderer";
import { Guard } from "./entities/Guard";
import { GuardGeometry } from "./geometry/GuardGeometry";
import { EnemyCore } from "./entities/EnemyCore";
import Stats from 'three/examples/jsm/libs/stats.module';
import { DEBUG } from "./Globals";
import { ShieldShaderMaterial } from "./shaders/ShieldShaderMaterial";
import { Shield } from "./entities/Shield";

const MAX_PLAYER_PROJECTILES = 50;
const MAX_DESTRUCTIBLE_PROJECTILES = 100;
const MAX_INDESTRUCTIBLE_PROJECTILES = 100;

interface IProjectileManagerMap {
    [entityType: string]: IProjectileManager;
}

interface IBorder {
    vertical: THREE.InstancedMesh,
    horizontal: THREE.InstancedMesh,
}

export class Game {
    public readonly worldBox: THREE.Box3 = new THREE.Box3();
    public readonly worldDimension: THREE.Vector3 = new THREE.Vector3(15, 0, 15);
    public readonly player: Player;

    private readonly scene: THREE.Scene;
    private readonly camera: THREE.PerspectiveCamera;
    private readonly cameraOffset: THREE.Vector3 = new THREE.Vector3(0, 20, 10);
    private readonly playerStartPos: THREE.Vector3;
    private readonly renderer: Renderer;
    private readonly controls: PlayerControls;
    private readonly entityManager: IEntityManager;
    private readonly uiManager: UiManager;
    private readonly managerMap: IProjectileManagerMap = {};
    private readonly audioProvider: AudioProvider;
    private readonly gameTime: GameTime;
    private readonly levelManager: LevelManager;
    private readonly border: IBorder;

    private gameOver: boolean = false;
    private stopSimulation: boolean = false;
    private isInPauseMenu: boolean = false;

    private readonly stats: Stats;


    public constructor(uiManager: UiManager, audioProvider: AudioProvider, gameTime: GameTime) {
        this.uiManager = uiManager;
        this.audioProvider = audioProvider;
        this.gameTime = gameTime;

        this.bindThis();
        this.addUiEventHandlers();

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
        this.camera.add(this.audioProvider.listener);
        this.renderer = new Renderer(this.scene, this.camera);
        this.setWorldBox(this.worldDimension);

        this.playerStartPos = new THREE.Vector3(0, 0.5, this.worldDimension.z / 3);

        this.levelManager = new LevelManager(this);

        this.entityManager = new EntityManager();
        this.initProjectileManager(this.scene, this.managerMap, this.worldBox);

        this.controls = new PlayerControls();
        this.controls.activate();
        this.controls.addEventListener('pointerlock', this.onPointerLock);
        this.controls.addEventListener('pointerlockexit', this.onPointerLockExit);

        this.player = this.createPlayer(this.controls, this.playerStartPos);
        this.initCamera(this.playerStartPos);
        this.addEntity(this.player);

        this.scene.add(this.createAmbientLight());
        this.scene.add(this.createPointLight());
        this.scene.add(this.createFloor(this.worldDimension));

        this.border = {
            vertical: this.createVerticalBorder(this.worldDimension, 3),
            horizontal: this.createHorizontalBorder(this.worldDimension, 3),
        };
        this.scene.add(this.border.vertical, this.border.horizontal);

        this.stats = Stats();
        if (DEBUG) {
            document.body.appendChild(this.stats.domElement);
        }
    }

    private addUiEventHandlers() {
        this.uiManager.buttons.continue.addEventListener('click', this.onContinue);
        this.uiManager.buttons.gameOverRestart.addEventListener('click', this.onRestart);
        this.uiManager.buttons.gameCompleteRestart.addEventListener('click', this.onRestart);
        window.addEventListener('resize', this.onResize);
    }

    private bindThis() {
        this.gameLoop = this.gameLoop.bind(this);
        this.onPointerLock = this.onPointerLock.bind(this);
        this.onPointerLockExit = this.onPointerLockExit.bind(this);
        this.onContinue = this.onContinue.bind(this);
        this.onRestart = this.onRestart.bind(this);
        this.onResize = this.onResize.bind(this);

        this.onPlayerDeath = this.onPlayerDeath.bind(this);
        this.onEnemyCoreDeath = this.onEnemyCoreDeath.bind(this);
        this.onGuardDeath = this.onGuardDeath.bind(this);
    }

    private onPointerLock() {
        this.uiManager.hide(this.uiManager.screens.pauseMenu);
        this.stopSimulation = false;
        this.isInPauseMenu = false;
    }

    private onPointerLockExit() {
        this.controls.deactivate();
        this.stopSimulation = true;

        if (this.gameOver) {
            return;
        }

        this.uiManager.setLevel(this.levelManager.currentLevel);
        this.uiManager.show(this.uiManager.screens.pauseMenu);
        this.isInPauseMenu = true;
    }

    private onContinue() {
        this.controls.activate();
    }

    private onRestart() {
        this.cleanUp();
        this.levelManager.resetAndLoad();

        this.uiManager.hide(this.uiManager.screens.gameOver);
        this.uiManager.hide(this.uiManager.screens.gameComplete);

        this.gameOver = false;
        this.controls.activate();
    }

    private onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    private start() {
        this.stopSimulation = false;
        requestAnimationFrame(this.gameLoop);
    }

    public init() {
        this.levelManager.resetAndLoad();
        this.start();
    }

    private gameLoop(time: DOMHighResTimeStamp) {
        if (DEBUG) {
            this.stats.update();
        }

        this.gameTime.update(time, this.stopSimulation);
        if (!this.stopSimulation) {
            this.update(this.gameTime);
        }

        requestAnimationFrame(this.gameLoop);
    }

    private onGameOver() {
        this.gameOver = true;
        this.controls.deactivate();
        this.stopSimulation = true;
    }

    private setWorldBox(dimensions: THREE.Vector3) {
        let worldBoxMin = new THREE.Vector3(-dimensions.x / 2, 0, -dimensions.z / 2);
        let worldBoxMax = new THREE.Vector3(dimensions.x / 2, 1, dimensions.z / 2);
        this.worldBox.set(worldBoxMin, worldBoxMax);
    }

    private initCamera(initLookAt: THREE.Vector3) {
        this.camera.position.copy(initLookAt).add(this.cameraOffset);
        this.camera.lookAt(initLookAt);
    }

    public createEnemyCore(): EnemyCore {
        let audio = this.audioProvider.requestAudio(...EnemyCore.NeededAudio);

        const coreRadius = 0.5;
        let geometry = new THREE.SphereGeometry(coreRadius, 20, 20);
        let material = new THREE.MeshPhongMaterial({ color: 'grey' });
        let enemyMesh = new THREE.Mesh(geometry, material);
        enemyMesh.receiveShadow = true;
        enemyMesh.castShadow = true;
        enemyMesh.add(...audio.values());

        let shieldRadius = coreRadius + 0.25;
        let shield = this.createEnemyCoreShield(shieldRadius);

        let enemy = new EnemyCore(this, enemyMesh, shield);
        enemy.addEventListener('death', this.onEnemyCoreDeath as EventListener);
        enemy.audioMap = audio;

        return enemy;
    }

    private createEnemyCoreShield(radius: number) {
        let geometry = new THREE.SphereGeometry(radius, 20, 20);
        let material = new ShieldShaderMaterial();
        let mesh = new THREE.Mesh(geometry, material);

        let shield = new Shield(mesh, radius);

        return shield;
    }

    private onEnemyCoreDeath(event: EnemyEvent) {
        this.removeEntity(event.enemy);

        this.loadNextLevel();
    }

    public createGuard(): Guard {
        let audio = this.audioProvider.requestAudio(...Guard.NeededAudio);

        let geometry = new GuardGeometry();
        let material = new THREE.MeshPhongMaterial({ color: 'grey' });
        let guardMesh = new THREE.Mesh(geometry, material);
        guardMesh.receiveShadow = true;
        guardMesh.castShadow = true;
        guardMesh.add(...audio.values());

        let guard = new Guard(this, guardMesh);
        guard.addEventListener('death', this.onGuardDeath as EventListener);
        guard.audioMap = audio;

        return guard;
    }

    private onGuardDeath(event: EnemyEvent) {
        this.removeEntity(event.enemy);
    }

    private loadNextLevel() {
        this.uiManager.setLevel(this.levelManager.currentLevel);
        if (this.levelManager.currentLevel === this.levelManager.maxLevel) {
            // Game complete
            this.onGameOver();
            this.uiManager.show(this.uiManager.screens.gameComplete);
        } else {
            this.stopSimulation = true;
            this.uiManager.show(this.uiManager.screens.levelComplete);

            setTimeout(() => {
                this.cleanUp();
                this.levelManager.loadNextLevel();
                this.uiManager.hide(this.uiManager.screens.levelComplete);
                if (!this.isInPauseMenu) {
                    this.stopSimulation = false;
                }
            }, 1000);
        }
    }

    private cleanUp() {
        this.clearEntities();

        this.player.reset();
        this.player.position.copy(this.playerStartPos);
        this.initCamera(this.playerStartPos);
        this.addEntity(this.player);
    }

    private initProjectileManager(scene: THREE.Scene, managerMap: IProjectileManagerMap, worldBox: THREE.Box3) {
        let playerProjectileGeo = new THREE.PlaneGeometry(0.25, 1);
        playerProjectileGeo.rotateX(Math.PI / 2);
        let playerProjectileMat = new THREE.MeshPhongMaterial({ color: 0xfafa7d, shininess: 0, side: THREE.DoubleSide });
        let playerProjectileMesh = new THREE.InstancedMesh(playerProjectileGeo, playerProjectileMat, MAX_PLAYER_PROJECTILES);
        playerProjectileMesh.castShadow = true;
        playerProjectileMesh.layers.enable(Renderer.BLOOM_SCENE);
        scene.add(playerProjectileMesh);
        managerMap[PlayerProjectile.name] = new ProjectileManager<PlayerProjectile>(playerProjectileMesh, worldBox);

        let destructibleProjectileGeo = new THREE.SphereGeometry(0.4, 20, 20);
        let destructibleProjectileMat = new THREE.MeshPhongMaterial({ color: 0x995400, shininess: 0 });
        let destructibleProjectileMesh = new THREE.InstancedMesh(destructibleProjectileGeo, destructibleProjectileMat, MAX_DESTRUCTIBLE_PROJECTILES);
        destructibleProjectileMesh.layers.enable(Renderer.BLOOM_SCENE);
        scene.add(destructibleProjectileMesh);
        managerMap[DestructibleProjectile.name] = new ProjectileManager<DestructibleProjectile>(destructibleProjectileMesh, worldBox);

        let indestructibleProjectileGeo = new THREE.SphereGeometry(0.4, 20, 20);
        let indestructibleProjectileMat = new THREE.MeshPhongMaterial({ color: 0x230054, shininess: 0 });
        let indestructibleProjectileMesh = new THREE.InstancedMesh(indestructibleProjectileGeo, indestructibleProjectileMat, MAX_INDESTRUCTIBLE_PROJECTILES);
        indestructibleProjectileMesh.layers.enable(Renderer.BLOOM_SCENE);
        scene.add(indestructibleProjectileMesh);
        managerMap[IndestructibleProjectile.name] = new ProjectileManager<IndestructibleProjectile>(indestructibleProjectileMesh, worldBox);
    }

    private update(time: GameTime) {
        this.updateCamera();

        this.updateProjectileManager(time);

        this.entityManager.update(time, true);
        this.checkCollisionWithEnemies();

        this.renderer.render();
    }

    private updateProjectileManager(time: GameTime) {
        for (const projectileType of Object.keys(this.managerMap)) {
            let projectileManager = this.managerMap[projectileType];

            projectileManager.update(time, true);

            let hittableEntities: Entity[] = [];
            switch (projectileType) {
                case DestructibleProjectile.name:
                    let playerProjectileManager = this.managerMap[PlayerProjectile.name];
                    hittableEntities.push(this.player, ...playerProjectileManager.entities);
                    break;
                case IndestructibleProjectile.name:
                    hittableEntities.push(this.player);
                    break;
                default:
                    hittableEntities.push(...this.entityManager.entities);
                    break;
            }

            projectileManager.checkHits(hittableEntities);
        }
    }

    private updateCamera() {
        let newCameraPos = this.player.position.clone().add(this.cameraOffset);
        this.camera.position.lerp(newCameraPos, 0.03);
        this.camera.lookAt(this.camera.position.clone().sub(this.cameraOffset));
    }

    private createPointLight(): THREE.PointLight {
        let pointLight = new THREE.PointLight(0xffffff, 0.4, 50);
        pointLight.position.set(0, 25, -1);
        pointLight.castShadow = true;
        pointLight.shadow.camera.near = 0.1;
        pointLight.shadow.camera.far = 50;

        return pointLight;
    }

    private createAmbientLight(): THREE.AmbientLight {
        return new THREE.AmbientLight(0xdadada, 0.8);
    }

    public setWorldSize(width: number, depth: number) {
        if (width === this.worldDimension.x && depth === this.worldDimension.z) {
            return;
        }

        this.worldDimension.set(width, 0, depth);
        this.setWorldBox(this.worldDimension);

        this.scene.remove(this.border.vertical, this.border.horizontal);

        this.border.vertical = this.createVerticalBorder(this.worldDimension, 3);
        this.border.horizontal = this.createHorizontalBorder(this.worldDimension, 3);
        this.scene.add(this.border.vertical, this.border.horizontal);
    }

    private createFloor(dimension: THREE.Vector3): THREE.Mesh {
        let geometry = new THREE.PlaneGeometry(dimension.x * 5, dimension.z * 5);
        let material = new THREE.MeshPhongMaterial({ color: 0xd1c9b6 });
        let plane = new THREE.Mesh(geometry, material);
        plane.position.y = dimension.y;
        plane.rotation.x = -Math.PI / 2;
        plane.receiveShadow = true;

        return plane;
    }

    /**
     * Creates a vertical symmetrical border pattern.
     * @param lines Number of lines for one side (left or right).
     */
    private createVerticalBorder(dimension: THREE.Vector3, lines: number): THREE.InstancedMesh {
        const borderW = 1;
        const borderH = 1;

        let borderDepth = dimension.z * (lines + 1 + lines % 2);
        let border = this.createBorderMesh(borderW, borderH, borderDepth, lines);

        for (let i = 0, j = 0; i < lines; i++, j += 2) {
            let pos = new THREE.Vector3(dimension.x / 2 + borderW / 2 + dimension.x * i, borderH / 2, 0);

            // Left
            let m = new THREE.Matrix4();
            m.setPosition(-pos.x, pos.y, pos.z);
            border.setMatrixAt(j, m);

            // Right
            m.setPosition(pos.x, pos.y, pos.z);
            border.setMatrixAt(j + 1, m);
        }
        return border;
    }

    /**
     * Creates a horizontal symmetrical border pattern.
     * @param lines Number of lines for one side (up or down).
     */
    private createHorizontalBorder(dimension: THREE.Vector3, lines: number): THREE.InstancedMesh {
        const borderH = 1;
        const borderD = 1;

        let borderWidth = dimension.x * (lines + 1 + lines % 2);
        let border = this.createBorderMesh(borderWidth, borderH, borderD, lines);

        for (let i = 0, j = 0; i < lines; i++, j += 2) {
            let pos = new THREE.Vector3(0, borderH / 2, dimension.z / 2 + borderD / 2 + dimension.z * i);

            // Up
            let m = new THREE.Matrix4();
            m.setPosition(pos.x, pos.y, -pos.z);
            border.setMatrixAt(j, m);

            // Down
            m.setPosition(pos.x, pos.y, pos.z);
            border.setMatrixAt(j + 1, m);
        }
        return border;
    }

    private createBorderMesh(width: number, height: number, depth: number, lines: number): THREE.InstancedMesh {
        let geometry = new THREE.BoxGeometry(width, height, depth);
        let material = new THREE.MeshPhongMaterial({ color: 0xffffff });
        let border = new THREE.InstancedMesh(geometry, material, lines * 2);
        border.receiveShadow = true;
        border.castShadow = true;

        return border;
    }

    private createPlayer(controls: PlayerControls, initialPosition: THREE.Vector3): Player {
        let audio = this.audioProvider.requestAudio(...Player.NeededAudio);

        const height = 0.25;
        const scale = 0.75;
        let playerCoreMesh = this.createPlayerCoreMesh(height, scale);
        playerCoreMesh.add(...audio.values());

        const size = 0.15;
        let leftHealthMesh = this.createHealthIndicator(size, height, scale);
        let rightHealthMesh = this.createHealthIndicator(size, height, scale);

        let leftHealth = new HealthIndicator(new THREE.Vector3(-(0.5 - size), 0, 0.4 + size), leftHealthMesh);
        let rightHealth = new HealthIndicator(new THREE.Vector3(0.5 - size, 0, 0.4 + size), rightHealthMesh);

        let player = new Player(this, controls, playerCoreMesh);
        player.position.copy(initialPosition);
        player.addHealthIndicator(leftHealth, rightHealth);
        player.audioMap = audio;
        player.addEventListener('death', this.onPlayerDeath as EventListener);

        return player;
    }

    private onPlayerDeath(event: PlayerEvent) {
        this.onGameOver();
        this.uiManager.setLevel(this.levelManager.currentLevel);
        this.uiManager.show(this.uiManager.screens.gameOver);
    }

    private createHealthIndicator(size: number, height: number, scale: number): THREE.Mesh {
        let healthGeo = new THREE.BoxGeometry(size, height * scale, size);
        let healthMat = new THREE.MeshPhongMaterial({ color: 'white' });
        let healthMesh = new THREE.Mesh(healthGeo, healthMat);
        healthMesh.castShadow = true;
        healthMesh.receiveShadow = true;

        return healthMesh;
    }

    private createPlayerCoreMesh(height: number, scale: number): THREE.Mesh {
        let playerCoreGeo = new PlayerGeometry(height);
        playerCoreGeo.scale(scale, scale, scale);
        let playerCoreMat = new THREE.MeshPhongMaterial({ color: 'white' });
        let playerCoreMesh = new THREE.Mesh(playerCoreGeo, playerCoreMat);
        playerCoreMesh.castShadow = true;
        playerCoreMesh.receiveShadow = true;

        return playerCoreMesh;
    }

    private checkCollisionWithEnemies() {
        for (const enemy of this.entityManager.entities) {
            if (!(enemy instanceof Enemy)) {
                continue;
            }

            if (this.player.intersects(enemy)) {
                this.player.onCollisionWithEnemy();
                break;
            }
        }
    }

    private getResponsibleManager(entity: Entity): IEntityManager {
        return this.managerMap[entity.type] ?? this.entityManager;
    }

    public addEntity(...entities: Entity[]) {
        for (const entity of entities) {
            let manager = this.getResponsibleManager(entity);
            manager.add(entity);
            if (entity.mesh !== null) {
                this.scene.add(entity.mesh);
            }
        }
    }

    public removeEntity(...entities: Entity[]) {
        for (const entity of entities) {
            let manager = this.getResponsibleManager(entity);
            manager.remove(entity);
            if (entity.mesh !== null) {
                this.scene.remove(entity.mesh);
            }
        }
    }

    private clearEntities() {
        let entityMeshes = this.entityManager.getMeshes();
        for (const projectileManager of Object.values(this.managerMap)) {
            entityMeshes = entityMeshes.concat(projectileManager.getMeshes());
            projectileManager.clear();
        }

        this.entityManager.clear();
        this.scene.remove(...entityMeshes);
    }
}
