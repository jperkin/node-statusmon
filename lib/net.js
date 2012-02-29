/*
 * Network statistics
 */

var exec = require('child_process').exec;

function get_netstat(callback)
{
  switch (process.platform) {
  case 'linux':
    exec('netstat -ant', function (err, stdout, stderr) {
      var ret = {};
      stdout.split('\n').forEach(function (line) {
        var vals = line.split(/\s+/);
        if (vals[0].match(/^tcp/)) {
          var key = ['net.state', vals[0], vals[5].toLowerCase()].join(".");
          if (!ret[key]) {
            ret[key] = 1;
          } else {
            ret[key] += 1;
          }
        }
      }, ret);
      callback(ret);
    });
    break;
  }
}

module.exports.probes = {
  'net.state': get_netstat,
}
