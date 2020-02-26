import { Player } from "client/entities/player";
import { Static } from "client/entities/static";
import { Background } from "client/entities/background";
import { BackgroundManager } from "client/managers/background-manager";
import config from "client/config";

declare var window: any;

export class GameScene extends Phaser.Scene {
	cursors: Phaser.Types.Input.Keyboard.CursorKeys;
	player: Player;
	gamepadInitialised = false;

	constructor() {
		super({
			key: "game"
		});
	}

	create(){
		const bounds = { x: 0, y: 0, width: 6000, height: this.cameras.main.height * 2};
		
		this.cameras.main.setBackgroundColor("#A9EFFE");

		this.matter.world.setBounds(bounds.x, bounds.y, bounds.width, bounds.height);
		
		this.player = window.player = new Player(this, 300, 1500, "character");

		const main = new Static(this, 0, 0, "stage1/main", -1);
		this.matter.alignBody(main, 0, bounds.height, Phaser.Display.Align.BOTTOM_LEFT);

		BackgroundManager.setupSceneBackgrounds(this, [
			{ texture: "stage1/bg1", depth: -2, scrollFactorX: 0.5 },
			{ texture: "stage1/bg2", depth: -3, scrollFactorX: 0.3 },
			{ texture: "stage1/bg3", depth: -4, scrollFactorX: 0.25 },
			{ texture: "stage1/bg4", depth: -5, scrollFactorX: 0.2 },
			{ texture: "stage1/fg1", depth: 1, scrollFactorX: 1.5 },
			{ texture: "stage1/fg2", depth: 2, scrollFactorX: 2 },
		]);
		
		this.cameras.main.zoom = 0.5;

		this.cameras.main.startFollow(this.player, true, 0.2, 0.2, -500);

		this.cameras.main.setBounds(bounds.x, bounds.y, bounds.width, bounds.height, true);

		this.cursors = this.input.keyboard.createCursorKeys();

		this.cursors.space?.on("down", () => {
			this.player.jump();
		});
	}

	update(){
		const pad = this.input.gamepad.getPad(0);

		if (pad && !this.gamepadInitialised){
			this.gamepadInitialised = true;
			this.setupGamepad(pad);
		}

		const speed = this.player.jumping ? config.speed * 0.8 : config.speed;

		if (this.cursors.left?.isDown || pad?.axes[0].getValue() === -1) {
			this.player.setVelocityX(-speed);
		} else if (this.cursors.right?.isDown || pad?.axes[0].getValue() === 1){
			this.player.setVelocityX(speed);
		}
	}

	setupGamepad(pad: Phaser.Input.Gamepad.Gamepad){
		pad.on(Phaser.Input.Gamepad.Events.BUTTON_DOWN, () => {
			this.player.jump();
		});
	}
}