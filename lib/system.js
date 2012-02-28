/*
 * Miscellaneous system statistics
 */

var os = require('os');
var exec = require('child_process').exec;

function get_mpstat(callback)
{
  switch (process.platform) {
  case 'linux':
    exec('mpstat -u -P ALL 1 1', function (err, stdout, stderr) {
      var capture = 0;
      stdout.split('\n').forEach(function (line) {
        var ret = {};
        if (line.length === 0) {
          capture = (capture) ? 0 : 1;
          return;
        }
        if (capture) {
          var vals = line.split(/\s+/);
          if (!vals[1].match(/\d+/)) {
            return;
          }
          ret['system.mpstat.cpu' + vals[1] + '.user'] = vals[2];
          ret['system.mpstat.cpu' + vals[1] + '.system'] = vals[4];
          ret['system.mpstat.cpu' + vals[1] + '.iowait'] = vals[5];
          ret['system.mpstat.cpu' + vals[1] + '.idle'] = vals[10];
          callback(ret);
        }
      });
    });
    break;
  }
}

function get_loadavg(callback)
{
  var vals = os.loadavg();
  callback({
    'system.loadavg.1min': vals[0],
    'system.loadavg.5mins': vals[1],
    'system.loadavg.15mins': vals[2]
  });
}

function get_uptime(callback)
{
  callback({
    'system.uptime': os.uptime()
  });
}

module.exports.pollers = {
  'system.mpstat': get_mpstat,
  'system.loadavg': get_loadavg,
  'system.uptime': get_uptime,
}
