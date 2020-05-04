import { GameObjects } from "phaser";
import { GameScene } from "client/scenes/game";

export class Tooltip extends GameObjects.Container {
    active = false;
    interval: Phaser.Time.TimerEvent;

    constructor(scene: Phaser.Scene, x: number, y: number, frameName: string, text: string, fontSize: number = 30, textY = -20, public triggerDistance = 500) {
        super(scene, x, y);

        const frame = scene.add.sprite(0, 0, "misc", `tooltips/${frameName}`);
        const bitmaptext = scene.add.bitmapText(0, textY, "alphabet", text, fontSize, 1).setOrigin(0.5, 0.5);

        this.add([frame, bitmaptext])

        this.scene.add.existing(this);

        this.setScale(0);

        this.setDepth(-1);

        this.interval = this.scene.time.addEvent({
            loop: true,
            delay: 100,
            startAt: 0,
            callback: () => {
                const player = (this.scene as GameScene).player;

                if (player.x > this.x - this.triggerDistance && player.x < this.x + this.triggerDistance && !this.active){
                    this.show();
                }

                if (player.x < this.x - this.triggerDistance || player.x > this.x + this.triggerDistance && this.active){
                    this.hide();
                }
            }
        })
    }

    show(){
        this.active = true;

        this.scene.tweens.add({
            targets: this,
            scaleX: 1,
            scaleY: 1,
            duration: 200,
            ease: Phaser.Math.Easing.Back.Out
        });
    }

    hide(){
        this.active = false;

        this.scene.tweens.add({
            targets: this,
            scaleX: 0,
            scaleY: 0,
            duration: 100,
            ease: Phaser.Math.Easing.Linear
        });
    }
}