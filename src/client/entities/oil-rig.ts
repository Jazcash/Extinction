export class OilRig {
    platforms: MatterJS.BodyType[];

    constructor(public scene: Phaser.Scene, x: number, y: number) {
        scene.add.image(x, y, "misc", "oil-rig/rig").setDepth(-1.5).setOrigin(0);

        scene.matter.add.rectangle(x + 707, y + 720, 1150, 10, { isStatic: true });

        this.platforms = [
            scene.matter.add.rectangle(x + 510, y + 590, 220, 10, { isStatic: true }),
            scene.matter.add.rectangle(x + 877, y + 605, 170, 10, { isStatic: true }),
            scene.matter.add.rectangle(x + 315, y + 165, 275, 10, { isStatic: true }),
            scene.matter.add.rectangle(x + 690, y + 75, 187, 10, { isStatic: true }),
            scene.matter.add.rectangle(x + 690, y + 323, 205, 10, { isStatic: true }),
            scene.matter.add.rectangle(x + 1142, y + 455, 188, 10, { isStatic: true }),
        ];

        const leftArm = scene.add.image(x + 220, y + 550, "misc", "oil-rig/rig-arm-left").setDepth(-2).setDisplayOrigin(472, 278);
        const rightArm1 = scene.add.image(x + 1100, y + 550, "misc", "oil-rig/rig-arm-right1").setDepth(-2).setDisplayOrigin(95, 553);
        const rightArm2 = scene.add.image(x + 1200, y + 675, "misc", "oil-rig/rig-arm-right2").setDepth(-2).setDisplayOrigin(66, 393).setAngle(10);
        
        scene.tweens.add({ targets: leftArm, angle: -20, yoyo: true, repeat: -1, duration: 5000, ease: Phaser.Math.Easing.Sine.InOut });
        scene.tweens.add({ targets: rightArm1, angle: 10, yoyo: true, repeat: -1, duration: 5000, ease: Phaser.Math.Easing.Sine.InOut });
        scene.tweens.add({ targets: rightArm2, angle: 20, yoyo: true, repeat: -1, duration: 5000, ease: Phaser.Math.Easing.Sine.InOut, delay: 5000 });
    }

    update(playerYPos: number){
        for (const platform of this.platforms){
            if (playerYPos < platform.position.y){
                platform.collisionFilter.mask = 1;
            } else {
                platform.collisionFilter.mask = -8;
            }
        }
    }
}