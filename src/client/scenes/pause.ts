import { Input, Display, GameObjects, Game } from "phaser";
import { GameScene } from "./game";
import { GaussianBlur1 } from "client/shaders/gaussian-blur-1-pipeline";
import { UIScene } from "./ui";

const menuTextStyle: Phaser.Types.GameObjects.Text.TextStyle = {
	fontFamily: "Roboto",
	fontSize: "90px",
	fontStyle: "500",
	fixedHeight: 160,
	shadow: {
		offsetX: 0,
		offsetY: 5,
		fill: true,
		color: "#008683",
	}
};

export class PauseScene extends Phaser.Scene {
	keys: { [key:string]: Phaser.Input.Keyboard.Key };
	menuElements: Array<GameObjects.Sprite | GameObjects.Text | GameObjects.Rectangle | GameObjects.Graphics> = [];
	mainElements: Array<GameObjects.Sprite | GameObjects.Text | GameObjects.Rectangle | GameObjects.Graphics> = [];
	controlsElements: Array<GameObjects.Sprite | GameObjects.Text | GameObjects.Rectangle | GameObjects.Graphics> = [];
	customPipeline: Phaser.Renderer.WebGL.WebGLPipeline;
	active:boolean = false;
	selectedOption: number = 0;
	options: Array<GameObjects.Text> = [];
	selectedBorder: GameObjects.Graphics;
	controlsActive = false;

	constructor() {
		super({
			key: "pause",
			active: false
		});
	}

	create() {
		this.keys = this.input.keyboard.addKeys({
			esc: Input.Keyboard.KeyCodes.ESC,
			up: Input.Keyboard.KeyCodes.UP,
			down: Input.Keyboard.KeyCodes.DOWN,
			space: Input.Keyboard.KeyCodes.SPACE
		}) as any;

		this.keys.esc?.on("down", () => this.exit());
		this.keys.up?.on("down", () => this.selectAbove());
		this.keys.down?.on("down", () => this.selectBelow());
		this.keys.space?.on("down", () => this.triggerOption());

		const pauseOverlayRect = this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x00AD7F, 0.35);
		pauseOverlayRect.setOrigin(0, 0);
		pauseOverlayRect.setAlpha(0);

		const pauseBorder = this.add.sprite(0, 0, "misc", "pause-overlay").setOrigin(0, 0);

		const headingStyle = Object.assign({}, menuTextStyle, { fontSize: "150px" });

		const pausedText = this.add.text(this.cameras.main.centerX, 200, "Paused", headingStyle).setOrigin(0.5);
		const resumeText = this.add.text(this.cameras.main.centerX, pausedText.getBounds().bottom + 150, "Resume", menuTextStyle).setOrigin(0.5);
		const controlsText = this.add.text(this.cameras.main.centerX, resumeText.getBounds().bottom + 75, "Controls", menuTextStyle).setOrigin(0.5);
		const menuText = this.add.text(this.cameras.main.centerX, controlsText.getBounds().bottom + 75, "Menu", menuTextStyle).setOrigin(0.5);

		this.selectedBorder = this.add.graphics({ lineStyle: { color: 0xffffff, width:12}});
		this.selectedBorder.strokeRoundedRect(this.cameras.main.centerX - 300, 0, 600, 150, 75);
		this.selectedBorder.setY(resumeText.getBounds().top - 20);

		const controlsTitle = this.add.text(this.cameras.main.centerX, 200, "Controls", headingStyle).setOrigin(0.5).setAlpha(0);
		const controlsImage = this.add.sprite(0, 0, "misc", "controls").setOrigin(0, 0).setAlpha(0);

		this.mainElements.push(pauseBorder, pauseOverlayRect);

		this.menuElements.push(pausedText, resumeText, controlsText, menuText, this.selectedBorder);

		this.controlsElements.push(controlsTitle, controlsImage);
		
		this.options.push(resumeText, controlsText, menuText);

		[...this.mainElements, ...this.menuElements].forEach(obj => obj.setAlpha(0));

		if (this.game.renderer instanceof Phaser.Renderer.WebGL.WebGLRenderer){
			this.customPipeline = this.game.renderer.addPipeline("GaussianBlur1", new GaussianBlur1(this.game));
			this.customPipeline.setFloat2('iResolution', 1920, 1080);
			this.customPipeline.setFloat1('Size', 0);
		}

		this.scene.sleep();
	}

	exit(){
		if (this.controlsActive){
			this.menuElements.forEach(obj => obj.setAlpha(1));
			this.controlsElements.forEach(obj => obj.setAlpha(0));

			this.controlsActive = false;
			
			return;
		}

		const gameScene = this.scene.get("game") as GameScene;
		const uiScene = this.scene.get("ui") as UIScene;

		if (!this.active){
			[gameScene, uiScene].forEach(scene => scene.cameras.main.setRenderToTexture(this.customPipeline));

			this.tweens.addCounter({
				from: 0,
				to: 80,
				duration: 200,
				onUpdate: (tween, current) => {
					this.customPipeline.setFloat1('Size', current.value);
					[...this.mainElements, ...this.menuElements].forEach(obj => obj.setAlpha(tween.progress));
				},
				onComplete: () => {
					[gameScene, uiScene].forEach(scene => scene.scene.pause());
				}
			});
		} else {
			gameScene.scene.resume();

			this.tweens.addCounter({
				from: 80,
				to: 0,
				duration: 200,
				onUpdate: (tween, current) => {
					this.customPipeline.setFloat1('Size', current.value);
					[...this.mainElements, ...this.menuElements].forEach(obj => obj.setAlpha(1 - tween.progress));
				},
				onComplete: () => {
					[gameScene, uiScene].forEach(scene => scene.cameras.main.clearRenderToTexture());

					this.scene.sleep();
				}
			});
		}

		this.active = !this.active;
	}

	showControls(){
		this.controlsActive = true;

		this.menuElements.forEach(obj => obj.setAlpha(0));
		this.controlsElements.forEach(obj => obj.setAlpha(1));
	}

	selectAbove() {
		this.selectedOption = this.selectedOption === 0 ? this.options.length - 1 : this.selectedOption - 1;
		const option = this.options[this.selectedOption];

		this.selectedBorder.setY(option.getBounds().top - 20);
	}

	selectBelow() {
		this.selectedOption = this.selectedOption === this.options.length - 1 ? 0 : this.selectedOption + 1;
		const option = this.options[this.selectedOption];

		this.selectedBorder.setY(option.getBounds().top - 20);
	}

	triggerOption(){
		if (this.selectedOption === 0){
			this.exit();
		} else if (this.selectedOption === 1){
			this.showControls();
		}
	}

	resume(){
		this.scene.wake();

		this.exit();
	}
}