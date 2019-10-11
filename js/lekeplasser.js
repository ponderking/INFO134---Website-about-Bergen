// url til json-datasett.
url = "https://hotell.difi.no/api/json/bergen/lekeplasser?";
// variabel som vil etter en stund referere til json-datasettet.
lekeplasser = null;

// getJSON oppretter en httpRequest som henter JSON data fra den spesifiserte url-en.
// Den tar også en callback funksjon som kjøres når funksjonen er "ferdig".

function getJSON(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'json';
    xhr.onload = function() {
      var status = xhr.status;
      if (status === 200) {
        callback(null, xhr.response);
      } else {
        callback(status, xhr.response);
      }
    };
    xhr.send();
};

// Opretting av nytt kart

function initMap() {
var bergen = {lat: 60.390465, lng: 5.328341};
map = new google.maps.Map(document.getElementById('map'), {
  zoom: 15,
  center: bergen
});
}

// koden som kjøres umiddelbart når HTML-filen lastes.

window.onload = function() {
  getJSON(url, function(err, data) {
    if (err !== null) {
      alert('Something went wrong: ' + err);
    } else {
      initMap();
      displayDefaultData(data);
    }
  });
}

// Viser 20 lekeplasser i Bergen på kartet og i en liste.

function displayDefaultData(data) {
  var header = document.getElementById("header");
  var tempLekeplasser = data['entries'];
  var list = document.createElement('ol');
  for (var i = 0; i < 20; i++) {
    var listItem = document.createElement('li');
    listItem.textContent = tempLekeplasser[i]["navn"];
    list.appendChild(listItem);
    var latLng = new google.maps.LatLng(tempLekeplasser[i]["latitude"],tempLekeplasser[i]["longitude"]);
    var marker = new google.maps.Marker({
      position: latLng,
      label: (i+1).toString(),
      map: map
    });
  }
  lekeplasser = tempLekeplasser;
  header.appendChild(list);
}

// Koden som kjøres når kunden trykker på knappen: "Antall lekeplasser".

function update() {
  var input = parseInt(document.getElementById("antallLekeplasser").value);
  console.log(typeof input);
  console.log(input);
  // er inputte er korrekt tall?
  if(input > 100 && input > 0) {
    alert("Number of playgrounds must be between 0 and 100");

  }
  // om så lager vi en ny liste eg et nytt kart basert på dette antallet med lekeplasser.
  else {
  displayCertainNumberOfData(input);
}
}


// displayCertainNumberOfData() tar et tall som parameter og lager en liste og et kart med dette antall toaletter.

function displayCertainNumberOfData(numberOfPlaygrounds) {
  var header = document.getElementById("header");
  header.innerHTML= "";
  initMap();
  var list = document.createElement('ol');
  for (var i = 0; i < numberOfPlaygrounds; i++) {
    var listItem = document.createElement('li');
    listItem.textContent = lekeplasser[i]["navn"];
    list.appendChild(listItem);
    var latLng = new google.maps.LatLng(lekeplasser[i]["latitude"],lekeplasser[i]["longitude"]);
    var marker = new google.maps.Marker({
      position: latLng,
      label: (i+1).toString(),
      map: map
    });
  }
  header.appendChild(list);
}
