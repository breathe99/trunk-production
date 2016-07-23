var express = require('express');
var osmosis = require('osmosis');
var router = express.Router();

var url = 'http://aqicn.org/city/';
var data = {
  beijing: -1,
  shanghai: -1,
  hongkong: -1,
  bangkok: -1,
  delhi: -1,
  mumbai: -1,
  tokyo: -1,
  seoul: -1,
  manila: -1,
  guangzhou: -1
};

function getAPIData(url, data) {
  osmosis
  .get(url)
  .find('#xatzcaqv')
  .set('data')
  .data(function(listing) {
    console.log(listing);
    return 'done!';
  })
  .log(console.log)
  .error(console.log)
  .debug(console.log);
}

/* GET map data. */
router.get('/data', function (req, res, next) {
  res.send(getAPIData(url, data));
});

module.exports = router;
