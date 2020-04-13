import { Player, PlayerState } from "client/entities/player";
import { BackgroundManager } from "client/managers/background-manager";
import config from "client/config";
import { Input } from "phaser";
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

declare let window: any;
declare var __DEV__: boolean;

export class GameScene extends Phaser.Scene {
    player: Player;
    gamepadInitialised = false;
    keys: { [key: string]: Phaser.Input.Keyboard.Key };
    t = 0;
    logSpawner: LogSpawner;
    clouds: Clouds;
    saturation: Phaser.Renderer.WebGL.WebGLPipeline;
    entering: boolean = true;
    oilrig: OilRig;
    platform: MatterJS.BodyType;
    test: Phaser.GameObjects.Rectangle;
    snowEmitter: Phaser.GameObjects.Particles.ParticleEmitter;

    constructor() {
        super({
            key: "game",
        });
    }

    create() {
        const bounds = { x: 50, y: 0, width: 18700, height: 1080 };

        this.cameras.main.setBackgroundColor("#A9EFFE");

        this.cameras.main.setBounds(bounds.x, bounds.y, bounds.width, bounds.height, true);

        this.cameras.main.setZoom(1);

        this.player = window.player = new Player(this, config.startPos.x, config.startPos.y);

        const world = window.world = this.matter.add.fromPhysicsEditor(0, 0, this.cache.json.get('shapes').world);
        this.matter.alignBody(world, 0, bounds.height, Phaser.Display.Align.BOTTOM_LEFT);

        BackgroundManager.setupSceneBackgrounds(this, [
            { texture: "sky", depth: -6, scrollFactorX: 1, totalFrames: 74 },
            { texture: "bg5", depth: -5, scrollFactorX: 0.2, totalFrames: 15 },
            { texture: "bg4", depth: -4, scrollFactorX: 0.2, totalFrames: 25 },
            { texture: "bg3", depth: -3, scrollFactorX: 0.3, totalFrames: 9, offsetX: 1000 },
            { texture: "bg2", depth: -2, scrollFactorX: 0.5, totalFrames: 37 },
            { texture: "bg1", depth: -1, scrollFactorX: 1, totalFrames: 75 },
            { texture: "fg1", depth: 1, scrollFactorX: 1.25, totalFrames: 71 },
            { texture: "fg2", depth: 2, scrollFactorX: 1.4, totalFrames: 51 },
            { texture: "fg3", depth: 3, scrollFactorX: 1.8, totalFrames: 127 }
        ]);

        this.cameras.main.startFollow(this.player, true, 0.15, 0.15, -500);

        this.keys = this.input.keyboard.addKeys({
            left: Input.Keyboard.KeyCodes.LEFT,
            right: Input.Keyboard.KeyCodes.RIGHT,
            up: Input.Keyboard.KeyCodes.UP,
            down: Input.Keyboard.KeyCodes.DOWN,
            space: Input.Keyboard.KeyCodes.SPACE,
            shift: Input.Keyboard.KeyCodes.SHIFT,
            esc: Input.Keyboard.KeyCodes.ESC
        }) as any;

        this.keys.space?.on("down", () => this.player.jump());
        this.keys.up?.on("down", () => this.player.jump());
        this.keys.esc?.on("down", () => (this.scene.get("pause") as PauseScene).resume())

        this.scene.run("pause");

        const truck = this.add.image(6330, 400, "misc", "truck").setDepth(-0.5);

        this.add.image(9591, 868, "misc", "sea-bottom").setOrigin(0).setDepth(1).setBlendMode(Phaser.BlendModes.MULTIPLY);
        this.add.image(9591, 810, "misc", "sea-top").setOrigin(0).setDepth(1);

        this.clouds = new Clouds(this);

        new Tooltip(this, 800, 400, "jump-tooltip");
        new Tooltip(this, 1300, 400, "double-jump-tooltip");
        new Tooltip(this, 2300, 500, "crouch-tooltip");
        new Tooltip(this, 3200, 400, "wallgrip-tooltip");

        new Rubbish(this, 1100, 700);
        new Rubbish(this, 2200, 300);
        new Rubbish(this, 2930, 350);
        new Rubbish(this, 4400, 570);
        new Rubbish(this, 3690, 900);
        new Rubbish(this, 5500, 50);
        new Rubbish(this, 7239, 870);
        new Rubbish(this, 7800, 500);
        new Rubbish(this, 9900, 50);
        new Rubbish(this, 8630, 200);
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

        this.oilrig = new OilRig(this, 14100, 50);

        new Boat(this, 16550, 800);

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
            this.saturation = this.game.renderer.addPipeline("SaturatePipeline", new SaturatePipeline(this.game));
            this.saturation.setFloat2('iResolution', 1920, 1080);
            this.cameras.main.setRenderToTexture(this.saturation);
        }

        this.scene.run("ui");

        this.input.gamepad.enabled = false;
        this.input.keyboard.enabled = false;

        this.entrance();
    }

    update() {
        const pad = this.input.gamepad.getPad(0);

        if (pad && !this.gamepadInitialised) {
            this.gamepadInitialised = true;
            this.setupGamepad(pad);
        }

        if (this.entering && !__DEV__){
            this.player.run(config.speed * 0.5);
        } else if (this.player.state == PlayerState.SPIKED) {
            this.player.body.friction = 0;
        } else if ((this.keys.shift?.isDown || pad?.R2) && this.player.canClimb()) {
            this.player.climb();
        } else {
            if (this.keys.left?.isDown || pad?.axes[0].getValue() === -1) {
                if (this.keys.down?.isDown) {
                    this.player.crouch(-config.crouchSpeed);
                } else {
                    this.player.run(-config.speed);
                }
            } else if (this.keys.right?.isDown || pad?.axes[0].getValue() === 1) {
                if (this.keys.down?.isDown) {
                    this.player.crouch(config.crouchSpeed);
                } else {
                    this.player.run(config.speed);
                }
            } else if (this.keys.down?.isDown) {
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

    entrance(){
        this.cameras.main.fadeIn(1000, 0, 0, 0, (camera: Phaser.Cameras.Scene2D.Camera, progress: number) => {
            if (progress === 1){
                this.input.gamepad.enabled = true;
                this.input.keyboard.enabled = true;

                this.entering = false;

                this.player.run();
            }
        });
    }
}