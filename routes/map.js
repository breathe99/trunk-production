var express = require('express');
var async = require('async');
var Xray = require('x-ray');
var router = express.Router();
var x = Xray();
var lastFetch = 0;

var site = 'http://aqicn.org/city/';
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

var d2 = {};

function updateAQIData(url, callback) {
  async.each(Object.keys(data), function(city, callback) {
    // x(url + city, '#aqiwgtvalue@html')(function(err, aqi) {
    //   console.log(aqi);
    //   data[city] = aqi;
    //
    //   callback();
    // });
    x(url + city, {
      aqi: '#aqiwgtvalue@html',
      condition: '#aqiwgtinfo@html'
    }
    )(function(err, obj) {
      data[city] = obj;

      callback();
    });
  }, function(err) {
    callback(err);
  });
}

function getAQIData(callback) {
  // fetch new data every hour
  if (Date.now() - lastFetch > 3600000) {
    console.log('new fetch');
    updateAQIData(site, function(err) {
      lastFetch = Date.now();
      callback();
    });
  } else {
    callback();
  }
}

/* GET map data. */
router.get('/data', function(req, res, next) {
  getAQIData(function(err) {
    if (err) {
      console.log(err);
    }

    res.send(data);
  })
});

module.exports = router;