"use strict";

const Homey = require('homey');
const util = require('/lib/util.js');

class TwinklyDevice extends Homey.Device {

  onInit() {
    this.registerCapabilityListener('onoff', this.onCapabilityOnoff.bind(this));

    this.updateToken();
    var intervalStatus = this.getSetting('polling') || 5;
    this.pollDevice(intervalStatus);
  }

  onDeleted() {
    clearInterval(this.pollingInterval);
  }

  // LISTENERS FOR UPDATING CAPABILITIES
  onCapabilityOnoff(value, opts, callback) {
    if (value) {
      util.sendCommand('/xled/v1/led/mode', this.getStoreValue("token"), 'POST', {"mode":"movie"}, this.getSetting('address'));
    } else {
      util.sendCommand('/xled/v1/led/mode', this.getStoreValue("token"), 'POST', {"mode":"off"}, this.getSetting('address'));
    }
    callback(null, value);
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

    //setTimeout(this.updateToken(), 3600000);
  }

  pollDevice(intervalStatus) {
    clearInterval(this.pollingInterval);
    clearInterval(this.pingInterval);

    this.pollingInterval = setInterval(() => {
      util.getState(this.getSetting('address'), this.getStoreValue("token"))
        .then(result => {
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
          this.error(error);
          this.setUnavailable(Homey.__('Unreachable'));
          this.pingDevice();
        })
    }, 1000 * intervalStatus);
  }

  pingDevice() {
    clearInterval(this.pollingInterval);
    clearInterval(this.pingInterval);

    this.pingInterval = setInterval(() => {
      util.getState(this.getSetting('address'), this.getStoreValue("token"))
        .then(result => {
          this.setAvailable();
          var intervalPing = this.getSetting('polling') || 5;
          this.pollDevice(intervalPing);
        })
        .catch(error => {
          this.log('Device is not reachable, pinging every 63 seconds to see if it comes online again.');
        })
    }, 63000);
  }

}

module.exports = TwinklyDevice;
