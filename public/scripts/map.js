'use strict';

var CityPoint = require('./citypoint');

// module vars, elements
var cityPoints = [];
var selectedCityPoint;
var mapSvg = document.getElementById('pollution-map');
var cityPointsContainer = document.getElementById('city-points');
var card = document.getElementById('map-card');
var cardTitle = card.getElementsByClassName('card-title')[0];
var cardCountry = card.getElementsByClassName('card-sub')[0];
var cardFlag = card.getElementsByClassName('flag')[0];
var cardAqi = card.getElementsByClassName('card-aqi')[0];
var cardCondition = card.getElementsByClassName('map__card__footer__text card-current-cond__text')[0];
var CardAqiAvg = card.querySelector('.card-avg > span.map__card__footer__text');

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

function handleClicked(cityPoint) {
  var outline;

  // update card info
  cardTitle.innerHTML = cityPoint.getCity();
  cardCountry.innerHTML = cityPoint.getCountry();
  cardFlag.style.backgroundImage = formatFlagUrl(cityPoint.getCountry());
  cardAqi.innerHTML = cityPoint.getData().aqi;
  cardCondition.innerHTML = cityPoint.getData().condition ?
    formatCondition(cityPoint.getData().condition) : '??';
  // TODO: add aqi avging
  CardAqiAvg.innerHTML = cityPoint.getData().aqi;

  if (selectedCityPoint) {
    selectedCityPoint.getElement().classList.add('city-point');
    selectedCityPoint.getElement().classList.remove('selected-point');
    $('.point-outline').remove();
  }

  selectedCityPoint = cityPoint;

  // add outline to DOM
  outline = selectedCityPoint.getElement().cloneNode();
  outline.classList.add('point-outline');
  outline.classList.remove('city-point');
  cityPointsContainer.appendChild(outline);

  // apply selected point styling
  selectedCityPoint.getElement().classList.remove('city-point');
  selectedCityPoint.getElement().classList.add('selected-point');

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

  // click(point) => clicked(point)
  ele.addEventListener('click', function (e) {
    e.stopPropagation();
    handleClicked(cityPoint);
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
  handleClicked(cityPoints[2]);
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
