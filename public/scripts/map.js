'use strict';

var CityPoint = require('./citypoint');

// module vars, elements
var cityPoints = [];
var mapSvg = document.getElementById('pollution-map');
var card = document.getElementById('map-card');
var card_title = card.getElementsByClassName('card-title')[0];
var card_country = card.getElementsByClassName('card-sub')[0];
var card_flag = card.getElementsByClassName('flag')[0];
var card_aqi = card.getElementsByClassName('card-aqi')[0];
var card_condition = card.getElementsByClassName('map__card__footer__text card-current-cond__text')[0];
var card_aqi_avg = card.querySelector('.card-avg > span.map__card__footer__text');

// Get the latest map data on page load
function getAQIData (callback) {
  $.ajax({
    url: '/map/data',
    dataType: 'JSON',
    type: 'GET',
    async: true,
    success: callback,
    error: function (response) {
      var r = jQuery.parseJSON(response.responseText);
      console.log("Message: " + r.Message);
      console.log("StackTrace: " + r.StackTrace);
      console.log("ExceptionType: " + r.ExceptionType);
    }
  });
}

function formatCondition(cond) {
  var result = cond;

  if (cond.includes('<div')) {
    result = cond.substring(cond.indexOf('>') + 1, cond.indexOf('<br>'));
  }

  return result;
}

function formatFlagUrl(country) {
  return 'url(/images/flags/' +
  country.replace(' ', '-').toLowerCase() + '.png)';
}

function handleClicked(ele, cityPoint) {
  // update card info
  card_title.innerHTML = cityPoint.getCity();
  card_country.innerHTML = cityPoint.getCountry();
  card_flag.style.backgroundImage = formatFlagUrl(cityPoint.getCountry());
  card_aqi.innerHTML = cityPoint.getData().aqi;
  card_condition.innerHTML = formatCondition(cityPoint.getData().condition);
  // TODO: add aqi avging
  card_aqi_avg.innerHTML = cityPoint.getData().aqi;

  // // switch city point that's 'pulsing'
  // points[selectedPointInd].classList.remove('pulsing');
  // points[selectedPointInd].style.r = 2.5;
  // cityPointTimelines[selectedPointInd].pause();
  // selectedPointInd = i;
  // points[selectedPointInd].classList.add('pulsing');
  // cityPointTimelines[selectedPointInd].play();
}

function assignCityPointListeners(cityPoint) {
  var ele = cityPoint.getElement();

  // hover(point) => highlight(point)
  ele.addEventListener('mouseover', function (e) {
    this.classList.add('mouseover');
    // console.log('mouseover');
  }, false);

  ele.addEventListener('mouseout', function (e) {
    this.classList.remove('mouseout');
    // console.log('mouseout');
  }, false);

  // click(point) => clicked(point)
  ele.addEventListener('click', function (e) {
    e.stopPropagation();
    handleClicked(ele, cityPoint);
  }, false);
}

function initCityPoints(resp) {
  var i;
  var ele;
  var cityPoint;
  var country;
  var keys = Object.keys(resp);

  for (i = 0; i < keys.length; i++) {
    ele = mapSvg.querySelectorAll('[data-city=' + keys[i] + ']')[0];
    country = ele.getAttribute('data-country');

    cityPoint = new CityPoint(keys[i], country, ele, resp[keys[i]]);
    assignCityPointListeners(cityPoint);
    cityPoints.push(cityPoint);
  }

  // init to bangkok
  handleClicked(null, cityPoints[2]);
}

// Update card/map with data
function initMapSection() {
  getAQIData(function(aqiData) {
    initCityPoints(aqiData);
    console.log(cityPoints);
  });
}

exports.getAQIData = getAQIData;
exports.initMapSection = initMapSection;
