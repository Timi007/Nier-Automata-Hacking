import * as THREE from "three";
import { Sphere } from "three";
import { Game } from "../Game";
import { GameTime } from "../GameTime";
import { Enemy, EnemyEvent } from "./Enemy";
import { PlayerProjectile } from "./projectile/PlayerProjectile";
import { Projectile } from "./projectile/Projectile";

export class Guard extends Enemy {
    /**
     * Keys of requested audio for this entity.
     */
    public static readonly NeededAudio = ['MinionDeath', 'EnemyShot'];

    public readonly boundingRadius: number;
    public readonly boundingSphere: Sphere;

    /**
     * Constructs a new guard which has 1 health points.
     * @param game The game or world.
     * @param mesh The render component of the entity.
     */
    public constructor(game: Game, mesh: THREE.Mesh) {
        super(game, mesh);

        this._health = 1;

        this.boundingRadius = 0.5;
        this.boundingSphere = new THREE.Sphere(this.position.clone(), this.boundingRadius);
    }

    public update(time: GameTime) {
        this.combatPattern?.update(this, time);

        super.update(time);
    }

    public onHit(source: Projectile): void {
        if (source instanceof PlayerProjectile && this._health > 0) {
            this._health--;

            this.playAudio('MinionDeath');
            this.dispatchEvent(new EnemyEvent(this, 'death'));
        }
    }
}
