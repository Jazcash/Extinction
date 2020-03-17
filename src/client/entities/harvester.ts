export class Harvester {
    leftClaw: Phaser.Physics.Matter.Sprite;
    rightClaw: Phaser.Physics.Matter.Sprite;

    constructor(public scene: Phaser.Scene, leftClawX: number, rightClawX: number, y: number, ){
        const physicsEditorConfig: Phaser.Types.Physics.Matter.MatterSetBodyConfig = this.scene.cache.json.get('shapes')["claw1"];

        this.leftClaw = scene.matter.add.sprite(leftClawX, y, "misc", "claw1");
        this.leftClaw.setBody(physicsEditorConfig, {
            isStatic: true
        });

        // this.rightClaw = scene.matter.add.sprite(rightClawX, y, "misc", "claw1");
        // this.rightClaw.setBody(physicsEditorConfig, {
        //     isStatic: true,
        //     angle: 50
        // });
    }
}