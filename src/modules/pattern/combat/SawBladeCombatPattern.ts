import * as THREE from "three";
import { Enemy, ProjectileType } from "../../entities/Enemy";
import { GameTime } from "../../GameTime";
import { CombatPattern } from "./CombatPattern";

export class SawBladeCombatPattern extends CombatPattern {
    private readonly rotationSpeed: number;
    private readonly stepAnglePerShot: number;
    private readonly targetPos: THREE.Vector3 = new THREE.Vector3();
    private readonly fireDir: THREE.Vector3 = new THREE.Vector3();

    public constructor(projectilesPerShot: number, firingRate: number = 10, rotationSpeed: number = 1, destructibleSpawnProbability: number = 0) {
        super(projectilesPerShot, firingRate, destructibleSpawnProbability);

        this.rotationSpeed = rotationSpeed / 1000;

        this.stepAnglePerShot = 2 * Math.PI / this.projectilesPerShot;
    }

    public update(enemy: Enemy, time: GameTime) {
        if (this.firingRateMillisPerShoot >= (time.totalElapsed - this.lastFiringTime)) {
            return;
        }
        this.lastFiringTime = time.totalElapsed;

        for (let i = 0; i < this.projectilesPerShot; i++) {
            let fireAngle = this.stepAnglePerShot * i + time.totalElapsed * this.rotationSpeed;

            this.targetPos.copy(enemy.position);
            this.targetPos.x += Math.sin(fireAngle);
            this.targetPos.z += Math.cos(fireAngle);

            this.fireDir.copy(this.targetPos).sub(enemy.position).normalize();
            this.fireDir.applyEuler(enemy.rotation);

            let type = Math.random() <= this.destructibleSpawnProbability ? ProjectileType.Destructible : ProjectileType.Indestructible;

            enemy.fire(this.fireDir, type);
        }
    }
}
