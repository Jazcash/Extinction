import { GameObjects } from "phaser";

export class TypewriterText extends GameObjects.Text {
    protected fullText: string;

    constructor(scene: Phaser.Scene, x: number, y: number, text: string, style: Phaser.Types.GameObjects.Text.TextStyle){
        super(scene, x, y, "", style);

        scene.add.existing(this);

        this.fullText = text;
    }

    public reveal(speed = 50) : Promise<void> {
        return new Promise(resolve => this.revealWord(resolve, speed, 1));
    }

    // speed is ms per lettr reveal
    protected revealWord(callback: Function, speed = 50, index = 1) {
        if (index <= this.fullText.length){
            this.setText(this.fullText.slice(0, index));

            this.scene.time.delayedCall(speed, () => this.revealWord(callback, speed, index + 1));
        } else {
            callback();
        }
    }
}