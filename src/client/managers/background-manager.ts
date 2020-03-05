import { GameObjects } from "phaser";

export interface BackgroundConfig{
	textures: string[];
	scrollFactorX: number;
	depth: number;
}

export class BackgroundManager {
	static setupSceneBackgrounds(scene: Phaser.Scene, configs: BackgroundConfig[]) {
		for (const bgConfig of configs) {
			let lastBg: GameObjects.Image | undefined;

			bgConfig.textures.forEach((texture, i) => {
				const bg = scene.add.image(lastBg?.getBounds().right ?? 0, 0, "world", texture);
				bg.scrollFactorX = bgConfig.scrollFactorX;
				bg.setOrigin(0, 0);
				bg.setDepth(bgConfig.depth);

				lastBg = bg;
			});
		}
	}
}