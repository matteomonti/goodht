const upnp = require('./nat/upnp.js');

var my_upnp = new upnp('tcp', 1234);
my_upnp.serve();
