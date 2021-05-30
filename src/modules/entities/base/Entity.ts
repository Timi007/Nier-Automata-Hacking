import * as THREE from 'three';
import { GameTime } from '../../GameTime';
import { EntityManager } from "../manager/EntityManager";
import { Projectile } from '../projectile/Projectile';

const FORWARD: THREE.Vector3 = new THREE.Vector3(0, 0, 1);
const LOOK_AT_UP: THREE.Vector3 = new THREE.Vector3(0, 1, 0);

// Helper objects for player rotation
const lookAtQuaternion: THREE.Quaternion = new THREE.Quaternion();
const targetRotation: THREE.Euler = new THREE.Euler();
const lookAtMatrix: THREE.Matrix4 = new THREE.Matrix4();
const _: THREE.Vector3 = new THREE.Vector3();

/**
 * The base for an entity.
 */
export abstract class Entity extends EventTarget {
    /**
     * The manager responsible for this entity.
     */
    public manager: EntityManager | null = null;
    /**
     * A value indicating if the entity is initialized.
     */
    public initialized: boolean = false;
    /**
     * The render component of the entity.
     */
    public readonly mesh: THREE.Mesh | null = null;
    /**
     * The child entities of the entity.
     */
    public readonly children: Entity[] = [];
    /**
     * The position of the entity.
     */
    public readonly position: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
    /**
     * The euler rotation of the entity.
     */
    public readonly rotation: THREE.Euler = new THREE.Euler(0, 0, 0);
    /**
     * The scale of the entity.
     */
    public readonly scale: THREE.Vector3 = new THREE.Vector3(1, 1, 1);
    /**
     * The bounding radius of the entity used to detect collision or hit detection.
     */
    public abstract readonly boundingRadius: number;
    /**
     * The bounding sphere of the entity used to detect collision or hit detection.
     */
    public abstract readonly boundingSphere: THREE.Sphere;

    protected _parent: Entity | null = null;

    private readonly _matrix: THREE.Matrix4 = new THREE.Matrix4();
    private readonly _direction: THREE.Vector3 = new THREE.Vector3();

    /**
     * Constructs a new entity.
     * @param mesh The render component of the entity.
     */
    protected constructor(mesh: THREE.Mesh | null = null) {
        super();

        this.mesh = mesh ?? null;
        if (this.mesh) {
            this.position.copy(this.mesh.position);
            this.rotation.copy(this.mesh.rotation);
            this.scale.copy(this.mesh.scale);
            this._matrix.copy(this.mesh.matrix);
        }
    }

    /**
     * Updates the state of the entity.
     * @param time The game time.
     */
    public update(time: GameTime): void {
        this.boundingSphere.center.copy(this.position);
    }

    /**
     * Initializes the state of the entity.
     * @param time The game time.
     */
    public init(time: GameTime): void {}

    /**
     * Rotates the entity so it looks at the given target position.
     * @param target The target position to look at.
     */
    public lookAt(target: THREE.Vector3) {
        lookAtMatrix.lookAt(this.position, target, LOOK_AT_UP);
        lookAtMatrix.decompose(_, lookAtQuaternion, _);
        targetRotation.setFromQuaternion(lookAtQuaternion);
        this.rotation.copy(targetRotation);
    }

    /**
     * Checks if this entity bounding sphere intersects with the passed entity bounding sphere.
     * @param entity The other entity to check intersection with.
     * @returns True if both entities intersect; otherwise false.
     */
    public intersects(entity: Entity): boolean {
        let distance2 = entity.position.distanceToSquared(entity.position);
        let minTestDistance2 = (entity.boundingRadius + entity.boundingRadius) ** 2;

        // First test: Check if entities are close enough
        if (distance2 > minTestDistance2) {
            return false;
        }

        // Second test: Check if the entities intersect
        return this.boundingSphere.intersectsSphere(entity.boundingSphere);
    }

    /**
     * Method called when this entity is hit by a projectile.
     * @param source The projectile that hit the entity.
     */
    public abstract onHit(source: Projectile): void;

    /**
     * The type name of the entity.
     */
    public get type(): string {
        return this.constructor.name;
    }

    /**
     * The parent of the entity. If entity has no parent, parent is null.
     */
    public get parent(): Entity | null {
        return this._parent;
    }

    /**
     * The local transform matrix holding information about position, rotation and scale.
     */
    public get matrix(): THREE.Matrix4 {
        let quaternion = new THREE.Quaternion().setFromEuler(this.rotation);
        this._matrix.compose(this.position, quaternion, this.scale);

        return this._matrix;
    }

    /**
     * The direction of entity's positive z-axis in world space.
     */
    public get direction(): THREE.Vector3 {
        this._direction.copy(FORWARD).applyEuler(this.rotation).normalize().negate();
        return this._direction;
    }

    /**
     * Adds the entity to this entity's children.
     * @param entity The entity to add.
     */
    public add(entity: Entity): Entity {
        entity._parent?.remove(entity);
        if (entity.mesh) {
            entity._parent?.mesh?.remove(entity.mesh);
            this.mesh?.add(entity.mesh);
        }
        this.children.push(entity);
        entity._parent = this;

        return this;
    }

    /**
     * Removes the entity from this entity's children.
     * @param entity The entity to remove.
     * @returns True if the entity was removed; otherwise false.
     */
    public remove(entity: Entity): boolean {
        let index = this.children.indexOf(entity);

        if (index < 0) {
            return false;
        }

        this.children.splice(index, 1);

        if (entity.mesh) {
            this.mesh?.remove(entity.mesh);
        }

        entity._parent = null;

        return true;
    }

}
