/*
 * Miscellaneous system statistics
 */

var os = require('os');
var exec = require('child_process').exec;

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

function get_users(callback)
{
  exec('who', function (err, stdout, stderr) {
    var ret = {
      'system.users.total': 0,
      'system.users.unique': 0,
    };
    var seen = [];
    stdout.split('\n').forEach(function (line) {
      if (line === '')
        return;
      ret['system.users.total'] += 1;
      var user = line.split(/\s+/)[0];
      if (seen.indexOf(user) == -1) {
        seen.push(user);
        ret['system.users.unique'] += 1;
      }
    }, ret);
    callback(ret);
  });
}

module.exports.probes = {
  'system.loadavg': get_loadavg,
  'system.uptime': get_uptime,
  'system.users': get_users,
}
