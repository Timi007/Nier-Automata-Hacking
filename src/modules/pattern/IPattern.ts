import { GameTime } from "../GameTime";
import { Enemy } from "../entities/Enemy";

export interface IPattern {
    init(enemy: Enemy, time: GameTime): void;
    update(enemy: Enemy, time: GameTime): void;
}
