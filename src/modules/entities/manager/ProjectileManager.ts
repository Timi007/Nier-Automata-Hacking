import * as THREE from "three";
import { GameTime } from "../../GameTime";
import { Entity } from "../base/Entity";
import { Projectile } from "../projectile/Projectile";
import { EntityManager } from "./EntityManager";
import { IProjectileManager } from "./IProjectileManager";

export class ProjectileManager<T extends Projectile> extends EntityManager<T> implements IProjectileManager {
    public readonly sharedMesh: THREE.InstancedMesh;
    public readonly worldBoundary: THREE.Box3;
    private readonly maxProjectiles: number;

    public constructor(sharedMesh: THREE.InstancedMesh, worldBoundary: THREE.Box3) {
        super();

        this.worldBoundary = worldBoundary;
        this.sharedMesh = sharedMesh;

        this.maxProjectiles = sharedMesh.count;
    }

    public checkHits(hittableEntities: Entity[]): void {
        for (let i = this._entities.length - 1; i >= 0; i--) {
            let projectile = this._entities[i];

            for (let j = hittableEntities.length - 1; j >= 0; j--) {
                let entity = hittableEntities[j];

                if (entity === projectile.instigator) {
                    continue;
                }

                if (projectile.intersects(entity)) {
                    entity.onHit(projectile);
                    this.remove(projectile);
                    // No need to check with the others entities
                    break;
                }
            }
        }
    }

    public add(entity: T): void {
        if (this._entities.length >= this.maxProjectiles) {
            throw new Error(`Cannot add more than ${this.maxProjectiles} ${entity.type}!`);
        }

        super.add(entity);
    }

    public update(time: GameTime, updateMesh: boolean = true) {
        super.update(time, false);

        for (let i = this._entities.length - 1; i >= 0; i--) {
            let projectile = this._entities[i];

            if (!this.worldBoundary.containsPoint(projectile.position)) {
                this.remove(projectile);
                continue;
            }
        }

        if (!updateMesh) {
            this.sharedMesh.count = this._entities.length;
            return;
        }

        for (let i = 0; i < this._entities.length; i++) {
            let projectile = this._entities[i];
            this.sharedMesh.setMatrixAt(i, projectile.matrix);
        }

        this.sharedMesh.count = this._entities.length;
        this.sharedMesh.instanceMatrix.needsUpdate = true;
    }
}
