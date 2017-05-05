const dns = require('native-dns');
const ipint = require('ip-to-int');

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

  // Members

  var domains = {window: 'window.' + root};

  var server = dns.createServer();
  var window = 0;

  // Methods

  self.serve = function(port)
  {
    server.on('request', function(request, response)
    {
      for(var i = 0; i < request.question.length; i++)
        if(request.question[i].name == domains.window)
        {
          response.answer.push(dns.A({
            name: domains.window,
            address: ipint(window).toIP(),
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
  };
};
