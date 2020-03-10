import { Physics, GameObjects, Game, Types } from "phaser";
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
	startingJump = false;
	spiked = false;

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
			frameRate: 30
		});

		Player.friction = this.body.friction;

		const feet = this.body.parts.find(part => part.label === "feet")!;
		const leftSide = this.body.parts.find(part => part.label === "leftSide")!;
		const rightSide = this.body.parts.find(part => part.label === "rightSide")!;
		
		this.body.parts[1].onCollideCallback = (pair: Types.Physics.Matter.MatterCollisionPair) => {
			if (pair.bodyA.label === "spikes" || pair.bodyB.label === "spikes"){
				requestAnimationFrame(() => this.spike());
			}
		};

		feet.onCollideCallback = () => {
			this.feetTouchingCount++;

			if (this.state === PlayerState.JUMPING){
				this.idle();
			}
		};

		feet.onCollideEndCallback = () => {
			this.feetTouchingCount--;
		};
	}

	test(){
		// const physicsEditorConfig: Phaser.Types.Physics.Matter.MatterSetBodyConfig = this.scene.cache.json.get('shapes')["crouching"];

		// this.setBody(physicsEditorConfig);

		// this.setFixedRotation();

		const crouchBox = this.body.parts.find(part => part.label === "test");

		console.log(crouchBox);
	}

	isAirbourne(){
		return this.feetTouchingCount === 0;
	}

	idle() {
		if (this.state === PlayerState.IDLE) {
			return;
		}

		this.body.friction = Player.friction;

		this.state = PlayerState.IDLE;

		this.hasDoubleJump = false;

		this.anims.stop();

		this.setFrame("idle");
	}

	run(speed: number) {
		const velocity = this.state === PlayerState.JUMPING ? speed * 0.8 : speed;

		this.setVelocityX(speed);
		
		if (velocity > 0) {
			this.setFlipX(false);
		} else {
			this.setFlipX(true);
		}

		if (this.state !== PlayerState.JUMPING) {
			this.state = PlayerState.RUNNING;
			this.play("running", true);
		}
	}

	jump() {
		if (this.state === PlayerState.JUMPING && !this.hasDoubleJump){
			return;
		}

		this.state = PlayerState.JUMPING;

		this.body.friction = 0;

		if (this.hasDoubleJump){
			this.setVelocityY(-config.jump);
			this.hasDoubleJump = false;
		} else if (!this.isAirbourne()){
			this.setVelocityY(-config.jump);
			this.hasDoubleJump = true;
		}
	}

	crouch(){
		this.state = PlayerState.CROUCHING;
	}

	stand(){
		if (this.state !== PlayerState.CROUCHING){
			return;
		}

		this.state = PlayerState.IDLE;
	}

	spike(){
		this.spiked = true;

		this.body.friction = 0;

		this.anims.stop();

		this.setFrame("idle");

		if (this.body.velocity.y > 1){
			this.setVelocityY(-25);
		} else if(this.body.velocity.y < -1){
			this.setVelocityY(25);
		} else if (this.body.velocity.x > 1){
			this.setVelocityX(-5);
			this.body.friction = 0;
		} else if(this.body.velocity.x < -1){
			this.setVelocityX(5);
		}

		this.scene.time.delayedCall(250, () => {
			this.spiked = false;
		});

		this.damage();
	}

	damage(){
		
	}
}