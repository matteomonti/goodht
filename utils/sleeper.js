module.exports = function()
{
  // Self

  var self = this;

  // Members

  var handle;
  var timeout;

  // Methods

  self.sleep = function(milliseconds)
  {
    return new Promise(function(resolve)
    {
      handle = resolve;
      timeout = setTimeout(function()
      {
        handle = undefined;
        resolve();
      }, milliseconds);
    });
  };

  self.wake = function()
  {
    clearTimeout(timeout);

    if(handle)
    {
      var chandle = handle;
      handle = undefined;

      chandle();
    }
  };
};
