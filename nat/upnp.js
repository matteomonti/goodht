const upnp = require('nat-upnp');
const util = require('util');
const events = require('events');
const sleep = require('../utils/sleep.js');

module.exports = function(protocol, port, identifier)
{
  // Self

  var self = this;

  // Inheritance

  events.EventEmitter.call(this);

  // Members

  var client = upnp.createClient();
  var description = identifier ? `Goo (${identifier})` : 'Goo';
  var public = 0;

  // Settings

  var settings = {ttl: 10};

  // Getters

  self.public = function()
  {
    return public;
  };

  self.serve = async function()
  {
    var interval = 1000;
    var online = undefined;

    while(true)
    {
      try
      {
        await clear();
        await map();

        interval = 1000;

        if(online != true)
        {
          online = true;
          // Fire event: online
        }
        while(true)
        {
          await sleep(settings.ttl * 30000);
          await refresh();
        }
      }
      catch(error)
      {
        if(online != false)
        {
          online = false;
          // Fire event: offline
        }
        
        console.log('Something failed. Sleeping for', interval);
        await sleep(interval);
        if(2 * interval < 600000)
          interval *= 2;
      }
    }
  };

  // Private methods

  var clear = function()
  {
    return new Promise(function(resolve, reject)
    {
      client.getMappings(function(error, results)
      {
        if(error)
          return reject(error);

        for(var i = 0; i < results.length; i++)
          if(results[i].description == description && results[i].protocol == protocol)
            return client.portUnmapping({public: results[i].public.port}, function(error)
            {
              if(error)
                return reject(error);

              resolve();
            });

        resolve();
      });
    });
  };

  var map = function()
  {
    return new Promise(function(resolve, reject)
    {
      client.getMappings(function(error, results)
      {
        if(error)
          return reject(error);

        var ports = [];

        for(var i = 0; i < results.length; i++)
          if(results[i].protocol == protocol)
            ports.push(results[i].public.port);

        while(true)
        {
          public = Math.floor(Math.random() * 31744) + 1024;
          if(ports.indexOf(public) == -1)
            break;
        }

        client.portMapping({public: public, private: port, ttl: 10, description: description}, function(error)
        {
          if(error)
            return reject(error);

          resolve();
        });
      });
    });
  };

  var refresh = function()
  {
    return new Promise(function(resolve, reject)
    {
      client.portMapping({public: public, private: port, ttl: settings.ttl, description: description}, function(error)
      {
        if(error)
          return reject(error);

        resolve();
      })
    });
  };
};

util.inherits(module.exports, events.EventEmitter);
