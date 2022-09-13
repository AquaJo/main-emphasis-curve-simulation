
function setup() {
  load(0.6);
}
function load(emphasisRelation) {
  createCanvas(1000, 430); // man könnte auch background neu setzen und überschreiben, wäre evt. effizienter --> wegen input range refreshs

  let unsplittedKoords =
    "0,000;0,00;1,30;0,00;0,70* 0,050;-0,03;1,50;0,42;1,11* 0,100;0,12;1,53;0,72;1,60* 0,150;0,51;1,56;0,84;2,05* 0,200;1,03;1,76;0,88;2,34* 0,250;1,49;2,17;0,95;2,43* 0,300;1,74;2,66;1,18;2,43* 0,350;1,76;3,03;1,56;2,46* 0,400;1,71;3,16;2,00;2,63* 0,450;1,77;3,05;2,36;2,93* 0,500;2,07;2,87;2,55;3,23* 0,550;2,56;2,81;2,61;3,41* 0,600;3,07;2,96;2,65;3,39* 0,650;3,41;3,26;2,81;3,23* 0,700;3,51;3,52;3,14;3,05* 0,750;3,46;3,57;3,57;2,98* 0,800;3,46;3,36;3,98;3,06* 0,850;3,66;3,01;4,24;3,19* 0,900;4,09;2,70;4,33;3,25* 0,950;4,62;2,59;4,36;3,13* 1,000;5,04;2,67;4,46;2,83* 1,050;5,23;2,78;4,73;2,46* 1,100;5,23;2,75;5,14;2,16* 1,150;5,18;2,46;5,57;2,00* 1,200;5,29;1,95;5,89;1,94* 1,250;5,64;1,42;6,05;1,87* 1,300;6,15;1,04;6,09;1,64* 1,350;6,64;0,88;6,14;1,22* 1,400;6,92;0,82;6,34;0,68* 1,450;6,98;0,69;6,70;0,16"; // aus dem csv entnommen
  let data = getCoords(unsplittedKoords); // function um koordinaten zu entnehmen --> return object

  // zeichne die Schwerpunkt-Kurve zuerst, damit sie hinter den anderen beiden Kurven ist, ... --> schönerer Effekt beim überlappen (emphasisRelation == 0 || 1)
  let pCollection = [data.xP, data.yP];
  let qCollection = [data.xQ, data.yQ];

  let mainEmphasisCoords = getCoordsInRelation(pCollection, qCollection, emphasisRelation);
  drawCoords(mainEmphasisCoords[0], mainEmphasisCoords[1], "CIRCLE", [50, 205, 50])

  // zeichne nun gegebene Koordinaten mit Verbindungslinien für P und Q
  drawCoords(data.xP, data.yP, "CIRCLE", [63, 136, 143]/*, [data.xQ,data.yQ]*/); // letzter Parameter : andere Koordinaten mit überliefern um Verbindungslinien zwischendrinnen zu machen --> in einem Array aufgrund der Parameteranzahl
  drawCoords(data.xQ, data.yQ, "RECT", [255, 127, 80]); // letzer Parameter darf undefined bleiben
}


// auf input change hören
let inputRange = document.getElementById("inputByMe");
inputRange.value = "0.6";
inputRange.addEventListener('input', (event) => {
  let val = inputRange.value;
  document.getElementById("rangeCounter").innerHTML = val;
  load(val);
}); // input als id wurde von p5js reserviert / blockiert

function getCoordsInRelation(collection1, collection2, relation) {
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

    let newXC = x1x2 * relation; // relation hinzufügen zu Verschiebungen --> auf welchem Prozent der Stecke PQ soll sich die neue Koordinate befinden
    let newYC = y1y2 * relation; // ""

    let newX = x1 + newXC; // berechnetes offset zu xy(1) Koordinaten hinzufügen
    let newY = y1 + newYC; // ""

    allX.push(newX);
    allY.push(newY);
    // 
  }
  newCollection.push(allX, allY); // neue Kords hinzufügen zu return-list
  return newCollection;
}
function drawCoords(x, y, shape, color, othersCords) {
  let w = 6; // w === Weite
  let a = 100; // Streckung bestimmen
  let offsetX = 60; // offsets für gleichen Abstand vom Rand
  let offsetY = a * Math.max(...y) + 60; // + a*MaxY --> da bei der Ellipsenerstellung - diese Höhe gegangen wird
  fill(color[0], color[1], color[2]);
  let lastX;
  let lastY;
  for (let i = 0; i < x.length; ++i) {
    let newX = a * x[i] + offsetX; // offset etc anwenden
    let newY = -a * y[i] + offsetY; // - a , da y-koord-achse gespiegelt ist
    if (i != 0) {
      // Strecken einzeichnen
      // alle Strecken einzeichnen, nach i == 0
      stroke(color[0], color[1], color[2]);
      line(newX, newY, lastX, lastY);
      //console.log(x[i] + "  " + x[i - 1]);
      noStroke();
    }
    lastX = newX; // copy machen von neuen xy - koords um danach Strecken zeichnen zu können
    lastY = newY;

    if (othersCords) { // Verbindungslinien zwischen den unterschiedlichen Kurven entstehend aus P und Q Koordinaten
      // muss am Anfang stehen, damit es in den Hintergrund rückt
      console.log("y");
      stroke(255, 255, 255);
      let offsetY = a * Math.max(...othersCords[1]) + 60; // selbiges Prozedere, bloß für die anderen y-Koordinaten
      line(newX, newY, a * othersCords[0][i] + offsetX,-a * othersCords[1][i] + offsetY);
      noStroke();
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
    xP: [],
    yP: [],
    xQ: [],
    yQ: [],
  };
  let xP = obj.xP; // automatisch-übertragend
  let yP = obj.yP; // ""

  let xQ = obj.xQ; // ""
  let yQ = obj.yQ; // ""

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
