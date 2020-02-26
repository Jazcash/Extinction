import { Physics, GameObjects } from "phaser";
import config from "client/config";

export enum PlayerState {
	IDLE = "IDLE",
	RUNNING = "RUNNING",
	JUMPING = "JUMPING"
}

export class Player extends Physics.Matter.Sprite {
	state: PlayerState = PlayerState.IDLE;
	body: MatterJS.BodyType;
	jumping = false;
	hasDoubleJump = false;
	sensors: { [key: string]: MatterJS.BodyType};

	constructor(scene: Phaser.Scene, x: number, y: number, texture = "player") {
		super(scene.matter.world, x, y, texture, "idle");

		this.scene.add.existing(this);

		const physicsEditorConfig: Phaser.Types.Physics.Matter.MatterSetBodyConfig = this.scene.cache.json.get('shapes')[texture];

		this.setBody(physicsEditorConfig);

		this.setFixedRotation();

		const friction = this.body.friction;

		this.world.on("collisionstart", (event: Physics.Matter.Events.CollisionStartEvent) => {
			event.pairs.forEach(pair => {
				if (pair.bodyA.label === "feet" || pair.bodyB.label === "feet") {
					this.jumping = false;
					this.hasDoubleJump = false;
					this.body.friction = friction;
				}
			});
		});

		this.world.on("collisionend", (event: Physics.Matter.Events.CollisionStartEvent, a: MatterJS.BodyType, b: any) => {
			event.pairs.forEach(pair => {
				if (pair.bodyA.label === "feet" || pair.bodyB.label === "feet") {
					this.jumping = true;
					this.body.friction = 0;
				}
			});
		});

		this.anims.animationManager.create({
			key: "running",
			frames: this.anims.animationManager.generateFrameNames("player", { start: 0, end: 13, prefix: "running/" }),
			frameRate: 15,
			repeat: -1
		});

		this.anims.animationManager.create({
			key: "jumping",
			frames: this.anims.animationManager.generateFrameNames("player", { start: 0, end: 18, prefix: "jumping/" }),
			frameRate: 15
		});
	}

	idle() {
		if (this.state === PlayerState.IDLE) {
			return;
		}

		this.state = PlayerState.IDLE;

		this.anims.stop();

		this.setFrame("idle");
	}

	run(speed: number) {
		const velocity = this.jumping ? speed * 0.8 : speed;

		this.setVelocityX(speed);

		this.scaleX = velocity > 0 ? 1 : -1;
		this.setFixedRotation();

		if (!this.jumping) {
			this.state = PlayerState.RUNNING;
			this.play("running", true);
		}
	}

	jump() {
		this.state = PlayerState.JUMPING;

		if (!this.jumping) {
			this.setVelocityY(-config.jump);
			this.hasDoubleJump = true;
			this.play("jumping");
		} else if (this.jumping && this.hasDoubleJump) {
			this.setVelocityY(-config.jump);
			this.hasDoubleJump = false;
			this.play("jumping");
		}
	}
}