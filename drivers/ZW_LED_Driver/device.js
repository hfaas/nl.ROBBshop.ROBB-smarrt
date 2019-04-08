'use strict';

const Homey = require('homey');

const ZwaveDevice = require('homey-meshdriver').ZwaveDevice;

module.exports = class ZW_LED_Driver extends ZwaveDevice {
	onMeshInit() {

		this.setUnavailable(Homey.__('pairing.configuring'));

		// enable debugging
		this.enableDebug();
		
		// print the node's info to the console
		this.printNode();

		this.registerCapability('onoff', 'SWITCH_MULTILEVEL', {
			set: 'SWITCH_MULTILEVEL_SET',
			setParserV4(value, options) {
				return {
					Value: (value) ? 'on/enable' : 'off/disable',
					'Dimming Duration': 'Default',
				};
			},
		});

		this.registerCapability('dim', 'SWITCH_MULTILEVEL');

		this.registerReportListener('BASIC', 'BASIC_REPORT', (report) => {
			if (report && report.hasOwnProperty('Current Value')) {
				if (this.hasCapability('onoff')) this.setCapabilityValue('onoff', report['Current Value'] > 0);
				if (this.hasCapability('dim')) this.setCapabilityValue('dim', report['Current Value'] / 99);
			}
		});

		// Finally device is ready to be used, mark as available
		this.setAvailable();
	}
}