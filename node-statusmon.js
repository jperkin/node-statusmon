#!/usr/bin/env node

var fs = require('fs');
var os = require('os');

var config = require('./config');

var probes = {};

function load_module(path)
{
  var mod = require(path);

  for (var m in mod.probes) {
    if (m in probes) {
      console.log('WARNING: ' + path + ' attempting to override ' + m + ', ignoring');
    } else {
      probes[m] = mod.probes[m];
    }
  }
}

fs.readdirSync('./probes').forEach(function(file) {
  if (file.match(/\.js$/)) {
    load_module('./probes/' + file);
  }
});

/*
 * The callback function applied to each probe, its responsibility is to
 * return the results back to the appropriate collection system.
 */
function update_stats(data)
{
  var timenow = parseInt(new Date().getTime() / 1000);
  for (var v in data) {
    switch (config.output_format) {
    case 'graphite':
      console.log([[os.hostname(), v].join('.'), data[v], timenow].join(' '));
      break;
    case 'rrd-simple':
      /*
       * rrd-simple doesn't support sub-minute granularity, and RRD is
       * notoriously bad at being able to sample accurate data, so we round to
       * the nearest minute.
       */
      var off = timenow % 60;
      timenow = (off <= 30) ? timenow - off : timenow + (60 - off);
      /*
       * POST data
       */
      var data = [[timenow, v].join('.'), data[v]].join(' ');
      var http = require('http');
      var opts = {
        host: config.rrdsimple.host,
        port: config.rrdsimple.port,
        path: config.rrdsimple.path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': data.length
        }
      }
      console.log('[' + new Date().toISOString() + '] ' +
                  [timenow, v].join('.') + ' -> ' + opts['host']);
      var req = http.request(opts, function (res) {
        // We currently fire-and-forget..
      }).write(data);
      break;
    }
  }
}

/*
 * Perform an initial probe, then repeat with the interval specified.
 */
function start_probe(func, interval)
{
  func(update_stats);
  setInterval(function() {
    func(update_stats);
  }, interval * 1000);
}

var registered = [];

config.probes.forEach(function(probe) {

  var probename = probe[0];
  var probeint = probe[1];

  if (typeof(probename) === 'string' && probename in probes) {
    if (registered.indexOf(probename) !== -1) {
      return;
    }
    registered.push(probename);
    start_probe(probes[probename], probeint);
    return;
  } 
  else if (probename instanceof RegExp) {
    for (var c in probes) {
      if (registered.indexOf(c.toString()) !== -1) {
        continue;
      }
      if (c.toString().match(probename)) {
        registered.push(c.toString());
        start_probe(probes[c], probeint);
      }
    }
  }
});
