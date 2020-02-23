import { GameScene } from "./game";

export class DebugScene extends Phaser.Scene {
    text: Phaser.GameObjects.Text;

    constructor() {
        super({
            key: "debug",
            active: true
        });
    }

    create() {
        const text = this.text = this.add.text(5, 5, "");
    }

    update(){


        const gameScene = this.scene.get("game") as GameScene | undefined;

        if (!gameScene){
            return;
        }

        this.text.setText(`FPS: ${this.game.loop.actualFps.toFixed()}`);
    }
}