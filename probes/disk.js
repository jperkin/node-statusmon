/*
 * Disk statistics
 */

var exec = require('child_process').exec;

function get_disk_io(callback)
{
  switch (process.platform) {
  case 'linux':
    var ret = {};
    exec('iostat -dx 1 2', function (err, stdout, stderr) {
      stdout.split('\n\n')[2].split('\n').forEach(function (line) {
        if (line.match(/^Device/))
          return;
        var vals = line.split(/\s+/);
        ret['disk.io.' + vals[0] + '.read.reqpersec'] = vals[3];
        ret['disk.io.' + vals[0] + '.write.reqpersec'] = vals[4];
        ret['disk.io.' + vals[0] + '.read.kbpersec'] = vals[5];
        ret['disk.io.' + vals[0] + '.write.kbpersec'] = vals[6];
        ret['disk.io.' + vals[0] + '.read.avgwait'] = vals[10];
        ret['disk.io.' + vals[0] + '.write.avgwait'] = vals[11];
        ret['disk.io.' + vals[0] + '.utilization'] = vals[13];
      }, ret);
      callback(ret);
    });
    break;
  }
}

function get_disk_temperature(callback)
{
  switch (process.platform) {
  case 'linux':
    var ret = {};
    exec('hddtemp -wq -u C /dev/hd? /dev/sd?', function (err, stdout, stderr) {
      stdout.split('\n').forEach(function (line) {
        if (!line)
          return;
        var vals = line.replace(/.dev.(.d.):.*: (\d+).*/, "$1 $2").split(/\s+/);
        ret['disk.temperature.' + vals[0]] = vals[1];
      }, ret);
      callback(ret);
    });
    break;
  }
}

module.exports.probes = {
  'disk.io':          get_disk_io,
  'disk.temperature': get_disk_temperature,
}
