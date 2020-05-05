import { Input, Display, GameObjects, Game, Sound } from "phaser";
import { GameScene } from "./game";
import { GaussianBlur1 } from "client/shaders/gaussian-blur-1-pipeline";
import { UIScene } from "./ui";
import { Button } from "client/ui/button";
import { Toggle } from "client/ui/toggle";
import { InputManager, PadButtons, PadStick } from "client/managers/input-manager";
import config from "client/config";

const menuTextStyle: Phaser.Types.GameObjects.Text.TextStyle = {
    fontFamily: "Roboto",
    fontSize: "90px",
    fontStyle: "500",
    fixedHeight: 160,
    shadow: {
        offsetX: 0,
        offsetY: 5,
        fill: true,
        color: "#008683"
    }
};

enum Page {
    PAUSED,
    CONTROLS,
    SETTINGS,
    NONE
}

export class PauseScene extends Phaser.Scene {
    customPipeline: Phaser.Renderer.WebGL.WebGLPipeline;
    selectedOption: number;
    selectedButton: Button;
    buttons: Button[];
    controlsActive: boolean;
    pages: Map<Page, GameObjects.Group>;
    mainElements: GameObjects.Group;
    currentPage: Page;
    inputManager: InputManager;

    constructor() {
        super({
            key: "pause",
            active: false
        });
    }

    create() {
        this.currentPage = Page.NONE;
        this.selectedOption = 0;
        this.pages = new Map();
        this.buttons = [];
        this.controlsActive = false;

        const pauseOverlayRect = this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x00AD7F, 0.35);
        pauseOverlayRect.setOrigin(0, 0);
        pauseOverlayRect.setAlpha(0);

        const pauseBorder = this.add.sprite(0, 0, "pause", "frame").setOrigin(0, 0);

        this.mainElements = this.add.group([pauseBorder, pauseOverlayRect]).setAlpha(0);

        const btnBack = new Button(this, 500, 250, "pause", "back");
        btnBack.action(() => this.setPage(Page.PAUSED));

        const pausedTitle = this.add.image(this.cameras.main.centerX, 275, "pause", "paused_title");

        const spacing = 60;

        const btnResume = new Button(this, this.cameras.main.centerX, pausedTitle.getBounds().bottom + spacing, "pause", "resume_text", true);
        const btnControls = new Button(this, this.cameras.main.centerX, btnResume.getBounds().bottom + spacing - 5, "pause", "controls_text", true);
        const btnSettings = new Button(this, this.cameras.main.centerX, btnControls.getBounds().bottom + spacing, "pause", "settings_text", true);
        const btnMenu = new Button(this, this.cameras.main.centerX, btnSettings.getBounds().bottom + spacing, "pause", "menu_text", true);

        btnResume.action(() => this.toggle());
        btnControls.action(() => this.setPage(Page.CONTROLS));
        btnSettings.action(() => this.setPage(Page.SETTINGS));
        btnMenu.action(() => {
            this.scene.stop("ui");
            this.scene.stop("game");
            this.scene.start("main-menu");
        });

        this.buttons = [ btnResume, btnControls, btnSettings, btnMenu ];

        this.selectedOption = 0;
        this.selectedButton = btnResume;

        this.buttons.forEach(button => {
            button.unhover(0);
        });

        this.pages.set(Page.NONE, this.add.group());

        this.pages.set(Page.PAUSED, this.add.group([pausedTitle, btnResume, btnControls, btnSettings, btnMenu]).setAlpha(0));

        const controlsTitle = this.add.image(this.cameras.main.centerX, 275, "pause", "controls_title");
        const controlsImg = this.add.image(this.cameras.main.centerX, 550, "pause", "controls");

        this.pages.set(Page.CONTROLS, this.add.group([btnBack, controlsTitle, controlsImg]).setAlpha(0));

        const settingsTitle = this.add.image(this.cameras.main.centerX, 275, "pause", "settings_title");

        const musicText = this.add.image(500, 400, "pause", "music_text").setOrigin(0);
        const musicToggle = new Toggle(this, 1200, musicText.y);
        musicToggle.setEnabled(config.musicEnabled);
        musicToggle.onToggled.add(() => {
            config.musicEnabled = !config.musicEnabled;
            localStorage.setItem("musicEnabled", `${config.musicEnabled}`);
            config.sounds.music.forEach(soundKey => {
                this.sound.getAll(soundKey).forEach(sound => {
                    (sound as Sound.WebAudioSound).setMute(!config.musicEnabled);
                });
            });
        });

        const soundText = this.add.image(500, 500, "pause", "sound_effects_text").setOrigin(0);
        const soundToggle = new Toggle(this, 1200, soundText.y);
        soundToggle.setEnabled(config.sfxEnabled);
        soundToggle.onToggled.add(() => {
            config.sfxEnabled = !config.sfxEnabled;
            localStorage.setItem("sfxEnabled", `${config.sfxEnabled}`);
            config.sounds.sfx.forEach(soundKey => {
                this.sound.getAll(soundKey).forEach(sound => {
                    (sound as Sound.WebAudioSound).setMute(!config.sfxEnabled);
                });
            });
        });

        const tutorialText = this.add.image(500, 600, "pause", "tutorial_enabled_text").setOrigin(0);
        const tutorialToggle = new Toggle(this, 1200, tutorialText.y);
        tutorialToggle.setEnabled(config.tutorialEnabled);
        tutorialToggle.onToggled.add(() => config.tutorialEnabled = !config.tutorialEnabled);

        this.pages.set(Page.SETTINGS, this.add.group([btnBack, settingsTitle, musicText, musicToggle, soundText, soundToggle, tutorialText, tutorialToggle]).setAlpha(0));

        if (this.game.renderer instanceof Phaser.Renderer.WebGL.WebGLRenderer) {
            this.customPipeline = this.game.renderer.getPipeline("GaussianBlur1");
            this.customPipeline.setFloat2('iResolution', 1920, 1080);
            this.customPipeline.setFloat1('Size', 0);
        }

        this.inputManager = new InputManager(this);

        this.inputManager.on({keys: ["Escape"], padButtons: [PadButtons.BACK, PadButtons.B]}, () => {
            if (this.currentPage !== Page.NONE){ 
                if (this.currentPage === Page.PAUSED){
                    this.toggle();
                } else {
                    this.setPage(Page.PAUSED);
                }
            }
        });
        this.inputManager.on({keys: ["ArrowUp"], padButtons: [PadButtons.DUP], padSticks: {left: PadStick.UP}}, () => {
            if (this.currentPage !== Page.NONE){
                this.selectAbove();
            }
        });
        this.inputManager.on({keys: ["ArrowDown"], padButtons: [PadButtons.DDOWN], padSticks: {left: PadStick.DOWN}}, () => {
            if (this.currentPage !== Page.NONE){
                this.selectBelow();
            }
        });
        this.inputManager.on({keys: ["Enter", " "], padButtons: [PadButtons.START, PadButtons.A]}, () => {
            if (this.currentPage !== Page.NONE){
                this.triggerButton(this.selectedButton);
            }
        });
        this.inputManager.on({keys: ["Escape"], padButtons: [PadButtons.START, PadButtons.BACK]}, () => {
            if (this.currentPage === Page.NONE){
                this.toggle();
            }
        });

        this.setPage(this.currentPage);
    }

    setPage(page: Page, instant = false) {
        this.pages.forEach(page => {
            page.getChildren().forEach((child: GameObjects.Sprite) => child.setAlpha(0));
        });

        this.pages.get(page)?.getChildren().forEach((child: GameObjects.Sprite) => child.setAlpha(1));

        this.currentPage = page;
    }

    toggle() {
        const gameScene = this.scene.get("game") as GameScene;
        const uiScene = this.scene.get("ui") as UIScene;

        if (this.currentPage === Page.NONE) {
            [gameScene, uiScene].forEach(scene => scene.cameras.main.setRenderToTexture(this.customPipeline));

            this.tweens.addCounter({
                from: 0,
                to: 80,
                duration: 200,
                onUpdate: (tween, current) => {
                    this.customPipeline.setFloat1('Size', current.value);
                    this.mainElements.setAlpha(tween.progress);
                    this.setPage(Page.PAUSED, true);
                    this.pages.get(this.currentPage)!.setAlpha(tween.progress);
                },
                onComplete: () => {
                    [gameScene, uiScene].forEach(scene => scene.scene.pause());
                }
            });
        } else {
            [gameScene, uiScene].forEach(scene => scene.scene.resume());

            this.tweens.addCounter({
                from: 80,
                to: 0,
                duration: 200,
                onUpdate: (tween, current) => {
                    this.customPipeline.setFloat1('Size', current.value);
                    this.mainElements.setAlpha(1 - tween.progress);
                    this.pages.get(this.currentPage)!.setAlpha(1 - tween.progress);
                },
                onComplete: () => {
                    this.setPage(Page.NONE, true);
                    [gameScene, uiScene].forEach(scene => scene.cameras.main.clearRenderToTexture());
                }
            });
        }
    }

    selectAbove() {
        this.selectedOption = this.selectedOption === 0 ? this.buttons.length - 1 : this.selectedOption - 1;
        const option = this.buttons[this.selectedOption];
        this.buttons.forEach(button => {
            button.unhover(0);
        });
        option.hover(0);
        this.selectedButton = option;
    }

    selectBelow() {
        this.selectedOption = this.selectedOption === this.buttons.length - 1 ? 0 : this.selectedOption + 1;
        const option = this.buttons[this.selectedOption];
        this.buttons.forEach(button => {
            button.unhover(0);
        });
        option.hover(0);
        this.selectedButton = option;
    }

    triggerButton(button: Button){
        button.callback();
    }
}