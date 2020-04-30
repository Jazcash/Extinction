import { GameObjects } from "phaser";
import Signal from "client/utils/signal";

export class Toggle extends GameObjects.Container{
    enabled: boolean = false;
    enabledImg: GameObjects.Image;
    disabledImg: GameObjects.Image;
    onToggled: Signal = new Signal();

    constructor(scene: Phaser.Scene, x: number, y: number){
        super(scene, x, y);

        const bg = scene.add.image(0, 0, "pause", "toggle_bg").setOrigin(0);

        this.disabledImg = scene.add.image(20, 15, "pause", "toggle_off").setOrigin(0);
        this.enabledImg = scene.add.image(80, 15, "pause", "toggle_on").setOrigin(0);

        this.add([bg, this.enabledImg, this.disabledImg]);

        this.setEnabled(this.enabled);

        bg.setInteractive({ useHandCursor: true });

        bg.on(Phaser.Input.Events.POINTER_DOWN, () => {
            this.toggle();
        });

        scene.add.existing(this);
    }

    setEnabled(enabled: boolean){
        if (enabled){
            this.enabledImg.setVisible(true);
            this.disabledImg.setVisible(false);
        } else {
            this.enabledImg.setVisible(false);
            this.disabledImg.setVisible(true);
        }

        this.enabled = enabled;
    }

    toggle(){
        this.enabled = !this.enabled;

        this.setEnabled(this.enabled);

        this.onToggled.dispatch(this.enabled);
    }
}