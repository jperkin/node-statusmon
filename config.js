var config = {}

/*
 * Configure probes to run, and their frequency in seconds.
 *
 * Note that for RRD::Simple output you should match the frquency to the
 * step size of your RRD databases, else they will be filled with NaNs.
 */
config.probes = [
  ['system.uptime',         '300'],
  [/.*/,                     '60'],
]

/*
 * Possible output formats:
 *
 *   'console':     Dump to stdout
 *   'graphite':    Post to a graphite server
 *   'rrd-simple':  HTTP POST to an RRD::Simple server
 */
config.output_format = 'console';

/*
 * Options for RRD::Simple
 */
config.rrdsimple = {};
config.rrdsimple.host = 'rrd.me.uk';
config.rrdsimple.port = 80;
config.rrdsimple.path = '/cgi-bin/rrd-server.cgi'

module.exports = config;
