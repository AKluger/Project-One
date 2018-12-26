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

// Initial Values
var name = "";
var street = "";
var city = "";
var state = "";
var zip = "";
var hours = "";

// Capture Button Click
$("#enterform").on("click", function (event) {
  event.preventDefault();

  // Grabbed values from text boxes
  name = $("#name").val().trim();
  street = $("#street_address").val().trim();
  street = street.replace(/\s+/g, '+');  // this regex replaces spaces with + marks e.g. 3000+Market+St
  city = $("#city_address").val().trim();
  state = $("#state_address").val().trim();
  state = state[1] + state[2]; // just need the two letter acronym e.g. PA from the state address field
  console.log("This is the state address before storing: " + state);
  zip = $("#zip_code_address").val().trim();
  hours = $("#hoursAvailable").val().trim();


  // Clear local storage and store the address to local storage
  localStorage.clear();
  localStorage.setItem("name", name);
  localStorage.setItem("street", street);
  localStorage.setItem("city", city);
  localStorage.setItem("state", state);
  localStorage.setItem("zip", zip);

  // Code for handling the push
  database.ref("users").push({
    name: name,
    street: street,
    city: city,
    state: state,
    zip: zip,
    hours: hours,
    infoAdded: firebase.database.ServerValue.TIMESTAMP
  });
});

// Firebase watcher .on("child_added"
database.ref("users").on("child_added", function (snapshot) {
  // storing the snapshot.val() in a variable for convenience
  var sv = snapshot.val();

  // Console.loging the last user's data
  console.log(sv);
  console.log(sv.street);
  console.log(sv.city);
  console.log(sv.state);
  console.log(sv.zip);
  console.log(sv.hours);

  // Change the HTML to reflect
  // $("#name-display").text(sv.name);
  // $("#email-display").text(sv.email);
  // $("#age-display").text(sv.age);
  // $("#comment-display").text(sv.comment);

  // Handle the errors
}, function (errorObject) {
  console.log("Errors handled: " + errorObject.code);
});



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
// $(document).ready(function() {

    //clearing out the time in the time once the time limit has been met the database

    //this is what will make the timer go down when the user clicks it which will start the timer from the submit button from the front screen

    //This is what will happen when the user pushes the button and page/timer for what user put in for time will start to count down
//     $("#start").on("click", function() {
//         $("start").hide();
//         start(i=0);
//     })

//     //Timer on the page that will start going down but will be hidden in backgroudn
//     function run() {
//         intervalId = setInterval(decrement, 1000);
//     }

//     function decrement() {
//         number--;
//         console.log(run);


//     }

// })