import { Enemy } from "../../entities/Enemy";
import { GameTime } from "../../GameTime";
import { MovementPattern } from "./MovementPattern";

export class StraightMovementPattern extends MovementPattern {
    public constructor(radius: number, speed: number = 1) {
        super(radius, speed);
    }

    public update(enemy: Enemy, time: GameTime) {
        let t = this.speed * time.totalElapsed;
        enemy.position.x = Math.sin(t) * this.radius + this.initialPos.x; // results to [-this.spread + this.initialPos.x, this.spread + this.initialPos.x]
    }
}
