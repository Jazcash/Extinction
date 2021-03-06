import { GameScene } from "./game";

declare var window: any;
export class DebugScene extends Phaser.Scene {
    text: Phaser.GameObjects.Text;

    constructor() {
        super({
            key: "debug"
        });
    }

    create() {
        this.text = this.add.text(5, 5, "", {
            stroke: "#000",
            strokeThickness: 4,
            fontFamily: "Arial"
        } as Phaser.Types.GameObjects.Text.TextStyle);
    }

    update() {
        const gameScene = this.scene.get("game") as GameScene | undefined;
        const player = gameScene?.player;

        if (!gameScene || !gameScene.scene.isActive()) {
            return;
        }

        this.text.setText([
            `FPS: ${this.game.loop.actualFps.toFixed()}`,
            `Player State: ${player?.state}`,
            `Pos: X: ${player?.body.position.x.toFixed(2)}, Y: ${player?.body.position.y.toFixed(2)}`,
            // `Jumping: ${gameScene.player?.jumping}`,
            `Has Double Jump: ${gameScene.player?.hasDoubleJump}`,
            `Axes 0: ${this.input.gamepad.getPad(0)?.axes[0].getValue().toFixed(2)}`,
            `Axes 1: ${this.input.gamepad.getPad(0)?.axes[1].getValue().toFixed(2)}`,
            // `Player velocity: X: ${player?.body.velocity.x.toFixed(2)}, Y: ${player?.body.velocity.y.toFixed(2)}`,
            // `Can wall climb: ${player?.canClimb()}`,
            // `Friction: ${player?.body.friction}`,
            // `Facing: ${player?.facingLeft ? "Left" : "Right"}`,
            // `JumpedFromWall: ${player?.jumpedFromWall}`,
            // `Active logs: ${gameScene.logSpawner?.activeLogs.length ?? 0}`
            `Feet touching count: ${player?.feetTouchingBodies.length}`,
            `On ice: ${player?.onIce}`
        ]);
    }
}