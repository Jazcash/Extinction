import { Button } from "client/ui/button";

export class MainMenuScene extends Phaser.Scene {
    video: Phaser.GameObjects.Video;
    btnPlay: Button;

    constructor() {
        super({
            key: "main-menu"
        });
    }

    create() {
        this.video = this.add.video(0, 0, "title").setOrigin(0) as Phaser.GameObjects.Video;

        this.video.setLoop(true);
        this.video.setMute(true);
        this.video.play();

        this.add.sprite(this.cameras.main.centerX, 230, "misc", "logo");

        this.btnPlay = new Button(this, this.cameras.main.centerX, 950, "misc", "btn-play");
        this.btnPlay.action(() => {
            this.nextScene("character-selection");
        });

        this.input.gamepad.on(Phaser.Input.Gamepad.Events.CONNECTED, (pad:Phaser.Input.Gamepad.Gamepad) => {
            pad.on(Phaser.Input.Gamepad.Events.BUTTON_DOWN, (keyCode: number) => {
                if (keyCode === 9){
                   this.nextScene("character-selection");
                }
            });
        });
    }

    update(){
        if (this.video && !this.video.isPlaying()){
            this.video.play();
        }
    }

    nextScene(sceneKey: string){
        this.btnPlay.input.enabled = false;
        
        this.scene.transition({
            target: sceneKey,
            duration: 1000,
            allowInput: true,
            sleep: true,
            moveBelow: true,
            onUpdate: (progress: number) => {
                this.cameras.main.setAlpha(1 - progress);
            }
        });
    }
}
