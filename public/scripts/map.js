// module vars
var cityPoints = [];
var mapSvg = document.getElementById('pollution-map');
console.log(mapSvg);

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

function assignCityPointListeners(ele) {
  // hover(point) => highlight(li)
  ele.addEventListener('mouseover', function (e) {
    console.log('mouseover');
    this.classList.add('li-city-hover');
  }, false);

  ele.addEventListener('mouseout', function (e) {
    this.classList.remove('li-city-hover');
    console.log('mouseout');
  }, false);

  // hover(li) => highlight(point)
  ele.addEventListener('mouseover', function (e) {
    this.classList.add('hover');
  }, false);

  ele.addEventListener('mouseout', function (e) {
    this.classList.remove('hover');
  }, false);

  // click(point) => clicked(li, point)
  ele.addEventListener('click', function (e) {
    e.stopPropagation();
    // handleClicked(i);
  }, false);

  // click(li) => clicked(li, point)
  ele.addEventListener('click', function (e) {
    console.log('handling clicked');
    e.stopPropagation();
    // handleClicked(i);
  }, false);
}

function initCityPoints(resp) {
  var i;
  var ele;
  var cityPoint;
  var keys = Object.keys(resp);

  for (i = 0; i < keys.length; i++) {
    console.log(keys[i]);
    ele = mapSvg.querySelectorAll('[data-city=' + keys[i] + ']')[0];
    console.log(ele);
    cityPoint = new CityPoint(keys[i], ele, resp[keys[i]]);
    console.log(cityPoint);
    assignCityPointListeners(cityPoint.element);
    cityPoints.push(cityPoint);
  }
}

function toDisplayName(propName) {
  return propName.replace('_',' ').replace(/\b[a-z]/g,function(f){return f.toUpperCase();});
}

function CityPoint(name, element, data) {
  this.name = toDisplayName(name);
  this.element = element;
  this.aqi = data.aqi;
  this.condition = data.condition;
  this.updateData = function(data) {
    this.condition = data.condition;
    this.aqi = data.aqi;
  }
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
