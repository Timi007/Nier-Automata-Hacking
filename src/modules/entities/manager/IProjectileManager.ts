import { Entity } from "../base/Entity";
import { IEntityManager } from "./IEntityManager";

export interface IProjectileManager extends IEntityManager {
    /**
     * Checks if any projectile manages by the manager is hitting any entity in the passed list. If a projectiles hit an entity, the onHit method of the entity is called.
     * @param hittableEntities The entities the projectile could hit.
     */
    checkHits(hittableEntities: Entity[]): void;
}
