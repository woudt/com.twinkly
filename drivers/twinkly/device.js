"use strict";

const Homey = require('homey');
const util = require('/lib/util.js');

class TwinklyDevice extends Homey.Device {

  onInit() {

    this.setAvailable();

    // START POLLING
    this.updateToken();
    var intervalStatus = this.getSetting('polling') || 5;
    this.pollDevice(intervalStatus);

    // UPDATE LIGHT PROFILE
    setTimeout(() => {
      this.updateTwinklyStore();
    }, 5000);

    // LISTENERS FOR UPDATING CAPABILITIES
    this.registerCapabilityListener('onoff', (value, opts) => {
      if (value) {
        return util.sendCommand('/xled/v1/led/mode', this.getStoreValue("token"), 'POST', JSON.stringify({"mode":"movie"}), this.getSetting('address'));
      } else {
        return util.sendCommand('/xled/v1/led/mode', this.getStoreValue("token"), 'POST', JSON.stringify({"mode":"off"}), this.getSetting('address'));
      }
    });

  }

  onDeleted() {
    clearInterval(this.pollingInterval);
  }

  // HELPER FUNCTIONS
  updateToken() {
    util.returnToken(this.getSetting('address'))
      .then(result => {
        this.setStoreValue("token", result);
      })
      .catch(error => {
        this.error(error);
      })
  }

  async updateTwinklyStore() {
    let data = await util.getDeviceInfo(this.getSetting('address'));

    this.setStoreValue("product_code", data.product_code);
    this.setStoreValue("hw_id", data.hw_id);
    this.setStoreValue("mac", data.mac);
    this.setStoreValue("max_supported_led", data.max_supported_led);
    this.setStoreValue("base_leds_number", data.base_leds_number);
    this.setStoreValue("number_of_led", data.number_of_led);
    this.setStoreValue("led_profile", data.led_profile);
    this.setStoreValue("frame_rate", data.frame_rate);
    this.setStoreValue("movie_capacity", data.movie_capacity);
  }

  pollDevice(intervalStatus) {
    clearInterval(this.pollingInterval);
    clearInterval(this.pingInterval);

    this.pollingInterval = setInterval(() => {
      util.sendCommand('/xled/v1/led/mode', this.getStoreValue("token"), 'GET', '', this.getSetting('address'))
        .then(result => {
          if (!this.getAvailable()) {
            this.setAvailable();
          }

          if (result.mode == 'off') {
            var state = false;
          } else {
            var state = true;
          }

          // capability onoff
          if (state != this.getCapabilityValue('onoff')) {
            this.setCapabilityValue('onoff', state);
          }

        })
        .catch(error => {
          if (error == 'Error: 401') {
            this.updateToken();
          } else {
            this.error(error);
            this.setUnavailable(Homey.__('Unreachable'));
            this.pingDevice();
          }
        })
    }, 1000 * intervalStatus);
  }

  pingDevice() {
    clearInterval(this.pollingInterval);
    clearInterval(this.pingInterval);

    this.pingInterval = setInterval(() => {
      util.sendCommand('/xled/v1/led/mode', this.getStoreValue("token"), 'GET', '', this.getSetting('address'))
        .then(result => {
          this.setAvailable();
          var intervalStatus = this.getSetting('polling') || 5;
          this.pollDevice(intervalStatus);
        })
        .catch(error => {
          if (error == 'Error: 401') {
            this.updateToken();
            setTimeout(() => {
              this.setAvailable();
              var intervalStatus = this.getSetting('polling') || 5;
              this.pollDevice(intervalStatus);
            }, 5000);
          } else {
            this.log('Device is not reachable, pinging every 63 seconds to see if it comes online again.');
          }
        })
    }, 63000);
  }

}

module.exports = TwinklyDevice;
