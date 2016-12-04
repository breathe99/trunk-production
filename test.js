var express = require('express');
var async = require('async');
var Xray = require('x-ray');
var moment = require('moment');
var router = express.Router();
var x = Xray();
var db = require('../db');
var site = 'http://aqicn.org/city/';

function genFakeData() {
  var now = new Date();
  var res = [];
  for (var i = 1; i <= 2; i++) {
    for (var j = 0; j < 31; j++) {
      for (var k = 0; k < 24; k++) {
        var currDateTs = new Date().setDate(now.getDate() - i * j);
        var currDate = new Date(currDateTs);
        currDate.setHours(k);
        var curr = {
          fakeRawDate: currDate,
          date: currDate.toDateString(),
          hour: currDate.getHours(),
          aqi: {}
        };
        Object.keys(data).forEach(function(city) {
          curr.aqi[city] = Math.random() * 400;
        });

        res.push(curr);
      }
    }
  }

  return res;
}

router.get('/test/genData', function(req, res, next) {
  var fake = genFakeData();

  db.connect(function() {
    db.get().collection('aqiHourlyData').insert(fake, function(err, res) {
      if (err)
        console.log(err);
      }
    );
  });

  res.send(fake);
});

router.get('/test/getAvgs', function(req, res, next) {
  getMonthlyAverages(function(avgs) {
    res.send(avgs);
  });
});
