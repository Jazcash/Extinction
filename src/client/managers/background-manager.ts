import { GameObjects } from "phaser";

export interface BackgroundConfig{
    texture: string;
    scrollFactorX: number;
    depth: number;
    totalFrames: number;
    offsetX?: number;
}

export class BackgroundManager {
    static setupSceneBackgrounds(scene: Phaser.Scene, configs: BackgroundConfig[]) {
        for (const bgConfig of configs) {
            let lastBg: GameObjects.Image | undefined;

            for (let i=0; i<bgConfig.totalFrames; i++){
                const offset = i === 0 ? bgConfig.offsetX : undefined;
                const bg = scene.add.image(offset ?? lastBg?.getBounds().right ?? 0, 0, "world", `${bgConfig.texture}/${i}`);
                bg.scrollFactorX = bgConfig.scrollFactorX;
                bg.setOrigin(0, 0);
                bg.setDepth(bgConfig.depth);

                lastBg = bg;
            }
        }
    }
}