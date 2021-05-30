import { AudioProvider } from "../../AudioProvider";
import { Game } from "../../Game";
import { GameTime } from "../../GameTime";
import { Renderer } from "../../Renderer";
import { MovingEntity } from "./MovingEntity";

export abstract class GameEntity extends MovingEntity {
    /**
     * The map holding all needed audio of the entity.
     */
    public audioMap: Map<string, THREE.PositionalAudio | THREE.Audio<GainNode>>;
    /**
     * The game or world.
     */
    public readonly game: Game;
    /**
     * The render component of the entity.
     */
    public readonly mesh: THREE.Mesh;

    protected _health: number = 3;
    protected isHit: boolean = false;
    protected lastHitEffectTime: number = Infinity;

    protected readonly material: THREE.MeshPhongMaterial;
    protected readonly originalColor: number;
    protected readonly hitEffectDuration: number = 50;

    /**
     * Constructs a new moving entity beloging to the passed game/world.
     * @param game The game or world.
     * @param mesh The render component of the entity.
     * @param maxSpeed The maximum speed the entity can travel in units/milliseconds.
     */
    protected constructor(game: Game, mesh: THREE.Mesh, maxSpeed: number = 0) {
        super(mesh, maxSpeed);

        this.mesh = mesh;
        this.game = game;
        this.audioMap = new Map<string, THREE.PositionalAudio | THREE.Audio<GainNode>>();

        this.material = this.mesh.material as THREE.MeshPhongMaterial;
        this.originalColor = this.material.color.getHex();
    }

    /**
     * The health points of the entity.
     */
    public get health(): number {
        return this._health;
    }

    /**
     * Plays the audio which is mapped to the given key if it exists.
     * @param key The audio key.
     */
    protected playAudio(key: string) {
        let audio = this.audioMap.get(key);
        if (audio) {
            AudioProvider.playAudio(audio);
        }
    }

    /**
     * Changes the color of the entity for hitColorDuration if isHit is set to true.
     * @param time GameTime
     * @param colorHex The color as a hex number.
     */
    protected handleHitEffect(time: GameTime, colorHex: number) {
        if (this.isHit) {
            this.material.color.setHex(colorHex);
            this.mesh.layers.enable(Renderer.BLOOM_SCENE);
            this.lastHitEffectTime = time.totalElapsed;
            this.isHit = false;
        }
        if (this.hitEffectDuration < (time.totalElapsed - this.lastHitEffectTime)) {
            this.material.color.setHex(this.originalColor);
            this.mesh.layers.disable(Renderer.BLOOM_SCENE);
            this.lastHitEffectTime = Infinity;
        }
    }
}
