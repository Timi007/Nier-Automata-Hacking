import { AudioProvider } from "./AudioProvider";

interface IUIScreen {
    readonly start: HTMLDivElement,
    readonly pauseMenu: HTMLDivElement,
    readonly gameOver: HTMLDivElement,
    readonly gameComplete: HTMLDivElement,
    readonly levelComplete: HTMLDivElement,
}

interface IUIButton {
    readonly start: HTMLButtonElement,
    readonly continue: HTMLButtonElement,
    readonly gameOverRestart: HTMLButtonElement,
    readonly gameCompleteRestart: HTMLButtonElement,
}

interface IUILevelCounter {
    readonly pauseMenu: HTMLSpanElement,
    readonly gameOver: HTMLSpanElement,
    readonly levelComplete: HTMLSpanElement,
}

export class UiManager {
    public static readonly NeededAudio = ['ButtonEnter', 'ButtonSelect'];
    public readonly screens: IUIScreen;
    public readonly buttons: IUIButton;
    public readonly levelCounter: IUILevelCounter;
    public audioMap: Map<string, THREE.PositionalAudio | THREE.Audio<GainNode>>;

    public constructor() {
        this.screens = {
            start: document.getElementById('start') as HTMLDivElement,
            pauseMenu: document.getElementById('pauseMenu') as HTMLDivElement,
            gameOver: document.getElementById('gameOver') as HTMLDivElement,
            gameComplete: document.getElementById('gameComplete') as HTMLDivElement,
            levelComplete: document.getElementById('levelComplete') as HTMLDivElement,
        };
        this.buttons = {
            start: document.getElementById('startButton') as HTMLButtonElement,
            continue: document.getElementById('continueButton') as HTMLButtonElement,
            gameOverRestart: document.getElementById('gameOverRestartButton') as HTMLButtonElement,
            gameCompleteRestart: document.getElementById('gameCompleteRestartButton') as HTMLButtonElement,
        };
        this.levelCounter = {
            pauseMenu: document.getElementById('pauseMenuLevelCompleted') as HTMLSpanElement,
            gameOver: document.getElementById('gameOverLevelCompleted') as HTMLSpanElement,
            levelComplete: document.getElementById('levelCompleteCounter') as HTMLSpanElement,
        };

        this.audioMap = new Map<string, THREE.PositionalAudio | THREE.Audio<GainNode>>();

        this.onButtonClick = this.onButtonClick.bind(this);
        this.onButtonSelect = this.onButtonSelect.bind(this);

        this.setAudioOnButtons();
    }

    /**
     * Hides the given screen.
     * @param screen The screen to hide.
     */
    public hide(screen: HTMLDivElement) {
        screen.classList.add('hidden');
    }

    /**
     * Shows the given screen.
     * @param screen The screen to show.
     */
    public show(screen: HTMLDivElement) {
        screen.classList.remove('hidden');
    }

    /**
     * Sets the level counter in UI.
     * @param level The level to set.
     */
    public setLevel(level: number) {
        for (const counter of Object.values(this.levelCounter)) {
            counter.textContent = level - 1;
        }
        this.levelCounter.levelComplete.textContent = level.toString();
    }

    private setAudioOnButtons() {
        for (const button of Object.values(this.buttons)) {
            button.addEventListener('click', this.onButtonClick);
            button.addEventListener('mouseover', this.onButtonSelect);
        }
    }

    private onButtonClick() {
        let buttonEnterAudio = this.audioMap.get('ButtonEnter');
        if (buttonEnterAudio) {
            AudioProvider.playAudio(buttonEnterAudio);
        }
    }

    private onButtonSelect() {
        let buttonSelectAudio = this.audioMap.get('ButtonSelect');
        if (buttonSelectAudio) {
            AudioProvider.playAudio(buttonSelectAudio);
        }
    }
}
