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
        console.log(request.question[i].name);
    });

    server.serve(port);
  };


};
