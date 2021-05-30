import { Enemy } from "../../entities/Enemy";
import { GameTime } from "../../GameTime";
import { MovementPattern } from "./MovementPattern";

export class InfinityMovementPattern extends MovementPattern {
    public constructor(radius: number, speed: number = 1) {
        super(radius, speed);
    }

    public update(enemy: Enemy, time: GameTime) {
        let t = this.speed * time.totalElapsed;
        enemy.position.x = Math.sin(t) * this.radius + this.initialPos.x;
        enemy.position.z = Math.sin(t) * Math.cos(t) * this.radius + this.initialPos.z;
    }
}
