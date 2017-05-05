const dns = require('dns');

module.exports = function(root)
{
  // Self

  var self = this;

  // Members

  root = root || 'goo.rain.vg';
  var domains = {root: root, count: 'count.' + root};

  // Methods

  self.count = function()
  {
    return new Promise(function(resolve, reject)
    {
      dns.lookup(domains.count, function(error, address, family)
      {
        console.log('Error:', error);
        console.log('Address:', address);
        console.log('Family:', family);
      });
    });
  };
};
