const Homey = require('homey');
const fetch = require('node-fetch');
const randomBytes = require('random-bytes');

exports.getDeviceInfo = function (address) {
  return new Promise(function (resolve, reject) {
    fetch('http://'+ address + '/xled/v1/gestalt', {
      method: 'GET',
    })
    .then(checkStatus)
    .then(res => res.json())
    .then(json => {
      return resolve(json);
    })
    .catch(err => {
      return reject(err);
    });
  })
}

exports.getState = function (address, token) {
  return new Promise(function (resolve, reject) {
    fetch('http://'+ address +'/xled/v1/led/mode', {
      method: 'GET',
      headers: {
        'X-Auth-Token': token,
        'Content-Type': 'application/json'
      },
    })
    .then(checkStatus)
    .then(res => res.json())
    .then(json => {
      return resolve(json);
    })
    .catch(err => {
      return reject(err);
    });
  })
}

exports.sendCommand = function (endpoint, token, type, payload, address) {
  return new Promise(function (resolve, reject) {

    fetch('http://'+ address + endpoint, {
      method: type,
      body: JSON.stringify(payload),
      headers: {
        'X-Auth-Token': token,
        'Content-Type': 'application/json',
        'Content-Length': payload.length
      },
    })
    .then(checkStatus)
    .then(res => res.json())
    .then(json => {
      return resolve(json);
    })
    .catch(err => {
      return reject(err);
    });
  })
}

exports.returnToken = function (address) {
  return new Promise(function (resolve, reject) {
    const verify = async () => {
      try {
        const challenge = await randomBytes.sync(32);
        const tokendata = await getToken(address);

        if (tokendata) {
          const body = JSON.stringify( {"challenge-response": tokendata["challenge-response"].toString('base64') } );
          fetch('http://'+ address + '/xled/v1/verify', {
            method: 'POST',
            body: body,
            headers: {
              'X-Auth-Token': tokendata.authentication_token,
              'Content-Type': 'application/json',
              'Content-Length': 66
            },
          })
          .then(checkStatus)
          .then(res => res.json())
          .then(json => {
            return resolve(tokendata.authentication_token);
          })
          .catch(err => {
            return reject(err);
          });
        }
      } catch (err) {
        return reject(err);
      }
    }
    verify();
  })
}

function getToken(address) {
  return new Promise(function (resolve, reject) {
    const token = async () => {
      try {
        const challenge = await randomBytes.sync(32);
        if (challenge) {
          const body = JSON.stringify( {"challenge": challenge.toString('base64') } );
          fetch('http://'+ address + '/xled/v1/login', {
            method: 'POST',
            body: body,
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'Content-Length': 61
            },
          })
          .then(checkStatus)
          .then(res => res.json())
          .then(json => {
            return resolve(json);
          })
          .catch(err => {
            return reject(err);
          });
        }
      } catch (err) {
        return reject(err);
      }
    }
    token();
  })
}

function checkStatus(res) {
  if (res.ok) {
    return res;
  } else {
    throw new Error(res.status);
  }
}

function isEmpty(obj) {
  for(var prop in obj) {
    if(obj.hasOwnProperty(prop))
      return false;
  }
  return true;
}
