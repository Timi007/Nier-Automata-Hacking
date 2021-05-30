import { GameTime } from "../../GameTime";
import { Enemy } from "../../entities/Enemy";
import { IPattern } from "../IPattern";
import * as THREE from "three";

export abstract class MovementPattern implements IPattern {
    public speed: number;
    public radius: number;
    protected initialPos: THREE.Vector3 = new THREE.Vector3();

    protected constructor(radius: number, speed: number) {
        this.radius = radius;
        this.speed = speed / 1000;
    }

    public init(enemy: Enemy, time: GameTime) {
        this.initialPos.copy(enemy.position);
    }

    public abstract update(enemy: Enemy, time: GameTime): void;
}
