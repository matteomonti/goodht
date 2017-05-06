const dns = require('./dns/dns.js');

(async function()
{
  my_dns = new dns();
  console.log(await my_dns.window());
})();
