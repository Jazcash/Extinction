export interface BackgroundConfig{
	texture: string;
	scrollFactorX: number;
	depth: number;
}

export class BackgroundManager {
	static setupSceneBackgrounds(scene: Phaser.Scene, configs: BackgroundConfig[]) {
		for (const bgConfig of configs) {
			const bg = scene.add.image(0, 0, bgConfig.texture);
			bg.scrollFactorX = bgConfig.scrollFactorX;
			bg.x -= bg.width * (1 - bg.scrollFactorX) * 0.25;
			bg.setOrigin(0, 0);
			bg.setDepth(bgConfig.depth);
		}
	}
}