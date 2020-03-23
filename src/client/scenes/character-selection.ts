import { Input } from "phaser";
import { Player } from "client/entities/player";

export enum Character {
    GIRL = "girl",
    BOY = "boy"
}

export class CharacterSelection extends Phaser.Scene {
    blobBacking: Phaser.GameObjects.Sprite;
    selectedChar: Character = Character.GIRL;
    keys: { [key: string]: Phaser.Input.Keyboard.Key };

    constructor() {
        super({
            key: "character-selection",
            active: false
        });
    }

    create() {
        this.add.image(0, 0, "menu", "background").setOrigin(0);
        this.add.image(0, 0, "menu", "shadows").setOrigin(0);
        this.add.image(0, 0, "menu", "spotlight-ground").setOrigin(0);
        this.add.image(0, 0, "menu", "spotlight-backing").setOrigin(0);
        this.blobBacking = this.add.sprite(730, 700, "menu", "blob-backing/0");
        const girl = this.add.image(0, 1080, "menu", "girl").setOrigin(0, 1);
        const boy = this.add.image(0, 1080, "menu", "boy").setOrigin(0, 1).setScale(1, 0.99);
        this.add.image(0, 0, "menu", "foreground").setOrigin(0);
        this.add.image(0, 0, "menu", "spotlight-top").setOrigin(0);
        this.add.image(0, 0, "menu", "select-text").setOrigin(0);

        this.tweens.add({
            targets: girl,
            scaleY: 0.99,
            yoyo: true,
            repeat: -1,
            duration: 500,
            ease: Phaser.Math.Easing.Sine.InOut,
        });

        this.tweens.add({
            targets: boy,
            scaleY: 1,
            yoyo: true,
            repeat: -1,
            duration: 500,
            ease: Phaser.Math.Easing.Sine.InOut,
        });

        this.blobBacking.anims.animationManager.create({
            key: "blob",
            frames: this.blobBacking.anims.animationManager.generateFrameNames("menu", { start: 0, end: 6, prefix: "blob-backing/" }),
            frameRate: 10,
            repeat: -1
        });

        this.blobBacking.play("blob");

        this.keys = this.input.keyboard.addKeys({
            left: Input.Keyboard.KeyCodes.LEFT,
            right: Input.Keyboard.KeyCodes.RIGHT
        }) as any;

        this.keys.left?.on("down", () => this.selectOtherChar());
        this.keys.right?.on("down", () => this.selectOtherChar());

        const backArrow = this.add.sprite(0, 0, "menu", "back-arrow").setOrigin(0);
        const playArrow = this.add.sprite(0, 0, "menu", "play-arrow").setOrigin(0);

        backArrow.setInteractive({ useHandCursor: true });
        backArrow.on(Phaser.Input.Events.POINTER_DOWN, () => {
            console.log("back");
        });

        playArrow.setInteractive({ useHandCursor: true });
        playArrow.on(Phaser.Input.Events.POINTER_DOWN, () => {
            this.scene.start("game");
        });

        const bounds = this.add.zone(0, 0, 1920, 1080).setOrigin(0);

        Phaser.Display.Align.In.TopLeft(backArrow, bounds, -20, -20);
        Phaser.Display.Align.In.BottomRight(playArrow, bounds, -20, -20);
    }

    selectOtherChar(){
        if (this.selectedChar === Character.GIRL){
            this.selectedChar = Character.BOY;
            this.blobBacking.setX(1200);
        } else {
            this.selectedChar = Character.GIRL;
            this.blobBacking.setX(730);
        }

        Player.gender = this.selectedChar;
    }
}