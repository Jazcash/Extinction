import { PollutionMeter } from "client/entities/pollution-meter";
import config from "client/config";

export class UIScene extends Phaser.Scene {
    pollutionMeter: PollutionMeter;
    timerText: Phaser.GameObjects.Text;
    timer: Phaser.Time.TimerEvent;

    constructor() {
        super({
            key: "ui"
        });
    }

    create() {
        const boundingZone = this.add.zone(this.cameras.main.x, this.cameras.main.y, this.cameras.main.width, this.cameras.main.height).setOrigin(0, 0);

        this.pollutionMeter = new PollutionMeter(this, 0, 0);
        Phaser.Display.Align.In.TopRight(this.pollutionMeter.container, boundingZone, -170);

        this.timerText = this.add.text(this.pollutionMeter.container.getBounds().centerX, this.pollutionMeter.container.getBounds().bottom, "", { 
            fontFamily: "Roboto",
            fontSize: "40px",
            fontStyle: "900",
            color: "#000",
        } as Phaser.Types.GameObjects.Text.TextStyle).setOrigin(0.5, 0);

        this.timer = this.time.delayedCall(config.time * 1000, () => { console.log("time finished") });
    }

    update(){
        const seconds = config.time - this.timer.getElapsedSeconds();
        this.timerText.setText(seconds.toFixed(0));

        const percent = this.timer.getElapsedSeconds() / config.time;
        this.pollutionMeter.setPercent(percent, true);
    }

    addTime(time: number){
        this.timer.elapsed = Math.max(this.timer.elapsed - time, 0);
    }
}