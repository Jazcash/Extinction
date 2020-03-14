import { Physics, GameObjects, Game, Types } from "phaser";
import config from "client/config";
import { Utils } from "client/utils/utils";

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
	parts: {
		main: MatterJS.BodyType;
		crouch: MatterJS.BodyType;
		feet: MatterJS.BodyType;
		leftSensor: MatterJS.BodyType;
		rightSensor: MatterJS.BodyType;
	}

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
			key: "crouching",
			frames: this.anims.animationManager.generateFrameNames("player", { start: 0, end: 5, prefix: "crouching/" }),
			frameRate: 15,
			repeat: -1
		});

		this.anims.animationManager.create({
			key: "jumping",
			frames: this.anims.animationManager.generateFrameNames("player", { start: 0, end: 11, prefix: "jumping/" }),
			frameRate: 30
		});

		Player.friction = this.body.friction;

		this.parts = {
			main: this.body.parts.find(part => part.label === "main")!,
			crouch: this.body.parts.find(part => part.label === "crouch")!,
			feet: this.body.parts.find(part => part.label === "feet")!,
			leftSensor: this.body.parts.find(part => part.label === "leftSide")!,
			rightSensor: this.body.parts.find(part => part.label === "rightSide")!
		}
		
		this.parts.main.onCollideCallback = (pair: Types.Physics.Matter.MatterCollisionPair) => {
			if (pair.bodyA.label === "spikes" || pair.bodyB.label === "spikes"){
				this.spike();
			}
		};

		this.parts.feet.onCollideCallback = () => {
			this.feetTouchingCount++;

			if (this.state === PlayerState.JUMPING){
				this.run();
			}
		};

		this.parts.feet.onCollideEndCallback = () => {
			this.feetTouchingCount--;
		};
	}

	isAirbourne(){
		return this.feetTouchingCount === 0;
	}

	run(speed?: number) {
		if (this.state === PlayerState.CROUCHING){
			//this.parts.main.vertices![0].y = 690;
			//this.parts.main.vertices![1].y = 690;
		}

		if (this.state !== PlayerState.JUMPING) {
			this.state = PlayerState.RUNNING;

			this.play("running", true);
		}
		
		if (speed){
			const velocity = this.state === PlayerState.JUMPING ? speed * 0.8 : speed;

			this.setVelocityX(velocity);

			this.setFlipX(speed < 0);
		} else {
			this.setFrame("idle");
			
			this.state = PlayerState.IDLE;

			this.hasDoubleJump = false;
		}
	}
	
	crouch(speed?: number){
		if (this.state !== PlayerState.CROUCHING){
			//this.parts.main.vertices![0].y = 735;
			//this.parts.main.vertices![1].y = 735;
		}

		if (this.state !== PlayerState.JUMPING) {
			this.state = PlayerState.CROUCHING;

			this.play("crouching", true);
		}

		if (speed){
			this.setVelocityX(speed);

			this.setFlipX(speed < 0);
		} else {
			this.setFrame("crouching/0");
		}
	}

	jump() {
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
			this.body.friction = Player.friction;
		});

		this.damage();
	}

	damage(){
		
	}
}