import { GameObjects, Input } from "phaser";
import { TypewriterText } from "client/entities/typewriter-text";
import { Utils } from "client/utils/utils";
import config from "client/config";
import { Button } from "client/ui/button";
import { Anims } from "client/utils/anims";
import { InputManager, PadButtons } from "client/managers/input-manager";

export class GameOverScene extends Phaser.Scene {
    inputManager: InputManager;
    constructor() {
        super({
            key: "game-over"
        });
    }

    create(){
        this.scene.get("ui").scene.stop();
        this.scene.get("pause").scene.stop();

        this.sound.stopByKey("game");
        this.sound.play("gameover");

        const vid = this.add.video(0, 0, "game-over").setOrigin(0) as GameObjects.Video;
        vid.play();
        vid.on("complete", () => {
            Anims.fadeIn(btnRetry);
            Anims.fadeIn(btnMenu);
        });

        const btnRetry = new Button(this, this.cameras.main.centerX, 550, "misc", "btn-retry").setAlpha(0);
        btnRetry.action(() => {
            this.scene.start("game");
        });

        const btnMenu = new Button(this, this.cameras.main.centerX, 750, "misc", "btn-menu").setAlpha(0);
        btnMenu.action(() => {
            this.scene.start("main-menu");
        });

        this.cameras.main.setAlpha(0);
        this.add.tween({
            targets: this.cameras.main,
            alpha: 1,
            duration: 1000,
            onComplete: async () => {
                this.scene.get("game").scene.stop();
                await this.displayRandomDeathMessage();
            }
        });
        
        this.inputManager = new InputManager(this);

        //this.inputManager.on({keys: ["ArrowDown", "ArrowUp"], padButtons: [PadButtons.DUP, PadButtons.DDOWN]}, 
    }

    displayRandomDeathMessage(){
        const msg = Utils.random(config.deathMessages);

        const text = new TypewriterText(this, this.cameras.main.centerX - (msg.length * 15), 370, msg, {
            fontFamily: "OCRAEXT",
            fontSize: "50px",
            shadow: {
                blur: 10,
                color: "#fff894",
                offsetX: 0,
                offsetY: 0,
                fill: true
            },
            color: "#fff"
        }).setOrigin(0, 0.5);

        return text.reveal();
    }
}