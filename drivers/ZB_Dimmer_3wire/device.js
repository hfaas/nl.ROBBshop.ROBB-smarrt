'use strict';

const ZigBeeLightDevice = require('homey-meshdriver').ZigBeeLightDevice;

module.exports = class ZB_Dimmer3wire extends ZigBeeLightDevice {
	async onMeshInit() {

			// this.setStoreValue('colorTempMin', 153); // 6500K = 153 Mired
			// this.setStoreValue('colorTempMax', 370); // 2700K = 370 Mired

      await super.onMeshInit();
      // enable debugging
      this.enableDebug();

      // print the node's info to the console
      this.printNode();

			this.log('GreenPowerProxy endpoint: ', this.getClusterEndpoint('genGreenPowerProxy'));

      if (this.getClusterEndpoint('genGreenPowerProxy') !== 0) {
        this.registerAttrReportListener('genOnOff', 'onOff', 1, 300, 1, value => {
          this.log('onoff', value);
          this.setCapabilityValue('onoff', value === 1);
					if (this.hasCapability('dim') && value === 0 ) this.setCapabilityValue('dim', value);
        }, 0);

        this.registerAttrReportListener('genLevelCtrl', 'currentLevel', 3, 300, 3, value => {
					if (this.getCapabilityValue('onoff') === true) {
						this.log('dim report', value);
          	this.setCapabilityValue('dim', value / 254);
					}
        }, 0);

      }
			/**
     * The OnOffTransitionTime attribute represents the time taken to move to or from
     * the target level when On of Off commands are received by an On/Off cluster on
     * the same endpoint. It is specified in 1/10ths of a second.
     * <p>
     * The actual time taken should be as close to OnOffTransitionTime as the device is
     * able. N.B. If the device is not able to move at a variable rate, the
     * OnOffTransitionTime attribute should not be implemented.

			await this.node.endpoints[0].clusters.genLevelCtrl.write('onOffTransitionTime', 20)
			.then(() => {
				// Registering attr reporting succeeded
				this.log('registered onOffTransitionTime');
			})
			.catch(err => {
				// Registering attr reporting failed
				this.error('failed onOffTransitionTime', err);
			});

		*
     * The OnLevel attribute determines the value that the CurrentLevel attribute is set to
     * when the OnOff attribute of an On/Off cluster on the same endpoint is set to On. If
     * the OnLevel attribute is not implemented, or is set to 0xff, it has no effect.

			await this.node.endpoints[0].clusters.genLevelCtrl.write('onLevel', 51)
			.then(() => {
				// Registering attr reporting succeeded
				this.log('registered onLevel');
			})
			.catch(err => {
				// Registering attr reporting failed
				this.error('failed onLevel', err);
			});
			*
			*
			* The onTime attribute specifies the length of time (in 1/10ths second) that the device is turned on before being turned off

			await this.node.endpoints[0].clusters.genOnOff.write('onTime', 200)
			.then(() => {
				// Registering attr reporting succeeded
				this.log('registered onTime');
			})
			.catch(err => {
				// Registering attr reporting failed
				this.error('failed onTime', err);
			});
			*/


     /* The OffWaitTime attribute specifies the length of time (in 1/10ths second) that the “off” state SHALL be guarded to prevent an on command
     * turning the device back to its “on” state (e.g., when leaving a room, the lights are turned off but an occupancy sensor detects the leaving
     * person and attempts to turn the lights back on). If this attribute is set to 0x0000, the device SHALL remain in its current state.

			await this.node.endpoints[0].clusters.genOnOff.write('offWaitTime', 0)
			.then(() => {
				// Registering attr reporting succeeded
				this.log('registered offWaitTime');
			})
			.catch(err => {
				// Registering attr reporting failed
				this.error('failed offWaitTime', err);
			});
			*/



	}

	async onSettings(oldSettingsObj, newSettingsObj, changedKeysArr, callback) {
		let changeSettingError = '';

		this.log(changedKeysArr);
		this.log('newSettingsObj', newSettingsObj);
		this.log('oldSettingsObj', oldSettingsObj);

		// Loop all changed settings
		for (const changedKey of changedKeysArr) {
			const newValue = newSettingsObj[changedKey];

			try {
				if (changedKey.includes('forced_brightness_level')) {
					this.log('forced_brightness_level: ', changedKey, newValue, Math.min(newValue * 2.55, 255));
					await this.node.endpoints[0].clusters.genLevelCtrl.write('onLevel', Math.min(newValue * 2.55, 255))
				};

				if (changedKey.includes('dim_transition_time')) {
					this.log('dim_transition_time: ', changedKey, newValue );
					await this.node.endpoints[0].clusters.genLevelCtrl.write('onOffTransitionTime', newValue)
				}

			} catch (err) {
					this.error(`failed_to_set_${changedKey}_to_${newValue}`, err);
					let errorString = `${changeSettingError}failed_to_set_${changedKey}_to_${newValue}`;
					if (changeSettingError.length > 0) errorString = `_${errorString}`;
					changeSettingError = errorString;
			}
		}

		// If one or more of the settings failed to set, reject
		if (changeSettingError.length > 0) return Promise.reject(new Error(changeSettingError));

		// Compose save message
		const saveMessage = 'successfully saved the changed settings';
		return Promise.resolve(saveMessage);
	}



}

/*
2019-03-03 22:31:58 [log] [ManagerDrivers] [ZB_Dimmer_3wire] [0] ------------------------------------------
2019-03-03 22:31:58 [log] [ManagerDrivers] [ZB_Dimmer_3wire] [0] Node: 3c9fba03-c87b-45ae-afc8-2fcdf7f8e426
2019-03-03 22:31:58 [log] [ManagerDrivers] [ZB_Dimmer_3wire] [0] - Battery: false
2019-03-03 22:31:58 [log] [ManagerDrivers] [ZB_Dimmer_3wire] [0] - Endpoints: 0
2019-03-03 22:31:58 [log] [ManagerDrivers] [ZB_Dimmer_3wire] [0] -- Clusters:
2019-03-03 22:31:58 [log] [ManagerDrivers] [ZB_Dimmer_3wire] [0] --- zapp
2019-03-03 22:31:58 [log] [ManagerDrivers] [ZB_Dimmer_3wire] [0] --- genBasic
2019-03-03 22:31:58 [log] [ManagerDrivers] [ZB_Dimmer_3wire] [0] ---- 9 : 255
2019-03-03 22:31:58 [log] [ManagerDrivers] [ZB_Dimmer_3wire] [0] ---- 10 : 00
2019-03-03 22:31:58 [log] [ManagerDrivers] [ZB_Dimmer_3wire] [0] ---- 11 : NULL
2019-03-03 22:31:58 [log] [ManagerDrivers] [ZB_Dimmer_3wire] [0] ---- 30721 : 255
2019-03-03 22:31:58 [log] [ManagerDrivers] [ZB_Dimmer_3wire] [0] ---- 30722 : 255
2019-03-03 22:31:58 [log] [ManagerDrivers] [ZB_Dimmer_3wire] [0] ---- 30723 : 255
2019-03-03 22:31:58 [log] [ManagerDrivers] [ZB_Dimmer_3wire] [0] ---- 30724 : 255
2019-03-03 22:31:58 [log] [ManagerDrivers] [ZB_Dimmer_3wire] [0] ---- 34819 : 0
2019-03-03 22:31:59 [log] [ManagerDrivers] [ZB_Dimmer_3wire] [0] ---- 34820 : 0
2019-03-03 22:31:59 [log] [ManagerDrivers] [ZB_Dimmer_3wire] [0] ---- 36864 : 2
2019-03-03 22:31:59 [log] [ManagerDrivers] [ZB_Dimmer_3wire] [0] ---- 65533 : 1
2019-03-03 22:31:59 [log] [ManagerDrivers] [ZB_Dimmer_3wire] [0] ---- cid : genBasic
2019-03-03 22:31:59 [log] [ManagerDrivers] [ZB_Dimmer_3wire] [0] ---- sid : attrs
2019-03-03 22:31:59 [log] [ManagerDrivers] [ZB_Dimmer_3wire] [0] ---- zclVersion : 3
2019-03-03 22:31:59 [log] [ManagerDrivers] [ZB_Dimmer_3wire] [0] ---- appVersion : 0
2019-03-03 22:31:59 [log] [ManagerDrivers] [ZB_Dimmer_3wire] [0] ---- stackVersion : 0
2019-03-03 22:31:59 [log] [ManagerDrivers] [ZB_Dimmer_3wire] [0] ---- hwVersion : 0
2019-03-03 22:31:59 [log] [ManagerDrivers] [ZB_Dimmer_3wire] [0] ---- manufacturerName : Sunricher
2019-03-03 22:31:59 [log] [ManagerDrivers] [ZB_Dimmer_3wire] [0] ---- modelId : ZG9101SAC-HP
2019-03-03 22:31:59 [log] [ManagerDrivers] [ZB_Dimmer_3wire] [0] ---- dateCode : NULL
2019-03-03 22:31:59 [log] [ManagerDrivers] [ZB_Dimmer_3wire] [0] ---- powerSource : 1
2019-03-03 22:31:59 [log] [ManagerDrivers] [ZB_Dimmer_3wire] [0] ---- appProfileVersion : 255
2019-03-03 22:31:59 [log] [ManagerDrivers] [ZB_Dimmer_3wire] [0] ---- swBuildId : 2.4.1_r30
2019-03-03 22:31:59 [log] [ManagerDrivers] [ZB_Dimmer_3wire] [0] --- genIdentify
2019-03-03 22:31:59 [log] [ManagerDrivers] [ZB_Dimmer_3wire] [0] ---- 65533 : 1
2019-03-03 22:31:59 [log] [ManagerDrivers] [ZB_Dimmer_3wire] [0] ---- cid : genIdentify
2019-03-03 22:31:59 [log] [ManagerDrivers] [ZB_Dimmer_3wire] [0] ---- sid : attrs
2019-03-03 22:31:59 [log] [ManagerDrivers] [ZB_Dimmer_3wire] [0] ---- identifyTime : 0
2019-03-03 22:31:59 [log] [ManagerDrivers] [ZB_Dimmer_3wire] [0] --- genGroups
2019-03-03 22:31:59 [log] [ManagerDrivers] [ZB_Dimmer_3wire] [0] ---- 65533 : 1
2019-03-03 22:31:59 [log] [ManagerDrivers] [ZB_Dimmer_3wire] [0] ---- cid : genGroups
2019-03-03 22:31:59 [log] [ManagerDrivers] [ZB_Dimmer_3wire] [0] ---- sid : attrs
2019-03-03 22:31:59 [log] [ManagerDrivers] [ZB_Dimmer_3wire] [0] ---- nameSupport : 0
2019-03-03 22:31:59 [log] [ManagerDrivers] [ZB_Dimmer_3wire] [0] --- genScenes
2019-03-03 22:31:59 [log] [ManagerDrivers] [ZB_Dimmer_3wire] [0] ---- 65533 : 1
2019-03-03 22:31:59 [log] [ManagerDrivers] [ZB_Dimmer_3wire] [0] ---- cid : genScenes
2019-03-03 22:31:59 [log] [ManagerDrivers] [ZB_Dimmer_3wire] [0] ---- sid : attrs
2019-03-03 22:31:59 [log] [ManagerDrivers] [ZB_Dimmer_3wire] [0] ---- count : 0
2019-03-03 22:31:59 [log] [ManagerDrivers] [ZB_Dimmer_3wire] [0] ---- currentScene : 0
2019-03-03 22:31:59 [log] [ManagerDrivers] [ZB_Dimmer_3wire] [0] ---- currentGroup : 0
2019-03-03 22:31:59 [log] [ManagerDrivers] [ZB_Dimmer_3wire] [0] ---- sceneValid : 0
2019-03-03 22:31:59 [log] [ManagerDrivers] [ZB_Dimmer_3wire] [0] ---- nameSupport : 0
2019-03-03 22:31:59 [log] [ManagerDrivers] [ZB_Dimmer_3wire] [0] --- genOnOff
2019-03-03 22:31:59 [log] [ManagerDrivers] [ZB_Dimmer_3wire] [0] ---- 65533 : 1
2019-03-03 22:31:59 [log] [ManagerDrivers] [ZB_Dimmer_3wire] [0] ---- cid : genOnOff
2019-03-03 22:31:59 [log] [ManagerDrivers] [ZB_Dimmer_3wire] [0] ---- sid : attrs
2019-03-03 22:31:59 [log] [ManagerDrivers] [ZB_Dimmer_3wire] [0] ---- onOff : 0
2019-03-03 22:31:59 [log] [ManagerDrivers] [ZB_Dimmer_3wire] [0] ---- globalSceneCtrl : 1
2019-03-03 22:31:59 [log] [ManagerDrivers] [ZB_Dimmer_3wire] [0] ---- onTime : 0
2019-03-03 22:31:59 [log] [ManagerDrivers] [ZB_Dimmer_3wire] [0] ---- offWaitTime : 0
2019-03-03 22:31:59 [log] [ManagerDrivers] [ZB_Dimmer_3wire] [0] --- genLevelCtrl
2019-03-03 22:31:59 [log] [ManagerDrivers] [ZB_Dimmer_3wire] [0] ---- 15 : 1
2019-03-03 22:31:59 [log] [ManagerDrivers] [ZB_Dimmer_3wire] [0] ---- 16384 : 255
2019-03-03 22:31:59 [log] [ManagerDrivers] [ZB_Dimmer_3wire] [0] ---- 65533 : 1
2019-03-03 22:31:59 [log] [ManagerDrivers] [ZB_Dimmer_3wire] [0] ---- cid : genLevelCtrl
2019-03-03 22:31:59 [log] [ManagerDrivers] [ZB_Dimmer_3wire] [0] ---- sid : attrs
2019-03-03 22:31:59 [log] [ManagerDrivers] [ZB_Dimmer_3wire] [0] ---- currentLevel : 67
2019-03-03 22:31:59 [log] [ManagerDrivers] [ZB_Dimmer_3wire] [0] ---- remainingTime : 2
2019-03-03 22:31:59 [log] [ManagerDrivers] [ZB_Dimmer_3wire] [0] ---- onOffTransitionTime : 1
2019-03-03 22:31:59 [log] [ManagerDrivers] [ZB_Dimmer_3wire] [0] ---- onLevel : 255
2019-03-03 22:31:59 [log] [ManagerDrivers] [ZB_Dimmer_3wire] [0] --- genOta
2019-03-03 22:31:59 [log] [ManagerDrivers] [ZB_Dimmer_3wire] [0] ---- cid : genOta
2019-03-03 22:31:59 [log] [ManagerDrivers] [ZB_Dimmer_3wire] [0] ---- sid : attrs
2019-03-03 22:31:59 [log] [ManagerDrivers] [ZB_Dimmer_3wire] [0] --- haDiagnostic
2019-03-03 22:31:59 [log] [ManagerDrivers] [ZB_Dimmer_3wire] [0] ---- 65533 : 1
2019-03-03 22:31:59 [log] [ManagerDrivers] [ZB_Dimmer_3wire] [0] ---- cid : haDiagnostic
2019-03-03 22:31:59 [log] [ManagerDrivers] [ZB_Dimmer_3wire] [0] ---- sid : attrs
2019-03-03 22:31:59 [log] [ManagerDrivers] [ZB_Dimmer_3wire] [0] ---- numberOfResets : 0
2019-03-03 22:31:59 [log] [ManagerDrivers] [ZB_Dimmer_3wire] [0] ---- averageMacRetryPerApsMessageSent : 0
2019-03-03 22:31:59 [log] [ManagerDrivers] [ZB_Dimmer_3wire] [0] ---- lastMessageLqi : 0
2019-03-03 22:31:59 [log] [ManagerDrivers] [ZB_Dimmer_3wire] [0] ---- lastMessageRssi : 0
2019-03-03 22:31:59 [log] [ManagerDrivers] [ZB_Dimmer_3wire] [0] --- lightLink
2019-03-03 22:31:59 [log] [ManagerDrivers] [ZB_Dimmer_3wire] [0] ---- 65533 : 1
2019-03-03 22:31:59 [log] [ManagerDrivers] [ZB_Dimmer_3wire] [0] ---- cid : lightLink
2019-03-03 22:31:59 [log] [ManagerDrivers] [ZB_Dimmer_3wire] [0] ---- sid : attrs
2019-03-03 22:31:59 [log] [ManagerDrivers] [ZB_Dimmer_3wire] [0] - Endpoints: 1
2019-03-03 22:31:59 [log] [ManagerDrivers] [ZB_Dimmer_3wire] [0] -- Clusters:
2019-03-03 22:31:59 [log] [ManagerDrivers] [ZB_Dimmer_3wire] [0] --- zapp
2019-03-03 22:31:59 [log] [ManagerDrivers] [ZB_Dimmer_3wire] [0] --- genGreenPowerProxy
2019-03-03 22:31:59 [log] [ManagerDrivers] [ZB_Dimmer_3wire] [0] ---- cid : genGreenPowerProxy
2019-03-03 22:31:59 [log] [ManagerDrivers] [ZB_Dimmer_3wire] [0] ---- sid : attrs
2019-03-03 22:31:59 [log] [ManagerDrivers] [ZB_Dimmer_3wire] [0] ------------------------------------------
*/
