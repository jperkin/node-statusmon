var config = {}

// This both configures which pollers to run, and their frequency.
config.pollers = [
  ["system.uptime",         "300"],
  [/.*/,                     "60"],
]

// Possible options: ["rrd-simple", "graphite"]
config.output_format = "rrd-simple"; //"graphite";

module.exports = config;
