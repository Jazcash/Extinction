import { GameObjects } from "phaser";

export class Button extends GameObjects.Sprite {
    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame?: string | number){
        super(scene, x, y, texture, frame);

        scene.add.existing(this);

        this.setInteractive({ useHandCursor: true });

        scene.input.on(Phaser.Input.Events.POINTER_OVER, (event: Phaser.Input.Pointer, gameObjects: Button[]) => {
            this.scene.tweens.add({ targets: this, scale: 1.05, duration: 50 });
        });

        scene.input.on(Phaser.Input.Events.POINTER_OUT, (event: Phaser.Input.Pointer, gameObjects: Button[]) => {
            this.scene.tweens.add({ targets: this, scale: 1, duration: 50 });
        });
    }

    action(callback: Function){
        this.on(Phaser.Input.Events.POINTER_DOWN, (event: Phaser.Input.Pointer, gameObjects: Button[]) => {
            console.log(this);
            callback();
        });
    }
}