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

declare let window: any;

export class GameScene extends Phaser.Scene {
    player: Player;
    gamepadInitialised = false;
    keys: { [key: string]: Phaser.Input.Keyboard.Key };
    t = 0;
    logSpawner: LogSpawner;
    clouds: Clouds;
    saturation: Phaser.Renderer.WebGL.WebGLPipeline;

    constructor() {
        super({
            key: "game",
        });
    }

    create() {
        const bounds = { x: 50, y: 0, width: 180000, height: 1080 };

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
            { texture: "bg3", depth: -3, scrollFactorX: 0.3, totalFrames: 9 },
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

        const truck = this.add.sprite(6330, 400, "misc", "truck").setDepth(-0.5);

        this.clouds = new Clouds(this);

        new Tooltip(this, 800, 400, "jump-tooltip");
        new Tooltip(this, 1300, 400, "double-jump-tooltip");
        new Tooltip(this, 2300, 500, "crouch-tooltip");
        new Tooltip(this, 3200, 400, "wallgrip-tooltip");

        new Rubbish(this, 1100, 400);
        new Rubbish(this, 3075, 180);
        new Rubbish(this, 3690, 900);
        new Rubbish(this, 5500, 70);
        new Rubbish(this, 7239, 870);
        new Rubbish(this, 7800, 50);
        new Rubbish(this, 9900, 50);

        this.logSpawner = new LogSpawner(this, truck.x - 200, truck.y);

        window.h = new Harvester(this, "claw3", "claw4", 4250, 4560, 600);
        new Harvester(this, "claw1", "claw2", 7620, 7980, 550);

        if (this.game.renderer instanceof Phaser.Renderer.WebGL.WebGLRenderer) {
            this.saturation = this.game.renderer.addPipeline("SaturatePipeline", new SaturatePipeline(this.game));
            this.saturation.setFloat2('iResolution', 1920, 1080);
            this.cameras.main.setRenderToTexture(this.saturation);
        }

        this.scene.run("ui");
    }

    update() {
        const pad = this.input.gamepad.getPad(0);

        if (pad && !this.gamepadInitialised) {
            this.gamepadInitialised = true;
            this.setupGamepad(pad);
        }

        if (this.player.state == PlayerState.SPIKED) {
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
}