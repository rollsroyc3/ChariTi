/**
 * Urban Airship push notification class
 *
 * @class push.ua
 * @uses core
 * @uses push
 * @uses Modules.ti.urbanairship
 */
var APP = require("core");
var PUSH = require("push");

if(OS_IOS) {

	var registeriOS = function(_callback) {
		APP.log("debug", "UA.registeriOS");

		var UA = require("ti.urbanairship");

		// Set UA options
		UA.tags = [APP.ID, APP.VERSION, Ti.Platform.osname, Ti.Platform.locale];
		UA.alias = 'user@email.com';
		UA.autoBadge = true;
		UA.autoResetBadge = true;

		Ti.Network.registerForPushNotifications({
			types: [Ti.Network.NOTIFICATION_TYPE_BADGE, Ti.Network.NOTIFICATION_TYPE_ALERT, Ti.Network.NOTIFICATION_TYPE_SOUND],
			/**
			 * Fired after we've registered the device
			 * @param {Object} _data UrbanAirship data object
			 */
			success: function(_data) {
				APP.log("debug", "UA.registeriOS @success");
				APP.log("trace", _data.deviceToken);

				PUSH.deviceToken = _data.deviceToken;

				UA.registerDevice(PUSH.deviceToken, {
					tags: [APP.ID, APP.VERSION, Ti.Platform.osname, Ti.Platform.locale]
				});

				_callback();
			},
			/**
			 * Fired on an error
			 * @param {Object} _data UrbanAirship data object
			 */
			error: function(_data) {
				APP.log("debug", "UA.registeriOS @error");
				APP.log("trace", JSON.stringify(_data));
				alert(_data);
			},
			/**
			 * Fired when a push notification is received
			 * @param {Object} _data UrbanAirship data object
			 */
			callback: function(_data) {
				APP.log("debug", "UA.registeriOS @callback");
				APP.log("trace", JSON.stringify(_data));

				// Pass the notification to the module, not sure what this does?
				//UA.handleNotification(_data.data);
				
				PUSH.pushRecieved(_data.data);
				//Ti.API.info('  Payload: ' + e.data.aps);

				if(_data.data.tab) {
					var tabIndex = parseInt(_data.data.tab, 10) - 1;

					if(APP.Nodes[tabIndex]) {
						APP.handleNavigation(tabIndex);
					}
				}
			}
		});
	};
}

if(OS_ANDROID) {
	var registerAndroid = function(_callback) {
		APP.log("debug", "UA.registerAndroid");

		var UrbanAirship = require('ti.urbanairship');

		// Set UA options
		UrbanAirship.showOnAppClick = true;
		UrbanAirship.tags = [APP.ID, APP.VERSION, Ti.Platform.osname, Ti.Platform.locale];
		UrbanAirship.alias = 'user@email.com';

		// UA Properties
		//UrbanAirship.pushId
		//UrbanAirship.pushEnabled

		/**
		 * Fired when a push notification is received
		 * @param {Object} _data UrbanAirship data object
		 *
		 * Push object example
		 * {"type":"UrbanAirship_Callback","source":{"vibrateEnabled":true,"alias":"user@email.com","isFlying":true,"soundEnabled":true,"pushEnabled":true,"pushId":"557e0fb4-495e-449d-8a89-5efaa51a8f80","apiName":"Ti.Module","showOnAppClick":true,"tags":["testingtesting","appcelerator","my-tags"],"bubbleParent":true,"invocationAPIs":[],"_events":{"UrbanAirship_Callback":{},"UrbanAirship_Success":{},"UrbanAirship_Error":{}}},"message":"Welcome to the app","payload":"{hello=world}","clicked":true,"bubbles":false,"cancelBubble":false}
		 * */
		function eventCallback(e) {
			APP.log("debug", "UA.registerAndroid @callback");
			APP.log("trace", JSON.stringify(e));

			PUSH.pushRecieved(e);

			var data = formatPayload(e.payload);

			if(data.tab != undefined) {
				var tabIndex = parseInt(data.tab, 10) - 1;

				if(APP.Nodes[tabIndex]) {
					APP.handleNavigation(tabIndex);
				}
			}

			_callback();
		}

		/**
		 * Fired after we've registered the device
		 * @param {Object} _data UrbanAirship data object
		 */
		function eventSuccess(e) {
			APP.log("debug", "UA.registerAndroid @success");
			APP.log("trace", e.deviceToken);

			PUSH.deviceToken = e.deviceToken;

			Ti.App.Properties.setString("PUSH_DEVICETOKEN", e.deviceToken);

			_callback();
		}

		/**
		 * Fired on an error
		 * @param {Object} _data UrbanAirship data object
		 */
		function eventError(e) {
			APP.log("debug", "UA.registerAndroid @error");
			APP.log("trace", JSON.stringify(e));
			//e.error
		}

		UrbanAirship.addEventListener(UrbanAirship.EVENT_URBAN_AIRSHIP_CALLBACK, eventCallback);
		UrbanAirship.addEventListener(UrbanAirship.EVENT_URBAN_AIRSHIP_SUCCESS, eventSuccess);
		UrbanAirship.addEventListener(UrbanAirship.EVENT_URBAN_AIRSHIP_ERROR, eventError);

		UrbanAirship.pushEnabled = true;
	};
}

/**
 * Clean up push notification payload
 * @param {String} _payload The string from the push notification data
 */
var formatPayload = function(_payload) {
	var payload = {};
	if(_payload === "{}") {
		return payload;
	}

	var data = _payload.replace('{', '').replace('}', '').split(",");
	for(var key in data) {
		var nvp = data[key].split("=");
		payload[nvp[0]] = nvp[1];
	}
	return payload;
};

/**
 * Registers a device for push notifications
 * @param {Function} _callback The function to run after registration is complete
 */
exports.registerDevice = function(_callback) {
	APP.log("debug", "UA.registerDevice");
	if(OS_IOS) {
		registeriOS(_callback);
	} else if(OS_ANDROID) {
		registerAndroid(_callback);
	}
};