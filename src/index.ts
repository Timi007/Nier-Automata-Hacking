// add styles
import './yorha.min.css';
import './style.css';

import { Game } from './modules/Game';
import { GameTime } from './modules/GameTime';
import { AudioProvider } from './modules/AudioProvider';
import { UiManager } from './modules/UiManager';

const uiManager = new UiManager();
const audioProvider = new AudioProvider();

let loadAudioTask = audioProvider.loadGameAudioAsync();

audioProvider.loadUiAudioAsync().then(() => {
    uiManager.audioMap = audioProvider.requestAudio(...UiManager.NeededAudio);

    uiManager.buttons.start.addEventListener('click', async () => {
        await loadAudioTask;

        uiManager.screens.start.remove();

        let game = new Game(uiManager, audioProvider, new GameTime());
        game.init();
    });
});
