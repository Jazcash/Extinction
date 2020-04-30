import { Input } from "phaser";
import { Player } from "client/entities/player";
import { Button } from "client/ui/button";
import { EdgeFadePipeline } from "client/shaders/edge-fade-pipeline";
import { TypewriterText } from "client/entities/typewriter-text";
import { Utils } from "client/utils/utils";
import { Anims } from "client/utils/anims";
import { InputManager, PadButtons } from "client/managers/input-manager";

export enum Character {
    GIRL = "girl",
    BOY = "boy"
}

const textStyle = {
    fontFamily: "OCRAEXT",
    fontSize: "50px",
    shadow: {
        blur: 10,
        color: "#fff894",
        offsetX: 0,
        offsetY: 0,
        fill: true
    },
    color: "#fff"
} as Phaser.Types.GameObjects.Text.TextStyle;

export class CharacterSelection extends Phaser.Scene {
    blobBacking: Phaser.GameObjects.Sprite;
    selectedChar: Character = Character.GIRL;
    girl: Phaser.GameObjects.Image;
    boy: Phaser.GameObjects.Image;
    fadeShader: Phaser.Renderer.WebGL.WebGLPipeline;
    selectText: Phaser.GameObjects.Image;
    fade: Phaser.GameObjects.Graphics;
    backArrow: Button;
    playArrow: Button;
    spotlightImages: Phaser.GameObjects.Image[];
    inputManager: InputManager;

    constructor() {
        super({
            key: "character-selection",
            active: false
        });
    }

    async create({ skip = false } : { skip: boolean }) {
        this.scene.stop("main-menu");

        const bg = this.add.image(0, 0, "menu", "background").setOrigin(0);
        const shadows = this.add.image(0, 0, "menu", "shadows").setOrigin(0);
        const spotlightGround = this.add.image(0, 0, "menu", "spotlight-ground").setOrigin(0).setVisible(false);
        const spotlightMain = this.add.image(0, 0, "menu", "spotlight-backing").setOrigin(0).setVisible(false);
        this.blobBacking = this.add.sprite(730, 700, "menu", "blob-backing/0").setVisible(false);
        this.girl = this.add.image(545, 1000, "menu", "girl-glow").setOrigin(0, 1).setVisible(false);
        this.boy = this.add.image(1074, 1000, "menu", "boy").setOrigin(0, 1).setScale(1, 0.99).setVisible(false);
        const fg = this.add.image(0, 0, "menu", "foreground").setOrigin(0);
        const spotlightTop = this.add.image(0, 0, "menu", "spotlight-top").setOrigin(0).setVisible(false);
        this.selectText = this.add.image(0, 0, "menu", "select-text").setOrigin(0).setVisible(false);

        this.spotlightImages = [spotlightGround, spotlightMain, spotlightTop];

        this.fade = this.add.graphics({fillStyle: {color: 0x00000, alpha: 0.4}}).fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);

        Utils.tween(this, { targets: this.girl, scaleY: 0.99, yoyo: true, repeat: -1, duration: 500, ease: Phaser.Math.Easing.Sine.InOut });
        Utils.tween(this, { targets: this.boy, scaleY: 1, yoyo: true, repeat: -1, duration: 500, ease: Phaser.Math.Easing.Sine.InOut });

        this.blobBacking.anims.animationManager.create({
            key: "blob",
            frames: this.blobBacking.anims.animationManager.generateFrameNames("menu", { start: 0, end: 6, prefix: "blob-backing/" }),
            frameRate: 6,
            repeat: -1
        });

        this.blobBacking.play("blob");

        this.backArrow = new Button(this, 0, 0, "menu", "back-arrow").setVisible(false);
        this.playArrow = new Button(this, 0, 0, "menu", "play-arrow").setVisible(false);
        const skipBtn = new Button(this, 500, 500, "misc", "btn-skip");

        const uiCam = this.cameras.add(0, 0, 1920, 1200, false);
        uiCam.ignore([bg, shadows, spotlightGround, spotlightMain, this.blobBacking, this.girl, this.boy, fg, spotlightTop, this.selectText, this.fade, this.backArrow, this.playArrow]);

        skipBtn.action(() => this.scene.restart({ skip: true }));
        this.backArrow.action(() => this.scene.start("main-menu"));
        this.playArrow.action(() => this.scene.start("game"));

        const bounds = this.add.zone(0, 0, 1920, 1080).setOrigin(0);

        Phaser.Display.Align.In.TopLeft(this.backArrow, bounds, -20, -20);
        Phaser.Display.Align.In.BottomRight(this.playArrow, bounds, -20, -20);
        Phaser.Display.Align.In.TopRight(skipBtn, bounds, -20, -20);

        if (this.game.renderer instanceof Phaser.Renderer.WebGL.WebGLRenderer) {
            this.fadeShader = this.game.renderer.getPipeline("EdgeFadePipeline");
            this.fadeShader.setFloat2('iResolution', 1920, 1080);
            this.fadeShader.setFloat1('amount', 5);
            this.cameras.main.setRenderToTexture(this.fadeShader);
        }

        this.inputManager = new InputManager(this);

        this.inputManager.on({keys: ["ArrowLeft", "ArrowRight"], padButtons: [PadButtons.DLEFT, PadButtons.DRIGHT]}, () => this.selectOtherChar());
        this.inputManager.on({keys: ["Enter", " "], padButtons: [PadButtons.START, PadButtons.A]}, () => this.playArrow.trigger());
        this.inputManager.on({keys: ["Backspace", "Escape"], padButtons: [PadButtons.BACK, PadButtons.B]}, () => this.backArrow.trigger());
        
        if (!skip){
            await this.intro();
        }

        this.fadeShader.setFloat1('amount', 0);

        this.boy.setVisible(true);
        this.girl.setVisible(true);
        this.blobBacking.setVisible(true);
        this.selectText.setVisible(true);
        this.backArrow.setVisible(true);
        this.playArrow.setVisible(true);
        this.spotlightImages.forEach(image => image.setVisible(true));
        
        this.fade.setVisible(false);
        skipBtn.setVisible(false);
    }

    intro() : Promise<void>{
        return new Promise(async resolve => {
            await Utils.tweenCounter(this, {
                from: 60,
                to: 5,
                duration: 6000,
                ease: Phaser.Math.Easing.Quadratic.Out,
                onUpdate: (tween: Phaser.Tweens.Tween, { value }: {value: number}) => {
                    this.fadeShader.setFloat1("amount", value);
                }
            });
    
            await this.message("Life on Earth is heading for mass extinction");
            await this.message("Our climate is under enormous threat from pollution");
            await this.message("We can stop this...");
            await this.message("But time is running out");
    
            let style = Object.assign({}, textStyle, { fontFamily: "Baloo", fontSize: "50px" });
            const yourMissionText = new TypewriterText(this, this.cameras.main.centerX, this.cameras.main.centerY - 40, "YOUR MISSION:", style).setOrigin(0.5);
            style.fontSize = "90px";
            const saveTheWorldText = new TypewriterText(this, this.cameras.main.centerX, this.cameras.main.centerY + 40, "SAVE THE WORLD", style).setOrigin(0.5);
    
            await yourMissionText.reveal();
            await Utils.delay(this, 2000);
            await saveTheWorldText.reveal();
            await Utils.delay(this, 3000);
            await Anims.fadeOut([yourMissionText, saveTheWorldText], 2000);
            await Utils.delay(this, 1000);

            await this.flickerOn();
    
            await Promise.all([
                Anims.fadeOut(this.fade, 1000),
                Utils.tweenCounter(this, {
                    from: 5,
                    to: 0,
                    duration: 1000,
                    ease: Phaser.Math.Easing.Quadratic.Out,
                    onUpdate: (tween: Phaser.Tweens.Tween, { value }: {value: number}) => {
                        this.fadeShader.setFloat1("amount", value);
                    }
                })
            ]);

            resolve();
        });
    }

    flickerOn() : Promise<void>{
        return new Promise(async resolve => {
            this.spotlightImages.forEach(image => image.setVisible(true));
            await Utils.delay(this, 200);
            this.spotlightImages.forEach(image => image.setVisible(false));
            await Utils.delay(this, 50);
            this.spotlightImages.forEach(image => image.setVisible(true));
            await Utils.delay(this, 50);
            this.spotlightImages.forEach(image => image.setVisible(false));
            await Utils.delay(this, 200);
            this.spotlightImages.forEach(image => image.setVisible(false));
            await Utils.delay(this, 100);
            this.spotlightImages.forEach(image => image.setVisible(true));

            resolve();
        })
    }

    message(text: string) : Promise<TypewriterText> {
        return new Promise(async resolve => {
            const twtext = new TypewriterText(this, this.cameras.main.centerX - (text.length * 15), this.cameras.main.centerY, text, textStyle).setOrigin(0, 0.5);
            await twtext.reveal();
            await Utils.delay(this, 3000);
            twtext.destroy();
            resolve();
        });
    }

    selectOtherChar(){
        if (this.selectedChar === Character.GIRL){
            this.selectedChar = Character.BOY;
            this.blobBacking.setX(1200);
            this.boy.setFrame("boy-glow");
            this.girl.setFrame("girl");
        } else {
            this.selectedChar = Character.GIRL;
            this.blobBacking.setX(730);
            this.boy.setFrame("boy");
            this.girl.setFrame("girl-glow");
        }

        Player.gender = this.selectedChar;
    }
}