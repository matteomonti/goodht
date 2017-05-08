const ip = require('ip');
const request = require('request');

module.exports = function(address)
{
  return new Promise(function(resolve, reject)
  {
    var options = {};

    if(address)
      options.localAddress = address;

    address = ip.address();
    
    request.get('http://api.ipify.org', options, function(error, response, body)
    {
      if(error)
        return reject(error);

      return resolve(body == address);
    });
  });
};
