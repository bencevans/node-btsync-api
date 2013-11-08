
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
    port: 8888,
    guid: null,
    token: null
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

  this.url = 'http://' + this.options.host + ':' + this.options.port + '/gui';

  function sortToken() {
    if(client.options.token) {
      client.token = client.options.token;
      process.nextTick(function() {
        client.emit('ready');
      });
    } else {
      client.getToken(function(err, token) {
        if(err) return client.emit('error', error);
        client.setToken(token);
        client.emit('ready');
      });
    }
  }

  if(this.options.guid) {
    this.guid = this.options.guid;
    sortToken();
  } else {
    this.getGUID(function(err, guid) {
      if(err) return client.emit('error', err);
      client.guid = guid;
      sortToken();
    });
  }

  return this;
};
util.inherits(BTSyncAPI, events.EventEmitter);

BTSyncAPI.prototype.getGUID = function(callback) {
  var client = this;
  this.request.post({
    uri: this.url + '/en/index.html'
  }, function(err, res, body) {
    if(err) return callback(err);
    client.jar.add(request.cookie(res.headers['set-cookie'].toString()));
    callback(null, res.headers['set-cookie'].toString().match(/GUID=([0-9a-zA-Z]+);/)[1]);
  });
};

BTSyncAPI.prototype.setToken = function(token) {
  this.token = token;
};

BTSyncAPI.prototype.getToken = function(callback) {
  this.request.post({
    uri: this.url + '/token.html?' + new Date()
  }, function(err, res, body) {
    if(err) return callback(err);
    callback(null, body.match(/<html><div id=\'token\' style=\'display:none;\'>(.+)<\/div><\/html>/)[1]);
  });
};

BTSyncAPI.prototype.call = function(action, params, callback) {

  if(!callback && typeof params === 'function') {
    callback = params;
    params = {};
  }

  params = _.extend(params, {
    token: this.token,
    guid: this.guid,
    action: action,
    t: (new Date()).getTime()
  }, false);

  this.request({
    json: true,
    url: this.url + '/?' + querystring.stringify(params),
  }, function(err, res, body) {
    return callback(err, body);
  });
};

function createClient(options) {
  return new BTSyncAPI(options);
}

/**
 * Exports
 */

module.exports = createClient;
module.exports.BTSyncAPI = BTSyncAPI;