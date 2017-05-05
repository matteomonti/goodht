const dns = require('native-dns');

module.exports = function(root)
{
  // Self

  var self = this;

  // Members

  var domains = {count: 'count.' + root};

  var server = dns.createServer();
  var count = 0;

  // Methods

  self.serve = function(port)
  {
    server.on('request', function(request, response)
    {
      for(var i = 0; i < request.question.length; i++)
        if(request.question[i].name == domains.count)
        {
          response.answer.push(dns.A({
            name: domains.count,
            address: inttoip(count),
            ttl: 60
          }));
        }

      response.send();
    });

    server.on('error', function(error, buffer, request, response)
    {
      console.log(error.stack);
    });

    server.serve(port);
  };

  // Private methods

  var inttoip = function(value)
  {
    return [(value >> 24) & 0xff, (value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff].join('.');
  };
};
