var client = require('./')({
  port: 9999
});

client.on('ready', function() {
  client.call('getdir', { dir: '/home' }, function(err, osInfo) {
    console.log(err, osInfo);
  })
});

client.on('error', console.error);