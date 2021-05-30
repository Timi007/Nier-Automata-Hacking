import * as THREE from "three";
import { Entity } from "../base/Entity";
import { Projectile } from "./Projectile";

export abstract class EnemyProjectile extends Projectile {
    public readonly boundingRadius: number;
    public readonly boundingSphere: THREE.Sphere;

    /**
     * Constructs a new enemy projectile which flies in the given direction.
     * @param instigator The entity who shot the projectile.
     * @param position The starting position of the projectile.
     * @param direction The direction the projectile will fly towards.
     * @param maxSpeed The maximum speed the projectiles can travel in units/milliseconds.
     */
    protected constructor(instigator: Entity, position: THREE.Vector3, direction: THREE.Vector3, maxSpeed: number) {
        super(instigator, position, direction, maxSpeed);

        this.boundingRadius = 0.4;
        this.boundingSphere = new THREE.Sphere(this.position.clone(), this.boundingRadius);
    }
}
