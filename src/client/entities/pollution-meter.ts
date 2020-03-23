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
    percent = 0;
    shake: any;

    constructor(public scene: Phaser.Scene, x: number, y: number) {
        this.container = scene.add.container(x, y);

        const backing = scene.add.sprite(0, 0, "misc", "meter-backing").setOrigin(0);
        const backingAnim = scene.add.sprite(0, 0, "misc", "polution-meter-goo/0").setOrigin(0);
        this.mainLiquid = scene.add.rectangle(69, 318, 38, maxPx, 0x000000).setOrigin(0, 1);
        this.topLiquid = scene.add.sprite(this.mainLiquid.x, this.mainLiquid.y - this.mainLiquid.height, "misc", "pollution-meter-top/0").setOrigin(0, 1);
        this.overlay = scene.add.sprite(0, 0, "misc", "meter-overlay").setOrigin(0);

        this.container.add([backingAnim, backing, this.mainLiquid, this.topLiquid, this.overlay]);

        this.topLiquid.anims.animationManager.create({
            key: "liquid-top",
            frames: this.topLiquid.anims.animationManager.generateFrameNames("misc", { start: 0, end: 5, prefix: "pollution-meter-top/" }),
            frameRate: 10,
            repeat: -1
        });

        backingAnim.anims.animationManager.create({
            key: "backing",
            frames: backingAnim.anims.animationManager.generateFrameNames("misc", { start: 0, end: 6, prefix: "polution-meter-goo/" }),
            frameRate: 10,
            repeat: -1
        });

        this.topLiquid.play("liquid-top");
        backingAnim.play("backing");

        this.setPercent(0, true);

        this.shake = new ShakePosition(this.container, {
            duration: 100000,
            magnitude: 1
        });
    }

    setPercent(percent: number, instant = false){
        if (instant){
            this.mainLiquid.displayHeight = Math.min(minPx + (maxHeight * percent), maxHeight);
            this.topLiquid.setY(this.mainLiquid.y - this.mainLiquid.displayHeight + 1);
            if (percent > 0.9){
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