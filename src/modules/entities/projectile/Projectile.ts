import * as THREE from "three";
import { Entity } from "../base/Entity";
import { MovingEntity } from "../base/MovingEntity";

export abstract class Projectile extends MovingEntity {
    /**
     * The entity who shot the projectile.
     */
    public readonly instigator: Entity;

    /**
     * Constructs a new projectile which flies in the given direction.
     * @param instigator The entity who shot the projectile.
     * @param position The starting position of the projectile.
     * @param direction The direction the projectile will fly towards.
     * @param maxSpeed The maximum speed the projectiles can travel in units/milliseconds.
     */
    protected constructor(instigator: Entity, position: THREE.Vector3, direction: THREE.Vector3, maxSpeed: number) {
        super(null, maxSpeed);

        this.instigator = instigator;

        this.position.copy(position);
        this.velocity.copy(direction).multiplyScalar(this.maxSpeed);
    }

    public onHit(source: Projectile) { }
}
