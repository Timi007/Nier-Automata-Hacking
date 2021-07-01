/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import * as THREE from "three";

const shader = {
	uniforms: {
		time: {
			value: 0
		}
	},
	vertexShader: `
		varying vec2 vUv;
		void main()	{
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
		}
	`,
	fragmentShader: `
		varying vec2 vUv;
		uniform float time;
		const float lines = 10.0;
		const float linewidth = 0.25;
		const float speed = 6.0;
		void main()	{
			float p = abs( fract( speed * time - lines * vUv.y ) * 2.0 - 1.0 );
			float c = smoothstep( p, p + 0.01, linewidth );
			gl_FragColor = vec4( vec3( c ), c );
		}
	`
};

export class ShieldShaderMaterial extends THREE.ShaderMaterial {
    constructor() {
        super(shader);
        this.transparent = true;
    }
}
