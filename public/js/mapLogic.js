var map;
var marker; // Declare marker at a higher scope

function initMap() {
  // Check if userLocation is defined and has coordinates
  var defaultLat = 53.3498; // Fallback latitude
  var defaultLng = -6.2603; // Fallback longitude

  if (window.userLocation && userLocation.coordinates) {
    defaultLat = userLocation.coordinates[1]; // Latitude
    defaultLng = userLocation.coordinates[0]; // Longitude
  }

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

  // Add the 'dragend' listener inside initMap, after the marker has been created
  marker.addListener('dragend', function () {
    var lat = marker.getPosition().lat();
    var lng = marker.getPosition().lng();

    // Update the hidden fields for latitude and longitude
    document.getElementById('lat').value = lat;
    document.getElementById('lng').value = lng;

    // Call the function to update the address input with the new location
    updateAddressFromMarker(lat, lng);
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
        document.getElementById('address').value = address; // Update hidden address field if needed

        // Update the display above the Address Description field
        document.getElementById('markerAddressDisplay').innerText = address;
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