var express = require('express');
var router = express.Router();
var async = require('async');
var Xray = require('x-ray');
var x = Xray();
var moment = require('moment');
var db = require('../db');

function getMonthlyAverages(callback) {
  db.connect(function() {
    db.get().collection('aqiHourlyData').aggregate([
      {
        "$match": {
          "createdAt": {
            // 30 days ago
            $gte: new Date(new Date().setDate(new Date().getDate() - 30))
          }
        }
      }, {
        "$group": {
          "_id": null,
          "macao": {
            "$avg": "$data.macao"
          },
          "manila": {
            "$avg": "$data.manila"
          },
          "bangkok": {
            "$avg": "$data.bangkok"
          },
          "delhi": {
            "$avg": "$data.delhi"
          },
          "hanoi": {
            "$avg": "$data.hanoi"
          },
          "seoul": {
            "$avg": "$data.seoul"
          },
          "tokyo": {
            "$avg": "$data.tokyo"
          },
          "beijing": {
            "$avg": "$data.beijing"
          },
          "shanghai": {
            "$avg": "$data.shanghai"
          },
          "beijing": {
            "$avg": "$data.beijing"
          },
          "mumbai": {
            "$avg": "$data.mumbai"
          },
          "pune": {
            "$avg": "$data.pune"
          }
        }
      }
    ], function(err, result) {
      if (err)
        console.log(err);

      // clean results
      if(result[0]) delete result[0]._id

      callback(result[0]);
    });
  });
}

function getHourlyData(callback) {
  var now = new Date();

  db.connect(function() {
    db.get().collection('aqiHourlyData').find({
      date: now.toDateString(),
      hour: now.getHours()
    }).toArray(function(err, items) {
      if (err)
        console.log(err);

      // clean results
      if(items[0]) delete items[0]._id
      callback(items[0]);
    });
  });
}

function saveHourlyData(data, callback) {
  var now = new Date();

  var doc = {
    createdAt: now,
    date: now.toDateString(),
    hour: now.getHours(),
    data: data
  }

  db.connect(function() {
    db.get().collection('aqiHourlyData').save(doc, function(err, res) {
        if (err) console.log(err);

        callback();
      }
    );
  });
}

// --- AQI DATA functionality ---
function scrapeAQIData(url, callback) {
  var aqiData = {
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

  async.each(Object.keys(aqiData), function(city, cb) {
    x(url + city, {
      aqi: '#aqiwgtvalue@html',
      condition: '#aqiwgtinfo@html'
    })(function(err, obj) {
      if(err) console.log(err);
      aqiData[city] = obj;

      // // fix for dehli url prop naming
      // if (city === 'delhi') {
      //   data.new_delhi = obj;
      //   data.new_delhi.avg = avgs.new_delhi;
      //   delete data[city];
      // }

      cb();
    });
  }, function(err) {
    if(err) console.log(err);
    callback(err, aqiData);
  });
}

function handleGetData(callback) {
  getHourlyData(function(data) {
    if(data) {
      return callback(data.data);
    }

    scrapeAQIData('http://aqicn.org/city/', function(err, aqiData) {
      saveHourlyData(aqiData, function() {
        callback(aqiData);
      });
    });
  });
}

/* GET map data. */
router.get('/data', function(req, res, next) {
  handleGetData(function(aqiData) {
    var fullRes;

    // clone the object as we want to rename delhi property
    var fixedData = JSON.parse(JSON.stringify(aqiData));
    fixedData.new_delhi = aqiData.delhi;
    delete fixedData.delhi;

    getMonthlyAverages(function(avgs) {
      // attach monthly averages
      if(avgs) {
        avgs.new_delhi = avgs.delhi;
        Object.keys(avgs).forEach(function(city){
          if(avgs[city]) fixedData[city].avg = avgs[city];
        });
      }

      fullRes = {
        data: fixedData,
        lastUpdated: 'AQI Data updated ' + moment().startOf('hour').fromNow() + ' from <a href="http://aqicn.org">aqicn.org</a>'
      };

      res.send(fullRes);
    });
  });
});

module.exports = router;
