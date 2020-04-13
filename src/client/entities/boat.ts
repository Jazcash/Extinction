import { Physics } from "phaser";

export class Boat extends Physics.Matter.Sprite{
    body: MatterJS.BodyType;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene.matter.world, x, y, "misc", "boat");

        this.scene.add.existing(this);

        const physicsEditorConfig: Phaser.Types.Physics.Matter.MatterSetBodyConfig = this.scene.cache.json.get('shapes')["boat"];

        this.setBody(physicsEditorConfig);

        this.setFixedRotation();

        this.setDepth(-2);

        this.scene.tweens.addCounter({
            from: 0,
            to: 10,
            repeat: -1,
            yoyo: true,
            duration: 1000,
            ease: Phaser.Math.Easing.Sine.InOut,
            onUpdate: (tween, { value }: { value: number }) => {
                this.setY(y + value);
            }
        });

        this.scene.tweens.addCounter({
            from: 0,
            to: 400,
            repeat: -1,
            yoyo: true,
            duration: 10000,
            ease: Phaser.Math.Easing.Sine.InOut,
            onUpdate: (tween, { value }: { value: number }) => {
                this.setVelocityX((x + value) - this.body.position.x);
                this.setX(x + value);
            }
        });
    }
}