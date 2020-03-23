import { Physics } from "phaser";
import config from "client/config";

export class LogSpawner {
    activeLogs: Physics.Matter.Sprite[] = [];
    interval: Phaser.Time.TimerEvent;

    constructor(public scene: Phaser.Scene, public x: number, public y: number){
        this.startSpawning();
    }

    startSpawning(){
        this.interval = this.scene.time.addEvent({
            delay: config.logSpawnRate * 1000,
            loop: true,
            startAt: 0,
            callback: () => this.spawnLog()
        });
    }

    stopSpawning(){
        this.interval.destroy();

        this.activeLogs.forEach(log => log.destroy());
    }

    spawnLog(){
        const log = this.scene.matter.add.sprite(this.x, this.y, "misc", "logroll/0");

        log.anims.animationManager.create({
            key: "roll",
            frames: log.anims.animationManager.generateFrameNames("misc", { start: 0, end: 3, prefix: "logroll/" }),
            frameRate: 10,
            repeat: -1
        });

        log.play("roll");

        log.setDepth(-1);

        log.setBody({
            type: "circle",
            radius: 55
        }, {
            gravityScale: {
                x: 1,
                y: 0.2
            },
            density: 25
        });

        log.setVelocityX(-5);

        this.scene.time.delayedCall(1000, () => {
            log.setVelocityX(-5);
        });

        this.scene.time.delayedCall(10000, () => {
            log.destroy();
            this.activeLogs.splice(this.activeLogs.indexOf(log), 1);
        });

        this.activeLogs.push(log);
    }
}