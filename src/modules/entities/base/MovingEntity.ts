import * as THREE from "three";
import { GameTime } from "../../GameTime";
import { Entity } from "./Entity";

export abstract class MovingEntity extends Entity {
    /**
     * The velocity of the entity.
     */
    public readonly velocity: THREE.Vector3 = new THREE.Vector3();
    /**
     * The maximum speed the entity is allowed to travel in units/milliseconds.
     */
    public readonly maxSpeed: number;

    /**
     * Constructs a new moving entity which travels independently according to velocity and the maximum speed.
     * @param mesh The render component of the entity.
     * @param maxSpeed The maximum speed the entity can travel in units/milliseconds.
     */
    protected constructor(mesh: THREE.Mesh | null = null, maxSpeed: number = 0.01) {
        super(mesh);

        this.maxSpeed = maxSpeed;
    }

    public update(time: GameTime) {
        const speed2 = this.speed2;
        if (speed2 === 0) {
            super.update(time);
            return;
        }

        // Make sure we do not exceed max speed
        if (speed2 > this.maxSpeed ** 2) {
            this.velocity.normalize();
            this.velocity.multiplyScalar(this.maxSpeed);
        }

        let scaledVelocity = this.velocity.clone().multiplyScalar(time.elapsed);
        this.position.add(scaledVelocity);

        super.update(time);
    }

    /**
     * The speed of the entity in units/milliseconds.
     */
    public get speed(): number  {
        return this.velocity.length();
    }

    /**
     * The squared value of speed of the entity.
     */
    protected get speed2(): number {
        return this.velocity.lengthSq();
    }
}
