export class Harvester {
    leftClaw: Phaser.Physics.Matter.Sprite;
    rightClaw: Phaser.Physics.Matter.Sprite;

    constructor(public scene: Phaser.Scene, leftClawX: number, rightClawX: number, y: number ){
        this.leftClaw = scene.matter.add.sprite(leftClawX, y, "misc", "claw1");
        this.leftClaw.setBody(this.scene.cache.json.get('shapes').claw1, {
            isStatic: true
        });

        this.rightClaw = scene.matter.add.sprite(rightClawX, y, "misc", "claw2");
        this.rightClaw.setBody(this.scene.cache.json.get('shapes').claw2, {
            isStatic: true
        });
    }
}