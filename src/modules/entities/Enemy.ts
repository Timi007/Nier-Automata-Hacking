import * as THREE from "three";
import { Game } from "../Game";
import { GameTime } from "../GameTime";
import { CombatPattern } from "../pattern/combat/CombatPattern";
import { MovementPattern } from "../pattern/movement/MovementPattern";
import { DestructibleProjectile } from "./projectile/DestructibleProjectile";
import { IndestructibleProjectile } from "./projectile/IndestructibleProjectile";
import { GameEntity } from "./base/GameEntity";
import { Player } from "./Player";

export enum ProjectileType {
    Indestructible = 'Indestructible',
    Destructible = 'Destructible'
}

export class EnemyEvent extends Event {
    public readonly enemy: Enemy;
    public constructor(enemy: Enemy, type: string, eventInitDict?: EventInit | undefined) {
        super(type, eventInitDict);

        this.enemy = enemy;
    }
}

export abstract class Enemy extends GameEntity {
    /**
     * The combat behavior of the entity.
     */
    public combatPattern: CombatPattern | null = null;
    /**
     * The movement behavior of the entity.
     */
    public movementPattern: MovementPattern | null = null;
    /**
     * The target entity to attack.
     */
    public target: Player | null = null;

    /**
     * Constructs a new enemy which has 10 health points.
     * @param game The game or world.
     * @param mesh The render component of the entity.
     */
    protected constructor(game: Game, mesh: THREE.Mesh) {
        super(game, mesh, 0);
    }

    public init(time: GameTime) {
        this.combatPattern?.init(this, time);
        this.movementPattern?.init(this, time);
    }

    public update(time: GameTime) {
        this.combatPattern?.update(this, time);
        this.movementPattern?.update(this, time);

        if (this.target) {
            this.lookAt(this.target.position);
        }

        super.update(time);
    }

    /**
     * Fires a projectile of given type in given direction and plays a sound.
     * @param direction The direction to fire the projectile.
     * @param projectileType The type of projectile.
     */
    public fire(direction: THREE.Vector3, projectileType: ProjectileType) {
        if (projectileType === ProjectileType.Destructible) {
            var projectile = new DestructibleProjectile(this, this.position, direction);
        } else {
            var projectile = new IndestructibleProjectile(this, this.position, direction);
        }
        this.playAudio('EnemyShot');
        this.game.addEntity(projectile);
    }
}
