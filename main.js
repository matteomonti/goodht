const watcher = require('./dns/watcher.js');

var my_watcher = new watcher('goo.rain.vg');
my_watcher.serve(53);
