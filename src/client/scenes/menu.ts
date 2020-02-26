export class DebugScene extends Phaser.Scene {
    text: Phaser.GameObjects.Text;

    constructor() {
        super({
            key: "debug"
        });
    }

    create() {
        const text = this.text = this.add.text(5, 5, "Hello world");
    }
}