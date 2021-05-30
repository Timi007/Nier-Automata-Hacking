import * as THREE from "three";
import { Entity } from "../base/Entity";
import { EnemyProjectile } from "./EnemyProjectile";

const PROJECTILE_SPEED: number = 0.015;

export class DestructibleProjectile extends EnemyProjectile {
    /**
     * Constructs a new destructible projectile which flies in the given direction.
     * If it gets hit by a player projectile, the projectile will be destroyed.
     * @param instigator The entity who shot the projectile.
     * @param position The starting position of the projectile.
     * @param direction The direction the projectile will fly towards.
     */
    public constructor(instigator: Entity, position: THREE.Vector3, direction: THREE.Vector3) {
        super(instigator, position, direction, PROJECTILE_SPEED);
    }
}
