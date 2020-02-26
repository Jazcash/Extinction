export class Static extends Phaser.Physics.Matter.Sprite {
	public body: Phaser.Types.Physics.Matter.MatterBodyConfig;

	constructor(scene: Phaser.Scene, x: number, y: number, texture: string, depth: number) {
		super(scene.matter.world, x, y, texture, 0);

		this.setOrigin(0, 0);

		this.setDepth(depth);

		this.scene.add.existing(this);

		const physicsEditorConfig: Phaser.Types.Physics.Matter.MatterSetBodyConfig = this.scene.cache.json.get('shapes')[texture];

		const bodyConfig: Phaser.Types.Physics.Matter.MatterBodyConfig = {

		}

		this.setBody(physicsEditorConfig, bodyConfig);
	}
}