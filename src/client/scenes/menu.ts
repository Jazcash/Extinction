import { Input } from "phaser";
import { GameScene } from "./game";

export class MenuScene extends Phaser.Scene {
	keys: { [key:string]: Phaser.Input.Keyboard.Key };

	constructor() {
		super({
			key: "menu"
		});
	}

	create() {
		this.add.sprite(100, 100, "player", "idle");
	
		this.keys = this.input.keyboard.addKeys({
			esc: Input.Keyboard.KeyCodes.ESC
		}) as any;

		this.keys.esc?.on("down", () => {
			this.unpause();
		});
	}

	unpause(){
		(this.scene.get("game") as GameScene).resume();

		this.scene.stop();
	}
}