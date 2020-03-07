import { Physics, GameObjects } from "phaser";
import config from "client/config";

export enum PlayerState {
	IDLE = "IDLE",
	RUNNING = "RUNNING",
	JUMPING = "JUMPING",
	CROUCHING = "CROUCHING",
	CLIMBING = "CLIMBING"
}

export class Player extends Physics.Matter.Sprite {
	static friction: number;

	state: PlayerState = PlayerState.IDLE;
	body: MatterJS.BodyType;
	canJump = false;
	hasDoubleJump = false;
	sensors: { [key: string]: MatterJS.BodyType};
	feetTouchingCount = 0;

	constructor(scene: Phaser.Scene, x: number, y: number, texture = "player") {
		super(scene.matter.world, x, y, texture, "idle");

		this.scene.add.existing(this);

		const physicsEditorConfig: Phaser.Types.Physics.Matter.MatterSetBodyConfig = this.scene.cache.json.get('shapes')[texture];

		this.setBody(physicsEditorConfig);

		this.setFixedRotation();

		this.anims.animationManager.create({
			key: "running",
			frames: this.anims.animationManager.generateFrameNames("player", { start: 0, end: 7, prefix: "running/" }),
			frameRate: 15,
			repeat: -1
		});

		this.anims.animationManager.create({
			key: "jumping",
			frames: this.anims.animationManager.generateFrameNames("player", { start: 0, end: 11, prefix: "jumping/" }),
			frameRate: 15
		});

		Player.friction = this.body.friction;

		const feet = this.body.parts.find(part => part.label === "feet")!;
		const leftSide = this.body.parts.find(part => part.label === "leftSide")!;
		const rightSide = this.body.parts.find(part => part.label === "rightSide")!;
		
		feet.onCollideCallback = () => {
			this.feetTouchingCount++;

			// this.body.friction = friction;

			if (this.state === PlayerState.JUMPING){
				this.idle();
			}
		};

		feet.onCollideEndCallback = () => {
			this.feetTouchingCount--;

			// if (this.feetTouchingCount === 0){
			// 	console.log("uncollide");

			// 	this.state = PlayerState.JUMPING;

			// 	this.body.friction = 0;
			// }
		};
	}

	isAirbourne(){
		return this.feetTouchingCount === 0;
	}

	idle() {
		if (this.state === PlayerState.IDLE) {
			return;
		}

		this.state = PlayerState.IDLE;

		this.hasDoubleJump = false;

		this.anims.stop();

		this.setFrame("idle");
	}

	run(speed: number) {
		const velocity = this.state === PlayerState.JUMPING ? speed * 0.8 : speed;

		this.setVelocityX(speed);

		this.scaleX = velocity > 0 ? 1 : -1;
		this.setFixedRotation();

		if (this.state !== PlayerState.JUMPING) {
			this.state = PlayerState.RUNNING;
			this.play("running", true);
		}
	}

	jump() {
		// if (!this.isAirbourne() && !this.hasDoubleJump) {
		// 	this.state = PlayerState.JUMPING;
		// 	this.setVelocityY(-config.jump);
		// 	this.hasDoubleJump = true;
		// 	//this.play("jumping");
		// } else if (this.isAirbourne() && this.hasDoubleJump) {
		// 	this.setVelocityY(-config.jump);
		// 	this.hasDoubleJump = false;
		// 	//this.play("jumping");
		// }
		if (this.state === PlayerState.JUMPING && !this.hasDoubleJump){
			return;
		}

		this.state = PlayerState.JUMPING;

		if (this.hasDoubleJump){
			this.setVelocityY(-config.jump);
			this.hasDoubleJump = false;
		} else if (!this.isAirbourne()){
			this.setVelocityY(-config.jump);
			this.hasDoubleJump = true;
		}

		this.play("jumping");
	}

	update(){
		if (this.isAirbourne()){
			this.body.friction = 0;
		} else {
			this.body.friction = Player.friction;
		}
	}
}