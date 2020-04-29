import { PollutionMeter } from "client/entities/pollution-meter";
import config from "client/config";
import { GameScene } from "./game";
import { GameObjects, Geom, Input } from "phaser";
import { Utils } from "client/utils/utils";
import { InputManager, PadButtons } from "client/managers/input-manager";

export class UIScene extends Phaser.Scene {
    pollutionMeter: PollutionMeter;
    timerText: Phaser.GameObjects.Text;
    timer: Phaser.Time.TimerEvent;
    currentHealth: number;
    hearts: GameObjects.Sprite[];
    snow: GameObjects.Particles.ParticleEmitterManager;
    tutorialAssets: GameObjects.Group;
    isTutorial: boolean;
    inputManager: InputManager;

    constructor() {
        super({
            key: "ui"
        });
    }

    create() {
        this.currentHealth = config.maxHealth;
        this.hearts = [];

        const boundingZone = this.add.zone(this.cameras.main.x, this.cameras.main.y, this.cameras.main.width, this.cameras.main.height).setOrigin(0, 0);

        this.pollutionMeter = new PollutionMeter(this, 0, 0);
        Phaser.Display.Align.In.TopRight(this.pollutionMeter.container, boundingZone, -170);

        this.add.image(this.pollutionMeter.container.getBounds().centerX - 6, this.pollutionMeter.container.getBounds().bottom + 50, "misc", "black-banner");

        this.timerText = this.add.text(this.pollutionMeter.container.getBounds().centerX, this.pollutionMeter.container.getBounds().bottom + 25, "", {
            fontFamily: "Roboto",
            fontSize: "40px",
            fontStyle: "900",
            color: "#000",
            stroke: "#aaa",
            strokeThickness: 5
        } as Phaser.Types.GameObjects.Text.TextStyle).setOrigin(0.5, 0);

        this.timer = this.time.delayedCall(config.time * 1000, () => { console.log("time finished") });

        let lastHeartOutline: GameObjects.Sprite | undefined;
        for (let i = 0; i < config.maxHealth; i++) {
            lastHeartOutline = this.add.sprite((lastHeartOutline?.getBounds().right ?? 0) + 85, 70, "misc", "heart-outline");

            const heartFill = this.add.sprite(lastHeartOutline.x, lastHeartOutline.y, "misc", "heart-fill").setDepth(-1);
            this.hearts.push(heartFill);
        }

        this.inputManager = new InputManager(this);

        this.inputManager.on({keys: ["Escape", "Enter", " "], padButtons: [PadButtons.START, PadButtons.A]}, () => this.endTutorial());

        this.tutorial();
    }

    update() {
        const seconds = config.time - this.timer.getElapsedSeconds();
        this.timerText.setText(seconds.toFixed(0));

        if (seconds <= 20) {
            this.timerText.setColor("#f00");
        } else {
            this.timerText.setColor("#000");
        }

        const percent = this.timer.getElapsedSeconds() / config.time;
        this.pollutionMeter.setPercent(percent, true);

        (this.scene.get("game") as GameScene).setSaturation(1 - percent);
    }

    addTime(time: number) {
        this.timer.elapsed = Math.max(this.timer.elapsed - time, 0);
    }

    damage(amount: number) {
        if (this.currentHealth === 0) {
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

    tutorial() {
        this.isTutorial = true;

        this.timer.paused = true;

        const game = this.scene.get("game") as GameScene;
        game.scene.pause();

        this.tutorialAssets = this.add.group([
            this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.8).setDepth(-2).setOrigin(0),

            this.add.image(1500, 100, "misc", "arrow").setOrigin(0).setFlipX(true).setAlpha(0.5),
            this.add.text(1300, 200, "Pollution Meter", {
                color: "#fff",
                fontFamily: "Baloo",
                fontSize: "50px"
            } as Phaser.Types.GameObjects.Text.TextStyle).setOrigin(0),
            this.add.text(1300, 270, `The Pollution Meter fills up as the timer ticks down, shown below. Once it fills, game over. Picking up rubbish adds ${config.rubbishAdds} seconds.`, {
                color: "#ddd",
                fontFamily: "Verdana",
                fontSize: "30px",
                wordWrap: {
                    width: 450
                }
            } as Phaser.Types.GameObjects.Text.TextStyle).setOrigin(0),

            this.add.image(400, 150, "misc", "arrow").setOrigin(0).setFlipY(true).setAngle(50).setAlpha(0.5),
            this.add.text(600, 200, "Health", {
                color: "#fff",
                fontFamily: "Baloo",
                fontSize: "50px"
            } as Phaser.Types.GameObjects.Text.TextStyle).setOrigin(0),
            this.add.text(600, 270, `You have 5 health, be careful of spikes and other nasties! Falling in pits or drowning results in instant death!`, {
                color: "#ddd",
                fontFamily: "Verdana",
                fontSize: "30px",
                wordWrap: {
                    width: 450
                }
            } as Phaser.Types.GameObjects.Text.TextStyle).setOrigin(0),

            this.add.text(0, 950, "Press A or Spacebar to continue", {
                fontSize: "50px",
                fontFamily: "Verdana",
                align: "center",
                fixedWidth: 1920
            } as Phaser.Types.GameObjects.Text.TextStyle)
        ]);
    }

    endTutorial() {
        if (!this.isTutorial){
            return;
        }

        this.isTutorial = false;

        this.tweens.addCounter({
            from: 1,
            to: 0,
            duration: 300,
            onUpdate: (tween, { value }) => {
                this.tutorialAssets.setAlpha(value);
            },
            onComplete: () => {
                this.tutorialAssets.destroy(true);
                const game = this.scene.get("game") as GameScene;
                game.scene.resume();
                game.player.visible = true;
                game.tutorial = false;
                this.timer.paused = false;
                this.scene.run("pause");
            }
        })
    }
}