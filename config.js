var config = {}

// This both configures which probes to run, and their frequency.
config.probes = [
  ['system.uptime',         '300'],
  [/.*/,                     '60'],
]

// Possible options: ['rrd-simple', 'graphite']
config.output_format = 'rrd-simple';

config.rrdsimple = {};
config.rrdsimple.host = 'rrd.me.uk';
config.rrdsimple.port = 80;
config.rrdsimple.path = '/cgi-bin/rrd-server.cgi'

module.exports = config;
