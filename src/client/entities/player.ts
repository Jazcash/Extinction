import { Physics, GameObjects, Game, Types } from "phaser";
import config from "client/config";
import { Utils } from "client/utils/utils";
import { Rubbish } from "./rubbish";
import { UIScene } from "client/scenes/ui";

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
    static gender: string = "girl";

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
    crouching = false;
    onIce = false;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene.matter.world, x, y, "player", `${Player.gender}/idle`);

        this.scene.add.existing(this);

        const physicsEditorConfig: Phaser.Types.Physics.Matter.MatterSetBodyConfig = this.scene.cache.json.get('shapes')["player"];

        this.setBody(physicsEditorConfig);

        this.setFixedRotation();

        this.anims.animationManager.create({
            key: "running",
            frames: this.anims.animationManager.generateFrameNames("player", { start: 0, end: 7, prefix: `${Player.gender}/running/` }),
            frameRate: 15,
            repeat: -1
        });

        this.anims.animationManager.create({
            key: "crouching",
            frames: this.anims.animationManager.generateFrameNames("player", { start: 0, end: 5, prefix: `${Player.gender}/crouching/` }),
            frameRate: 15,
            repeat: -1
        });

        this.anims.animationManager.create({
            key: "jumping",
            frames: this.anims.animationManager.generateFrameNames("player", { start: 0, end: 9, prefix: `${Player.gender}/jumping/` }),
            frameRate: 20
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
            if (pair.bodyB.label === "spikes"){
                this.spike();
            }

            if (pair.bodyB.label === "rubbish"){
                const rubbish = pair.bodyB.gameObject as Rubbish;
                rubbish.collect();
            }
        };

        this.parts.feet.onCollideCallback = (pair: Types.Physics.Matter.MatterCollisionPair) => {
            this.feetTouchingCount++;

            if (this.state === PlayerState.JUMPING){
                this.run();
            }

            if (pair.bodyB.label === "ice"){
                this.onIce = true;
            }
        };

        this.parts.feet.onCollideEndCallback = (pair: Types.Physics.Matter.MatterCollisionPair) => {
            this.feetTouchingCount--;

            if (pair.bodyB.label === "ice"){
                this.onIce = false;
            }
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

        if (this.crouching){
            this.parts.main.vertices![0].y -= 50;
            this.parts.main.vertices![1].y -= 50;
            this.crouching = false;
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
            this.setFrame(`${Player.gender}/idle`);

            this.state = PlayerState.IDLE;

            this.hasDoubleJump = false;
        }
    }

    crouch(speed?: number){
        if (this.state === PlayerState.JUMPING){
            return;
        }

        if (!this.crouching){
            this.parts.main.vertices![0].y += 50;
            this.parts.main.vertices![1].y += 50;
            this.crouching = true;
        }

        this.state = PlayerState.CROUCHING;

        if (speed){
            this.setVelocityX(speed);

            this.setFlipX(speed < 0);

            this.facingLeft = speed < 0;

            this.play("crouching", true);
        } else {
            this.setFrame(`${Player.gender}/crouching/0`);
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

            this.hasDoubleJump = true;

            this.scene.time.delayedCall(50, () => this.jumpedFromWall = false);
        } else {
            if (this.hasDoubleJump){
                this.setVelocityY(-config.jump);
                this.hasDoubleJump = false;
            } else if (!this.isAirbourne()){
                this.setVelocityY(-config.jump);
                this.hasDoubleJump = true;
            }
        }

        this.state = PlayerState.JUMPING;

        this.body.friction = 0;

        this.play("jumping");
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

        this.setFrame(`${Player.gender}/climb`);

        this.hasDoubleJump = true;
    }

    spike(){
        this.anims.stop();

        this.setFrame(`${Player.gender}/idle`);

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

        (this.scene.scene.get("ui") as UIScene).damage(1);
    }
}