import { Player, PlayerState } from "client/entities/player";
import { Static } from "client/entities/static";
import { Background } from "client/entities/background";
import { BackgroundManager } from "client/managers/background-manager";
import config from "client/config";
import { Input } from "phaser";

declare var window: any;

export class GameScene extends Phaser.Scene {
	player: Player;
	gamepadInitialised = false;
	keys: { [key:string]: Phaser.Input.Keyboard.Key };

	constructor() {
		super({
			key: "game"
		});
	}

	create() {
		const bounds = { x: 0, y: 0, width: 6000, height: this.cameras.main.height};

		this.cameras.main.setBackgroundColor("#A9EFFE");

		this.matter.world.setBounds(bounds.x, bounds.y, bounds.width, bounds.height);

		this.player = window.player = new Player(this, 300, 200);

		// const main = new Static(this, 0, 0, "stage1/main", -1);
		// this.matter.alignBody(main, 0, bounds.height, Phaser.Display.Align.BOTTOM_LEFT);

		const screen1 = new Static(this, 0, 0, "screen_1", -1);
		this.matter.alignBody(screen1, 0, bounds.height, Phaser.Display.Align.BOTTOM_LEFT);

		// BackgroundManager.setupSceneBackgrounds(this, [
		// 	{ texture: "stage1/bg1", depth: -2, scrollFactorX: 0.5 },
		// 	{ texture: "stage1/bg2", depth: -3, scrollFactorX: 0.3 },
		// 	{ texture: "stage1/bg3", depth: -4, scrollFactorX: 0.25 },
		// 	{ texture: "stage1/bg4", depth: -5, scrollFactorX: 0.2 },
		// 	{ texture: "stage1/fg1", depth: 1, scrollFactorX: 1.5 },
		// 	{ texture: "stage1/fg2", depth: 2, scrollFactorX: 2 }
		// ]);

		//this.cameras.main.zoom = 0.5;

		this.cameras.main.startFollow(this.player, true, 0.15, 0.15, -500);

		this.cameras.main.setBounds(bounds.x, bounds.y, bounds.width, bounds.height, true);
		
		this.keys = this.input.keyboard.addKeys({
			left: Input.Keyboard.KeyCodes.LEFT,
			right: Input.Keyboard.KeyCodes.RIGHT,
			space: Input.Keyboard.KeyCodes.SPACE,
			up: Input.Keyboard.KeyCodes.UP
		}) as any;

		this.keys.space?.on("down", () => this.player.jump());
		this.keys.up?.on("down", () => this.player.jump());
	}

	update() {
		const pad = this.input.gamepad.getPad(0);

		if (pad && !this.gamepadInitialised) {
			this.gamepadInitialised = true;
			this.setupGamepad(pad);
		}

		if (this.keys.left?.isDown || pad?.axes[0].getValue() === -1) {
			this.player.run(-config.speed);
		} else if (this.keys.right?.isDown || pad?.axes[0].getValue() === 1) {
			this.player.run(config.speed);
		} else if (!this.player.jumping) {
			this.player.idle();
		}
	}

	setupGamepad(pad: Phaser.Input.Gamepad.Gamepad) {
		pad.on(Phaser.Input.Gamepad.Events.BUTTON_DOWN, () => {
			this.player.jump();
		});
	}
}