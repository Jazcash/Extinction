export interface BackgroundConfig{
    scrollFactorX: number;
}

export class Background extends Phaser.GameObjects.Image {
    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame?: string | number, config?: BackgroundConfig){
        super(scene, x, y, texture, frame);

        this.setOrigin(0, 0);

        if (config){
            this.scrollFactorX = config.scrollFactorX;
            console.log(this.width);
            this.x -= this.width * (1 - this.scrollFactorX) * 0.25;
        }

        this.scene.add.existing(this);
    }
}