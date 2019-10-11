//  url til JSON datasettet over toalletter i Bergen Sentrum.
var url ="https://hotell.difi.no/api/json/bergen/dokart?";

// getJSON opretter en httpRequest som henter JSON data fra den spesifiserte url-en.
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

// Koden som kjøres umiddelbart når html-siden lastes inn.

window.onload = function() {
  getJSON(url, function(err, data) {
    if (err !== null) {
      alert('Something went wrong: ' + err);
    } else {
      // her er koden der vi faktisk behandler JSON-dataen vi får av httpRequestet.
      createList(data);
    }
  });
}

// createList lager en liste bestående av option og select elementer.
// De her elementene kan trykkes på av brukeren, noe som vil aktivere en
// annen funksjon createNearestInformation() som opretter informasjon om den nærmeste toalettet til det bruket-balgte toalettet.

function createList(data) {
var form = document.getElementById("selectionForm");
toilets = data['entries'];
var selections = document.createElement("select");
selections.setAttribute("size", toilets.length);
form.appendChild(selections);
   for (var i = 0; i < toilets.length; i++) {
     var option = document.createElement('option');
     option.id = i;
     option.textContent = toilets[i]["plassering"];
     option.onclick = function() {
      var nearest = nearestElement(toilets[this.id]["latitude"], toilets[this.id]["longitude"]);
      createNearestInformation(this.id, nearest);
     }
     selections.appendChild(option);
   }
   console.log(selections);
   return selections;
}

// createNearestInformation() opretter html informasjon om både det valgte toalettet og det nærmeste toalettet.
// Alle key-nøkkel par blir lagret og vist i en liste.
// Kunne sikkert laget en egen funksjon for sette opp slik informasjon siden den nåværende funksjonen gjør egentlig de samme prossesene to ganger.

function createNearestInformation(currentElement, indexOfNearest) {

  // først opretter vi informasjon om det bruker-valgte toalettet.

  var choice = document.getElementById("choiceSection");
  choice.innerHTML = "";

  var choiceHeadline = document.createElement("h2");
  choiceHeadline.innerHTML = toilets[currentElement]["plassering"];
  choice.appendChild(choiceHeadline);

  var choiceList = document.createElement("ul");

  for(var key in toilets[currentElement]) {
    var listItem = document.createElement("li");
    listItem.textContent = key + ": " + toilets[indexOfNearest][key];
    choiceList.appendChild(listItem);
  }
  choice.append(choiceList);

  //...så opretter vi infromasjon om det nærmeste toalettet.

  var result = document.getElementById("nearestSection");
  result.innerHTML = "";

  var resultHeadline = document.createElement("h2");
  resultHeadline.innerHTML = toilets[indexOfNearest]["plassering"];
  result.appendChild(resultHeadline);

  var resultList = document.createElement("ul");

  for(var key in toilets[indexOfNearest]) {
    var listItem = document.createElement("li");
    listItem.textContent = key + ": " + toilets[indexOfNearest][key];
    resultList.appendChild(listItem);
  }
  result.appendChild(resultList);
}

// findDistance finner avstanden mellom two koordinater gitt fra parameteren.
// Matemtikken er basert på Haversine Forumla som antar at avstanden mellom to punkter er
// en direkte luftlinje.

function findDistance(lat1, lon1, lat2, lon2) {
  var R = 6371; // Radius av jordkloden i km
  var dLatitude = toRadius(lat2-lat1);  // deg2rad below
  var dLongitude = toRadius(lon2-lon1);
  var a =
    Math.sin(dLatitude/2) * Math.sin(dLatitude/2) +
    Math.cos(toRadius(lat1)) * Math.cos(toRadius(lat2)) *
    Math.sin(dLongitude/2) * Math.sin(dLongitude/2)
    ;
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var distance = R * c; // avstand i kilometer.
  return distance;
}

function toRadius(deg) {
  return deg * (Math.PI/180);
}

// displayDistance legger til informasjon i html-siden om avstanden mellom det valgte toalettet og
// det nærmeste treffet.

function displayDistance(distance) {
  var pointer = document.getElementById("pointer");
  pointer.innerHTML = "";
  var distanceDisplay = document.createElement("p");
  var roundedDistance = +distance.toFixed(2);
  distanceDisplay.innerHTML = roundedDistance + " Kilometer \n Avstand";
  pointer.appendChild(distanceDisplay);
}

// nearestElement finner det nærmeste toaletter til det bruker-valgte toalettet.
// Dette oppnår den ved å iterere gjennom alle toaletter, så kalle findDistance() på hver av dem,
// og lager en variabel som lagrer det minste resultatet så langt av alle resultat.
//

function nearestElement(lat1, lon1) {
  var nearestSoFar = 100.0;

  for(var i = 0; i < toilets.length; i++) {
    var indexOfNearest;

    if(!((lat1 == toilets[i]["latitude"]) && (lon1 == [toilets[i]["longitude"]]))) {

      var lat2 = toilets[i]["latitude"];
      var lon2 = toilets[i]["longitude"];

      var distance = findDistance(lat1, lon1, lat2, lon2);

      if(distance < nearestSoFar) {
          nearestSoFar = distance;
          indexOfNearest = i;
      }
    }
  }
  displayDistance(nearestSoFar);
  return indexOfNearest;
}
