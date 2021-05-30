import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";

// Taken from https://github.com/mrdoob/three.js/blob/master/examples/webgl_postprocessing_unreal_bloom_selective.html

const DARK_MATERIAL = new THREE.MeshPhongMaterial({ color: "black" });

interface IMaterialMap {
    [uuid: string]: THREE.Material | THREE.Material[];
}

export class Renderer {
    public static readonly BLOOM_SCENE: number = 1;
    public readonly renderer: THREE.WebGLRenderer;

    private readonly bloomLayer: THREE.Layers;
    private readonly bloomComposer: EffectComposer;
    private readonly finalComposer: EffectComposer;
    private readonly materials: IMaterialMap = {};
    private readonly scene: THREE.Scene;
    private readonly camera: THREE.Camera;

    public constructor(scene: THREE.Scene, camera: THREE.Camera) {
        this.scene = scene;
        this.camera = camera;

        this.bloomLayer = new THREE.Layers();
        this.bloomLayer.set(Renderer.BLOOM_SCENE);

        this.renderer = this.createRenderer();
        let renderScene = new RenderPass(this.scene, this.camera);
        let bloomPass = this.createBloomPass();
        this.bloomComposer = this.createBloomComposer(this.renderer, renderScene, bloomPass);
        let finalPass = this.createShaderPass(this.bloomComposer);
        this.finalComposer = this.createFinalComposer(this.renderer, renderScene, finalPass);

        this.darkenNonBloomed = this.darkenNonBloomed.bind(this);
        this.restoreMaterial = this.restoreMaterial.bind(this);
    }

    /**
     * Render scene with bloom.
     */
    public render() {
        this.renderBloom();
        this.finalComposer.render();
    }

    /**
     * Resizes the output canvas to (width, height), and also sets the viewport to fit that size, starting in (0, 0).
     * @param width The width.
     * @param height The height.
     */
    public setSize(width: number, height: number) {
        this.renderer.setSize(width, height);

        this.bloomComposer.setSize(width, height);
        this.finalComposer.setSize(width, height);
    }

    private createFinalComposer(renderer: THREE.WebGLRenderer, renderScene: RenderPass, shaderPass: ShaderPass): EffectComposer {
        let finalComposer = new EffectComposer(renderer);
        finalComposer.addPass(renderScene);
        finalComposer.addPass(shaderPass);

        return finalComposer;
    }

    private createShaderPass(bloomComposer: EffectComposer): ShaderPass {
        let shaderPass = new ShaderPass(
            new THREE.ShaderMaterial({
                uniforms: {
                    baseTexture: { value: null },
                    bloomTexture: { value: bloomComposer.renderTarget2.texture }
                },
                vertexShader: `
                    varying vec2 vUv;

                    void main() {
                        vUv = uv;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
                    }
                `,
                fragmentShader: `
                    uniform sampler2D baseTexture;
                    uniform sampler2D bloomTexture;
                    varying vec2 vUv;

                    void main() {
                        gl_FragColor = ( texture2D( baseTexture, vUv ) + vec4( 1.0 ) * texture2D( bloomTexture, vUv ) );
                    }
                `,
                defines: {}
            }), "baseTexture"
        );
        shaderPass.needsSwap = true;

        return shaderPass;
    }

    private createRenderer(): THREE.WebGLRenderer {
        let renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMap.enabled = true;
        document.body.appendChild(renderer.domElement);

        return renderer;
    }

    private createBloomPass(): UnrealBloomPass {
        let bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
        bloomPass.threshold = 0.25;
        bloomPass.strength = 1;
        bloomPass.radius = 1;

        return bloomPass;
    }

    private createBloomComposer(renderer: THREE.WebGLRenderer, renderScene: RenderPass, bloomPass: UnrealBloomPass): EffectComposer {
        let bloomComposer = new EffectComposer(renderer);
        bloomComposer.renderToScreen = false;
        bloomComposer.addPass(renderScene);
        bloomComposer.addPass(bloomPass);

        return bloomComposer;
    }

    private renderBloom() {
        this.scene.traverse(this.darkenNonBloomed);
        this.bloomComposer.render();
        this.scene.traverse(this.restoreMaterial);
    }

    private darkenNonBloomed(obj: THREE.Object3D) {
        if (!(obj instanceof THREE.Mesh || obj instanceof THREE.InstancedMesh)) {
            return;
        }

        if (obj.isMesh && this.bloomLayer.test(obj.layers) === false) {
            this.materials[obj.uuid] = obj.material;
            obj.material = DARK_MATERIAL;
        }
    }

    private restoreMaterial(obj: THREE.Object3D) {
        if (!(obj instanceof THREE.Mesh || obj instanceof THREE.InstancedMesh)) {
            return;
        }

        if (this.materials[obj.uuid]) {
            obj.material = this.materials[obj.uuid];
            delete this.materials[obj.uuid];
        }
    }
}
