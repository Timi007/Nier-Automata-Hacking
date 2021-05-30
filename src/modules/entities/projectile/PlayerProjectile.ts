import * as THREE from "three";
import { OBB } from "three/examples/jsm/math/OBB";
import { GameTime } from "../../GameTime";
import { Entity } from "../base/Entity";
import { Projectile } from "./Projectile";

const PROJECTILE_SPEED: number = 0.017;

export class PlayerProjectile extends Projectile {
    public readonly boundingRadius: number;
    public readonly boundingSphere: THREE.Sphere;
    /**
     * The oriented bounding box (OBB) of the projectile used in the intersection test.
     */
    public readonly obb: OBB;

    /**
     * Constructs a new player projectile which flies in the given direction.
     * @param instigator The entity who shot the projectile.
     * @param position The starting position of the projectile.
     * @param direction The direction the projectile will fly towards.
     * @param rotation The rotation of the projectile.
     */
    public constructor(instigator: Entity, position: THREE.Vector3, direction: THREE.Vector3, rotation: THREE.Euler) {
        super(instigator, position, direction, PROJECTILE_SPEED);

        this.rotation.copy(rotation);

        this.boundingRadius = 0.5;
        this.boundingSphere = new THREE.Sphere(this.position.clone(), this.boundingRadius);

        // Set up oriented bounding box
        this.obb = new OBB();
        this.obb.halfSize.set(0.1, 0.1, 0.5);
        this.obb.rotation.setFromMatrix4(this.matrix);

    }

    public update(time: GameTime) {
        super.update(time);
        this.obb.center.copy(this.position);
    }

    public intersects(entity: Entity): boolean {
        return this.obb.intersectsSphere(entity.boundingSphere);
    }
}
