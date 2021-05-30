import * as THREE from "three";

const PlayerShot = require('../audio/PlayerShot.wav');
const PlayerHit1 = require('../audio/PlayerHit1.wav');
const PlayerHit2 = require('../audio/PlayerHit2.wav');
const PlayerDeath = require('../audio/PlayerDeath.wav');

const EnemyShot = require('../audio/EnemyShot.wav');
const EnemyHit = require('../audio/EnemyHit.wav');
const EnemyHitShield = require('../audio/EnemyHitShield.wav');
const EnemyShieldDown = require('../audio/EnemyShieldDown.wav');
const EnemyDeath = require('../audio/EnemyDeath.wav');
const MinionDeath = require('../audio/MinionDeath.wav');

const ButtonEnter = require('../audio/ButtonEnter.wav');
const ButtonSelect = require('../audio/ButtonSelect.wav');

enum AudioType {
    Game,
    Ui,
}

interface IAudioDefinition {
    /**
     * The name and key of the audio file.
     */
    readonly name: string,
    /**
     * The name of the audio file. Default is <name>.wav
     */
    readonly fileName: string,
    /**
     * The volume of the audio.
     */
    readonly volume?: number,
    /**
     * The type of audio. Default is PositionalAudio.
     */
    readonly type?: AudioType,
}

const AUDIO_DEFINITIONS: IAudioDefinition[] = [
    { name: 'PlayerShot', fileName: PlayerShot.default, volume: 0.5 },
    { name: 'PlayerHit1', fileName: PlayerHit1.default, volume: 0.4 },
    { name: 'PlayerHit2', fileName: PlayerHit2.default, volume: 0.4 },
    { name: 'PlayerDeath', fileName: PlayerDeath.default, volume: 0.5 },
    { name: 'EnemyShot', fileName: EnemyShot.default, volume: 0.25 },
    { name: 'EnemyHit', fileName: EnemyHit.default, volume: 0.5 },
    { name: 'EnemyHitShield', fileName: EnemyHitShield.default, volume: 0.5 },
    { name: 'EnemyShieldDown', fileName: EnemyShieldDown.default, volume: 0.4 },
    { name: 'EnemyDeath', fileName: EnemyDeath.default, volume: 0.5 },
    { name: 'MinionDeath', fileName: MinionDeath.default, volume: 0.5 },
    { name: 'ButtonEnter', fileName: ButtonEnter.default, type: AudioType.Ui },
    { name: 'ButtonSelect', fileName: ButtonSelect.default, type: AudioType.Ui },
];

export class AudioProvider {
    public readonly loader: THREE.AudioLoader;
    public readonly listener: THREE.AudioListener;
    /**
     * The audio map containing all loaded audio.
     */
    public readonly map: Map<string, THREE.PositionalAudio | THREE.Audio<GainNode>>;

    public constructor() {
        this.loader = new THREE.AudioLoader();
        this.listener = new THREE.AudioListener();
        this.map = new Map<string, THREE.PositionalAudio | THREE.Audio<GainNode>>();
    }

    /**
     * Plays given audio. Restarts it if its already playing.
     * @param audio The audio to play.
     */
    public static playAudio(audio: THREE.PositionalAudio | THREE.Audio<GainNode>) {
        if (audio.isPlaying) {
            audio.stop();
        }

        audio.play();
    }

    /**
     * Load all UI audio files asynchronously and add it to the map.
     */
    public async loadUiAudioAsync() {
        let loadAudioTasks: Promise<void>[] = [];

        for (const audioDefinition of AUDIO_DEFINITIONS) {
            if (audioDefinition.type !== AudioType.Ui) {
                continue;
            }

            let audio = new THREE.Audio(this.listener);
            let task = this.setAudioAsync(audioDefinition, audio);
            loadAudioTasks.push(task);
        }

        await Promise.all(loadAudioTasks);
    }

    /**
     * Load all positional audio files asynchronously and add it to the map.
     */
    public async loadGameAudioAsync() {
        let loadAudioTasks: Promise<void>[] = [];

        let refDistance = 25;
        for (const audioDefinition of AUDIO_DEFINITIONS) {
            if (audioDefinition.type === AudioType.Ui) {
                continue;
            }

            let audio = new THREE.PositionalAudio(this.listener);
            audio.setRefDistance(refDistance);
            let task = this.setAudioAsync(audioDefinition, audio);
            loadAudioTasks.push(task);
        }

        await Promise.all(loadAudioTasks);
    }
    /**
     * Clones all requested audio into a new map.
     * @param audioKeys The keys of the audio to include in the map.
     * @returns A map of requested audio.
     */
    public requestAudio(...audioKeys: string[]): Map<string, THREE.PositionalAudio | THREE.Audio<GainNode>> {
        let map = new Map<string, THREE.PositionalAudio | THREE.Audio<GainNode>>();
        for (const audioKey of audioKeys) {
            let audio = this.map.get(audioKey);
            if (!audio) {
                continue;
            }

            map.set(audioKey, this.cloneAudio(audio));
        }

        return map;
    }

    private cloneAudio(source: THREE.PositionalAudio | THREE.Audio<GainNode>): THREE.PositionalAudio | THREE.Audio<GainNode> {
        if (source instanceof THREE.PositionalAudio) {
            let audio = new THREE.PositionalAudio(this.listener);
            audio.buffer = source.buffer;
            audio.name = source.name;
            audio.setVolume(source.getVolume());
            audio.setRefDistance(source.getRefDistance());
            return audio;
        } else {
            let audio = new THREE.Audio(this.listener);
            audio.buffer = source.buffer;
            audio.name = source.name;
            audio.setVolume(source.getVolume());
            return audio;
        }
    }



    private async setAudioAsync(audioDefinition: IAudioDefinition, audio: THREE.PositionalAudio | THREE.Audio<GainNode>) {
        this.map.set(audioDefinition.name, audio);
        audio.name = audioDefinition.name;
        if (audioDefinition.volume !== undefined) {
            audio.setVolume(audioDefinition.volume);
        }

        let buffer = await this.loader.loadAsync(audioDefinition.fileName);
        audio.setBuffer(buffer);
    }
}
