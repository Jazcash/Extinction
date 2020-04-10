import { PollutionMeter } from "client/entities/pollution-meter";
import config from "client/config";
import { GameScene } from "./game";
import { GameObjects } from "phaser";

export class UIScene extends Phaser.Scene {
    pollutionMeter: PollutionMeter;
    timerText: Phaser.GameObjects.Text;
    timer: Phaser.Time.TimerEvent;
    currentHealth: number = config.maxHealth;
    hearts: GameObjects.Sprite[] = [];

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
            color: "#000"
        } as Phaser.Types.GameObjects.Text.TextStyle).setOrigin(0.5, 0);

        this.timer = this.time.delayedCall(config.time * 1000, () => { console.log("time finished") });

        let lastHeartOutline: GameObjects.Sprite | undefined;
        for (let i=0; i<config.maxHealth; i++){
            lastHeartOutline = this.add.sprite((lastHeartOutline?.getBounds().right ?? 0) + 85, 70, "misc", "heart-outline");

            const heartFill = this.add.sprite(lastHeartOutline.x, lastHeartOutline.y, "misc", "heart-fill").setDepth(-1);
            this.hearts.push(heartFill);
        }
    }

    update(){
        const seconds = config.time - this.timer.getElapsedSeconds();
        this.timerText.setText(seconds.toFixed(0));

        if (seconds <= 20){
            this.timerText.setColor("#f00");
        } else {
            this.timerText.setColor("#000");
        }

        const percent = this.timer.getElapsedSeconds() / config.time;
        this.pollutionMeter.setPercent(percent, true);

        (this.scene.get("game") as GameScene).setSaturation(1 - percent);
    }

    addTime(time: number){
        this.timer.elapsed = Math.max(this.timer.elapsed - time, 0);
    }

    damage(amount: number){
        if (this.currentHealth === 0){
            return;
        }

        this.currentHealth = Math.max(this.currentHealth - amount, 0);

        const lastHeart = this.hearts[this.currentHealth];

        this.tweens.add({
            targets: lastHeart,
            scaleX: 0,
            scaleY: 0,
            duration: 200,
            ease: Phaser.Math.Easing.Sine.Out
        });
    }
}