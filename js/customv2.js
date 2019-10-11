
// LES RAPPORTEN


// This webpage(custom.html) presents data regarding TV-episodes of the show "Norge Rundt" from Bergen.
// The user can choose between 3 different types of data: 1. Episodes by theme, 2. episodes by gender of main character, 3. episodes by age of main character.

// current selected year. Used in the url that is part of a httpRequest. "2016" is the default.
var aar = "2016";
// current choice of data by the user. "Tema" is the default.
var currentChoice = "tema";
// url used when requesting json data from a domain. The year is a variable and can therefore be changed.
var url = "https://hotell.difi.no/api/json/nrk/norge-rundt?aar="+aar+"&kommune=Bergen";
// object where the key is the information we are interested in(like theme of episode) and the value is how many times this information occurs among all episodes of the given year.
var dataOccurrences = {};
// Total number of occurances of data. This will be used to calculate percentages of data.
var totalOccurences = 0;
// The list of data formated so that it can be used in a canvasjs Pie Chart.
var dataList = [];
//


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

window.onload = function() {
  getJSON(url, function(err, data) {
    if (err !== null) {
      alert('Something went wrong: ' + err);
    } else {
      showData(createPieData(data, "tema"));
    }
  });
}

// createPieData creates data of the Pie chart by taking the key of our json data as a parameter.
// The paramteter is recieved when the user checks a radiobox and presses the "Velg" button. "tema" is the default parameter.
// Then it loops trough all episodes and finds the occurances of the unique values of the key.
// This is used to calculate percentages of the values which is the data that will be used in the graph itself.

function createPieData(data, brukerValg) {
    var episodes = data['entries'];
    dataOccurrences = {};
    totalOccurences = 0;
    dataList = [];

    for(var i = 0; i < episodes.length; i++) {
      if(dataOccurrences[episodes[i][brukerValg]] === undefined) {
      dataOccurrences[episodes[i][brukerValg]] = 1;
      totalOccurences++;
       }
       else {
         dataOccurrences[episodes[i][brukerValg]] += 1;
         totalOccurences++;
       }
    }
    for(var key in dataOccurrences) {
      var percentage = (dataOccurrences[key]/totalOccurences)*100;
      // shortes decimals to only 2 numbers after the ".";
      var roundedPercentage = +percentage.toFixed(2);

      var text = "(" + dataOccurrences[key] + ") - " + key;
      // formats the data so that it can be used as datapoins in the Pie Chart.
      dataList.push({y: roundedPercentage, label: text});
    }
    return dataList;
}

// changes year of the information requested based on parameter.
function changeYear(aar) {
  url = "https://hotell.difi.no/api/json/nrk/norge-rundt?aar="+aar+"&kommune=Bergen";

}


// Denne versjonen printer ut dataen i stedet for å lage en graf. Begrunnelse i rapported.

function showData(data) {
  console.log(data);
  var dataSection = document.getElementById("displayData");
  dataSection.innerHTML = "";
  var head = document.createElement("h2");
  var headline = "Norge Rundt - Bergen - " + currentChoice + ": "+ aar;
  head.innerHTML = headline;
  dataSection.appendChild(head);
  var dataList = document.createElement("ul");
  for(var i = 0; i < data.length; i++) {
    var listItem = document.createElement("li");
    listItem.innerHTML = data[i]["y"] + "%  " + data[i]["label"];
    dataList.appendChild(listItem);
  }
  dataSection.appendChild(dataList);
}

// This function is called when the user presses the "Velg" button.

function getBrukerValg() {
  var forandretAar = true;
  form = document.getElementById("valgAvGraf");
  // loops trough all radioboxes and finds the one that is checked.
  for (var i = 0; i < form.elements.length; i++ ) {
      if(form.elements[i].type == 'radio') {
          if (form.elements[i].checked == true) {
              currentChoice = form.elements[i].value;
          }
      }
      else if(form.elements[i].type == 'text') {
        if(form.elements[i].value !== '') {
        aar = form.elements[i].value;
         }
         // if the year has not been changed there is no need to make a new json request.
         else {
           forandretAar = false;
         }
      }
  }

// if the year has been changed, then we will request new data based on the submitted year.
  if(forandretAar) {
    console.log("new data was requested and loaded.");
    changeYear(aar);
   }
    getJSON(url,function(err, data) {
      if (err !== null) {
        alert('Something went wrong: ' + err);
      } else {
          // new pie chart data is collected based on the radio box that the user clicked.
        if(currentChoice === "tema") {
          showData(createPieData(data, "tema"));;
        }
        else if (currentChoice === "hovedperson1_kjonn") {
          showData(createPieData(data, "hovedperson1_kjonn"));
        }
        else if(currentChoice === "hovedperson1_alder"){
          showData(createPieData(data, "hovedperson1_alder"));
        }
      }
    });
}
