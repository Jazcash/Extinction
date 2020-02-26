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
        const text = this.text = this.add.text(5, 5, "", {
            stroke: "#000",
            strokeThickness: 3
        } as Phaser.Types.GameObjects.Text.TextStyle);
    }

    update(){
        const gameScene = this.scene.get("game") as GameScene | undefined;

        if (!gameScene){
            return;
        }

        this.text.setText([
            `FPS: ${this.game.loop.actualFps.toFixed()}`,
            `Jumping: ${gameScene.player?.jumping}`,
            `Has Double Jump: ${gameScene.player?.hasDoubleJump}`,
            `Axes 0: ${this.input.gamepad.getPad(0)?.axes[0].getValue()}`,
            `Axes 1: ${this.input.gamepad.getPad(0)?.axes[1].getValue()}`,
        ]);
    }
}