import * as THREE from "three";
import { Game } from "../Game";
import { GameTime } from "../GameTime";
import { Enemy, EnemyEvent } from "./Enemy";
import { Guard } from "./Guard";
import { PlayerProjectile } from "./projectile/PlayerProjectile";
import { Projectile } from "./projectile/Projectile";
import { Shield } from "./Shield";

const DEFAULT_BOUNDING_RADIUS = 0.5;

export class EnemyCore extends Enemy {
    /**
     * Keys of requested audio for this entity.
     */
    public static readonly NeededAudio = ['EnemyShot', 'EnemyHit', 'EnemyHitShield', 'EnemyShieldDown', 'EnemyDeath'];

    private _boundingRadius: number;
    private _boundingSphere: THREE.Sphere;

    private readonly guards: Guard[] = [];
    private readonly shield: Shield;

    /**
     * Constructs an enemy core which behaves according to set combat and movement patterns.
     * @param game The game or world.
     * @param mesh The render component of the entity.
     * @param shield The render component of the shield.
     * @param shieldRadius The shield radius.
     */
    public constructor(game: Game, mesh: THREE.Mesh, shield: Shield) {
        super(game, mesh);

        this.shield = shield;
        this.mesh.add(this.shield.mesh);

        this._health = 10;

        this.shield.active = false;
        this._boundingRadius = DEFAULT_BOUNDING_RADIUS;
        this._boundingSphere = new THREE.Sphere(this.position.clone(), this.boundingRadius);

        this.onGuardDeath = this.onGuardDeath.bind(this);
    }

    public get boundingRadius(): number {
        return this._boundingRadius;
    }

    public get boundingSphere(): THREE.Sphere {
        return this._boundingSphere;
    }

    public update(time: GameTime) {
        this.handleHitEffect(time, 0xffffff);
        this.shield.update(time);

        super.update(time);
    }

    private enableShield() {
        this.shield.active = true;
        this._boundingRadius = this.shield.boundingRadius;
        this._boundingSphere.radius = this._boundingRadius;
    }

    private disableShield() {
        this.shield.active = false;
        this._boundingRadius = DEFAULT_BOUNDING_RADIUS;
        this._boundingSphere.radius = this._boundingRadius;
    }

    public onHit(source: Projectile) {
        if (source instanceof PlayerProjectile && this._health > 0) {
            if (this.shield.active) {
                // Take no damage, shield is protecting us
                this.playAudio('EnemyHitShield');
                return;
            }

            this._health--;
            if (this._health === 0) {
                this.playAudio('EnemyDeath');
                this.dispatchEvent(new EnemyEvent(this, 'death'));
                return;
            }

            this.isHit = true;
            this.playAudio('EnemyHit');
        }
    }

    /**
     * Adds a guard to the core and enables the core's shield.
     * @param guards The guard to add.
     */
    public addGuard(...guards: Guard[]) {
        for (const minion of guards) {
            this.guards.push(minion);
            minion.addEventListener('death', this.onGuardDeath as EventListener);
        }
        this.enableShield()
    }

    private removeGuard(guard: Guard) {
        let index = this.guards.indexOf(guard);
        if (index < 0) {
            return;
        }
        this.guards.splice(index, 1);
        guard.removeEventListener('death', this.onGuardDeath as EventListener);
    }

    private onGuardDeath(event: EnemyEvent) {
        this.removeGuard(event.enemy as Guard);

        if (this.guards.length === 0) {
            this.playAudio('EnemyShieldDown');
            this.disableShield();
        }
    }
}
