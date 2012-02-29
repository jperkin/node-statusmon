#!/usr/bin/env node

var fs = require('fs');
var os = require('os');

var config = require('./config');

var pollers = {};

function load_module(path)
{
  var mod = require(path);

  for (var m in mod.pollers) {
    if (m in pollers) {
      console.log("WARNING: " + path + " attempting to override " + m + ", ignoring");
    } else {
      pollers[m] = mod.pollers[m];
    }
  }
}

fs.readdirSync('./lib').forEach(function(file) {
  if (file.match(/\.js$/)) {
    load_module('./lib/' + file);
  }
});

/*
 * The callback function applied to each poller, its responsibility is to
 * return the results back to the appropriate collection system.
 */
function update_stats(data)
{
  var timenow = parseInt(new Date().getTime() / 1000);
  for (var v in data) {
    switch (config.output_format) {
    case 'graphite':
      console.log([[os.hostname(), v].join("."), data[v], timenow].join(" "));
      break;
    case 'rrd-simple':
      /*
       * rrd-simple doesn't support sub-minute granularity, and RRD is
       * notoriously bad at being able to sample accurate data, so we round to
       * the nearest minute.
       */
      var off = timenow % 60;
      timenow = (off <= 30) ? timenow - off : timenow + (60 - off);
      console.log([[timenow, v].join("."), data[v]].join(" "));
      break;
    }
  }
}

/*
 * Perform an initial poll, then repeat with the interval specified.
 */
function start_poller(func, interval)
{
  func(update_stats);
  setInterval(function() {
    func(update_stats);
  }, interval * 1000);
}

var registered = [];

config.pollers.forEach(function(poll) {

  var pollname = poll[0];
  var pollint = poll[1];

  if (typeof(pollname) === 'string' && pollname in pollers) {
    if (registered.indexOf(pollname) !== -1) {
      return;
    }
    registered.push(pollname);
    start_poller(pollers[pollname], pollint);
    return;
  } 
  else if (pollname instanceof RegExp) {
    for (var c in pollers) {
      if (registered.indexOf(c.toString()) !== -1) {
        continue;
      }
      if (c.toString().match(pollname)) {
        registered.push(c.toString());
        start_poller(pollers[c], pollint);
      }
    }
  }
});
