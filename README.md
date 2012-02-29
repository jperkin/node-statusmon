## About

node-statusmon is a monitoring framework, designed to run on clients and send
system information from a variety of probes to a collector/graphing system
such as rrd-simple or graphite.

node-statusmon effectively runs as a daemon, and each probe is configured with
its own `setInterval` frequency.  Thus you can run some probes which change
frequently at high frequency, e.g. for cpu utilisation, adsl noise margin etc.,
while running others which are much more stable at a much lower frequency, e.g.
uptime, logged-in users, etc.

## Status

Currently very bare-bones, general framework is in place, and modules can be
put into ./lib and automatically loaded.

A basic system provider, including cpu utilisation, load average, and uptime is
included.

## TODO

Lots!  At least get rrd-simple and graphite output formats fully functional,
and then start writing lots more probes.

My main aims are:

 - write lots of probes
 - ensure they are portable
 - learn me more javascript!
