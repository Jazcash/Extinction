import { GameObjects } from "phaser";
import Signal from "client/utils/signal";

export class Toggle extends GameObjects.Group{
    enabled: boolean = false;
    enabledImg: GameObjects.Image;
    disabledImg: GameObjects.Image;
    onToggled: Signal = new Signal();

    constructor(scene: Phaser.Scene, x: number, y: number){
        super(scene);

        const bg = scene.add.image(x, y, "pause", "toggle_bg").setOrigin(0);

        this.disabledImg = scene.add.image(x + 20, y + 15, "pause", "toggle_off").setOrigin(0);
        this.enabledImg = scene.add.image(x + 80, y + 15, "pause", "toggle_on").setOrigin(0);

        this.addMultiple([bg, this.enabledImg, this.disabledImg]);

        this.setEnabled(this.enabled);

        bg.setInteractive({ useHandCursor: true });

        bg.on(Phaser.Input.Events.POINTER_DOWN, () => {
            this.toggle();
        });
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