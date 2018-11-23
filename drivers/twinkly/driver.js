"use strict";

const Homey = require('homey');
const util = require('/lib/util.js');

class TwinklyDriver extends Homey.Driver {

  onPair(socket) {
    socket.on('testConnection', function(data, callback) {
      util.getDeviceInfo(data.address)
        .then(result => {
          callback(false, result);
        })
        .catch(error => {
          callback(error, false);
        })
    });
  }

}

module.exports = TwinklyDriver;
