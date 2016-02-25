
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

  this.options = _.defaults(options || {}, {
    host: 'localhost',
    port: 8888
  });

  this.url = 'http://' + this.options.host + ':' + this.options.port + '/api/v2';

  client.getTokenAndCookie(function(err, token) {
    if(err) return client.emit('error', err);

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

  // init or empty jar if there was something there
  // this way we will get a new set-cookie header returned
  this.jar = request.jar();
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

  this.request.get({
    uri: this.url + '/token'
  }, function(err, res, body) {
    if (err) return callback('Error while retrieving the token: ' + err);

    var jsonBody = JSON.parse(body);
    if (!jsonBody.data || !jsonBody.data.token) return callback('Token was not found in the BTSyncAPI response body');
    var token = jsonBody.data.token;

    if (res.headers && res.headers['set-cookie']) {
      var setCookieHeader = res.headers['set-cookie'].toString();
      // store cookie for further requests
      // see: http://stackoverflow.com/questions/20856139/cant-add-cookie-anymore-in-request-jar
      _this.jar.setCookie(setCookieHeader, _this.url, function (err, cookie) {
        callback(null, token);
      })
    } else {
     return callback('Set-cookie header was not returned by BTSyncAPI');
    }
  });
};

BTSyncAPI.prototype.getFolders = function (callback) {
  _this = this;
  var hasRetried = false;

  params = _.extend({}, {
    token: this.token
  }, false);

  this.request.get({
    json: true,
    url: this.url + '/folders?' + querystring.stringify(params),
  }, function(err, res, body) {
    // try to reestablish connection only once
    if ((err || body === '\r\ninvalid request') && !hasRetried) {
      _this.getTokenAndCookie(function(err, token) {
        if(err) return callback(err); // we can not reconnect

        hasRetried = true;

        _this.setToken(token);
        _this.getAllFolders(callback);
      });
    } else {
      return callback(err, body);
    }
  });
};

BTSyncAPI.prototype.addFolder = function (params, callback) {
  _this = this;
  var hasRetried = false;

  params = _.extend(params, {
    token: this.token
  }, false);

  this.request.post({
    json: true,
    url: this.url + '/folders?' + querystring.stringify(params),
  }, function(err, res, body) {
    // try to reestablish connection only once
    if ((err || body === '\r\ninvalid request') && !hasRetried) {
      _this.getTokenAndCookie(function(err, token) {
        if(err) return callback(err); // we can not reconnect

        hasRetried = true;

        _this.setToken(token);
        _this.addFolder(params, callback);
      });
    } else {
      return callback(err, body);
    }
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
  _this = this;
  var hasRetried = false;

  params = _.extend(params, {
    token: this.token
  }, false);

  this.request.del({
    json: true,
    url: this.url + '/folders/' + folderId + '?' + querystring.stringify(params),
  }, function(err, res, body) {
    // try to reestablish connection only once
    if ((err || body === '\r\ninvalid request') && !hasRetried) {
      _this.getTokenAndCookie(function(err, token) {
        if(err) return callback(err); // we can not reconnect

        hasRetried = true;

        _this.setToken(token);
        _this.removeFolder(folderId, params, callback);
      });
    } else {
      return callback(err, body);
    }
  });
};

BTSyncAPI.prototype.generateSecret = function (params, callback) {
  _this = this;
  var hasRetried = false;

  params = _.extend(params, {
    token: this.token
  }, false);

  this.request.post({
    json: true,
    url: this.url + '/secret?' + querystring.stringify(params),
  }, function(err, res, body) {
    // try to reestablish connection only once
    if ((err || body === '\r\ninvalid request') && !hasRetried) {
      _this.getTokenAndCookie(function(err, token) {
        if (err) return callback(err); // we can not reconnect

        hasRetried = true;

        _this.setToken(token);
        _this.generateSecret(params, callback);
      });
    } else {
      return callback(err, body);
    }
  });
};

BTSyncAPI.prototype.getEvents = function (params, callback) {
  params = _.extend(params, {
    token: this.token
  }, false);

  this.request.get({
    json: true,
    url: this.url + '/events?' + querystring.stringify(params),
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
