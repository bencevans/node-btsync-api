# btsync-api [![Build Status](https://img.shields.io/travis/bencevans/node-btsync-api.svg?style=flat-square)](https://travis-ci.org/bencevans/node-btsync-api) [![Coverage Status](https://img.shields.io/coveralls/bencevans/node-btsync-api.svg?branch=master&style=flat-square)](https://coveralls.io/r/bencevans/node-btsync-api)

> [BitTorrent Sync](http://labs.bittorrent.com/experiments/sync.html) API Client



## Install

    $ npm install btsync-api

## API

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

MIT © [Ben Evans](http://bensbit.co.uk)

