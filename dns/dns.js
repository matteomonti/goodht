const dns = require('dns');
const ipint = require('ip-to-int');

module.exports = function(root)
{
  // Self

  var self = this;

  // Members

  root = root || 'goo.rain.vg';
  var domains = {root: root, window: 'window.' + root};

  // Methods

  self.window = function()
  {
    return new Promise(function(resolve, reject)
    {
      dns.lookup(domains.window, function(error, address, family)
      {
        if(error)
          return reject(error);

        resolve(ipint(address).toInt());
      });
    });
  };
};
