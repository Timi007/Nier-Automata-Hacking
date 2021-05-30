import * as THREE from "three";
import { Enemy, ProjectileType } from "../../entities/Enemy";
import { GameTime } from "../../GameTime";
import { CombatPattern } from "./CombatPattern";

const PROJECTILES_PER_SHOT = 1;

export class GatlingCombatPattern extends CombatPattern {
    private readonly fireDurationMillis: number;
    private readonly firePauseDurationMillis: number;
    private nextPauseTime: number = 0;
    private nextFiringTime: number = Infinity;
    private firingPhase: boolean = false;

    public constructor(firingRate: number, fireDuration: number = 1, firePauseDuration: number = 0.5, destructibleSpawnProbability: number = 0.5) {
        super(PROJECTILES_PER_SHOT, firingRate, destructibleSpawnProbability);

        this.fireDurationMillis = fireDuration * 1000;
        this.firePauseDurationMillis = firePauseDuration * 1000;
    }

    public update(enemy: Enemy, time: GameTime) {
        if (this.nextPauseTime < time.totalElapsed) {
            this.nextPauseTime = Infinity;
            this.nextFiringTime = time.totalElapsed + this.firePauseDurationMillis;
            this.firingPhase = false;
        } else if (this.nextFiringTime < time.totalElapsed) {
            this.nextPauseTime = time.totalElapsed + this.fireDurationMillis;
            this.nextFiringTime = Infinity;
            this.firingPhase = true;
        }

        if (!this.firingPhase || this.firingRateMillisPerShoot >= (time.totalElapsed - this.lastFiringTime)) {
            return;
        }
        this.lastFiringTime = time.totalElapsed;

        let type = Math.random() <= this.destructibleSpawnProbability ? ProjectileType.Destructible : ProjectileType.Indestructible;

        enemy.fire(enemy.direction.clone(), type);
    }
}
