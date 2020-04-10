import { Physics } from "phaser";

export class IceCap extends Physics.Matter.Sprite{
    constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
        super(scene.matter.world, x, y, "misc", texture);

        this.scene.add.existing(this);

        const physicsEditorConfig: Phaser.Types.Physics.Matter.MatterSetBodyConfig = this.scene.cache.json.get('shapes')[texture];

        this.setBody(physicsEditorConfig);

        this.setFixedRotation();

        this.scene.tweens.addCounter({
            from: 0,
            to: 30,
            repeat: -1,
            yoyo: true,
            duration: 2000,
            delay: Math.random() * 2000,
            ease: Phaser.Math.Easing.Sine.InOut,
            onUpdate: (tween, { value }: { value: number }) => {
                this.setY(y + value);
            }
        });
    }
}