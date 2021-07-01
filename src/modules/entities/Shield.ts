import * as THREE from "three";
import { GameTime } from "../GameTime";

export class Shield {
    public readonly boundingRadius: number;
    public readonly mesh: THREE.Mesh;

    private readonly shader: THREE.ShaderMaterial;

    public constructor(mesh: THREE.Mesh, boundingRadius: number) {
        this.mesh = mesh;
        this.boundingRadius = boundingRadius;

        this.shader = this.mesh.material as THREE.ShaderMaterial;
    }

    /**
     * Returns whether the shield is currently enabled.
     */
    public get active(): boolean {
        return this.mesh.visible;
    }

    /**
     * Sets the state of the shield. True for enabled, false for disabled.
     */
    public set active(value: boolean) {
        this.mesh.visible = value;
    }

    /**
     * Updates the state of the entity.
     * @param time The game time.
     */
    public update(time: GameTime): void {
        if (!this.mesh.visible)
            return;

        this.shader.uniforms.time.value = time.totalElapsed / 1000;
    }
}
