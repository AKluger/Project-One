$(document).ready(function () {
    // Initialize Firebase
    var config = {
        apiKey: "AIzaSyD1nyE-SfenxVwBoxuoL92zFCEsZb0GUqo",
        authDomain: "studybuddy-bc331.firebaseapp.com",
        databaseURL: "https://studybuddy-bc331.firebaseio.com",
        projectId: "studybuddy-bc331",
        storageBucket: "studybuddy-bc331.appspot.com",
        messagingSenderId: "21013901811"
    };

    firebase.initializeApp(config);

    // Create a variable to reference the database.
    var database = firebase.database();

    // $("#enterform").on("click", function (event) {

    // event.preventDefault();

    var street = localStorage.getItem("street");
    var city = localStorage.getItem("city");
    var state = localStorage.getItem("state");
    var location = street + city + state;
    // user city and state from form here

    // Retrieve user and chosen study buddy locations from local storage
    var userCoordinates = localStorage.getItem("userCoordinates");
    var userName = localStorage.getItem("name");
    var chosenCoordinates = localStorage.getItem("chosenCoordinates");
    var chosenName = localStorage.getItem("chosenName");




    var queryURL = "https://cors-anywhere.herokuapp.com/https://api.yelp.com/v3/businesses/search?term=cafe&location=" + location + "&radius=11265";
    //api call to Yelp for cafe names and coordinates 

    console.log(queryURL);
    $.ajax({
        url: queryURL,
        headers: {
            'Authorization': 'Bearer 41tlAJAR11jbsyWiat9oNyy0ohqgPTYunAzX3vPpHAAWX8uAi4mtLb2XbpPu0IS3o_CL-nlwYIYZyzRWlGiFmHDn7JhFKbCKADufGYvnFuj5vHVkf3upw1EXHAccXHYx'
        },
        method: "GET"
    }).then(function (response) {

        for (var i = 0; i < response.businesses.length; i++) {
            var results = response.businesses[i].coordinates;
            var lat = results.latitude;
            var lng = results.longitude;
            var coordinates = [lat, lng];
            var name = response.businesses[i].name;
            var webUrl = response.businesses[i].url;
            // store in firebase
            database.ref("places").push({
                placeName: name,
                placeCoordinates: coordinates,
                placeUrl: webUrl
            });

            console.log(coordinates);


            //create the map
            var map = tomtom.L.map('map', {
                key: 'sYDNGj8wET1YxX9MvoISZSyPtefiwHDM',
                basePath: '/sdk',
                center: userCoordinates,
                zoom: 14
            });

            // Adding user flag icon
            var userMarker = tomtom.L.marker(userCoordinates).addTo(map).bindPopup(userName);

            // Adding chosen study buddy icon
            var chosenMarker = tomtom.L.marker(chosenCoordinates, {
                icon: tomtom.L.icon({
                    iconUrl: 'sdk/images/ic_map_poi_027-black.png',
                    iconSize: [40, 40]
                })
            }).addTo(map).bindPopup(chosenName);

            database.ref("places").on("child_added", function (snapshot) {

                var sv = snapshot.val();

                console.log(sv.placeName);
                console.log(sv.placeCoordinates);
                // Adding coffee places

                var marker = tomtom.L.marker(sv.placeCoordinates, {
                    icon: tomtom.L.icon({
                        iconUrl: 'assets/coffee.png',
                        iconSize: [30, 30]
                    })
                }).addTo(map).bindPopup(sv.placeName);
                //add coffeeshop icon with name to map
            }); // close snapshot

        };
    });

});