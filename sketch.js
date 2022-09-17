// Listener und Stuff außerhalb von P5JS
let showWhite = true;
let showWhiteNow = false;
// auf input change hören
let inputRange = document.getElementById("inputByMe");
inputRange.value = "0.2";
let rangeCounter = document.getElementById("rangeCounter");
inputRange.addEventListener('input', (event) => {
  if (showWhite) {
    showWhiteNow = true;
  }
  let val = inputRange.value;
  rangeCounter.innerHTML = val;
  loadWithDefaults(); // reload mit Relations-Wert & weiße Kurve einblenden / nicht einblenden
  showWhiteNow = false;
}); // input als id wurde von p5js reserviert / blockiert

document.addEventListener('wheel', (event) => { // mouse scroll für resizing detecten in canvas von p5js
  if (window.getComputedStyle(mainModal).display === "none") {
    zoomFactor -= event.deltaY / 70;
    loadWithDefaults();
  }
});

let options = document.getElementById("options"); // auf Maus hover hören bei element (id === "options"), um Maus-Graphen-Dragging beim zB. Slider zu vermeiden
options.mouseIsOver = false;
options.onmouseover = function () {
  this.mouseIsOver = true;
};
options.onmouseout = function () {
  this.mouseIsOver = false;
}


document.addEventListener('mousedown', (event) => {
  let dragOffsetX = xOffset - event.pageX; // um den Offset zum Graph XY Mittelpunkt und der Maus zu berechen
  let dragOffsetY = yOffset - event.pageY;
  document.addEventListener('mousemove', onMouseMove);
  function onMouseMove(event) { // dragging erkennen um Diagramm auf (relativer) Maus-Position zu halten
    if (!options.mouseIsOver && window.getComputedStyle(mainModal).display === "none") {
      let newX = event.pageX + dragOffsetX; // offset addieren, damit der Graph sich 'smooth' bewegt
      let newY = event.pageY + dragOffsetY;

      xOffset = newX;
      yOffset = newY;
      loadWithDefaults();
    }
  }
  document.addEventListener('mouseup', onMouseUp);
  function onMouseUp() { // feuert jedes mal aber merkt man nicht .. --> weiße Kurve löschen & mouse mouse listener + mouseupListener löschen --> werden wieder erstellt
    loadWithDefaults();
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  };
});
// auf den switch-Input hören
let inputSwitch = document.getElementById("checkcross");
inputSwitch.addEventListener('input', (event) => {
  showWhite = !showWhite;
});

let uploadInput = document.getElementById("uploadInput");
// auf upload button click hören --> trigger file input
document.getElementById("uploadCSV").addEventListener("click", () => {
  uploadInput.click();
})
uploadInput.addEventListener("change", handleFiles, false);
async function handleFiles(event) { // auf file input hören
  let csvraw = await readCSV(event.target.files[0]);
  if (csvraw) {
    // modal anzeigen für den split - modus
    showSplitOptionModal(csvraw);
  } else {
    alert("file must be a csv");
  }
  uploadInput.value = null;
}

function readCSV(file) {
  return new Promise(resolve => { // Promise, da reader.onload async abläuft
    // Überprüfen ob typ csv
    try {
      if (file.type && !file.type.startsWith('text/csv')) {
        resolve(false);
      }
    } catch (e) {
      resolve(false);
    }

    const reader = new FileReader(); // csv zu String überführen
    reader.readAsText(file, "UTF-8")
    reader.onload = function (evt) {
      resolve(evt.target.result);
    }
  });
}

function CSVToArray(rawData, mode) {
  let data = rawData.split('\n');
  for (let i = 0; i < data.length; ++i) {
    let elm = data[i];
    elm = elm.split(mode);
    data[i] = elm;
  }
  return data;
}















// P5JS - Syntax - Zeugs
let zoomFactor = 100;
let coordinates = presetCoordinates();
function presetCoordinates() {
  let unsplittedKoords =
    "0,000;0,00;1,30;0,00;0,70* 0,050;-0,03;1,50;0,42;1,11* 0,100;0,12;1,53;0,72;1,60* 0,150;0,51;1,56;0,84;2,05* 0,200;1,03;1,76;0,88;2,34* 0,250;1,49;2,17;0,95;2,43* 0,300;1,74;2,66;1,18;2,43* 0,350;1,76;3,03;1,56;2,46* 0,400;1,71;3,16;2,00;2,63* 0,450;1,77;3,05;2,36;2,93* 0,500;2,07;2,87;2,55;3,23* 0,550;2,56;2,81;2,61;3,41* 0,600;3,07;2,96;2,65;3,39* 0,650;3,41;3,26;2,81;3,23* 0,700;3,51;3,52;3,14;3,05* 0,750;3,46;3,57;3,57;2,98* 0,800;3,46;3,36;3,98;3,06* 0,850;3,66;3,01;4,24;3,19* 0,900;4,09;2,70;4,33;3,25* 0,950;4,62;2,59;4,36;3,13* 1,000;5,04;2,67;4,46;2,83* 1,050;5,23;2,78;4,73;2,46* 1,100;5,23;2,75;5,14;2,16* 1,150;5,18;2,46;5,57;2,00* 1,200;5,29;1,95;5,89;1,94* 1,250;5,64;1,42;6,05;1,87* 1,300;6,15;1,04;6,09;1,64* 1,350;6,64;0,88;6,14;1,22* 1,400;6,92;0,82;6,34;0,68* 1,450;6,98;0,69;6,70;0,16"; // aus dem csv entnommen
  let data = getCoords(unsplittedKoords); // function um koordinaten zu entnehmen --> return object
  data["1"].config = {
    "color": [63, 136, 143],
    "shape": "CIRCLE",
    "emphasis": {
      "partner": "2"
    }
  }
  data["2"].config = {
    "color": [255, 127, 80],
    "shape": "RECT"
  }
  return data;
}

function setup() {
  loadWithDefaults();
}
function loadWithDefaults() { // damit man nicht immer dasselbe schreiben muss, man hätte auch direkt als global vars schreiben können, dann könnte man aber im Falle der Fälle nicht einfach beliebige Werte einsetzen /// leichter wiederverwendbar
  load(coordinates, zoomFactor, xOffset, yOffset, inputRange.value, showWhiteNow);
}

let xOffset = 60;
let yOffset = 350;



function load(cords, a, xOffset, yOffset, emphasisRelation, showConnectionLines) {
  //background(19, 19, 18);
  createCanvas(windowWidth, windowHeight); // vllt ineffektiver / langsamer --> passt sich aber jedes mal auf die Screenweite an ...
  let data = cords; // habe vorher direkt hier presetCords erfragt und als data gespeichert --> deswegen Übertragung
  let mainEmphasisCoords;
  for (let graphKey in data) { // zweifache for Schleife des selbigen Typs, da erst im Falle die Schwerpunktbahn-Kurve gezeichnet wird, damit diese in den Hintergrund rutscht, egal welches Object welchen Partner angegeben hat
    let graph = data[graphKey];
    let emphasisPartner;
    let meCollection;
    let partnerCollection;
    try {
      meCollection = [graph.x, graph.y]; // collections der Übersichts halber seperat setzen und übertragen
      emphasisPartner = graph.config.emphasis.partner;
      partnerCollection = [data[emphasisPartner].x, data[emphasisPartner].y];
      // bis hier gekommen -> Schwerpunkbahn-Kords benötigt ... // zweifacher draw in einer for - iteration
      mainEmphasisCoords = getCoordsInRelation(meCollection, partnerCollection, emphasisRelation, true);
      drawCoords(mainEmphasisCoords[0], mainEmphasisCoords[1], a, xOffset, yOffset, "CIRCLE", [50, 205, 50]);
    } catch (e) {
      emphasisPartner = undefined;
    }
  }
  for (let graphKey in data) { // key entspricht 1 Object mit x für x-Kords und y für y-Kords
    let graph = data[graphKey];
    let emphasisPartner;
    let partnerCollection;
    try {
      emphasisPartner = graph.config.emphasis.partner;
      // bis hier gekommen -> Schwerpunkbahn-Kords bereits gezeichnet ...
      if (emphasisRelation >= -1 && emphasisRelation <= 1) { // wenn innerhalb der beiden Kurvenpunkte
        partnerCollection = [[data[emphasisPartner].x, data[emphasisPartner].y, [a, xOffset, yOffset]]]; // auf die des Partners setzen mit Extra-Infos
      } else {
        if (emphasisRelation < -1) { // zeichne Verbindungslinien zu Schwerpunktbahn + zum anderen satischen Partner --> weil wenn die Schwerpunkt-Bahn P überstreicht, die andere Linie verschwindet
          partnerCollection = mainEmphasisCoords; // partner - Collection als endgültiges Array aber auch zum umwandeln der Schwerpunktbahnpunkte in ein geeignetes Array --> überträgt sich dann in sich selbst
          partnerCollection.push([a, xOffset, yOffset]);
          partnerCollection = [[data[emphasisPartner].x, data[emphasisPartner].y, [a, xOffset, yOffset]], partnerCollection];
        } else { // sonst zeichne direkt zur Schwerpunktbahn Verbindungslinien
          partnerCollection = mainEmphasisCoords;
          partnerCollection.push([a, xOffset, yOffset]);
          partnerCollection = [partnerCollection];
        }
      }
    } catch (e) {
      emphasisPartner = undefined;
    }
    drawCoords(graph.x, graph.y, a, xOffset, yOffset, graph.config.shape, graph.config.color, emphasisPartner !== undefined && showConnectionLines ? partnerCollection : undefined);
  }
}



let fromPToQ = 0.6;
function getCoordsInRelation(collection1, collection2, relation, fixed) {
  let newCollection = [];
  let allX = [];
  let allY = [];
  for (let i = 0; i < collection1[0].length; ++i) {
    let x1 = collection1[0][i];
    let y1 = collection1[1][i];
    let x2 = collection2[0][i];
    let y2 = collection2[1][i];

    let x1x2 = x2 - x1; // verschiebung zwischen einzelnen Koordinaten bestimmen
    let y1y2 = y2 - y1; // ""
    let relativeMultiplicator = (parseFloat(relation / 2) + 0.5); // direkter Verschiebungsvektor
    let newXC = x1x2 * relativeMultiplicator; // relation hinzufügen zu Verschiebungen --> +0.5 damit sich Mittelpunkt bei 0 befined & / 2 damit 1 / -1 die Endwerte für die Kurven sind und nicht deren abs == 0.5 ist --> allgemein nicht direkt Relation von P zu PQ genommen, damit man einen gleichen Bezugspunkt --> Mittelpunkt 0 zw. PQ
    let newYC = y1y2 * relativeMultiplicator; // ""
    fromPToQ = relativeMultiplicator; // direkter Verschiebungsvektor
    let rounded = Math.round(fromPToQ * 100) / 100; // damit nicht noch mal und nochmal ... berechnet
    document.getElementById("rangeCounterFromP").innerHTML = rounded == fromPToQ ? fromPToQ + " (from P to Q)" : rounded + " (from P to Q) (~)"; // Math.round zum runden von 2 Dezimalsstellen, damit nicht zu große Zahlen, deswegen ~ wenn nicht identische Zahlen
    let newX;
    let newY;
    if (fixed) {
      newX = x1 + newXC; // berechnetes offset zu xy(1) Koordinaten hinzufügen
      newY = y1 + newYC; // ""
    } else {
      newX = x1 + newXC; // berechnetes offset zu xy(1) Koordinaten hinzufügen
      newY = y1 + newYC; // ""
    }

    allX.push(newX);
    allY.push(newY);
    // 
  }
  newCollection.push(allX); // neue Kords hinzufügen zu return-list
  newCollection.push(allY);
  return newCollection;
}
function drawCoords(x, y, a, offsetX, offsetY, shape, color, othersCords) {
  let w = 6; // w === Weite
  //let a = 100; // Streckung bestimmen
  fill(color[0], color[1], color[2]);
  let lastX;
  let lastY;
  for (let i = 0; i < x.length; ++i) {
    let newX = a * x[i] + offsetX; // offset etc anwenden
    let newY = -a * y[i] + offsetY + a / (1 + offsetY / 1000); // - a , da y-koord-achse gespiegelt ist  // a/(1+(offsetY/1000) damit y - offset doch relativ "unveränderlich" zur Streckung / Zoom-Faktor bleibt
    if (i != 0) {
      // Strecken einzeichnen
      // alle Strecken einzeichnen, nach i == 0
      stroke(color[0], color[1], color[2]);
      line(newX, newY, lastX, lastY);
      noStroke();
    }
    lastX = newX; // copy machen von neuen xy - koords um danach Strecken zeichnen zu können
    lastY = newY;

    if (othersCords) { // Verbindungslinien zwischen den unterschiedlichen Kurven entstehend aus P und Q Koordinaten
      for (let o = 0; o < othersCords.length; ++o) { // alle Verbindungsgraphen durchgehen // vllt. später noch Farboptionen hinzufügen
        // muss am Anfang stehen, damit es in den Hintergrund rückt
        stroke(255, 255, 255);
        let oA = othersCords[o][2][0]; // erst schön übersichtlich Daten aus Array übertragen
        let oX = othersCords[o][2][1];
        let oY = othersCords[o][2][2];
        line(newX, newY, oA * othersCords[o][0][i] + oX, -oA * othersCords[o][1][i] + oY + oA / (1 + (oY / 1000)));
        noStroke();
      }
    }

    if (shape === "CIRCLE") {
      // Punktungen einzeichnen
      ellipseMode(CENTER);
      ellipse(newX, newY, w); // offset, Streckung, Koord anwenden
    } else if (shape === "RECT") {
      rectMode(CENTER);
      rect(newX, newY, w, w);
    }


  }
}

function getCoords(data) {
  let obj = {};
  obj = {
    // template
    "1": {
      x: [],
      y: []
    },
    "2": {
      x: [],
      y: []
    }
  };
  let xP = obj["1"].x; // automatisch-übertragend
  let yP = obj["1"].y; // ""

  let xQ = obj["2"].x; // ""
  let yQ = obj["2"].y; // ""

  let table = data.split("*"); // data bei * splitten --> * kennzeichnet line-break und damit neue Koords
  table.forEach((row, index) => {
    // nun jedes Item von table widerum bei ; splitten um die verschiedenen Messpunkte einzugrenzen
    row = row.replaceAll(",", "."); // zu .-trennungs-Zahlenformat wechseln
    row = row.split(";"); // --> Struktur: t/s, xP/m, yP/m, xQ/m, yQ/m
    row.forEach((item, index) => {
      item = parseFloat(item); // einträge von row zu floats parsen, um als Koords mit ihnen arbeiten zu können
      row[index] = item;
    });
    table[index] = row; // table überschreiben --> [[],[]]  // nicht umbedingt notwendig, gibt einem jedoch auch ein Array mit dem man arbeiten könnte

    // Werte aus table passend in obj übertragen
    // Punk P
    xP.push(row[1]);
    yP.push(row[2]);
    // Punk Q
    xQ.push(row[3]);
    yQ.push(row[4]);
  });

  return obj;
}
