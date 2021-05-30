import { GameTime } from "../../GameTime";
import { Entity } from "../base/Entity";
import { IEntityManager } from "./IEntityManager";

export class EntityManager<T extends Entity = Entity> implements IEntityManager {

    protected _entities: T[] = [];

    public constructor() {
    }

    public get entities(): T[] {
        return this._entities;
    }

    public add(entity: T): void {
        this._entities.push(entity);
        entity.manager = this;
    }

    public remove(entity: T): boolean {
        let index = this._entities.indexOf(entity);

        if (index < 0) {
            return false;
        }

        this._entities.splice(index, 1);

        entity.manager = null;

        return true;
    }

    public clear() {
        for (const entity of this._entities) {
            entity.manager = null;
        }
        this._entities = [];
    }

    public getMeshes(): THREE.Mesh[] {
        let entityMeshes: THREE.Mesh[] = [];
        for (const entity of this._entities) {
            if (entity.mesh) {
                entityMeshes.push(entity.mesh);
            }
        }

        return entityMeshes;
    }

    public update(time: GameTime, updateMesh: boolean = true) {
        for (let i = this._entities.length - 1; i >= 0; i--) {
            let entity = this._entities[i];

            this.updateEntity(entity, time, updateMesh);
        }
    }

    /**
     * Updates the state of a single entity.
     * @param entity The entity to update.
     * @param time The game time.
     * @param updateMesh A value indicating if the render component should also be updated. (Default: true)
     */
    public updateEntity<T extends Entity>(entity: T, time: GameTime, updateMesh: boolean = true) {
        if (!entity.initialized) {
            entity.init(time);
            entity.initialized = true;
        }

        entity.update(time);
        if (updateMesh) {
            this.updateEntityMesh(entity);
        }

        for (let j = entity.children.length - 1; j >= 0; j--) {
            let child = entity.children[j];

            this.updateEntity(child, time, false);
        }
    }

    private updateEntityMesh<T extends Entity>(entity: T) {
        if (!entity.mesh) {
            return;
        }

        entity.mesh.position.copy(entity.position);
        entity.mesh.rotation.copy(entity.rotation);
        entity.mesh.scale.copy(entity.scale);
        entity.mesh.updateMatrix();
    }
}
