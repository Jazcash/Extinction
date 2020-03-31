import { Utils } from "client/utils/utils";
import { PollutionMeter } from "client/entities/pollution-meter";

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

        this.load.on("progress", (v: number) => {
            pollutionMeter.setPercent(v, true);
        });

        this.load.json("shapes", "sprites/shapes.json");

        this.load.multiatlas("menu", "sprites/menu.json", "sprites");
        this.load.multiatlas("world", "sprites/world.json", "sprites");
        this.load.multiatlas("player", "sprites/player.json", "sprites");
        this.load.multiatlas("misc", "sprites/misc.json", "sprites");

        Utils.loadFont("Roboto", [100, 300, 400, 500, 700, 900]);
    }

    create() {
        this.scene.start("character-selection");
    }
}
