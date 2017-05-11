const ed = require('ed25519-supercop')
const dgram = require('dgram');
const ddht = require('../dht/dht.js');
const npublic = require('../nat/public.js');
const nupnp = require('../nat/upnp.js');
const sleep = require('../utils/sleep.js');
const usleeper = require('../utils/sleeper.js');

module.exports = function(options)
{
  // Self

  var self = this;

  // Options

  options = options || {};

  if(!(options.public && options.private))
  {
    var keypair = ed.createKeyPair(ed.createSeed());
    options.public = keypair.publicKey;
    options.private = keypair.secretKey;
  }

  // Members

  var status = undefined;
  var socket = dgram.createSocket('udp4');

  var bindoptions = {};

  if(options.address)
    bindoptions.address = options.address;

  if(options.port)
    bindoptions.port = options.port;

  socket.bind(bindoptions, function()
  {
    setup();
  });

  var sleeper = new usleeper();
  var upnp;
  var dht;

  // Getters

  self.public = function()
  {
    return options.public;
  };

  self.private = function()
  {
    return options.private;
  };

  self.address = function()
  {
    return options.address;
  };

  self.port = function()
  {
    return options.port;
  };

  // Private methods

  var setup = async function()
  {
    console.log('Setting up');
    options.address = socket.address().address;
    options.port = socket.address().port;

    var dhtoptions = {address: options.address};

    if(options.root)
      dhtoptions.root = options.root;

    dhtoptions.public = options.public;
    dhtoptions.private = options.private;

    dht = new ddht();

    if(await npublic(options.address == '0.0.0.0' ? undefined : options.address))
      open();
    else
    {
      upnp = new nupnp('udp', options.port, options.public.toString('hex').substring(0, 8));

      upnp.on('online', open);
      upnp.on('offline', closed);
      upnp.serve();
    }
  };

  var open = function()
  {
    var start = (!status);
    status = 'open';

    if(start)
      serve();
    else
      sleeper.wake();
  };

  var closed = function()
  {
    var start = (!status);
    status = 'closed';

    if(start)
      serve();
    else
      sleeper.wake();
  };

  var serve = async function()
  {
    while(true)
    {
      if(status == 'open')
      {
        await dht.announce(options.port);
        console.log('Announced!');
      }
      else
      {
        console.log('Fuck my life');
      }

      await sleeper.sleep(300000);
    }
  };
};
