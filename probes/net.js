/*
 * Network statistics
 */

var exec = require('child_process').exec;
var fs = require('fs');

function get_netstat(callback)
{
  switch (process.platform) {
  case 'linux':
    exec('netstat -ant', function (err, stdout, stderr) {
      var ret = {};
      stdout.split('\n').forEach(function (line) {
        var vals = line.split(/\s+/);
        if (vals[0].match(/^tcp/)) {
          var key = ['net.state', vals[0], vals[5].toLowerCase()].join('.');
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
  case 'sunos':
    exec('netstat -an -P tcp -f inet -f inet6', function (err, stdout, stderr) {
      var ret = {};
      stdout.split('\n').forEach(function (line) {
        if (line.match(/^TCP: IPv4/)) {
          proto = 'tcp';
          return;
        }
        if (line.match(/^TCP: IPv6/)) {
          proto = 'tcp6';
          return;
        }
        // Meh..
        if (line.match(/\d.*\d.*\d/)) {
          var vals = line.replace(/^\s+/, '').split(/\s+/);
          var key = ['net.state', proto, vals[6].toLowerCase()].join('.');
          if (!ret[key]) {
            ret[key] = 1;
          } else {
            ret[key] += 1;
          }
        }
      }, ret);
      callback(ret);
    });
  }
}

function get_net_traffic(callback)
{
  switch (process.platform) {
  case 'linux':
    var format = {
      'rx.bytes': 1,
      'rx.packets': 2,
      'tx.bytes': 9,
      'tx.packets': 10,
    }
    fs.readFile('/proc/net/dev', 'ascii', function (err, data) {
      var ret = {};
      data.split('\n').forEach(function (line) {
        line = line.replace(/^\s+/, '');
        var vals = line.split(/\s+/);
        if (vals[0].match(/:$/)) {
          var iface = vals[0].replace(/:$/, '');
          for (var f in format) {
            var key = ['net.traffic', iface, f].join('.');
            ret[key] = vals[format[f]];
          }
        }
      }, ret);
      callback(ret);
    });
    break;
  case 'sunos':
    var format = {
      'rx.bytes': 'rbytes64',
      'rx.packets': 'ipackets64',
      'tx.bytes': 'obytes64',
      'tx.packets': 'opackets64',
    }
    exec('kstat -c net -n mac', function (err, stdout, stderr) {
      var ret = {};
      var nic = '';
      stdout.split('\n').forEach(function (line) {
        var vals = line.replace(/^\s+/, '').replace(/\n$/, '').split(/\s+/);
        if (line.match(/^module/)) {
          nic = vals[1] + vals[3];
          return;
        }
        if (vals.length == 2) {
          for (var f in format) {
            if (vals[0] == format[f]) {
              var key = ['net.traffic', nic, f].join('.');
              ret[key] = vals[1];
            }
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
  'net.traffic': get_net_traffic,
}
