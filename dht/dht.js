const bdht = require('bittorrent-dht');
const crypto = require('crypto');
const ddns = require('../dns/dns.js');

module.exports = function(options)
{
  // Self

  var self = this;

  // Options

  options = options || {};
  options.root = options.root || 'goo.rain.vg';

  // Members

  var dht = new bdht();
  var dns = new ddns(options.root);

  if(options.address)
    dht.listen(address);
  else
    dht.listen();

  // Getters

  self.address = function()
  {
    return dht.address();
  };

  // Methods

  self.announce = function(port)
  {
    return new Promise(async function(resolve, reject)
    {
      var window = await dns.window();
      var slot = Math.floor(Math.random() * (2 ** window));
      var uri = `goo://${options.root}/slot/${slot}`;
      var infohash = crypto.createHash('sha1').update(uri).digest('hex');
      dht.announce(infohash, port, function(error)
      {
        if(error)
          return reject(error);

        return resolve();
      });
    });
  };
};
