import { BlurPipeline } from "client/shaders/blur-pipeline";
import { GrayscalePipeline } from "client/shaders/grayscale-pipeline";
import { Input } from "phaser";

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
		//this.scene.sleep();
		console.log("unpause");
		//this.scene.get("game").scene.resume();
		//this.scene.sleep();
	}
}