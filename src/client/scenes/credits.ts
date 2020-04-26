import { Button } from "client/ui/button";
import { Tweens, Time, GameObjects } from "phaser";
import { Utils } from "client/utils/utils";
import { LumaFadePipeline } from "client/shaders/luma-fade-pipeline";
import { BackgroundManager } from "client/managers/background-manager";

export class CreditsScene extends Phaser.Scene {
    video: GameObjects.Video;
    constructor() {
        super({
            key: "credits"
        });
    }

    async create() {
        this.cameras.main.fadeIn(2000);

        this.video = this.add.video(0, 0, "credits").setOrigin(0) as GameObjects.Video;
        this.video.setLoop(true);
        this.video.play();
    }

    update(){
        if (this.video && !this.video.isPlaying()){
            this.video.play();
        }
    }
}