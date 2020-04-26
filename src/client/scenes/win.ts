import { Button } from "client/ui/button";
import { Tweens, Time, GameObjects } from "phaser";
import { Utils } from "client/utils/utils";
import { LumaFadePipeline } from "client/shaders/luma-fade-pipeline";
import { BackgroundManager } from "client/managers/background-manager";

export class WinScene extends Phaser.Scene {
    constructor() {
        super({
            key: "win"
        });
    }

    async create() {
        this.scene.get("pause").scene.stop();

        const rect = this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x000000);
        const text = this.add.text(0, 0, "To be continued...", {
            fontFamily: "OCRAEXT",
            fontSize: "70px",
            shadow: {
                blur: 10,
                color: "#fff894",
                offsetX: 0,
                offsetY: 0,
                fill: true
            },
            color: "#fff"
        } as Phaser.Types.GameObjects.Text.TextStyle).setOrigin(0.5);
        text.x = this.cameras.main.width * 0.5;
        text.y = this.cameras.main.height * 0.5;

        const fireLvl = this.add.container(0, 0).setVisible(false);
        for (let i=0; i<35; i++){
            fireLvl.add(this.add.image(256 * i, 0, "world2", `bg1/${i}`).setOrigin(0));
        }

        const airLvl = this.add.container(0, 0).setVisible(false);
        for (let i=0; i<35; i++){
            airLvl.add(this.add.image(256 * i, 0, "world3", `bg1/${i}`).setOrigin(0));
        }

        await Utils.delay(this, 3000);

        fireLvl.setVisible(true);

        await Utils.tween(this, { targets: fireLvl, x: -6948, duration: 8000 });

        fireLvl.setVisible(false);
        airLvl.setVisible(true);

        Utils.tween(this, { targets: airLvl, x: -6948, duration: 8000 });

        await Utils.delay(this, 6000);

        this.cameras.main.fadeOut(2000);

        await Utils.delay(this, 2000);

        this.scene.start("credits");
    }
}