import config from "client/config";
import { Physics } from "phaser";

export class Harvester {
    leftClaw: Phaser.Physics.Matter.Sprite;
    rightClaw: Phaser.Physics.Matter.Sprite;
    interval: Phaser.Time.TimerEvent;

    constructor(public scene: Phaser.Scene, leftClawTexture: string, rightClawTexture: string, leftClawX: number, rightClawX: number, y: number ){
        this.leftClaw = scene.matter.add.sprite(leftClawX, y, "misc", leftClawTexture);
        this.leftClaw.setBody(this.scene.cache.json.get('shapes')[leftClawTexture], { isStatic: true });

        this.rightClaw = scene.matter.add.sprite(rightClawX, y, "misc", rightClawTexture);
        this.rightClaw.setBody(this.scene.cache.json.get('shapes')[rightClawTexture], { isStatic: true });

        this.scene.tweens.addCounter({
            from: 0,
            to: 130,
            duration: 300,
            repeat: -1,
            repeatDelay: 2000,
            ease: Phaser.Math.Easing.Quadratic.Out,
            yoyo: true,
            hold: 1000,
            onUpdate: (tween, { value }: { value: number }) => {
                this.leftClaw.setVelocityX((leftClawX + value) - (this.leftClaw.body as MatterJS.BodyType).position.x);
                this.leftClaw.setX(leftClawX + value);
            },
            onLoop: () => {
                console.log("repeat");
            }
        });

        this.scene.tweens.addCounter({
            from: 0,
            to: 130,
            duration: 300,
            repeat: -1,
            repeatDelay: 2000,
            ease: Phaser.Math.Easing.Quadratic.Out,
            yoyo: true,
            hold: 1000,
            onUpdate: (tween, { value }: { value: number }) => {
                this.rightClaw.setVelocityX((rightClawX - value) - (this.rightClaw.body as MatterJS.BodyType).position.x);
                this.rightClaw.setX(rightClawX - value);
            }
        });
    }
}