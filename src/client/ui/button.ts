import { GameObjects } from "phaser";

export class Button extends GameObjects.Sprite {
    callback: Function;

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame?: string | number, tint = false){
        super(scene, x, y, texture, frame);

        scene.add.existing(this);

        this.setInteractive({ useHandCursor: true });

        this.on(Phaser.Input.Events.POINTER_OVER, (event: Phaser.Input.Pointer, gameObjects: Button[]) => {
            this.hover();
        });

        this.on(Phaser.Input.Events.POINTER_OUT, (event: Phaser.Input.Pointer, gameObjects: Button[]) => {
            this.unhover();
        });
    }

    action(callback: Function){
        this.callback = callback;

        this.on(Phaser.Input.Events.POINTER_DOWN, (event: Phaser.Input.Pointer, gameObjects: Button[]) => {
            this.callback();
        });
    }

    hover(duration = 50, callback?: Function){
        this.scene.tweens.add({ targets: this, scale: 1.05, duration: duration});
        if (this.tint){
            this.tint = 0xFFFFFF;
        }
    }

    unhover(duration = 50, callback?: Function){
        this.scene.tweens.add({ targets: this, scale: 1, duration: duration });
        if (this.tint){
            this.tint = 0xAAAAAA;
        }
    }

    trigger(){
        this.callback();
    }
}