import { Player, PlayerState } from "client/entities/player";
import { BackgroundManager } from "client/managers/background-manager";
import config from "client/config";
import { Input, GameObjects } from "phaser";
import { GaussianBlur1 } from "client/shaders/gaussian-blur-1-pipeline";
import { PauseScene } from "./pause";
import { Tooltip } from "client/entities/tooltip";
import { Rubbish } from "client/entities/rubbish";
import { PollutionMeter } from "client/entities/pollution-meter";
import { LogSpawner } from "client/entities/log-spawner";
import { Harvester } from "client/entities/harvester";
import { Clouds } from "client/entities/clouds";
import { SaturatePipeline } from "client/shaders/saturate-pipeline";
import { IceCap } from "client/entities/ice-cap";
import { Drill } from "client/entities/drill";
import { OilRig } from "client/entities/oil-rig";
import { Boat } from "client/entities/boat";
import { UIScene } from "./ui";
import { LumaFadePipeline } from "client/shaders/luma-fade-pipeline";
import { Utils } from "client/utils/utils";
import { InputManager, PadButtons } from "client/managers/input-manager";

declare let window: any;
declare var __DEV__: boolean;

export class GameScene extends Phaser.Scene {
    player: Player;
    gamepadInitialised: boolean;
    keys: { [key: string]: Phaser.Input.Keyboard.Key };
    logSpawner: LogSpawner;
    clouds: Clouds;
    saturation: Phaser.Renderer.WebGL.WebGLPipeline;
    oilrig: OilRig;
    platform: MatterJS.BodyType;
    snowEmitter: Phaser.GameObjects.Particles.ParticleEmitter;
    tutorial: boolean;
    bounds: { x: number; y: number; width: number; height: number; };
    ui: UIScene;
    won: boolean;
    inputManager: InputManager;
    waves: GameObjects.Group;

    constructor() {
        super({ key: "game" });
    }

    async create() {
        this.sound.stopAll();

        this.sound.play("game", { loop: true, volume: 0.1 });

        this.won = false;
        this.gamepadInitialised = false;
        this.tutorial = config.tutorialEnabled;

        this.bounds = { x: 50, y: 0, width: 18700, height: 1080 };

        this.cameras.main.setBackgroundColor("#A9EFFE");

        this.cameras.main.setBounds(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height, true);

        this.player = window.player = new Player(this, config.startPos.x, config.startPos.y);

        const world = window.world = this.matter.add.fromPhysicsEditor(0, 0, this.cache.json.get('shapes').world);
        this.matter.alignBody(world, 0, this.bounds.height, Phaser.Display.Align.BOTTOM_LEFT);

        BackgroundManager.setupSceneBackgrounds(this, [
            { texture: "sky", depth: -6, scrollFactorX: 1, totalFrames: 74 },
            { texture: "bg5", depth: -5, scrollFactorX: 0.2, totalFrames: 17 },
            { texture: "bg4", depth: -4, scrollFactorX: 0.2, totalFrames: 14 },
            { texture: "bg3", depth: -3, scrollFactorX: 0.3, totalFrames: 9, offsetX: 1000 },
            { texture: "bg2", depth: -2, scrollFactorX: 0.5, totalFrames: 44 },
            { texture: "bg1", depth: -1, scrollFactorX: 1, totalFrames: 75 },
            { texture: "fg1", depth: 1, scrollFactorX: 1.25, totalFrames: 71 },
            { texture: "fg2", depth: 2, scrollFactorX: 1.4, totalFrames: 51 },
            { texture: "fg3", depth: 3, scrollFactorX: 1.8, totalFrames: 127 }
        ]);

        this.cameras.main.startFollow(this.player, true, 0.15, 0.15, -500);

        if (!this.input.keyboard.keys.length){
            this.keys = this.input.keyboard.addKeys({
                left: Input.Keyboard.KeyCodes.LEFT,
                right: Input.Keyboard.KeyCodes.RIGHT,
                up: Input.Keyboard.KeyCodes.UP,
                down: Input.Keyboard.KeyCodes.DOWN,
                space: Input.Keyboard.KeyCodes.SPACE,
                shift: Input.Keyboard.KeyCodes.SHIFT,
            }) as any;
    
            this.keys.space?.on("down", () => this.player.jump());
            this.keys.up?.on("down", () => this.player.jump());
        }

        const truck = this.add.image(6330, 400, "misc", "truck").setDepth(-0.5);

        this.add.image(9599, 864, "world", "misc/sea-bottom").setOrigin(0).setDepth(1).setBlendMode(Phaser.BlendModes.MULTIPLY);
        this.add.image(9591, 799, "world", "misc/sea-top").setOrigin(0).setDepth(1);

        this.clouds = new Clouds(this);

        this.anims.create({
            key: "waterfall",
            frames: this.anims.generateFrameNames("misc", { start: 0, end: 2, prefix: `waterfall/` }),
            frameRate: 7,
            repeat: -1,
        });

        this.add.sprite(1890, 0, "misc", "waterfall/0").setOrigin(0).setScrollFactor(0.3).setDepth(-3).play("waterfall");

        this.anims.create({
            key: "flag",
            frames: this.anims.generateFrameNames("misc", { start: 0, end: 3, prefix: `flag/` }),
            frameRate: 7,
            repeat: -1,
        });

        this.add.sprite(17500, 0, "misc", "flag/0").setOrigin(0).setDepth(-1.5).play("flag");
        this.add.sprite(17500, 0, "misc", "flag/flag-pole").setOrigin(0).setDepth(-1.5);

        new Tooltip(this, 800, 400, "jump", "JUMP", 30);
        new Tooltip(this, 1300, 400, "double-jump", "DOUBLE\nJUMP", 20);
        new Tooltip(this, 2300, 500, "crouch", "CROUCH", 26, -25);
        new Tooltip(this, 3200, 400, "wallgrip", "WALL GRIP", 25, -30);

        new Rubbish(this, 1100, 700);
        new Rubbish(this, 2200, 300);
        new Rubbish(this, 2930, 350);
        new Rubbish(this, 4400, 570);
        new Rubbish(this, 3690, 930);
        new Rubbish(this, 5500, 50);
        new Rubbish(this, 7239, 870);
        new Rubbish(this, 7800, 500);
        new Rubbish(this, 8300, 400);
        new Rubbish(this, 9900, 50);
        new Rubbish(this, 10700, 300);
        new Rubbish(this, 12090, 350);
        new Rubbish(this, 12975, 350);
        new Rubbish(this, 14800, 0);

        new LogSpawner(this, truck.x - 200, truck.y);

        new Harvester(this, "claw3", "claw4", 4250, 4560, 600);
        new Harvester(this, "claw1", "claw2", 7620, 7980, 550);

        new IceCap(this, 9900, 930, "ice-cap1").setDepth(-1);
        new IceCap(this, 10400, 930, "ice-cap2").setDepth(-1);
        new IceCap(this, 11350, 930, "ice-cap1").setDepth(-1);

        new Drill(this, { x: 10520, y: 0, drillId: 1, duration: 2000, reach: 250, scale: 0.7 });
        new Drill(this, { x: 10990, y: 0, drillId: 2, duration: 2000, reach: 200, scale: 1 });
        new Drill(this, { x: 11300, y: 0, drillId: 1, duration: 2000, reach: 250, scale: 0.8 });
        new Drill(this, { x: 11880, y: 180, drillId: 2, duration: 2000, reach: 250, scale: 0.8 });
        new Drill(this, { x: 12260, y: 0, drillId: 3, duration: 2000, reach: 380, scale: 0.8});
        new Drill(this, { x: 12790, y: -200, drillId: 2, duration: 3000, reach: 400, scale: 1 });
        new Drill(this, { x: 13100, y: -100, drillId: 1, duration: 2000, reach: 250, scale: 0.7 });
        new Drill(this, { x: 13500, y: -200, drillId: 3, duration: 2000, reach: 450, scale: 0.8});

        this.add.image(10090, 0, "world", "misc/ice-cave-top").setOrigin(0);

        const waves = this.add.sprite(7800, 870, "world", "waves/0").setDepth(-2).setScale(0.98).setScrollFactor(0.5);
        this.anims.create({
            key: "waves",
            frames: this.anims.generateFrameNames("world", { start: 0, end: 11, prefix: `waves/` }),
            frameRate: 7,
            repeat: -1,
        });
        waves.play("waves");

        const waves2 = this.add.sprite(7200, 950, "world", "waves/0").setDepth(-2.1).setScale(0.8).setScrollFactor(0.4);
        this.anims.create({
            key: "waves2",
            frames: this.anims.generateFrameNames("world", { start: 0, end: 11, prefix: `waves/` }),
            frameRate: 7,
            repeat: -1,
            delay: 1000
        });
        waves2.play("waves2");

        const waves3 = this.add.sprite(5000, 800, "world", "waves/0").setDepth(-2.2).setScale(0.5).setScrollFactor(0.25);
        this.anims.create({
            key: "waves3",
            frames: this.anims.generateFrameNames("world", { start: 0, end: 11, prefix: `waves/` }),
            frameRate: 7,
            repeat: -1,
            delay: 500
        });
        waves3.play("waves3");

        this.waves = this.add.group([waves, waves2, waves3]);

        this.oilrig = new OilRig(this, 14100, 50);

        new Boat(this, 16550, 800);

        const textStyle = { 
            fontFamily: "OCRAEXT",
            fontSize: "40px",
            color: "rgba(255, 255, 255, 0.8)",
            lineSpacing: 30
        } as Phaser.Types.GameObjects.Text.TextStyle;

        this.add.text(705, 250, "Forests cover 30% of the Earth's land", textStyle).setDepth(-0.5);
        this.add.text(1791, 994, "They play an important role in absorbing the world's C0²", textStyle).setDepth(-0.5);
        this.add.text(3449, 237, "But they are\ndisappearing", textStyle).setDepth(-0.5);
        this.add.text(4502, 155, "50,000 trees are cut down every minute", Object.assign({ align: "center" }, textStyle)).setDepth(-0.5);
        this.add.text(5422, 573, "Over 2000\norangutans\nare killed\nevery year", Object.assign({ align: "center" }, textStyle)).setDepth(-0.5);
        this.add.text(7130, 346, "Agriculture\nis the\nmain cause of\ndeforestation", Object.assign({ align: "right" }, textStyle, { fontSize: "30px" })).setDepth(-0.5);
        this.add.text(8492, 195, "It is estimated that within 100 years\n              there will be no rainforests...", textStyle).setDepth(-0.5);
        this.add.text(9684, 661, "As our climate warms up, the ice caps melt away", textStyle).setDepth(-0.5);
        this.add.text(12421, 511, "Oil drilling\nis putting\nmarine life\nin danger", textStyle).setDepth(-0.5);
        this.add.text(14297, 990, "Oil spills can be deadly to animals", textStyle).setDepth(-0.5);
        this.add.text(16615, 302, "So together, let's fight to stop climate change", textStyle).setDepth(-0.5);

        const particles = this.add.particles("misc", "snow-particle");
        this.snowEmitter = particles.createEmitter({
            x: 9400,
            y: -100,
            lifespan: 5000,
            gravityY: 600,
            scale: { min: 0.5, max: 1 },
            speed: { min: 1, max: 10 },
            alpha: { start: 1, end: 0 },
            quantity: 1,
            emitZone: { source: new Phaser.Geom.Rectangle(0, 0, 5000, 10)}
        });

        if (this.game.renderer instanceof Phaser.Renderer.WebGL.WebGLRenderer) {
            this.saturation = this.game.renderer.getPipeline("SaturatePipeline");
            this.saturation.setFloat2('iResolution', 1920, 1080);
            this.cameras.main.setRenderToTexture(this.saturation);
        }

        this.scene.run("pause");
        this.scene.run("ui");
        this.ui = this.scene.get("ui") as UIScene;
    }

    update(time: number, delta: number) {
        const pad = this.input.gamepad.getPad(0);

        if (pad && !this.gamepadInitialised) {
            this.gamepadInitialised = true;
            this.setupGamepad(pad);
        }

        if (this.tutorial || this.player.state === PlayerState.DANCING) {
        } else if (this.player.state == PlayerState.SPIKED) {
            this.player.body.friction = 0;
        } else if ((this.keys.shift?.isDown || pad?.R2) && this.player.canClimb()) {
            this.player.climb();
        } else {
            if (this.keys.left?.isDown) {
                if (this.keys.down?.isDown) {
                    this.player.crouch(-config.crouchSpeed);
                } else {
                    this.player.run(-config.speed);
                }
            } else if (this.keys.right?.isDown) {
                if (this.keys.down?.isDown) {
                    this.player.crouch(config.crouchSpeed);
                } else {
                    this.player.run(config.speed);
                }
            } else if (this.keys.down?.isDown || pad?.down || pad?.axes[1].getValue() === 1) {
                this.player.crouch();
            } else if (this.player.state !== PlayerState.JUMPING) {
                this.player.run();
            }

            if (this.player.isAirbourne()) {
                this.player.state = PlayerState.JUMPING;

                this.player.body.friction = 0;
            } else if (this.player.state !== PlayerState.JUMPING) {
                if (this.player.onIce) {
                    this.player.body.friction = config.iceFriction;
                } else {
                    this.player.body.friction = Player.friction;
                }
            }
        }

        this.clouds.update();

        this.oilrig.update(this.player.parts.feet.position.y - 7);

        if (this.player.body.position.x > 8000 && this.player.body.position.x < 14000 && !this.snowEmitter.on){
            this.snowEmitter.start();
        } else if (this.player.body.position.x < 8000 || this.player.body.position.x > 14000 && this.snowEmitter.on){
            this.snowEmitter.stop();
        }

        if (this.player.body.position.x > 11500){
            this.waves.setVisible(true);
        } else {
            this.waves.setVisible(false);
        }

        if (this.ui.timer.getProgress() === 1 || this.ui.currentHealth === 0){
            this.gameOver();
        }

        if (this.player.y > 2000){
            this.gameOver();
        }

        if (this.player.x > 18100 && !this.won){
            this.won = true;
            this.ui.timer.paused = true;
            this.win();
        }
    }

    setupGamepad(pad: Phaser.Input.Gamepad.Gamepad) {
        pad.on(Phaser.Input.Gamepad.Events.BUTTON_DOWN, (keyCode: number) => {
            if (keyCode === 0) {
                this.player.jump();
            }
        });
    }

    setSaturation(amount: number) {
        this.saturation.setFloat1('saturation', amount);
    }

    gameOver(){
        this.scene.run("game-over");
        this.scene.pause();
    }

    async win(){
        this.player.dance();

        await Utils.delay(this, 5000);

        this.scene.start("win");
    }
}