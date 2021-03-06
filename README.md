## About

node-statusmon is a monitoring framework, designed to run on clients and send
system information from a variety of probes to a collector/graphing system
such as rrd-simple or graphite.

node-statusmon effectively runs as a daemon, and each probe is configured with
its own `setInterval` frequency.  Thus you can run some probes which change
frequently at high frequency, e.g. for cpu utilisation, adsl noise margin etc.,
while running others which are much more stable at a much lower frequency, e.g.
uptime, logged-in users, etc.

## Install

node-statusmon is now published on [npm](http://www.npmjs.org/) so it is super
easy to install and run:

```bash
npm install statusmon
statusmon
```

Or you can grab the latest from the repository:

```bash
git clone git://github.com/jperkin/node-statusmon.git
```

And then either run it directly:

```bash
cd node-statusmon
./statusmon.js
```

Or install it:

```bash
cd node-statusmon
npm link
statusmon
```

If you want a custom configuration, copy the default and pass it on the command
line as the first argument, for example:

```bash
statusmon customconfig.js
```

## How To Write Probes

Writing probes is hopefully very simple.  Here's an example from `system.js` to
get the current load average:

```javascript
var os = require('os');

/*
 * Probes take a callback argument of the function which updates the
 * statistics.  The callback takes an argument containing the key/value
 * pairs to store in the database.
 */
function get_loadavg(callback)
{
  var vals = os.loadavg();
  callback({
    'system.loadavg.1min': vals[0],
    'system.loadavg.5mins': vals[1],
    'system.loadavg.15mins': vals[2]
  });
}

/*
 * Export back each probe you want to register.
 */
module.exports.probes = {
  'system.loadavg': get_loadavg,
}
```

Dump that into a file in `probes/` and it will be automatically registered.

## Status

Currently very bare-bones, general framework is in place, and modules can be
put into `probes/` and automatically loaded.

A basic system provider, including cpu utilisation, load average, and uptime is
included.

## TODO

Lots!  At least get rrd-simple and graphite output formats fully functional,
and then start writing lots more probes.

My main aims are:

 - write lots of probes
 - ensure they are portable
 - learn me more javascript!
