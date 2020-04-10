import { Physics } from "phaser";

interface DrillConfig{
    x: number;
    y: number;
    drillId: 1 | 2 | 3;
    scale: number;
    reach: number;
    duration: number;
}

export class Drill extends Physics.Matter.Sprite{
    constructor(scene: Phaser.Scene, public config: DrillConfig) {
        super(scene.matter.world, config.x, config.y, "misc", `drills/${config.drillId}/0`);

        this.scene.add.existing(this);

        const physicsEditorConfig: Phaser.Types.Physics.Matter.MatterSetBodyConfig = this.scene.cache.json.get('shapes')[`drill${config.drillId}`];

        this.setBody(physicsEditorConfig);

        this.setScale(config.scale);

        this.setFixedRotation();

        this.scene.tweens.addCounter({
            from: 0,
            to: config.reach,
            repeat: -1,
            yoyo: true,
            duration: 2000,
            delay: Math.random() * 2000,
            ease: Phaser.Math.Easing.Sine.InOut,
            onUpdate: (tween, { value }: { value: number }) => {
                this.setY(config.y + value);
            }
        });

        const lastFrame = config.drillId === 3 ? 6 : 2;

        this.anims.animationManager.create({
            key: `drill${config.drillId}`,
            frames: this.anims.animationManager.generateFrameNames("misc", { start: 0, end: lastFrame, prefix: `drills/${config.drillId}/` }),
            frameRate: 12,
            repeat: -1
        });

        this.play(`drill${config.drillId}`);
    }
}