import Signal from "client/utils/signal";
import { Math } from "phaser";

export enum PadButtons {
    A = 0,
    B = 1,
    Y = 2,
    X = 3,
    L1 = 4,
    R1 = 5,
    L2 = 6,
    R2 = 7,
    BACK = 8,
    START = 9,
    LTHUMB = 10,
    RTHUMB = 11,
    DUP = 12,
    DDOWN = 13,
    DLEFT = 14,
    DRIGHT = 15
}

export enum PadStick {
    UP,
    DOWN,
    LEFT,
    RIGHT
}

interface Binds {
    padButtons?: PadButtons[];
    padSticks?: {
        left?: PadStick;
        right?: PadStick;
    };
    keys?: string[];
}

export class InputManager {
    protected leftStickMoved: Signal = new Signal();
    protected rightStickMoved: Signal = new Signal();

    constructor(public scene: Phaser.Scene){
        // scene.input.gamepad.on(Phaser.Input.Gamepad.Events.BUTTON_DOWN, (a: any, b: any) => {
        //     console.log(a, b);
        // });

        // scene.input.keyboard.on("keydown", (e:KeyboardEvent) => {
        //     console.log(e);
        // });

        // scene.events.on(Phaser.Scenes.Events.UPDATE, () => {
        //     if (scene.input.gamepad.pad1){
        //         const pad = scene.input.gamepad.pad1;

        //         if (pad.axes[0].getValue() || pad.axes[1].getValue()){
        //             this.leftStickMoved.dispatch(new Math.Vector2(pad.axes[0].getValue(), pad.axes[1].getValue()));
        //         }

        //         if (pad.axes[2].getValue() || pad.axes[3].getValue()){
        //             this.rightStickMoved.dispatch(new Math.Vector2(pad.axes[2].getValue(), pad.axes[3].getValue()));
        //         }
        //     }
        // });
    }

    on(binds: Binds, callback: Function){
        if (binds.keys){
            this.scene.input.keyboard.on("keydown", (e:KeyboardEvent) => {
                if (binds.keys && binds.keys.includes(e.key)){
                    callback();
                    return;
                }
            });
        }

        if (binds.padButtons){
            this.scene.input.gamepad.on(Phaser.Input.Gamepad.Events.BUTTON_DOWN, (pad: Gamepad, {index}: {index:number}) => {
                if (binds.padButtons && binds.padButtons.includes(index)){
                    callback();
                    return;
                }
            });
        }

        // if (binds.padSticks){
        //     if (binds.padSticks.left){
        //         this.leftStickMoved.add((pos: Phaser.Math.Vector2) => {
        //             if (pos.x === -1 && binds.padSticks?.left === PadStick.LEFT){
        //                 callback();
        //             } else if (pos.x === 1 && binds.padSticks?.left === PadStick.RIGHT){
        //                 callback();
        //             } else if (pos.y === -1 && binds.padSticks?.left === PadStick.UP){
        //                 callback();
        //             } else if (pos.y === 1 && binds.padSticks?.left === PadStick.DOWN){
        //                 callback();
        //             }
        //         });
        //     }

        //     if (binds.padSticks.right){
        //         this.rightStickMoved.add((pos: Phaser.Math.Vector2) => {
        //             if (pos.x === -1 && binds.padSticks?.right === PadStick.LEFT){
        //                 callback();
        //             } else if (pos.x === 1 && binds.padSticks?.right === PadStick.RIGHT){
        //                 callback();
        //             } else if (pos.y === -1 && binds.padSticks?.right === PadStick.UP){
        //                 callback();
        //             } else if (pos.y === 1 && binds.padSticks?.right === PadStick.DOWN){
        //                 callback();
        //             }
        //         });
        //     }
        // }
    }
}