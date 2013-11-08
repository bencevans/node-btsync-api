# btsync-api

[BitTorrent Sync](http://labs.bittorrent.com/experiments/sync.html) API Client

[![Build Status](https://travis-ci.org/bencevans/node-btsync-api.png?branch=master)](https://travis-ci.org/bencevans/node-btsync-api)
[![Coverage Status](https://coveralls.io/repos/bencevans/node-btsync-api/badge.png)](https://coveralls.io/r/bencevans/node-btsync-api)
[![Dependency Status](https://david-dm.org/bencevans/node-btsync-api.png)](https://david-dm.org/bencevans/node-btsync-api)

## Install

`npm install btsync-api`

## API Commands

* `licence`
* `getostype`
* `getsettings`
* `getversion`
* `checknewversion`
* `getuserlang`
* `iswebuilanguageset`
* `getdir` params: `dir`: absolute path in file system
* `getsyncfolders`

## Example

```javascript
var client = require('btsync-api')();
client.on('ready', function() {
  client.call('getosinfo', function(err, osInfo) {
    console.log(err, osInfo);
  })
});
client.on('error', console.error);
```

### Licence

MIT

