'use strict';

var map = require('./map');

$(document).ready(function () {
  map.initMapSection();

  // Mobile menu
  var mobile = $('.navbar__mobile');
  var hamburger = $('.ham');
  var close = $('.close');

  hamburger.click(function() {
    mobile.toggleClass('open');
  });
  close.click(function() {
    mobile.toggleClass('open');
  });
});
