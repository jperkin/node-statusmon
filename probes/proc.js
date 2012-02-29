/*
 * Process statistics
 */

var exec = require('child_process').exec;

function get_proc_count(callback)
{
  switch (process.platform) {
  case 'linux':
    exec('ps -eo pid,nlwp', function (err, stdout, stderr) {
      var ret = {
        'proc.count.procs': 0,
        'proc.count.threads': 0,
        'proc.count.threadedprocs': 0,
      };
      stdout.split('\n').forEach(function (line) {
        line = line.replace(/^\s+/, '');
        var vals = line.split(/\s+/);
        if (vals[0].match(/\d+/)) {
          var lwps = parseInt(vals[1]);
          ret['proc.count.procs'] += 1;
          ret['proc.count.threads'] += lwps;
          if (lwps > 1) {
            ret['proc.count.threadedprocs'] += 1;
          }
        }
      }, ret);
      callback(ret);
    });
    break;
  }
}

function get_proc_state(callback)
{
  switch (process.platform) {
  case 'linux':
    exec('ps -eo s', function (err, stdout, stderr) {
      var map = {
        'D': 'iowait',
        'R': 'run',
        'S': 'sleep',
        'T': 'stopped',
        'W': 'paging',
        'X': 'dead',
        'Z': 'zombie',
      }
      var ret = {
        'proc.state.iowait': 0,
        'proc.state.run': 0,
        'proc.state.sleep': 0,
        'proc.state.stopped': 0,
        'proc.state.paging': 0,
        'proc.state.dead': 0,
        'proc.state.zombie': 0,
      };
      stdout.split('\n').forEach(function (state) {
        if (state in map) {
          ret["proc.state." + map[state]] += 1;
        }
      }, ret);
      callback(ret);
    });
    break;
  }
}

module.exports.probes = {
  'proc.count': get_proc_count,
  'proc.state': get_proc_state,
}
