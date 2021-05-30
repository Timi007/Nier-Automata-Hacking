import * as THREE from "three";
import { Sphere } from "three";
import { Entity } from "./base/Entity";
import { Projectile } from "./projectile/Projectile";

export class HealthIndicator extends Entity {
    public readonly boundingRadius: number;
    public readonly boundingSphere: Sphere;
    public readonly mesh: THREE.Mesh;

    /**
     * The offset of the indicator relative to the parent which is usually the player object.
     */
    public readonly offset: THREE.Vector3 = new THREE.Vector3();

    /**
     * Constructs a new player health indicator.
     * @param offset The offset of the indicator relative to the parent which is usually the player object.
     * @param mesh The render component of the entity.
     */
    public constructor(offset: THREE.Vector3, mesh: THREE.Mesh) {
        super(mesh);

        this.mesh = mesh;

        this.offset.copy(offset);
        this.mesh.position.copy(offset);

        this.boundingRadius = 0;
        this.boundingSphere = new THREE.Sphere(this.position.clone(), this.boundingRadius);
    }

    public onHit(source: Projectile): void {}
}
