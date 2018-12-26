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


$("#enterform").on("click", function (event) {

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
            var isClosed = response.businesses[i].is_closed;

            database.ref("places").push({
                placeName: name,
                placeCoordinates: coordinates,
                closedStatus: isClosed
            });
        }


        database.ref("places").on("child_added", function (snapshot) {
         
            var sv = snapshot.val();
          
            console.log(sv.placeName);
            console.log(sv.placeCoordinates);
            console.log(sv.isClosed);

        })

    })

});
