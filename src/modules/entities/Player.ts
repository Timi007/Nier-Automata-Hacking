import * as THREE from "three";
import { Game } from "../Game";
import { GameTime } from "../GameTime";
import { DEBUG_GOD_MODE } from "../Globals";
import { PlayerControls } from "../PlayerControls";
import { GameEntity } from "./base/GameEntity";
import { HealthIndicator } from "./HealthIndicator";
import { PlayerProjectile } from "./projectile/PlayerProjectile";
import { Projectile } from "./projectile/Projectile";

const DECELERATE_TOLERANCE: number = 0.1;
const DECELERATE_FORCE: number = 10;

// Helper objects for player rotation
const target: THREE.Vector3 = new THREE.Vector3();

const PLAYER_SPEED: number = 0.01;
const PLAYER_HEATH: number = 3;

export class PlayerEvent extends Event {
    public readonly player: Player;
    public constructor(player: Player, type: string, eventInitDict?: EventInit | undefined) {
        super(type, eventInitDict);

        this.player = player;
    }
}

export class Player extends GameEntity {
    /**
     * Keys of requested audio for this entity.
     */
    public static readonly NeededAudio = ['PlayerShot', 'PlayerHit1', 'PlayerHit2', 'PlayerDeath'];

    public readonly boundingRadius: number;
    public readonly boundingSphere: THREE.Sphere;
    /**
     * The input controls state.
     */
    public readonly controls: PlayerControls;
    /**
     * The attached health indicators.
     */
    public readonly healthIndicators: HealthIndicator[] = [];
    /**
     * The maximum firing rate in shoots per second.
     */
    public readonly firingRate: number = 8;

    private readonly hitSoundOrder: string[] = ['PlayerDeath', 'PlayerHit2', 'PlayerHit1'];
    private readonly firingRateMillisPerShoot: number;

    private lastFiringTime: number = 0;

    /**
     * Constructs a new player which can be controlled using the input controls handler.
     * @param game The game or world.
     * @param controls The input controls handler.
     * @param mesh The render component of the entity.
     */
    public constructor(game: Game, controls: PlayerControls, mesh: THREE.Mesh) {
        super(game, mesh, PLAYER_SPEED);

        this.controls = controls;

        this._health = PLAYER_HEATH;

        this.boundingRadius = 0.5;
        this.boundingSphere = new THREE.Sphere(this.position.clone(), this.boundingRadius);

        this.firingRateMillisPerShoot = 1 / (this.firingRate / 1000);
    }

    /**
     * Adds a new health indicator.
     * @param healthIndicators The health indicators to add.
     */
    public addHealthIndicator(...healthIndicators: HealthIndicator[]): void {
        for (const indicator of healthIndicators) {
            this.add(indicator);
            this.healthIndicators.push(indicator);
        }
    }

    public update(time: GameTime) {
        this.controlMovement(time);
        this.controlRotation();
        this.clampMovementNearBorder();

        if (this.controls.input.mouseDown) {
            this.fire(time);
        }

        this.handleHitEffect(time, 0x363636);

        super.update(time);
    }

    public onHit(source: Projectile) {
        if (DEBUG_GOD_MODE) {
            return;
        }

        if (this._health <= 0) {
            return;
        }

        this._health--;

        let healthIndicator = this.healthIndicators[this._health - 1];
        if (healthIndicator) {
            healthIndicator.mesh.visible = false;
        }

        this.playAudio(this.hitSoundOrder[this._health]);
        this.isHit = true;
        if (this._health === 0) {
            this.dispatchEvent(new PlayerEvent(this, 'death'));
        }
    }

    /**
     * Method called when player collides with enemy.
     */
    public onCollisionWithEnemy() {
        this._health = 0;

        for (const healthIndicator of this.healthIndicators) {
            healthIndicator.mesh.visible = false;
        }

        this.playAudio(this.hitSoundOrder[this._health]);
        this.isHit = true;
        this.dispatchEvent(new PlayerEvent(this, 'death'));
    }

    /**
     * Resets the player to its initial state.
     */
    public reset() {
        this._health = PLAYER_HEATH;

        for (const healthIndicator of this.healthIndicators) {
            healthIndicator.mesh.visible = true;
        }

        this.lastFiringTime = 0;

        this.position.set(0, 0, 0);
        this.rotation.set(0, 0, 0);
        this.velocity.set(0, 0, 0);
    }

    /**
     * Fires a projectile in looking direction and plays a sound.
     * @param time The game time.
     */
    private fire(time: GameTime) {
        if (this.firingRateMillisPerShoot < (time.totalElapsed - this.lastFiringTime)) {
            this.lastFiringTime = time.totalElapsed;

            let projectile = new PlayerProjectile(this, this.position, this.direction.clone(), this.rotation);
            this.game.addEntity(projectile);

            this.playAudio('PlayerShot');
        }
    }

    private clampMovementNearBorder() {
        let minX = this.game.worldBox.min.x + this.boundingRadius;
        let maxX = this.game.worldBox.max.x - this.boundingRadius;
        this.position.x = THREE.MathUtils.clamp(this.position.x, minX, maxX);

        let minZ = this.game.worldBox.min.z + this.boundingRadius;
        let maxZ = this.game.worldBox.max.z - this.boundingRadius;
        this.position.z = THREE.MathUtils.clamp(this.position.z, minZ, maxZ);
    }

    private controlMovement(time: GameTime) {
        let direction = new THREE.Vector3(0, 0, 0);
        if (this.controls.input.up) {
            direction.add(new THREE.Vector3(0, 0, -1));
        }
        if (this.controls.input.left) {
            direction.add(new THREE.Vector3(-1, 0, 0));
        }
        if (this.controls.input.down) {
            direction.add(new THREE.Vector3(0, 0, 1));
        }
        if (this.controls.input.right) {
            direction.add(new THREE.Vector3(1, 0, 0));
        }
        direction.normalize();

        if (direction.lengthSq() === 0) {
            // Decelerate
            this.velocity.x -= this.velocity.x * time.elapsed / 1000 * DECELERATE_FORCE;
            this.velocity.z -= this.velocity.z * time.elapsed / 1000 * DECELERATE_FORCE;

            if (Math.abs(this.velocity.x) < DECELERATE_TOLERANCE) {
                this.velocity.x = 0;
            }
            if (Math.abs(this.velocity.z) < DECELERATE_TOLERANCE) {
                this.velocity.z = 0;
            }
        } else {
            // Accelerate
            this.velocity.add(direction);
        }
    }

    private controlRotation() {
        target.set(this.controls.input.mouse.x, 0, this.controls.input.mouse.y).normalize();
        target.add(this.position);

        this.lookAt(target);
    }
}


