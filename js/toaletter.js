// url der JSON datasettet blir hentet.
var url = "https://hotell.difi.no/api/json/bergen/dokart?";

var toilets = null;
// map div
var map;
// Object containing search-criteria based on the form containing checkboxes and text inputs. e.g Advanced Search.
var searchObject = {};
// Object containing search-critera based on search field and regular expressions. e.g Quick-search.
var regexObject = {};


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

// starter et tomt kart (uten markers) som er sentrert i Bergen sentrum.

function initMap() {
var bergen = {lat: 60.390465, lng: 5.328341};
map = new google.maps.Map(document.getElementById('map'), {
  zoom: 15,
  center: bergen
});
}

// Kode som kjøres umiddelbart når html-siden lastes inn.

window.onload = function() {
  initMap();
  getJSON(url, function(err, data) {
    if (err !== null) {
      alert('Something went wrong: ' + err);
    } else {
      cleanupJSON(data);
      displayDefaultData(data);
    }
  });
}


// Noen keys i datasettet har values "" i stedet for "NULL". Samtidig har noen toalett "All" som åpningstid.
// Dette blir konvertert til tilsvarande klokkseslett 00.00-23.59.
// Denne funksjonen "fikser" dette for å gjøre datahandtering lettere etterhvert.
function cleanupJSON(data) {
  // this variable excludes 'entries' from the json data. This makes it easier to reference the data that we want.
  // e.g we can write toilets[i] instead of json['entries'][i].
  tempToilets = data['entries'];
  for(var i = 0; i < tempToilets.length; i++) {
     for(var key in tempToilets[i]) {
       if(tempToilets[i][key] === '') {
         tempToilets[i][key] = "NULL";
       }
       else if(tempToilets[i][key] === 'ALL') {
         tempToilets[i][key] = "00.00 - 23.59";
       }
     }
  }
  // Forsøk på å sette en global variabel til datasettet fra callback-funksjonen.
  // Dette ser ut til å fungere i dette tilfelle, selv om en slik operasjon vil ofte resultere i problemer pga Asynkronisk natur.
  // En bedre mulighet hadde kanskje vert å lage en ordentlig .json fil i directorien til koden som kan henvendes til til senere bruk.
  toilets = tempToilets;
}

//  displayDefaultData viser alle toaletter på kartet og i en liste når HTML siden lastes inn.

function displayDefaultData(data) {
  toilets = data['entries'];
  var list = document.createElement('ol');
  for (var i = 0; i < toilets.length; i++) {
    var listItem = document.createElement('li');
    listItem.textContent = toilets[i].plassering;
    list.appendChild(listItem);
    var latLng = new google.maps.LatLng(toilets[i].latitude,toilets[i].longitude);
    var marker = new google.maps.Marker({
      position: latLng,
      label: (i+1).toString(),
      map: map
    });
  }
  header.appendChild(list);
}





//
//
//  AVANSERT SØK
//
//

// update() kjøres når brukeren trykker på "Søk" knappen i "Avansert Søk".
function update() {
    // Vi opretter et søkeobjekt basert på valgene i "Avansert Søk"
    createSearchCriteria();
    console.log("Search object");
    console.log(searchObject);
    console.log("\n");
    // Så finner vi alle matcher til kravene spesifiserti objektet.
    createList(searchObject);
}

// createSearchCriteria er ansvarlig for å samle inn hvilke bokser og felt brukeren valgte i Avansert Søk.
// Siden veridene til boksene er på samme format som nøkkelene i datasettet, så kan vi bare si at søkeobjektet
// sin verdi skal tilsvaret verdien til boksen som brukeren valgte.

function createSearchCriteria() {
    var form = document.getElementById("toiletSearch");
    for (var i = 0; i < form.elements.length; i++ ) {
        if (form.elements[i].type == 'radio') {
            if (form.elements[i].checked == true) {
                searchObject[form.elements[i].name] = form.elements[i].value;
            }
        }
        else if (form.elements[i].type == 'checkbox') {
            if (form.elements[i].checked == true) {
                searchObject[form.elements[i].name] = form.elements[i].value;
            }
        }
        else if (form.elements[i].type == 'text') {
             if(form.elements[i].value !==  '') {
                  searchObject[form.elements[i].name] = form.elements[i].value;
                  console.log(searchObject[form.elements[i].name] = form.elements[i].value);
                }
              }
        }
}

// createList er funksjonen som lager en HTML liste som består av alle toalleter som fyller kravene spesifisert i et søkeobjekt.
// Merk at funksjonen handterer både søkeobjekter lagd av regex, og søkeobjekter fra avansert søk. (Søke-objektet er parameteren.)

function createList(comparisonObject) {
    // Hvis objektet er tomt, altså at brukeren ikke har lagt inn noe informasjon, så er det ingen grunn til å legge gjøre noen forandringer..
    if(Object.keys(comparisonObject).length === 0) {
     console.log("Incorrect user input format");
     console.log();
     return false;
   }
    // header elementet som vil vise listen over toallet-treff.
    var header = document.getElementById("header");
    // oopretting av ny HTML liste.
    header.innerHTML = "";
    var list = document.createElement('ol');
    // nytt tomt kart.
    map.innerHTML = " ";
    initMap();
    // når denne variabelen er false, vil det si at toalette ikke er en match, og vi kan derfor la være å se på resten av nøkkelene til dette toalettet.
    var stillComparing;
    // holder antall treff.
    var matchNumber = 0;
    for (var i = 0; i < toilets.length; i++) {
      stillComparing = true;
      // Her går vi gjennom alle nøkkler i søkeobjektet og sammenligner det med nøkler i hvert toalett i datasettet.
      for (var key in comparisonObject) {
        // hvis toalettet ikke er en match, break loopen, og gå videre til neste kandidat.
          if(!(compareCriteria(key, comparisonObject[key], i))) {
            console.log("Not a match at index: " + i);
            stillComparing = false;
            break;
          }
       }
       // Toalettet var en match. Vi legger den til i HTML listen som vises til brukeren.
       if(stillComparing === true) {
         console.log("Match at toilets index: " + i);
         var listItem = document.createElement('li');
         listItem.textContent = toilets[i]["plassering"];
         list.appendChild(listItem);
         // Vi legger også til en marker på selve kartet som tilsvarer posisjonen til toalettet.
         var latLng = new google.maps.LatLng(toilets[i].latitude,toilets[i].longitude);
         var marker = new google.maps.Marker({
           position: latLng,
           label: (matchNumber+1).toString(),
           map: map
         });
         matchNumber++;
       }
    }
    console.log("Total matches:" + matchNumber);
    header.appendChild(list);
    return header;
  }

// compareCriteria() sammenligner nøkler og verdier i søkeobjektet  med nøkler og verdier i hvert toalett.
// Funksjonen bestemmer altså om toalettet som sammenligned er en match eller ikke. REturnerer false dersom det ikke er en match, og motsatt.
// parameter i, tilsvarer indeksen til toallettet vi ser på.

  function compareCriteria(key, value, i) {
        if(key === ("pris")) {
          // hvis søke-prisen ikke er mindre eller lik prisen til toalettet, så er det ikke en match.
          if(!(parseInt(toilets[i]["pris"]) <= parseInt(value) || (toilets[i]["pris"] === "NULL"))) {
            return false;
          }
        }
        else if(key === "free") {
          // brukeren spesifiserte at toalettet skal være gratis.
            if(value === "1") {
              // hvis toalettet ikke har en pris som er 0, eller "NULL", så er det ikke en match.
              // Her har jeg tolket det slik at "NULL" betyr gratis, selv om det gjerne egentlig betyr at vi mangler informasjon om prisen.
              if(!((toilets[i]["pris"] === "0") || (toilets[i]["pris"] === "NULL"))) {
                  console.log("It's free");
                  return false;
              }
            }
            // brukeren spesifiserte at toalettet skal IKKE være gratis. Hvis prisen ikke er større enn 0 eller lik "NULL" så er det ikke en match.
            else if (!((toilets[i]["pris"] > "0")) || ((toilets[i]["pris"] === "NULL"))){
              return false;
              }
            }
        else if(key === "openNow") {
          // vi finner åpningstiden til toalllet i den dag i dag.
          var timeRangeOfToilet = toilets[i][whatDayIsIt()];
          // brukeren spesifiserte at toalettet skal være åpent nå.
          if(value !== "NULL") {
            // hvis toallettet ikke er åpent så er det ikke en match.
              if(!(isItOpen(timeRangeOfToilet))) {
                console.log("Not open");
                return false;
              }
          }
          // kunden spesifiserte at toallet skal IKKE være åpent.
          else {
            console.log(timeRangeOfToilet);
            // hvis det ikke er åpent så er et en match.
            if(!(isItOpen(timeRangeOfToilet))) {
              console.log("Not open");
              return true;
            }
            // ellers er det ikke en match.
            else {
              return false;
            }
          }
        }
        else if(key === "openAt") {
          // her sjekker vi om toalettet er åpent i dag basert på klokkeslettet fra brukeren som er lagret i value.
            if(!(isItOpen(toilets[i][whatDayIsIt()], value))) {
              console.log("Not open at custom time");
              return false;
              }
           }
      // Denne koden takler resten av nøkkelene. e.g(herre, dame, rullestol, stellerom). Først sikrer vi oss om toalettet har en tilsvarende nøkkel til søke-objektet.
      else if (toilets[i].hasOwnProperty(key)) {
        // Dersom verdien til søkeobjektet ikke samsvarer med verdien til toallettet så er det ikke en match.
        // Et eksempel: if(herre:1 === herre:1) , hvis dette ikke er likt så er det selfølgelig ikke en match.
        if(!(value === toilets[i][key])) {
            return false;
        }
      }
      // dersom søkeobjektet når helt her nede, så er det en match!
     return true;
}


//  currentDayOfWeek() returnerer et tall som representerer hvilke ukedag det er i dag.
//  0 betyr søndag, 1 mandag osv...

 function currentDayOfWeek() {
   var date = new Date();
   return date.getDay();
 }

 // currentHoursMinutes returnrerer dagens klokkeslett. formatert slik: HH.MM

  function currentHoursMinutes() {
    var date = new Date();

    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    var min = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    return hour + "." + min;
  }

  //isItOpen() sjekker om . timestring er klokkeslettet som hentes fra toallettene. Merk at formatet til toallettene er f eks slik: 08.00 - 20.00.
  // Derfor deler jeg opp tids perioden i de to delene, og sammenligner de med tiden gitt av brukeren. returnerer sant dersom tid parameteren som sammenlignd ligger over første delen, og under andre delen.
  function isItOpen(timeString, comparisonTime) {
    // Hvis en comparisonTime ikke er gitt som paramteter, så vil denne variabelen bli instansiert til klokken akkurat nå.
    // Det er dette som skjer når vi ser etter toaletter som er åpent akkurat nå. (i stedet for et spesifikt tidspunkt.).
    if(comparisonTime === undefined) {
    var comparisonTime = currentHoursMinutes();
    }
    var startTime = timeString.substring(0,5);
    var endTime = timeString.substring(8,13);
    if((startTime <= comparisonTime) && (endTime >= comparisonTime)) {
        return true;
      }
    return false;
   }

   // whatDayIsIt() returnerer en tekst representasjon av hvilke type ukedag det er i dag.
   // Teksten vil samsvare med formatet brukt som keys i datasettet.
  function whatDayIsIt() {
    var date = new Date();
    var currentDay = date.getDay();

    if(currentDay > 1  && currentDay < 5) {
      return "tid_hverdag";
    }

    else if(currentDay === 6) {
      return "tid_lordag ";
    }

    else {
      return "tid_sondag";
    }
  }



//
//
//  HURTIGSØK
//
//

// readUserSearch henter inputet fra hurtig-søkefeltet og gjør enten et frisøk eller et objektsøk.
// I frisøk sammenlignes tekst-inputten med navnet eller addressen til alle toaletter.
// I objektsøkt bruker vi regex til å sjekke om brukren har lagt input på følgende format: key:value. For ekemspel: pris:10, eller rullestol:ja

function readUserSearch() {
  var input = document.getElementById("searchField").value;
  // hvis feltet er tomt gjør vi ingenting.
  if(input === '') {
    console.log('Search string was empty.');
    return false;
  }
  // feltet var ikke tomt
  else {
    // regex sjekker om teksten er delt inn i følgende format: key:value.
    // Den grupperer nøkkelen på indeks 0, og veri på indeks 1.
    var reColonMatches = new RegExp('([^:| ]+):(.*)', 'i');
    var colonResults = reColonMatches.exec(input);
    console.log(colonResults);
    // hvis inputtet består regex-testen.
    if(colonResults !== null) {
    var key = colonResults[1];
    var value = colonResults[2];
    }
    // hvis ikke antar vi at brukeren mente å gjør et frisøk.
    else {
      // Vi søker gjennom toalller for å se om navn eller adresser samsvarer med inputtet til brukeren. Så stopper vi koden.
      var reFreeSearch = new RegExp(input, "i");
      searchByName(reFreeSearch);
      return true;
    }
    // Inputtet er på objekt-format.
    // Oppretting av key/values i regexObject.
    if(key === "kjønn") {
      if(value === "herre" || value === "dame") {
        // dette blir til herre:1, eller dame:1.
       regexObject[value] = "1";
      }
    }
    else if(key === "openAt") {
      // regex som fanger tekst som består av 2 siffer etterfølt av "." og så 2 nye siffer. Dette er altså et klokkeslett.
      var reTime = new RegExp("\\d\\d.\\d\\d");
      console.log(value);
      console.log(reTime.test(value))
      // Hvis det er et korrekt klokke slett, så setter vi set som verdi til nøkkelen "openAt".
      if(reTime.test(value)) {
        regexObject[key] = value;
      }
    }
    else if(key === "maksPris") {
        regexObject[key] = value;
    }
    // Her handterer vi resten av nøklene på en enkel måte. Hvis brukeren for eksempel skrev: stellerom:ja, så oversetter vi det til stellerom:1 i søkeobjektet.
    else if(key === "rullestol" || key === "stellerom" || key === "openNow" || key === "free" || key === "herre" || key === "dame") {
      // vi aksepterer flere former for "ja"
      if(value === "ja" || value === "yes" || value === "1" || value === "true") {
       regexObject[key] = "1";
      }
      // ellers må dete bety at kunden IKKE ville ha denne verdien. Er gjerne bedre å sjekke om kunden skrev"nei" eller tilsvarande.
     else {
       regexObject[key] = "NULL";
      }
    }
  }
    console.log("Regex søke Object");
    console.log(regexObject);
    // Nå er vi klare til å sammenligne regexObjektet med alle toalletter i datasettet, og så lage en liste over alle matcher.
    createList(regexObject);
}


//  Hurtig søk. Dette funksjoner kjøres når brukeren spesifiserer fri-tekst i søkefeltet.
//  Funksjonen leter etter toaletter som har tilsvarende navn med bruker-inputtet.

function searchByName(re) {
  var header = document.getElementById("header");
  var list = document.createElement('ol');
  map.innerHTML = " ";
  initMap();
  var matchNumber = 1;
  for (var i = 0; i < toilets.length; i++) {
        if((re.test(toilets[i]['plassering'])) || (re.test(toilets[i]['adresse']))) {
          console.log("Match at index: " + i);
          var listItem = document.createElement('li');
          listItem.textContent = toilets[i]["plassering"];
          list.appendChild(listItem);
          var latLng = new google.maps.LatLng(toilets[i].latitude,toilets[i].longitude);
          var marker = new google.maps.Marker({
            position: latLng,
            label: (matchNumber).toString(),
            map: map
          });
          matchNumber++;
        }
        else {
          console.log("Not a match at index: " + i);
        }
  }
  // det var ingen treff. Så det er igngen grunn til å oppdatere.
  if(matchNumber === 1) {
    alert("Ingen treff funnet ved hurtig-søket: " + re.toString());
    return false;
  }
  header.innerHTML = "";
  console.log(list);
  header.appendChild(list);
  console.log(header);
  return header;
}
