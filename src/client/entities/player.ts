import { Physics, GameObjects, Game, Types } from "phaser";
import config from "client/config";
import { Utils } from "client/utils/utils";

export enum PlayerState {
	IDLE = "IDLE",
	RUNNING = "RUNNING",
	JUMPING = "JUMPING",
	CROUCHING = "CROUCHING",
	CLIMBING = "CLIMBING",
	SPIKED = "SPIKED"
}

export class Player extends Physics.Matter.Sprite {
	static friction: number;

	state: PlayerState = PlayerState.IDLE;
	body: MatterJS.BodyType;
	canJump = false;
	hasDoubleJump = false;
	sensors: { [key: string]: MatterJS.BodyType};
	startingJump = false;
	parts: {
		main: MatterJS.BodyType;
		crouch: MatterJS.BodyType;
		feet: MatterJS.BodyType;
		leftSensor: MatterJS.BodyType;
		rightSensor: MatterJS.BodyType;
	};
	feetTouchingCount = 0;
	leftTouchingCount = 0;
	rightTouchingCount = 0;
	facingLeft = false;
	jumpedFromWall = false;


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
		};
		
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

		this.parts.leftSensor.onCollideCallback = () => {
			this.leftTouchingCount++;
		};

		this.parts.leftSensor.onCollideEndCallback = () => {
			this.leftTouchingCount--;
		};
		
		this.parts.rightSensor.onCollideCallback = () => {
			this.leftTouchingCount++;
		};

		this.parts.rightSensor.onCollideEndCallback = () => {
			this.leftTouchingCount--;
		};
	}

	isAirbourne(){
		return this.feetTouchingCount === 0;
	}

	touchingLeft(){
		return this.leftTouchingCount > 0;
	}

	touchingRight(){
		return this.rightTouchingCount > 0;
	}

	canClimb(){
		return (this.state === PlayerState.JUMPING || this.state === PlayerState.CLIMBING) && (this.touchingLeft() || this.touchingRight()) && !this.jumpedFromWall;
	}

	run(speed?: number) {
		if (this.jumpedFromWall){
			return;
		}

		if (this.state === PlayerState.CROUCHING){
			this.parts.main.vertices![0].y -= 50;
			this.parts.main.vertices![1].y -= 50;
		}

		if (this.state !== PlayerState.JUMPING) {
			this.state = PlayerState.RUNNING;

			this.play("running", true);
		}
		
		if (speed){
			const velocity = this.state === PlayerState.JUMPING ? speed * 0.8 : speed;

			this.setVelocityX(velocity);

			this.setFlipX(speed < 0);
			this.facingLeft = speed < 0;
		} else {
			this.setFrame("idle");
			
			this.state = PlayerState.IDLE;

			this.hasDoubleJump = false;
		}
	}
	
	crouch(speed?: number){
		if (this.state === PlayerState.JUMPING){
			return;
		}

		if (this.state !== PlayerState.CROUCHING){
			this.parts.main.vertices![0].y += 50;
			this.parts.main.vertices![1].y += 50;
		}

		this.state = PlayerState.CROUCHING;

		if (speed){
			this.setVelocityX(speed);

			this.setFlipX(speed < 0);

			this.facingLeft = speed < 0;

			this.play("crouching", true);
		} else {
			this.setFrame("crouching/0");
		}
	}

	jump() {
		if (this.state === PlayerState.CROUCHING){
			return;
		}

		if (this.state === PlayerState.JUMPING && !this.hasDoubleJump){
			return;
		}

		if (this.state === PlayerState.CLIMBING){
			if (this.facingLeft){
				this.setVelocityX(config.speed);
			} else {
				this.setVelocityX(-config.speed);
			}

			this.setVelocityY(-config.jump);

			this.jumpedFromWall = true;

			this.scene.time.delayedCall(50, () => this.jumpedFromWall = false);
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

	stand(){
		if (this.state !== PlayerState.CROUCHING){
			return;
		}

		this.state = PlayerState.IDLE;
	}

	climb(){
		this.state = PlayerState.CLIMBING;

		this.body.friction = 10;

		this.anims.stop();

		this.setFrame("idle");

		this.hasDoubleJump = true;
	}

	spike(){
		this.anims.stop();

		this.setFrame("idle");

		this.hasDoubleJump = true;

		this.body.friction = 0;

		const prevState = this.state;

		this.state = PlayerState.SPIKED;

		if (this.body.velocity.y > 1){
			requestAnimationFrame(() => this.setVelocityY(-config.knockbackY));
		} else if(this.body.velocity.y < -1){
			requestAnimationFrame(() => this.setVelocityY(config.knockbackY));
		}

		if (this.body.velocity.y > 1 || this.body.velocity.y < -1){
			if (this.body.velocity.x > 1){
				requestAnimationFrame(() => { this.setVelocityX(config.knockbackX); this.body.friction = 0; });
			} else if(this.body.velocity.x < -1){
				requestAnimationFrame(() => { this.setVelocityX(-config.knockbackX); this.body.friction = 0; });
			}
		} else {
			if (this.body.velocity.x > 1){
				requestAnimationFrame(() => this.setVelocityX(-config.knockbackX));
			} else if(this.body.velocity.x < -1){
				requestAnimationFrame(() => this.setVelocityX(config.knockbackX));
			}
		}

		this.scene.time.delayedCall(100, () => {
			this.body.friction = Player.friction;
			this.state = prevState;
		});

		this.damage();
	}

	damage(){
		for (let i=0; i<10; i++){
			this.scene.time.delayedCall(i * 50, () => this.alpha = Number(!this.alpha));
		}
	}
}