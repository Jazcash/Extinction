import { Player, PlayerState } from "client/entities/player";
import { BackgroundManager } from "client/managers/background-manager";
import config from "client/config";
import { Input } from "phaser";
import { GaussianBlur1 } from "client/shaders/gaussian-blur-1-pipeline";
import { PauseScene } from "./pause";

declare var window: any;

export class GameScene extends Phaser.Scene {
	player: Player;
	gamepadInitialised = false;
	keys: { [key:string]: Phaser.Input.Keyboard.Key };
	t: number = 0;

	constructor() {
		super({
			key: "game"
		});
	}

	create() {
		const bounds = { x: 0, y: 0, width: 6000, height: 1080};

		this.cameras.main.setBackgroundColor("#A9EFFE");

		this.cameras.main.setBounds(bounds.x, bounds.y, bounds.width, bounds.height, true);
		this.matter.world.setBounds(bounds.x, bounds.y, bounds.width, bounds.height);

		this.player = window.player = new Player(this, 100, 100);

		const world = window.world = this.matter.add.fromPhysicsEditor(0, 0, this.cache.json.get('shapes').world);
		this.matter.alignBody(world, 0, bounds.height, Phaser.Display.Align.BOTTOM_LEFT);

		BackgroundManager.setupSceneBackgrounds(this, 8, [
			// { textures: ["bg4"], depth: -4, scrollFactorX: 0.2 },
			// { textures: ["bg3"], depth: -3, scrollFactorX: 0.25 },
			// { textures: ["bg2"], depth: -2, scrollFactorX: 0.3 },
			// { textures: ["bg1"], depth: -1, scrollFactorX: 0.5 },
			{ texture: "bg1", depth: -1, scrollFactorX: 1 },
			// { textures: ["fg1"], depth: 1, scrollFactorX: 1.5 },
			// { textures: ["fg2"], depth: 2, scrollFactorX: 2 },
		]);

		this.cameras.main.startFollow(this.player, true, 0.15, 0.15, -500);
		
		this.keys = this.input.keyboard.addKeys({
			left: Input.Keyboard.KeyCodes.LEFT,
			right: Input.Keyboard.KeyCodes.RIGHT,
			space: Input.Keyboard.KeyCodes.SPACE,
			up: Input.Keyboard.KeyCodes.UP,
			esc: Input.Keyboard.KeyCodes.ESC
		}) as any;

		this.keys.space?.on("down", () => this.player.jump());
		this.keys.up?.on("down", () => this.player.jump());
		this.keys.esc?.on("down", () => (this.scene.get("pause") as PauseScene).resume())

		this.scene.run("pause");
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
		} else if (this.player.state !== PlayerState.JUMPING){
			this.player.idle();
		}
	}

	setupGamepad(pad: Phaser.Input.Gamepad.Gamepad) {
		pad.on(Phaser.Input.Gamepad.Events.BUTTON_DOWN, () => {
			this.player.jump();
		});
	}
}