import { GameObjects } from "phaser";
import { Utils } from "./utils";

export namespace Anims {
    export function fadeOut(objects: any, duration = 400, easing = Phaser.Math.Easing.Linear) : Promise<void>{
        const targets = Utils.asArray(objects);
        const scene: Phaser.Scene = targets[0].scene;

        return new Promise(resolve => {
            scene.tweens.add({
                targets: targets,
                alpha: 0,
                duration: duration,
                ease: easing,
                onComplete: () => resolve()
            });
        });
    }

    export function fadeIn(objects: any, duration = 400, easing = Phaser.Math.Easing.Linear) : Promise<void>{
        const targets = Utils.asArray(objects);
        const scene: Phaser.Scene = targets[0].scene;

        return new Promise(resolve => {
            scene.tweens.add({
                targets: targets,
                alpha: 1,
                duration: duration,
                ease: easing,
                onComplete: () => resolve()
            });
        });
    }
}