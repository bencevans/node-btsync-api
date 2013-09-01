# btsync-api

[BitTorrent Sync](http://labs.bittorrent.com/experiments/sync.html) API Client

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
* 
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

