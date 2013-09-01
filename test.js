
/**
 * Dependencies
 */ 

var assert = require('assert');
var btsync = require('./');

/**
 * Create Client
 */

describe('btsync-api client', function() {

  var client = null;

  it('should call ready', function(done) {
    client = btsync({
      host: process.env.BTSYNC_HOST,
      port: process.env.BTSYNC_PORT
    });
    client.on('ready', done);
    client.on('error', done);
  });

  it('should reply with version on getversion call', function(done) {
    client.call('getversion', function(err, res) {
      if(err) return done(err)
      assert.equal(typeof res === 'object' && typeof res.version === 'number', true);
      done();
    });
  });
});
