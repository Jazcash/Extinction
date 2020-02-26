/*
	TODO:
		- Xbox controller support
		- Setup texture packer, scale assets to 0.5
*/

import "phaser";

import Stats from "stats.js";

import { LoadScene } from "client/scenes/load";
import { GameScene } from "client/scenes/game";
import { DebugScene } from "client/scenes/debug";

declare var window: any;
declare var __DEBUG__: boolean;

const game = window.game = new Phaser.Game({
	parent: "game-container",
	type: Phaser.AUTO,
	width: 1820,
	height: 1080,
	render: {
		transparent: false,
		roundPixels: true
	},
	scale: {
		mode: Phaser.Scale.FIT
	},
	input: {
		gamepad: true
	},
	physics: {
		default: "matter",
		matter: {
			debug: __DEBUG__ ? {
				lineColor: 0xff0000,
				staticLineColor: 0x00ff00,
				sensorLineColor: 0x00ff00,
				sensorFillColor: 0x00ff00
			} : false,
			gravity: {
				x: 0,
				y: 3
			}
		}
	},
	scene: [
		new LoadScene(),
		new GameScene(),
		new DebugScene()
	]
});

if (__DEBUG__){
	const stats = new Stats();
	stats.showPanel(2);
	document.body.appendChild(stats.dom);
	
	game.events.on(Phaser.Core.Events.PRE_STEP, () => stats.begin());
	game.events.on(Phaser.Core.Events.POST_RENDER, () => stats.end());
}