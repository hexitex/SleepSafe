// Note: This requires that you consent to location sharing when
// prompted by your browser. If you see the error "The Geolocation service
// failed.", it means you probably did not give permission for the browser to
// locate you.

var map, marker, pos, readonly, addmode;

function initMapReadOnly() {
    readonly = true;
    addmode = false;
    initMap();
    markCurrentPosition();
}

function initMapEdit() {
    readonly = false;
    addmode = false;
    initMap();
}

function initMapAdd() {
    readonly = false;
    addmode = true;
    initMap();
}

function initMap() {

    if ($('#lat').val().length > 0 && $('#lng').val().length > 0) {
        pos = {
            lat: Number.parseFloat($('#lat').val()),
            lng: Number.parseFloat($('#lng').val())
        };
        //this must be an edit so don't do anything if the pin is moved until the location text has be replaced with blank

    } else {
        pos = {
            lat: 51,
            lng: 0.21
        };
    }
    // set it to somewhere
    map = new google.maps.Map(document.getElementById('map'), {
        center: pos,
        zoom: 16,
        draggable: true
    });

    // set it to somewhere
    pos = map.getCenter();

    if (navigator.geolocation && addmode && !readonly) {

        navigator.geolocation.getCurrentPosition(function (position) {
                pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };

                setUpDragFeature(pos);
                geocodePosition(pos);
                setAutoCompleteOptionsBounds(map, pos, true);
            },
            function () {
                setUpDragFeature(pos);
                setAutoCompleteOptionsBounds(map, pos, true);
            });

    } else {
        if (!readonly) {
            setUpDragFeature(pos);
            setAutoCompleteOptionsBounds(map, pos, false);
        }
    }
}

function markCurrentPosition() {
    let drag = true;
    if (readonly) {
        drag = false;

    }
    marker = new google.maps.Marker({
        position: pos,
        map: map,
        draggable: drag
    });
    return marker;
}

function setUpDragFeature(pos) {
    google.maps.event.addListener(markCurrentPosition(), 'dragend', function () {
        geocodePosition(marker.getPosition());
    });

}

function geocodePosition(pos) {

    geocoder = new google.maps.Geocoder();
    geocoder.geocode({
            latLng: pos
        },
        function (results, status) {

            if (status == google.maps.GeocoderStatus.OK) {
                setResultsToScreenVals(results, pos, true);
            }
        }
    );
}

function setAutoCompleteOptionsBounds(map, pos, locationFound) {
    const input = document.getElementById('location');
    let options = {};
    const Geocoder = new google.maps.Geocoder();
    map.setCenter(pos);
    map.setZoom(16);

    // make sure we are not overwriting previous location and that location is working

    if (locationFound) {
        Geocoder.geocode({
            location: pos
        }, function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) {

                if (results[0]) {
                    try {
                        let indice = 0;
                        for (let j = 0; j < results.length; j++) {
                            if (results[j].types[0] == 'locality') {
                                indice = j;
                                break;
                            }
                        }

                        for (let i = 0; i < results[j].address_components.length; i++) {

                            if (results[j].address_components[i].types[0] == "country") {
                                //this is the object you are looking for
                                xcountry = results[j].address_components[i];
                            }
                        }

                        options = {
                            componentRestrictions: {
                                country: xcountry.short_name
                            }
                        };
                        setResultsToScreenVals(options, pos);

                    } catch (exception) {

                    }
                }
            }
        });
    }

    const autocomplete = new google.maps.places.Autocomplete(input, options);
    autocomplete.bindTo('bounds', map);
    google.maps.event.addListener(autocomplete, 'place_changed', function () {

        marker.setVisible(false);
        const place = autocomplete.getPlace();

        if (!place.geometry) {
            return;
        }

        // If the place has a geometry, then present it on a map.
        if (place.geometry.viewport) {
            map.fitBounds(place.geometry.viewport);
        } else {
            map.setCenter(place.geometry.location);
        }

        marker.setPosition(place.geometry.location);
        marker.setVisible(true);
        setResultsToScreenVals(options, place.geometry.location);
    });
}

function setResultsToScreenVals(results, pos) {

    $("#lat").val(pos.lat);
    $("#lng").val(pos.lng);
    $('#location').val(results[0].formatted_address);

}

function get_json(url) {

    $.get(url, function (data) {
        return data;
    });
}