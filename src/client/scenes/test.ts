import { Button } from "client/ui/button";
import { Tweens, Time, GameObjects } from "phaser";
import { Utils } from "client/utils/utils";
import { LumaFadePipeline } from "client/shaders/luma-fade-pipeline";

export class TestScene extends Phaser.Scene {
    constructor() {
        super({
            key: "test"
        });
    }

    create() {
        //this.sound.play("game", { loop: true, volume: 0.1 });
        
        this.game.sound.play("game", { loop: true, volume: 0.1 });

        this.time.delayedCall(4000, () => this.scene.start("test2"));
    }
}