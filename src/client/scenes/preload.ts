import { Utils } from "client/utils/utils";
import { PollutionMeter } from "client/entities/pollution-meter";

export class PreloadScene extends Phaser.Scene {
    constructor() {
        super({
            key: "preload"
        });
    }

    preload() {
        const bg = this.add.graphics();
        bg.fillGradientStyle(0x333333, 0x333333, 0x232323, 0x232323, 1);
        bg.fillRect(0, 0, 1920, 1080);

        this.load.multiatlas("polution-meter", "sprites/polution-meter.json", "sprites");
    }

    create() {
        this.scene.start("load");
    }
}
