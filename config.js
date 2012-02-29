var config = {}

// This both configures which probes to run, and their frequency.
config.probes = [
  ["system.uptime",         "300"],
  [/.*/,                     "60"],
]

// Possible options: ["rrd-simple", "graphite"]
config.output_format = "rrd-simple"; //"graphite";

module.exports = config;
