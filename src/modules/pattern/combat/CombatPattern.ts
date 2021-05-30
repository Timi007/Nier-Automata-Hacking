import { GameTime } from "../../GameTime";
import { Enemy, ProjectileType } from "../../entities/Enemy";
import { IPattern } from "../IPattern";

export abstract class CombatPattern implements IPattern {
    public readonly firingRate: number;
    public readonly projectilesPerShot: number;
    protected lastFiringTime: number = 0;
    protected readonly firingRateMillisPerShoot: number;
    protected readonly destructibleSpawnProbability: number;

    protected constructor(projectilesPerShot: number, firingRate: number, destructibleSpawnProbability: number) {
        this.projectilesPerShot = projectilesPerShot;
        this.firingRate = firingRate;

        if (destructibleSpawnProbability < 0 || destructibleSpawnProbability > 1) {
            throw new Error("destructibleSpawnProbability must be between 0 and 1!");
        }

        this.destructibleSpawnProbability = destructibleSpawnProbability;

        this.firingRateMillisPerShoot = 1 / (this.firingRate / 1000);
    }

    public init(enemy: Enemy, time: GameTime) {
        this.lastFiringTime = time.totalElapsed; // Delay start volley
    }

    public abstract update(enemy: Enemy, time: GameTime): void;
}
