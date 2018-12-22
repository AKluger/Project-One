{/* <script src="https://www.gstatic.com/firebasejs/5.7.0/firebase.js"></script> */ }
{/* <script> */ }
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

var database = firebase.database();


$("#searchButton").on("click", function (event) {

    event.preventDefault();

    var location = "philadelphia";
    //could use city and state from form here

    var queryURL = "https://cors-anywhere.herokuapp.com/https://api.yelp.com/v3/businesses/search?term=cafe&location=" + location + "&radius=11265";

    console.log(queryURL);

    //api call and dynamically create html
    $.ajax({
        url: queryURL,
        headers: {
            'Authorization': 'Bearer 41tlAJAR11jbsyWiat9oNyy0ohqgPTYunAzX3vPpHAAWX8uAi4mtLb2XbpPu0IS3o_CL-nlwYIYZyzRWlGiFmHDn7JhFKbCKADufGYvnFuj5vHVkf3upw1EXHAccXHYx'
        },
        method: "GET"
    }).then(function (response) {
        // console.log(response)
        for (var i = 0; i < response.businesses.length; i++) {
            var results = response.businesses[i].coordinates;
            var lat = results.latitude;
            var lng = results.longitude;
            var coordinates = [lat, lng];
            var name = response.businesses[i].name;

            // console.log(results)
            // console.log( lat + " " + lng + " " + name)
            database.ref().push({
                placeName: name,
                placeCoordinates: coordinates,
            });
            // console.log(database.ref().child("places"))
        }


        database.ref().on("child_added", function (snapshot) {
            // storing the snapshot.val() in a variable for convenience
            var sv = snapshot.val();
            // Console.logging the last user's data
            console.log(sv.placeName);
            console.log(sv.placeCoordinates);

        })

    })

});
