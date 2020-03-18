import { GameObjects } from "phaser";

export interface BackgroundConfig{
    texture: string;
    scrollFactorX: number;
    depth: number;
}

export class BackgroundManager {
    static setupSceneBackgrounds(scene: Phaser.Scene, sectionCount: number, configs: BackgroundConfig[]) {
        for (const bgConfig of configs) {
            let lastBg: GameObjects.Image | undefined;

            for (let i=0; i<sectionCount; i++){
                const bg = scene.add.image(lastBg?.getBounds().right ?? 0, 0, "world", `${bgConfig.texture}/${i}`);
                bg.scrollFactorX = bgConfig.scrollFactorX;
                bg.setOrigin(0, 0);
                bg.setDepth(bgConfig.depth);

                lastBg = bg;
            }
        }
    }
}