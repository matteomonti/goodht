const sleeper = require('./utils/sleeper.js');

var my_sleeper = new sleeper();

(async function()
{
  console.log('Start');
  await my_sleeper.sleep(5000);
  console.log('End');
})();

setTimeout(my_sleeper.wake, 1000);
