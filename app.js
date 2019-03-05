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

		this.actionZBForcedBrightness = new Homey.FlowCardAction('ZB_dim_set_forced_brightness');
		this.actionZBForcedBrightness
				.register()
				.registerRunListener(this.actionZBForcedBrightnessRunListener.bind(this));
	}

	async actionZBForcedBrightnessRunListener(args, state) {
		if (!args.hasOwnProperty('set_forced_brightness_level')) return Promise.reject('set_forced_brightness_level_property_missing');
		if (typeof args.set_forced_brightness_level !== 'number') return Promise.reject('forced_brightness_level_is_not_a_number');
		if (args.set_forced_brightness_level > 1) return Promise.reject('forced_brightness_level_out_of_range');

		if (!args.hasOwnProperty('enable_set_forced_brightness')) return Promise.reject('enable_set_forced_brightness_property_missing');

		try {
			const newBrightnessLevel = args.enable_set_forced_brightness === "enabled" ? args.set_forced_brightness_level * 254 : 255;
			args.device.log(newBrightnessLevel);
			let result = await args.device.node.endpoints[0].clusters.genLevelCtrl.write('onLevel', newBrightnessLevel);
			return args.device.setSettings({
				'forced_brightness_level': args.enable_set_forced_brightness === "enabled" ? args.set_forced_brightness_level * 100 : 101
			});
		}
		catch (error) {
			args.device.log(error.message);
			return Promise.reject(error.message);
		}
		return Promise.reject('unknown_error');
	}

}

module.exports = ROBBsmarrtApp;
