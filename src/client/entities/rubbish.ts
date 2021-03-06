import { Physics } from "phaser";
import { GameScene } from "client/scenes/game";
import { UIScene } from "client/scenes/ui";
import config from "client/config";

export class Rubbish extends Physics.Matter.Sprite{
    startingY: number;
    tween: Phaser.Tweens.Tween;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene.matter.world, x, y, "misc", `rubbish/${Math.floor(Math.random() * 10)}`);

        this.scene.add.existing(this);

        this.startingY = y;

        this.setBody({}, {
            label: "rubbish",
            isSensor: true,
            isStatic: true
        });

        this.setDepth(-1);

        this.hover();
    }

    hover(){
        this.tween = this.scene.tweens.addCounter({
            from: 0,
            to: 50,
            repeat: -1,
            yoyo: true,
            duration: 2000,
            ease: Phaser.Math.Easing.Sine.InOut,
            onUpdate: (tween, { value }: { value: number }) => {
                this.setY(this.startingY + value);
            }
        });
    }

    collect(){
        this.tween.stop();

        this.scene.tweens.addCounter({
            from: this.scaleX,
            to: 0,
            duration: 100,
            ease: Phaser.Math.Easing.Quadratic.Out,
            onUpdate: (tween, { value }: { value: number }) => {
                this.setScale(value);
            },
            onComplete: () => {
                (this.scene.scene.get("ui") as UIScene).addTime(config.rubbishAdds * 1000);
            }
        });
    }
}