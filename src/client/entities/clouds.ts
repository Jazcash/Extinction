import { GameObjects } from "phaser";

const worldWidth = 180000;
const spaceBetween = 700;
const pxPerFrame = 0.2;

export class Clouds {
    clouds: GameObjects.Image[] = [];
    timer: Phaser.Time.TimerEvent;

    constructor(public scene: Phaser.Scene){
        let usedWidth = 0;

        while (usedWidth < worldWidth){
            const cloud = scene.add.image((this.clouds[this.clouds.length-1]?.getBounds().right ?? 0) + spaceBetween, 0, "misc", "clouds");

            cloud.setOrigin(0);

            cloud.setDepth(-4);
            cloud.setScrollFactor(0.2);

            if (this.clouds.length % 2 === 0){
                cloud.setFlipX(true);
            }
            
            usedWidth += cloud.width + spaceBetween;
            this.clouds.push(cloud);
        }
    }

    update(){
        this.clouds.forEach((cloud, index) => {
            cloud.x -= pxPerFrame;

            if (cloud.x < -cloud.width){
                const prevCloud = this.clouds[index === 0 ? this.clouds.length - 1 : index - 1];
                cloud.x = prevCloud.x + cloud.width + spaceBetween;
            }
        });
    }
}