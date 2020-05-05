import { Utils } from "client/utils/utils";
import { PollutionMeter } from "client/entities/pollution-meter";
import { EdgeFadePipeline } from "client/shaders/edge-fade-pipeline";
import { SaturatePipeline } from "client/shaders/saturate-pipeline";
import { GaussianBlur1 } from "client/shaders/gaussian-blur-1-pipeline";
import config from "client/config";
import { Sound } from "phaser";

declare var __DEV__: boolean;
declare var window: any;
export class LoadScene extends Phaser.Scene {
    constructor() {
        super({
            key: "load"
        });
    }

    preload() {
        this.cameras.main.setBackgroundColor("rgba(0, 0, 0, 0.5)");

        const boundingZone = this.add.zone(this.cameras.main.x, this.cameras.main.y, this.cameras.main.width, this.cameras.main.height).setOrigin(0, 0);

        const bg = this.add.graphics();
        bg.fillGradientStyle(0x333333, 0x333333, 0x232323, 0x232323, 1);
        bg.fillRect(0, 0, boundingZone.width, boundingZone.height);

        const pollutionMeter = new PollutionMeter(this, 0, 0, true);
        Phaser.Display.Align.In.BottomRight(pollutionMeter.container, boundingZone, -180, -440);

        this.load.on(Phaser.Loader.Events.PROGRESS, (v: number) => {
            pollutionMeter.setPercent(v, true);
        });

        this.load.json("shapes", "sprites/shapes.json");

        this.load.multiatlas("menu", "sprites/menu.json", "sprites");
        this.load.multiatlas("world", "sprites/world.json", "sprites");
        this.load.multiatlas("world2", "sprites/world2.json", "sprites");
        this.load.multiatlas("world3", "sprites/world3.json", "sprites");
        this.load.multiatlas("player", "sprites/player.json", "sprites");
        this.load.multiatlas("misc", "sprites/misc.json", "sprites");
        this.load.multiatlas("pause", "sprites/pause.json", "sprites");

        this.load.video("title", ["video/title.webm", "video/title.mp4"]);
        this.load.video("game-over", ["video/game-over.webm", "video/game-over.mp4"]);
        this.load.video("credits", ["video/credits.webm", "video/credits.mp4"]);

        this.load.bitmapFont("alphabet", "fonts/alphabet.png", "fonts/alphabet.xml");
        
        config.sounds.music.forEach(soundKey => this.load.audio(soundKey, [`audio/music/${soundKey}.mp3`]));
        config.sounds.sfx.forEach(soundKey => this.load.audio(soundKey, [`audio/sfx/${soundKey}.mp3`]));

        Utils.loadFont("Roboto", [100, 300, 400, 500, 700, 900]);
        Utils.loadFont("OCRAEXT");
        Utils.loadFont("Baloo");
    }

    async create() {
        if (this.game.renderer instanceof Phaser.Renderer.WebGL.WebGLRenderer) {
            this.game.renderer.addPipeline("EdgeFadePipeline", new EdgeFadePipeline(this.game));
            this.game.renderer.addPipeline("SaturatePipeline", new SaturatePipeline(this.game));
            this.game.renderer.addPipeline("GaussianBlur1", new GaussianBlur1(this.game));
        }

        config.sounds.music.forEach(soundKey => this.game.sound.add(soundKey, { volume: 0.1 }));
        config.sounds.sfx.forEach(soundKey => this.game.sound.add(soundKey, { volume: 0.1 }));
        
        config.sounds.music.forEach(soundKey => {
            this.sound.getAll(soundKey).forEach(sound => {
                (sound as Sound.WebAudioSound).setMute(!config.musicEnabled);
            });
        });

        config.sounds.sfx.forEach(soundKey => {
            this.sound.getAll(soundKey).forEach(sound => {
                (sound as Sound.WebAudioSound).setMute(!config.sfxEnabled);
            });
        });

        this.scene.run("debug");

        if (__DEV__){
            this.scene.start("main-menu");
        } else {
            this.scene.start("main-menu");
        }
    }
}
