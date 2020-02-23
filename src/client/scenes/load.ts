export class LoadScene extends Phaser.Scene {
	progressBar: Phaser.GameObjects.Graphics;
	progressBox: Phaser.GameObjects.Graphics;

	constructor() {
		super({
			key: "load"
		});
	}

	preload() {
		const barWidth = 320;
		const barHeight = 50;

		this.cameras.main.setBackgroundColor("rgba(0, 0, 0, 0.5)");

		this.progressBox = this.add.graphics();
		this.progressBar = this.add.graphics();
		this.progressBox.fillStyle(0x222222, 0.8);
		this.progressBox.fillRect(this.cameras.main.width / 2 - barWidth / 2, this.cameras.main.height / 2 - barHeight / 2, barWidth, barHeight);

		this.load.on("progress", (v: number) => {
			this.progressBar.clear();
			this.progressBar.fillStyle(0xdddddd, 1);
			this.progressBar.fillRect(this.cameras.main.width / 2 - barWidth / 2, this.cameras.main.height / 2 - barHeight / 2, barWidth * v, 50);
		});

		this.load.json("shapes", "/sprites/shapes.json");

		this.load.image("character", "/sprites/character/idle.png");

		this.load.image("stage1/main", "/sprites/stage1/main.png");
		this.load.image("stage1/bg1", "/sprites/stage1/bg1.png");
		this.load.image("stage1/bg2", "/sprites/stage1/bg2.png");
		this.load.image("stage1/bg3", "/sprites/stage1/bg3.png");
		this.load.image("stage1/bg4", "/sprites/stage1/bg4.png");
		this.load.image("stage1/fg1", "/sprites/stage1/fg1.png");
		this.load.image("stage1/fg2", "/sprites/stage1/fg2.png");
	}

	create() {
		this.scene.start("game");
	}
}
