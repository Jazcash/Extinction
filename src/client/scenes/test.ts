import { Button } from "client/ui/button";
import { Tweens, Time } from "phaser";
import { Utils } from "client/utils/utils";

export class TestScene extends Phaser.Scene {
    rect: Phaser.GameObjects.Rectangle;
    cancelGroup: CancelGroup;

    constructor() {
        super({
            key: "test"
        });
    }

    create() {
        this.rect = this.add.rectangle(0, 0, 50, 50, 0xff0000).setOrigin(0);

        this.cancelGroup = new CancelGroup();

        const btnCancel = this.add.sprite(900, 900, "misc", "btn-skip");
        btnCancel.setInteractive();
        btnCancel.on("pointerdown", () => {
            console.log("cancel");
            this.cancelGroup.cancel();
        });

        this.stuff();
    }

    async stuff(){
        await this.cancelGroup.tween(this, { targets: this.rect, duration: 1000, x: 500 });
        console.log("next");
        await this.cancelGroup.delay(this, 1000);
        await this.cancelGroup.tween(this, { targets: this.rect, duration: 1000, y: 500 });
        await this.cancelGroup.delay(this, 1000);
        await this.cancelGroup.tween(this, { targets: this.rect, duration: 1000, x: 0 });
        await this.cancelGroup.delay(this, 1000);
        await this.cancelGroup.tween(this, { targets: this.rect, duration: 1000, y: 0 });
    }
}

class CancelGroup {
    private cancelled: boolean = false;
    private lastItem: Tweens.Tween | Time.TimerEvent;

    // public async add<T>(item: Promise<T>) : Promise<T> {
    //     return new Promise<T>(async resolve => {
    //         if (!this.cancelled){
    //             const object = await item;
    //             resolve(object);
    //         }
    //     });
    // }

    public tween(scene: Phaser.Scene, config: Phaser.Types.Tweens.TweenBuilderConfig | object){
        if (this.cancelled){
            return;
        }

        return new Promise(resolve => {
            this.lastItem = scene.tweens.add(config) as Tweens.Tween;
            this.lastItem.on("complete", () => resolve(this.lastItem));
        });
    };

    public tweenCounter(scene: Phaser.Scene, config: Phaser.Types.Tweens.NumberTweenBuilderConfig | object){
        if (this.cancelled){
            return;
        }

        return new Promise(resolve => {
            this.lastItem = scene.tweens.addCounter(config) as Tweens.Tween;
            this.lastItem.on("complete", () => resolve(this.lastItem));
        });
    };

    public delay(scene: Phaser.Scene, ms: number){
        if (this.cancelled){
            return;
        }

        return new Promise(resolve => {
            this.lastItem = scene.time.delayedCall(ms, () => resolve(this.lastItem));
        });
    }

    public cancel() {
        this.cancelled = true;

        if (this.lastItem instanceof Tweens.Tween){
            this.lastItem.stop();
        } else if (this.lastItem instanceof Time.TimerEvent){
            this.lastItem.destroy();
        }
    }
}