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
  case 'sunos':
    exec('mpstat 1 2', function (err, stdout, stderr) {
      var seen = 0;
      stdout.replace(/\n$/, '').split('\n').forEach(function (line) {
        var vals = line.split(/\s+/);
        if (!vals[1].match(/\d+/)) {
          return;
        }
        if (vals[1] == '0') {
          seen += 1;
        }
        if (seen != 2) {
          return;
        }
        var ret = {};
        ret['cpu.utilization.cpu' + vals[1] + '.minorfaults'] = vals[2];
        ret['cpu.utilization.cpu' + vals[1] + '.majorfaults'] = vals[3];
        ret['cpu.utilization.cpu' + vals[1] + '.crosscalls'] = vals[4];
        ret['cpu.utilization.cpu' + vals[1] + '.interrupts'] = vals[5];
        ret['cpu.utilization.cpu' + vals[1] + '.threadinterrupts'] = vals[6];
        ret['cpu.utilization.cpu' + vals[1] + '.contextswitches'] = vals[7];
        ret['cpu.utilization.cpu' + vals[1] + '.involuntarycontextswitches'] = vals[8];
        ret['cpu.utilization.cpu' + vals[1] + '.threadmigrations'] = vals[9];
        ret['cpu.utilization.cpu' + vals[1] + '.mutexspins'] = vals[10];
        ret['cpu.utilization.cpu' + vals[1] + '.lockspins'] = vals[11];
        ret['cpu.utilization.cpu' + vals[1] + '.syscalls'] = vals[12];
        ret['cpu.utilization.cpu' + vals[1] + '.user'] = vals[13];
        ret['cpu.utilization.cpu' + vals[1] + '.system'] = vals[14];
        ret['cpu.utilization.cpu' + vals[1] + '.iowait'] = vals[15];
        ret['cpu.utilization.cpu' + vals[1] + '.idle'] = vals[16];
        callback(ret);
      });
    });
    break;
  }
}

module.exports.probes = {
  'cpu.utilization': get_cpu_utilization,
}
