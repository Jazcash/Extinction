import { GameObjects } from "phaser";

//@ts-ignore
import ShakePosition from 'phaser3-rex-plugins/plugins/shakeposition.js';

const minPx = 10;
const maxPx = 250;
const maxHeight = maxPx - minPx;

export class PollutionMeter {
    container: GameObjects.Container;
    mainLiquid: GameObjects.Rectangle;
    topLiquid: GameObjects.Sprite;
    overlay: GameObjects.Sprite;
    percent: number = 0;
    shake: ShakePosition;

    constructor(public scene: Phaser.Scene, x: number, y: number, public loader = false) {
        this.container = scene.add.container(x, y);

        const backing = scene.add.sprite(0, 0, "polution-meter", "backing").setOrigin(0);
        const backingAnim = scene.add.sprite(0, 0, "polution-meter", "goo/0").setOrigin(0);
        this.mainLiquid = scene.add.rectangle(69, 318, 38, maxPx, 0x000000).setOrigin(0, 1);
        this.topLiquid = scene.add.sprite(this.mainLiquid.x, this.mainLiquid.y - this.mainLiquid.height, "polution-meter", "top/0").setOrigin(0, 1);
        this.overlay = scene.add.sprite(0, 0, "polution-meter", "overlay").setOrigin(0);

        this.container.add([backingAnim, backing, this.mainLiquid, this.topLiquid, this.overlay]);

        this.topLiquid.anims.animationManager.create({
            key: "top",
            frames: this.topLiquid.anims.animationManager.generateFrameNames("polution-meter", { start: 0, end: 5, prefix: "top/" }),
            frameRate: 6,
            repeat: -1
        });

        backingAnim.anims.animationManager.create({
            key: "backing",
            frames: backingAnim.anims.animationManager.generateFrameNames("polution-meter", { start: 0, end: 6, prefix: "goo/" }),
            frameRate: 6,
            repeat: -1
        });

        this.topLiquid.play("top");
        backingAnim.play("backing");

        this.setPercent(0, true);

        if (!this.loader){
            this.shake = new ShakePosition(this.container, {
                duration: 100000,
                magnitude: 1
            });
        }
    }

    setPercent(percent: number, instant = false){
        if (instant){
            this.mainLiquid.displayHeight = Math.min(minPx + (maxHeight * percent), maxHeight);
            this.topLiquid.setY(this.mainLiquid.y - this.mainLiquid.displayHeight + 1);
            if (percent > 0.9 && !this.loader){
                this.shake.shake();
            }
        } else {
            this.scene.tweens.addCounter({
                from: this.percent,
                to: percent,
                duration: 1000,
                ease: Phaser.Math.Easing.Sine.Out,
                onUpdate: (tween, { value }: { value: number }) => {
                    this.setPercent(value, true);
                }
            });
        }
    }
}