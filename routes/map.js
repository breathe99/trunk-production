var express = require('express');
var async = require('async');
var Xray = require('x-ray');
var moment = require('moment');
var router = express.Router();
var x = Xray();
var lastFetch = 0;

var site = 'http://aqicn.org/city/';
var data = {
  macao: -1,
  manila: -1,
  bangkok: -1,
  delhi: -1,
  hanoi: -1,
  seoul: -1,
  tokyo: -1,
  beijing: -1,
  shanghai: -1,
  mumbai: -1,
  // karachi: -1,
  pune: -1
};

function updateAQIData(url, callback) {
  async.each(Object.keys(data), function(city, cb) {
    x(url + city, {
      aqi: '#aqiwgtvalue@html',
      condition: '#aqiwgtinfo@html'
    }
    )(function(err, obj) {
      data[city] = obj;

      // fix for dehli url prop naming
      if (city === 'delhi') {
        data.new_delhi = obj;
        delete data[city];
      }

      cb();
    });
  }, function(err) {
    callback(err, data);
  });
}

function getAQIData(callback) {
  // fetch new data every hour
  if (Date.now() - lastFetch > 3600000) {
    console.log('new fetch');
    updateAQIData(site, function(err, aqiData) {
      lastFetch = Date.now();
      callback(err, aqiData);
    });
  } else {
    callback(null, data);
  }
}

/* GET map data. */
router.get('/data', function(req, res, next) {
  getAQIData(function(err, aqiData) {
    var fullRes;

    if (err) {
      console.log(err);
    }

    fullRes = {
      data: aqiData,
      lastUpdated: 'AQI Data updated ' + moment(lastFetch).fromNow() + ' from <a href="http://aqicn.org">aqicn.org</a>'
    };

    res.send(fullRes);
  });
});

module.exports = router;
