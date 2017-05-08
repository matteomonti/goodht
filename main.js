const public = require('./nat/public.js');

(async function()
{
  console.log(await public());
})();
