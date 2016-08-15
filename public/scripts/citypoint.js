'use strict';

function toDisplayName(propName) {
  return propName.replace('_',' ').replace(/\b[a-z]/g,function(f){return f.toUpperCase();});
}

function CityPoint(city, country, element, data) {
  this._city = toDisplayName(city);
  this._country = toDisplayName(country);
  this._element = element;
  this._data = data;
}

CityPoint.prototype.getCity = function() {
  return this._city;
};

CityPoint.prototype.getCountry = function() {
  return this._country;
};

CityPoint.prototype.getElement = function() {
  return this._element;
};

CityPoint.prototype.getData = function() {
  return this._data;
};

CityPoint.prototype.setData = function(data) {
  this._data = data;
};

module.exports = CityPoint;
