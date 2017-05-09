const bdht = require('bittorrent-dht');
const dns = require('native-dns');
const ipint = require('ip-to-int');
const crypto = require('crypto');
const sleep = require('../utils/sleep.js');

module.exports = function(root, settings)
{
  // Self

  var self = this;

  // Settings

  settings = settings || {};
  settings.ttl = settings.ttl || 60; // Increase this to several minutes.

  settings.announce = settings.announce || {};
  settings.announce.min = settings.announce.min || 4;
  settings.announce.max = settings.announce.max || 16;

  settings.trials = settings.trials || 8;
  settings.interval = settings.interval || 15000;
  settings.patience = settings.patience || 5000;

  // Members

  var domains = {window: 'window.' + root};

  var dht = new bdht();
  var server = dns.createServer();
  var window = 0;

  // Methods

  self.serve = function(port)
  {
    dht.listen(20000, function()
    {
      console.log('Connected to dht.');
    });

    server.on('request', function(request, response)
    {
      for(var i = 0; i < request.question.length; i++)
        if(request.question[i].name == domains.window)
        {
          response.answer.push(dns.A({
            name: domains.window,
            address: ipint(window.toString()).toIP(),
            ttl: settings.ttl
          }));

          break;
        }

      response.send();
    });

    server.on('error', function(error, buffer, request, response)
    {
      console.log(error.stack);
    });

    server.serve(port);
    watch();
  };

  // Private methods

  var query = function(slot)
  {
    return new Promise(function(resolve, reject)
    {
      var uri = `goo://${domains.root}/slot/${slot.toString()}`;
      var infohash = crypto.createHash('sha1').update(uri).digest('hex');
      console.log('Querying', infohash);
      
      var peers = {};

      var finalize = function()
      {
        dht.removeAllListeners('peer');

        var response = [];

        for(var host in peers)
          response.push(peers[host]);

        resolve(response);
      };

      var ftimeout;

      var reset = function()
      {
        if(ftimeout)
          clearTimeout(ftimeout);

        ftimeout = setTimeout(finalize, settings.patience);
      };

      dht.on('peer', function (peer, reshash, from)
      {
        if(reshash.toString('hex') == infohash)
        {
          reset();
          var host = `${peer.host}:${peer.port.toString()}`;

          if(!(host in peers))
            peers[host] = peer;
        }
      });

      reset();
      dht.lookup(infohash);
    });
  };

  var watch = async function()
  {
    var history = [];

    while(true)
    {
      var slot = Math.floor(Math.random() * (2 ** window));

      console.log('Querying slot', slot, 'with window', window);
      var peers = await query(slot);
      console.log(peers.length, 'peers found');

      history.push(peers.length);
      if(history.length > settings.trials)
        history.shift();

      if(history.length == settings.trials)
      {
        var up = true;
        var down = true;

        for(var i = 0; i < history.length; i++)
        {
          if(history[i] <= settings.announce.max)
            up = false;

          if(history[i] >= settings.announce.min)
            down = false;
        }

        if(up)
        {
          window++;
          history = [];
        }

        if(down && window > 0)
        {
          window--;
          history = [];
        }
      }

      await sleep(settings.interval);
    }
  };
};
