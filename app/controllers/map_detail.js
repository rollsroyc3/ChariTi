/**
 * Controller for the map node screen
 *
 * @class Controllers.map.detail
 * @uses core
 * @uses Widgets.com.mcongrove.detailNavigation
 */
var APP = require("core");

var CONFIG = arguments[0] || {};

/**
 * Initializes the controller
 */
$.init = function() {
	APP.log("debug", "map_detail.init | " + JSON.stringify(CONFIG));

	$.handleData(CONFIG.data);
};

/**
 * Handles the data passed
 * @param {Object} _data The passed data
 */
$.handleData = function(_data) {
	APP.log("debug", "event_event.handleData");

	$.heading.text = _data.title;
	$.heading.color = APP.Settings.colors.hsb.primary.b > 70 ? "#000" : APP.Settings.colors.primary;
	$.text.value = _data.description;
	$.location.text = _data.address;
	$.phoneNumber.text = _data.phoneNumber;
	$.email.text = _data.email;
	var size = (APP.Device.width - 40) + 'x' + ((APP.Device.width - 40) / 2);
	$.photo.image = 'http://maps.googleapis.com/maps/api/staticmap?center=' + _data.latitude + ',' + _data.longitude + '&zoom=13&size=' + size + '&maptype=roadmap&markers=color:' + _data.pinColor + '|label:A|' + _data.latitude + ',' + _data.longitude + '&sensor=true';

	$.NavigationBar.setBackgroundColor(APP.Settings.colors.primary);

	if(APP.Device.isHandheld || APP.Device.isTablet && !CONFIG.tabletSupport) {
		$.NavigationBar.showBack(function(_event) {
			APP.removeAllChildren();
		});
	}
};

// Kick off the init
$.init();