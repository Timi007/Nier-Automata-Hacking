import { GameTime } from "../../GameTime";
import { Entity } from "../base/Entity";

export interface IEntityManager {
    /**
     * The entities the manager is responsible for.
     */
    readonly entities: Entity[];
    /**
     * Adds the entity to the manager.
     * @param entity The entity to add.
     */
    add(entity: Entity): void;
    /**
     * Removes the entity from the manager.
     * @param entity The entity to remove.
     * @returns True if the entity was removed; otherwise false.
     */
    remove(entity: Entity): boolean;
    /**
     * Removes all entities from the manager.
     */
    clear(): void;
    /**
     * Returns the render components of all entities.
     * @returns Render components, in this case meshes, of all entities
     */
    getMeshes(): THREE.Mesh[];
    /**
     * Updates the state of all entities.
     * @param time The game time.
     * @param updateMesh A value indicating if the render components of all entities should also be updated.
     */
    update(time: GameTime, updateMesh: boolean): void;
}
