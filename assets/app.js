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

  // // Firebase watcher .on
  // database.ref().on("value", function (snapshot) {
  //   // storing the snapshot.val() in a variable for convenience
  //   var sv = snapshot.val();

  // Console.logging addresses in firebase 
  // console.log(sv);
  // console.log(sv.street);
  // console.log(sv.city);
  // console.log(sv.state);
  // console.log(sv.zip);
  // console.log(sv.hours);

  // Get the user location from the local storage
  var street = localStorage.getItem("street");
  var city = localStorage.getItem("city");
  var state = localStorage.getItem("state");

  // Ajax code to geocod.io to convert text address to latitude and longitude
  var queryURL = "https://api.geocod.io/v1.3/geocode?street=" + street + "&city=" + city + "&state=" + state + "&api_key=6446f59bc5ec449c45ce44c9c4466c5f61816e1"

  var userCoordinates = [];

  $.ajax({
    url: queryURL,
    method: "GET"
  }).then(function (response) {
    //Storing latitude and longitude
    var lat = response.results[0].location.lat; // stores latitude
    var lng = response.results[0].location.lng; // stores longitude
    userCoordinates = [lat, lng];
    localStorage.setItem("userCoordinates", userCoordinates); // adds userCoordinates to localStorage

    // Default locations
    //var phillyCoordinates = [39.9526, -75.1652];
    //var pennovationCoordinates = [39.941252, -75.199540]

    // Map itself uses the TomTom SDK (hence the massive /sdk directory)
    var map = tomtom.L.map('map', {
      key: 'sYDNGj8wET1YxX9MvoISZSyPtefiwHDM',
      basePath: '/sdk',
      center: userCoordinates,
      zoom: 14
    }); // close ajax

    // Icon for the user location with the dialog box already open
    var userMarker = tomtom.L.marker(userCoordinates).addTo(map);

    userMarker.bindPopup('This is your current location').openPopup();

    // // Adding other student locations from firebase
    var ref = database.ref('users').on("child_added", function (snapshot) {
      var snap = snapshot.val(); // store values

      if (snap.name !== localStorage.getItem("name")) {
        var marker = tomtom.L.marker(snap.coordinates, {
          icon: tomtom.L.icon({
            iconUrl: 'sdk/images/ic_map_poi_027-black.png',
            iconSize: [40, 40]
          })
        }).addTo(map).bindPopup(snap.name);




        // var distBetween = distance(userCoordinates, snap.coordinates);
        // console.log(distBetween);

        // Variables needed to solving distance in order to sort the table later by distance
        var distanceTo;
        var distanceLat;
        var distanceLng;

        // calculate the latitude difference and store to distanceLat variable
        if (userCoordinates[0] > snap.coordinates[0]) {
          distanceLat = Math.abs((parseFloat(userCoordinates[0]) - parseFloat(snap.coordinates[0])));
        } else if (userCoordinates[0] < snap.coordinates[0]) {
          distanceLat = Math.abs((parseFloat(snap.coordinates[0]) - parseFloat(userCoordinates[0])));
        } else if (userCoordinates[0] === snap.coordinates[0]) {
          distanceLat = 0;
        }

        // repeat for longitude
        if (parseFloat(userCoordinates[1]) > parseFloat(snap.coordinates[1])) {
          distanceLng = Math.abs((parseFloat(userCoordinates[1]) - parseFloat(snap.coordinates[1])));
        } else if (parseFloat(userCoordinates[1]) < parseFloat(snap.coordinates[1])) {
          distanceLng = Math.abs((parseFloat(snap.coordinates[1]) - parseFloat(userCoordinates[1])));
        } else if (userCoordinates[1] === snap.coordinates[1]) {
          distanceLng = 0;
        }

        // calculating distance in meters using pythagorean theorem
        distanceTo = Math.sqrt(Math.pow(distanceLat, 2) + Math.pow(distanceLng, 2));
        // degree can be coverted to meters by multiplying with 111,139
        distanceTo = distanceTo * 111139;
        distanceTo = Math.round(distanceTo);

        // Generate a button to select
        var selectBtn = $("<a>");
        selectBtn.attr("class", "btn btn-secondary chosen");
        selectBtn.attr("href", "finalselect.html");
        selectBtn.attr("id", snap.name);
        selectBtn.attr("lat", snap.coordinates[0]);
        selectBtn.attr("lng", snap.coordinates[1]);
        selectBtn.attr("distance", distanceTo);
        selectBtn.attr("role", "button");
        selectBtn.text("Choose " + snap.name + " as your Study Buddy");

        // replace + marks in street address to spaces
        var snapStreet = snap.street;
        snapStreet = snapStreet.split('+').join(' ');

        // Adding the other student information to a chart
        var newRow = $("<tr>").append(
          $("<td>").text(snap.name),
          $("<td>").text(snapStreet),
          $("<td>").text(distanceTo),
          $("<td>").text(snap.hours),
          $("<td>").text("Kevin: need the calculated end time here"),
          $("<td>").append(selectBtn)
        );

        // Append the new row to the html
        $("tbody").append(newRow);
      }; // close if statement to avoid duplicating icons 


      // Sorting the table by distance
      function sortTable() {
        var table, rows, switching, i, x, y, shouldSwitch;
        table = $("table");
        console.log(table);
        switching = true;
        // Make a loop that will continue until no switching has been done
        while (switching) {
          // start by saying: no switching is done:
          switching = false;
          rows = table[0].rows;
          console.log(rows);
          // Loop through all table rows (except the first, which contains table headers):
          for (i = 1; i < (rows.length - 1); i++) {
            // start by saying there should be no switching:
            shouldSwitch = false;
            // Get the two elements you want to compare, one from current row and one from the next:
            x = rows[i].getElementsByTagName("TD")[2];
            y = rows[i + 1].getElementsByTagName("TD")[2];
            //check if the two rows should switch place:
            if (Number(x.innerHTML) > Number(y.innerHTML)) {
              //if so, mark as a switch and break the loop:
              shouldSwitch = true;
              break;
            }
          }
          if (shouldSwitch) {
            /*If a switch has been marked, make the switch
            and mark that a switch has been done:*/
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
            switching = true;
          }
        }
      }

      sortTable();

      // On click for chosing a study buddy
      $(".chosen").on("click", function (event) {
        event.preventDefault();

        // Retrieve latitude and longitude attributes in the clicked button and store as array
        var chosenCoordinates = [this.getAttribute("lat"), this.getAttribute("lng")];

        // Store the chosen study buddy name and location to local storage
        localStorage.setItem("chosenName", this.id);
        localStorage.setItem("chosenCoordinates", chosenCoordinates);

        // Either we color the button differently or use radio buttons to indicate that the person is selected
        // var changeColor = $(this).css({"background-color": "blue"});

        // or move directly into final select
        window.location.href = "finalselect.html";

      }); // close onclick button

    }); // close firebase



  }); // close ajax

}); // close document ready


  // Change the HTML to reflect
  // $("#name-display").text(sv.name);
  // $("#email-display").text(sv.email);
  // $("#age-display").text(sv.age);
  // $("#comment-display").text(sv.comment);

  //   // Handle the errors
  // }, function (errorObject) {
  //   console.log("Errors handled: " + errorObject.code);
  // });


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