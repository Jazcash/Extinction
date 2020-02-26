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
		this.text = this.add.text(5, 5, "", {
			stroke: "#000",
			strokeThickness: 4,
			fontFamily: "Arial"
		} as Phaser.Types.GameObjects.Text.TextStyle);
	}

	update() {
		const gameScene = this.scene.get("game") as GameScene | undefined;
		const player = gameScene?.player;

		if (!gameScene) {
			return;
		}

		this.text.setText([
			`FPS: ${this.game.loop.actualFps.toFixed()}`,
			`Player State: ${player?.state}`
			// `Jumping: ${gameScene.player?.jumping}`,
			// `Has Double Jump: ${gameScene.player?.hasDoubleJump}`,
			// `Axes 0: ${this.input.gamepad.getPad(0)?.axes[0].getValue()}`,
			// `Axes 1: ${this.input.gamepad.getPad(0)?.axes[1].getValue()}`,
			// `Player Velocity: X: ${player?.body.velocity.x.toFixed(2)}, Y: ${player?.body.velocity.y.toFixed(2)}`,
		]);
	}
}