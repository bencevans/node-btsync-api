
/**
 * Module Dependencies
 */

var url = require('url');
var request = require('request');
var _ = require('underscore');
var events = require('events');
var util = require('util');
var querystring = require('querystring');

/**
 * BitTorrent Sync API Client
 * @param {Object} options
 *   default options = {
 *     host: 'localhost',
 *     port: 8888,
 *     guid: null,
 *     token: null
 *   }
 * Events:
 *   'ready' - Client has guid and token thus ready to use
 *   'error' - Error on guid/token retreival
 */
var BTSyncAPI = function(options) {
  var client = this;

  this.jar = request.jar();

  this.options = _.defaults(options || {}, {
    host: 'localhost',
    port: 8888
  });

  var requestDefaults = {
    jar: this.jar
  };

  if(this.options.username) {
    requestDefaults.auth = { user: this.options.username };
    if(this.options.password) {
      requestDefaults.auth.pass = this.options.password;
    }
  }

  this.request = request.defaults(requestDefaults);

  this.url = 'http://' + this.options.host + ':' + this.options.port + '/api/v2';

  client.getTokenAndCookie(function(err, token) {
    if(err) return client.emit('error', error);

    client.setToken(token);
    client.emit('ready');
  });

  return this;
};
util.inherits(BTSyncAPI, events.EventEmitter);

BTSyncAPI.prototype.setToken = function(token) {
  this.token = token;
};

BTSyncAPI.prototype.getTokenAndCookie = function(callback) {
  var _this = this;

  this.request.get({
    uri: this.url + '/token'
  }, function(err, res, body) {
    if(err) return callback(err);

    var setCookieHeader = res.headers['set-cookie'].toString();
    // TODO: guid seems not to be used explicitly anymore
    _this.guid = setCookieHeader.match(/GUID=([0-9a-zA-Z]+);/)[1];

    // store cookie for further requests
    // see: http://stackoverflow.com/questions/20856139/cant-add-cookie-anymore-in-request-jar
    _this.jar.setCookie(setCookieHeader, _this.url, function (err, cookie) {
      var jsonBody = JSON.parse(body);
      var token = jsonBody.data.token;

      callback(null, token);
    })
  });
};

BTSyncAPI.prototype.addFolder = function (params, callback) {
  params = _.extend(params, {
    token: this.token
  }, false);

  this.request.post({
    json: true,
    url: this.url + '/folders?' + querystring.stringify(params),
  }, function(err, res, body) {
    return callback(err, body);
  });
};

BTSyncAPI.prototype.getInvitationLink = function (folderId, params, callback) {
  params = _.extend(params, {
    token: this.token
  }, false);

  this.request.post({
    json: true,
    url: this.url + '/folders/' + folderId + '/link?' + querystring.stringify(params),
  }, function(err, res, body) {
    return callback(err, body);
  });
};

BTSyncAPI.prototype.removeFolder = function (folderId, params, callback) {
  params = _.extend(params, {
    token: this.token
  }, false);

  this.request.del({
    json: true,
    url: this.url + '/folders/' + folderId + '?' + querystring.stringify(params),
  }, function(err, res, body) {
    return callback(err, body);
  });
};

// TODO: reuse this function to keep DRY in other calls
// BTSyncAPI.prototype.call = function(action, params, callback) {
//   if(!callback && typeof params === 'function') {
//     callback = params;
//     params = {};
//   }

//   params = _.extend(params, {
//     token: this.token,
//     guid: this.guid,
//     action: action
//   }, false);

//   this.request({
//     json: true,
//     url: this.url + '/?' + querystring.stringify(params),
//   }, function(err, res, body) {
//     return callback(err, body);
//   });
// };

function createClient(options) {
  return new BTSyncAPI(options);
}

/**
 * Exports
 */

module.exports = createClient;
module.exports.BTSyncAPI = BTSyncAPI;