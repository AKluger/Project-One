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

  // Removing users from firebase whose endtime has passed
  var cutoff = moment() - 1; // basically now but one millisecond behind, this displays the actual time instead of the object
  var old = firebase.database().ref('users').orderByChild('endtime').endAt(cutoff).limitToLast(1);
  var listener = old.on('child_added', function (snapshot) {
    snapshot.ref.remove();
  });

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
        


        // Convert endtime to HH:mm format
        var endTime = snap.endtime;
        endTime = moment(endTime).format("LT");

        // Generate a button to select
        var selectBtn = $("<a>");
        selectBtn.attr("class", "btn btn-secondary chosen");
        selectBtn.attr("href", "finalselect.html");
        selectBtn.attr("id", snap.name);
        selectBtn.attr("lat", snap.coordinates[0]);
        selectBtn.attr("lng", snap.coordinates[1]);
        selectBtn.attr("distance", distanceTo);
        selectBtn.attr("role", "button");
        selectBtn.text("Choose");

        // selectBtn.text("Choose " + snap.name + " as your Study Buddy");

        // replace + marks in street address to spaces
        var snapStreet = snap.street;
        snapStreet = snapStreet.split('+').join(' ');

        // Calculating distance in miles from distanceTo
        var milesTo = distanceTo * 0.000621371;
        milesTo = milesTo.toFixed(2); // two decimal places

        // Adding the other student information to a chart
        var newRow = $("<tr>").append(
          $("<td>").text(snap.name),
          // $("<td>").text(snapStreet),
          $("<td>").text(milesTo),
          // $("<td>").text(snap.hours),
          $("<td>").text(endTime),
          $("<td>").append(selectBtn)
        );

        // Append the new row to the html
        $("tbody").append(newRow);
      }; // close if statement to avoid duplicating icons 


      // Sorting the table by distance
      function sortTable() {
        var table, rows, switching, i, x, y, shouldSwitch;
        table = $("table");
        switching = true;
        // Make a loop that will continue until no switching has been done
        while (switching) {
          // start by saying: no switching is done:
          switching = false;
          rows = table[0].rows;
          // Loop through all table rows (except the first, which contains table headers):
          for (i = 1; i < (rows.length - 1); i++) {
            // start by saying there should be no switching:
            shouldSwitch = false;
            // Get the two elements you want to compare, one from current row and one from the next:
            x = rows[i].getElementsByTagName("TD")[1];
            y = rows[i + 1].getElementsByTagName("TD")[1];
            //check if the two rows should switch place:
            if (Number(x.innerHTML) > Number(y.innerHTML)) {
              //if so, mark as a switch and break the loop:
              shouldSwitch = true;
              break;
            }
          }
          if (shouldSwitch) {
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
        localStorage.setItem("distance", this.getAttribute("distance"));

        // Either we color the button differently or use radio buttons to indicate that the person is selected
        // var changeColor = $(this).css({"background-color": "blue"});

        // or move directly into final select
        window.location.href = "finalselect.html";

      }); // close onclick button

    }); // close firebase



  }); // close ajax

}); // close document ready
