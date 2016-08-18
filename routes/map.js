var express = require('express');
var async = require('async');
var Xray = require('x-ray');
var moment = require('moment');
var router = express.Router();
var x = Xray();
var db = require('../db');
var lastFetch = 0;
var lastUpdatedAvgs = 0;
var site = 'http://aqicn.org/city/';

var numFetches = 0;
var dailyTotal = {
  macao: 0,
  manila: 0,
  bangkok: 0,
  delhi: 0,
  hanoi: 0,
  seoul: 0,
  tokyo: 0,
  beijing: 0,
  shanghai: 0,
  mumbai: 0,
  // karachi: 0,
  pune: 0
};

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

var avgs = {
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

// --- Monthly avg functionality ---
function getMonthlyAvg(city, callback) {
  var monthSum = 0;
  var entries = 0;

  db.connect(function() {
    db.get().collection('aqiAvgs').find({ city: city, 'date.month': (new Date()).getMonth() }, { value: 1, _id: 0 }).toArray(function(err, items) {
      if (err) console.log(err);

      for (var i = 0; i < items.length; i++) {
        console.log(items[i].value);
        monthSum += items[i].value;
        entries++;
      }

      callback(monthSum / entries);
    });
  });
}

function updateMonthlyAvgs(callback) {
  async.each(Object.keys(avgs), function(city, cb) {
    getMonthlyAvg(city, function(avg) {
      console.log(city + ': ' + avg);
      avgs[city] = avg;

      cb();
    });
  }, function(err) {
    callback(err, avgs);
  });
}

function getMonthlyAvgs(callback) {
  // haven't updated in the last day
  if (Date.now() - lastUpdatedAvgs > 86400000) {
    lastUpdatedAvgs = Date.now();
    updateMonthlyAvgs(callback);
  } else {
    callback();
  }
}

function saveDailyAvgs(callback) {
  var today = new Date();

  async.each(Object.keys(dailyTotal), function(city, cb) {
    var dailyAvg = {
      city: city,
      value: dailyTotal[city] / numFetches,
      date: {
        month: today.getMonth(),
        day: today.getDate()
      }
    };

    db.get().collection('aqiAvgs').save(dailyAvg, function(err, result) {
      if (err) console.log(err);

      cb();
    });
  }, function(err) {
    callback(err);
  });
}

// --- AQI DATA functionality ---
function updateAQIData(url, callback) {
  // first get monthly avgs, then scrape aqi data
  getMonthlyAvgs(function() {
    async.each(Object.keys(data), function(city, cb) {
      x(url + city, {
        aqi: '#aqiwgtvalue@html',
        condition: '#aqiwgtinfo@html'
      }
      )(function(err, obj) {
        data[city] = obj;
        data[city].avg = avgs[city];
        dailyTotal[city] += obj.aqi;

        // // fix for dehli url prop naming
        // if (city === 'delhi') {
        //   data.new_delhi = obj;
        //   data.new_delhi.avg = avgs.new_delhi;
        //   delete data[city];
        // }

        cb();
      });
    }, function(err) {
      numFetches++;
      callback(err, data);
    });
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

    // clone the object as we want to rename delhi property
    var fixedData = JSON.parse(JSON.stringify(aqiData));
    fixedData.new_delhi = aqiData.delhi;
    delete fixedData.delhi;

    fullRes = {
      data: fixedData,
      lastUpdated: 'AQI Data updated ' + moment(lastFetch).fromNow() + ' from <a href="http://aqicn.org">aqicn.org</a>'
    };

    res.send(fullRes);
  });
});

module.exports = router;
