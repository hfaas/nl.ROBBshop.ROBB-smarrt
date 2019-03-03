'use strict';

const Homey = require('homey');

class ROBBsmarrtApp extends Homey.App {

	onInit() {
		this.log('ROBB smarrt app is running...');

		//Z-button scene trigger cards
		this.triggerWallController_scene = new Homey.FlowCardTriggerDevice('wall_controller_scene');
		this.triggerWallController_scene
			.register()
			.registerRunListener((args, state) =>
				Promise.resolve(args.button.id === state.button && args.scene.id === state.scene));

		this.triggerWallController_scene
			.getArgument('scene')
			.registerAutocompleteListener((query, args, callback) => args.device.onSceneAutocomplete(query, args, callback));
		this.triggerWallController_scene
			.getArgument('button')
			.registerAutocompleteListener((query, args, callback) => args.device.onButtonAutocomplete(query, args, callback));

		//Z-button button trigger cards
		this.triggerWallController_button = new Homey.FlowCardTriggerDevice('wall_controller_button');
		this.triggerWallController_button
			.register();
	}

}

module.exports = ROBBsmarrtApp;
