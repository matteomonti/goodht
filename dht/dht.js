const bdht = require('bittorrent-dht');
const crypto = require('crypto');
const ed = require('ed25519-supercop');
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

  self.public = function()
  {
    return options.public;
  };

  self.private = function()
  {
    return options.private;
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
      console.log('Announcing on', infohash);

      dht.announce(infohash, port, function(error)
      {
        if(error)
          return reject(error);

        return resolve();
      });
    });
  };

  self.put = {
    open: function(address, port)
    {
      return new Promise(function(resolve, reject)
      {
        var value = Buffer.from(JSON.stringify({type: 'open', address: address, port: port}));
        
      });
    },
    closed: function()
    {

    }
  };
};
