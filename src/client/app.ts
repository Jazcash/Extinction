import "phaser";

import Stats from "stats.js";

import { LoadScene } from "client/scenes/load";
import { GameScene } from "client/scenes/game";
import { DebugScene } from "client/scenes/debug";
import { PauseScene } from "client/scenes/pause";
import { UIScene } from "./scenes/ui";
import { CharacterSelection } from "./scenes/character-selection";
import { PreloadScene } from "./scenes/preload";
import { MainMenuScene } from "./scenes/main-menu";
import { TestScene } from "./scenes/test";
import { GameOverScene } from "./scenes/game-over";
import { WinScene } from "./scenes/win";
import { CreditsScene } from "./scenes/credits";

declare var window: any;
declare var __DEV__: boolean;

const game = window.game = new Phaser.Game({
    parent: "game-container",
    width: 1920,
    height: 1080,
    render: {
        transparent: true,
        roundPixels: true
    },
    scale: {
        mode: Phaser.Scale.FIT
    },
    input: {
        gamepad: true
    },
    physics: {
        default: "matter",
        matter: {
            debug: __DEV__ ? {
                lineColor: 0xff0000,
                staticLineColor: 0xff0000,
                sensorLineColor: 0x00ff00
            } : false,
            gravity: {
                y: 3
            }
        }
    },
    scene: [
        new PreloadScene(),
        new LoadScene(),
        new MainMenuScene(),
        new CharacterSelection(),
        new GameScene(),
        new UIScene(),
        new PauseScene(),
        new GameOverScene(),
        new WinScene(),
        new CreditsScene(),
        __DEV__ ? new DebugScene() : {},
        __DEV__ ? new TestScene() : {},
    ]
});

let stats: Stats | undefined;

document.addEventListener('keydown', function(event) {
    if (event.shiftKey && event.key === 'F' && !stats) {
        stats = new Stats();
        stats.showPanel(0);
        document.body.appendChild(stats.dom);

        game.events.on(Phaser.Core.Events.PRE_STEP, () => stats!.begin());
        game.events.on(Phaser.Core.Events.POST_RENDER, () => stats!.end());
    } else if (event.shiftKey && event.key === 'F'){
        stats?.dom.classList.toggle("hidden");
    }
});