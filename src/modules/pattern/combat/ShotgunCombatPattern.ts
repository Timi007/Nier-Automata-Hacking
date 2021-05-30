import * as THREE from "three";
import { Enemy, ProjectileType } from "../../entities/Enemy";
import { GameTime } from "../../GameTime";
import { CombatPattern } from "./CombatPattern";

export class ShotgunCombatPattern extends CombatPattern {
    private readonly shotgunSpread: number = Math.PI / 2;
    private readonly stepAnglePerShot: number;
    private readonly startAngle: number;
    private readonly targetPos: THREE.Vector3 = new THREE.Vector3();
    private readonly fireDir: THREE.Vector3 = new THREE.Vector3();

    public constructor(projectilesPerShot: number, firingRate: number = 0.5, destructibleSpawnProbability: number = 0) {
        super(projectilesPerShot, firingRate, destructibleSpawnProbability);

        this.stepAnglePerShot = this.shotgunSpread / this.projectilesPerShot;
        this.startAngle = this.stepAnglePerShot * (this.projectilesPerShot - 1) / 2;
    }

    public update(enemy: Enemy, time: GameTime) {
        if (this.firingRateMillisPerShoot >= (time.totalElapsed - this.lastFiringTime)) {
            return;
        }
        this.lastFiringTime = time.totalElapsed;

        for (let i = 0; i < this.projectilesPerShot; i++) {
            let fireAngle = this.startAngle - this.stepAnglePerShot * i;

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
