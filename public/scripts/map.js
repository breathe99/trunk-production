// Update card/map with data
function initMapSection(aqiData) {
  
}

// Get the latest map data on page load
function getAQIData (callback) {
  $.ajax({
    url: '/map/data',
    dataType: 'JSON',
    type: 'GET',
    async: true,
    success: callback(data),
    error: function (response) {
      var r = jQuery.parseJSON(response.responseText);
      console.log("Message: " + r.Message);
      console.log("StackTrace: " + r.StackTrace);
      console.log("ExceptionType: " + r.ExceptionType);
    }
  });
}

exports.getAQIData = getAQIData;
