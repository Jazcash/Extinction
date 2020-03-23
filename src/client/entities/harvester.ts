import config from "client/config";

export class Harvester {
    leftClaw: Phaser.Physics.Matter.Sprite;
    rightClaw: Phaser.Physics.Matter.Sprite;
    interval: Phaser.Time.TimerEvent;

    constructor(public scene: Phaser.Scene, leftClawTexture: string, rightClawTexture: string, leftClawX: number, rightClawX: number, y: number ){
        this.leftClaw = scene.matter.add.sprite(leftClawX, y, "misc", leftClawTexture);
        this.leftClaw.setBody(this.scene.cache.json.get('shapes')[leftClawTexture], {
            isStatic: true
        });

        this.rightClaw = scene.matter.add.sprite(rightClawX, y, "misc", rightClawTexture);
        this.rightClaw.setBody(this.scene.cache.json.get('shapes')[rightClawTexture], {
            isStatic: true
        });

        this.scene.tweens.add({
            targets: this.leftClaw,
            x: this.leftClaw.x + 130,
            duration: 300,
            loop: -1,
            loopDelay: 2000,
            ease: Phaser.Math.Easing.Quadratic.Out,
            yoyo: true,
            hold: 1000,
        });

        this.scene.tweens.add({
            targets: this.rightClaw,
            x: this.rightClaw.x - 130,
            duration: 300,
            loop: -1,
            loopDelay: 2000,
            ease: Phaser.Math.Easing.Quadratic.Out,
            yoyo: true,
            hold: 1000,
        });
    }
}