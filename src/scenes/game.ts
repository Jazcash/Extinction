import { Player } from "entities/player";
import { Static } from "entities/static";
import { Background } from "entities/background";
import { BackgroundManager } from "managers/background-manager";

declare var window: any;

export class GameScene extends Phaser.Scene {
	cursors: Phaser.Types.Input.Keyboard.CursorKeys;
	player: Player;
	orange: Static;

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
	}

	update(){
		if (this.cursors.left?.isDown) {
			this.player.setVelocityX(-10);
		} else if (this.cursors.right?.isDown){
			this.player.setVelocityX(10);
		}

		if ((this.cursors.space?.isDown || this.cursors.up?.isDown) && !this.player.jumping){
			this.player.setVelocityY(-25);
		}
	}
}