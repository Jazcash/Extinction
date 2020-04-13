export class MainMenuScene extends Phaser.Scene {
    constructor() {
        super({
            key: "main-menu"
        });
    }

    create() {
        const video = this.add.video(0, 0, "title").setOrigin(0) as Phaser.GameObjects.Video;

        video.setLoop(true);
        video.setMute(true);
        video.play();

        window.addEventListener("focus", () => video.play());

        const logo = this.add.sprite(this.cameras.main.centerX, 230, "misc", "logo");
        const btnPlay = this.add.sprite(this.cameras.main.centerX, 950, "misc", "btn-play");

        btnPlay.setInteractive({ useHandCursor: true });
        btnPlay.on(Phaser.Input.Events.POINTER_DOWN, () => {
            this.scene.start("character-selection");
        });

        this.input.gamepad.on(Phaser.Input.Gamepad.Events.CONNECTED, (pad:Phaser.Input.Gamepad.Gamepad) => {
            pad.on(Phaser.Input.Gamepad.Events.BUTTON_DOWN, (keyCode: number) => {
                if (keyCode === 9){
                    this.scene.start("character-selection");
                }
            });
        });
    }
}
