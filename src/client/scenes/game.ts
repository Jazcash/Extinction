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

		this.player = window.player = new Player(this, 100, 500);

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
			up: Input.Keyboard.KeyCodes.UP,
			down: Input.Keyboard.KeyCodes.DOWN,
			space: Input.Keyboard.KeyCodes.SPACE,
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

		if (this.player.spiked){
			this.player.body.friction = 0;
		} else {
			if (this.keys.left?.isDown || pad?.axes[0].getValue() === -1) {
				if (this.keys.down?.isDown){
					this.player.crouch(-config.crouchSpeed);
				} else {
					this.player.run(-config.speed);
				}
			} else if (this.keys.right?.isDown || pad?.axes[0].getValue() === 1) {
				if (this.keys.down?.isDown){
					this.player.crouch(config.crouchSpeed);
				} else {
					this.player.run(config.speed);
				}
			} else if (this.keys.down?.isDown) {
				this.player.crouch();
			} else if (this.player.state !== PlayerState.JUMPING){
				this.player.run();
			}

			// if (this.keys.down?.isDown){
			//	this.player.crouch();
			// } else {
			// 	this.player.stand();
			// }
	
			if (this.player.isAirbourne()){
				this.player.state = PlayerState.JUMPING;
	
				this.player.body.friction = 0;
	
				this.player.play("jumping", true);
			} else {
				this.player.body.friction = Player.friction;
			}
		}
	}

	setupGamepad(pad: Phaser.Input.Gamepad.Gamepad) {
		pad.on(Phaser.Input.Gamepad.Events.BUTTON_DOWN, () => {
			this.player.jump();
		});
	}
}