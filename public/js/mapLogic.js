if (pinLocation==undefined){
  var pinLocation = 0;
}
var map;
var marker; // Declare marker at a higher scope
var circle;

function initMap() {
  // Check if userLocation is defined and has coordinates
  var defaultLat = 53.3498; // Fallback latitude
  var defaultLng = -6.2603; // Fallback longitude

  document.getElementById('lat').value = defaultLat;
  document.getElementById('lng').value = defaultLng;

  // First, check if pinLocation is defined and has coordinates
  if (pinLocation && pinLocation[0] && pinLocation[1]) {
    defaultLat = +pinLocation[0];
    defaultLng = +pinLocation[1];
    console.log(...pinLocation)
  } 
  // Then, fallback to userLocation if pinLocation doesn't exist
  else if (window.userLocation && userLocation.coordinates) {
    defaultLat = userLocation.coordinates[1]; // Latitude from userLocation
    defaultLng = userLocation.coordinates[0]; // Longitude from userLocation
  }

  updateAddressFromMarker(defaultLat, defaultLng);

  map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: defaultLat, lng: defaultLng },
    zoom: 14
  });

  marker = new google.maps.Marker({
    position: { lat: defaultLat, lng: defaultLng }, // Use userLocation for initial marker position
    map: map,
    draggable: true,
    title: 'My Location' // Optionally use the address as the marker title
  });

  // Initialize the circle with an initial radius
  var radiusValue = 0; // Default radius value

  var radiusSlider = document.getElementById('radiusSlider');
  radiusValue = parseFloat(radiusSlider.value) * 1000; // Convert to meters
  circle = new google.maps.Circle({
    strokeColor: "#FF0000",
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: "#FF0000",
    fillOpacity: 0.35,
    map: map,
    center: { lat: defaultLat, lng: defaultLng },
    radius: radiusValue

});

// Attach an event listener to the range input to update the circle radius
document.getElementById('radiusSlider').addEventListener('input', function () {
    circle.setRadius(parseFloat(this.value) * 1000); // Convert to meters
});

  // Add the 'dragend' listener inside initMap, after the marker has been created
  marker.addListener('dragend', function () {
    var lat = marker.getPosition().lat();
    var lng = marker.getPosition().lng();

    // Update the hidden fields for latitude and longitude
    document.getElementById('lat').value = lat;
    document.getElementById('lng').value = lng;

    // Call the function to update the address input with the new location
    updateAddressFromMarker(lat, lng);
    circle.setCenter({ lat: lat, lng: lng });
  });

  // Optionally, immediately update address display if userLocation has an address
  if (userLocation && userLocation.address) {
    document.getElementById('addressInput').value = userLocation.address;
    document.getElementById('address').value = userLocation.address;
    document.getElementById('markerAddressDisplay').innerText = userLocation.address;
  }

  // Example usage within initMap or after product data is fetched
  // make sure products is defined and not null before calling
  if (products) {
    createProductMarkers(products);
  }
  
}


function geocodeAddress() {
  var geocoder = new google.maps.Geocoder();
  var address = document.getElementById('addressInput').value;

  geocoder.geocode({ 'address': address }, function (results, status) {
    if (status === 'OK') {
      var location = results[0].geometry.location;
      map.setCenter(location);
      marker.setPosition(location); // Update marker position

      // Update the address display and hidden input fields using the geocoded location
      var lat = location.lat();
      var lng = location.lng();
      updateAddressFromMarker(lat, lng); // This will also update 'markerAddressDisplay'

      // Since 'updateAddressFromMarker' already sets the value of hidden inputs, 
      // you don't need to repeat it here unless you're handling errors differently
    } else {
      alert('Geocode was not successful for the following reason: ' + status);
    }
  });
}

function createProductMarkers(products) {

  products.forEach(function (product) {
    console.log(product, 'HERE');
    let productMarker = new google.maps.Marker({
      position: { lat: product.location.coordinates[1], lng: product.location.coordinates[0] },
      map: map,
      title: product.name
    });
  });
}


function updateAddressFromMarker(lat, lng) {
  var geocoder = new google.maps.Geocoder();
  var latlng = { lat: parseFloat(lat), lng: parseFloat(lng) };

  geocoder.geocode({ 'location': latlng }, function (results, status) {
      if (status === 'OK') {
          if (results[0]) {
              var address = results[0].formatted_address;
              document.getElementById('addressInput').value = address; // Update the address input
              document.getElementById('markerAddressDisplay').innerText = address; // Update the address display
          } else {
              window.alert('No results found');
              document.getElementById('markerAddressDisplay').innerText = 'No results found';
          }
      } else {
          window.alert('Geocoder failed due to: ' + status);
          document.getElementById('markerAddressDisplay').innerText = 'Geocoder failed';
      }
  });
}
document.getElementById('userForm').addEventListener('submit', function () {
  // Update the hidden address input's value to the current marker address display
  var address = document.getElementById('markerAddressDisplay').innerText;
  document.getElementById('address').value = address;
});

window.initMap = initMap;