/*
 * CPU statistics
 */

var exec = require('child_process').exec;

/*
 * Unfortunately the majority of systems are en_US based, so we go with
 * the wrong spelling of 'utilisation' for the least hassle ;)
 */
function get_cpu_utilization(callback)
{
  switch (process.platform) {
  case 'linux':
    exec('mpstat -u -P ALL 1 1', function (err, stdout, stderr) {
      stdout.split('\n\n')[1].split('\n').forEach(function (line) {
        var ret = {};
        var vals = line.split(/\s+/);
        if (!vals[1].match(/\d+/)) {
          return;
        }
        ret['cpu.utilization.cpu' + vals[1] + '.user'] = vals[2];
        ret['cpu.utilization.cpu' + vals[1] + '.system'] = vals[4];
        ret['cpu.utilization.cpu' + vals[1] + '.iowait'] = vals[5];
        ret['cpu.utilization.cpu' + vals[1] + '.idle'] = vals[10];
        callback(ret);
      });
    });
    break;
  }
}

module.exports.probes = {
  'cpu.utilization': get_cpu_utilization,
}
