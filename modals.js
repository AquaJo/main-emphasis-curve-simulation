let mainModal = document.getElementById("mainModal");
let mainModalText = document.getElementById("mainModalText");
let mainModalTitle = document.getElementById("mainModalTitle");
let mainModalFooterBtn1 = document.getElementById("mainModalFooterBtn1");
let mainModalFooterBtn2 = document.getElementById("mainModalFooterBtn2");
let mainModalInputRange = document.getElementById("mainModalInputRange");
let mainModalSplitMode = document.getElementById("mainModalSplitMode");
let mainModalCSVEdit = document.getElementById("mainModalCSVEdit");
let modalDialog = document.getElementById("modalDialog");
let csvTable = document.getElementById("CSVTable")
mainModal.addEventListener('hidden.bs.modal', detectModalClose); // auf modal-Schließung hören
function detectModalClose() {
    // modal resetten
    mainModalFooterBtn1.style.display = "block";
    mainModalFooterBtn2.style.display = "block";
    mainModalInputRange.style.display = "none";
    mainModalSplitMode.style.display = "none";
    mainModalCSVEdit.style.display = "none";
    mainModalText.style.height = "160px";
    mainModalText.style.overflow = "none";
    modalDialog.classList.remove("modal-lg");
    createButtonCsvEdit.innerHTML = "Create new Graph";
    if (!csvTable.classList.contains("table-striped")) {
        csvTable.classList.add("table-striped");
    }
    csvEditContinueBtn.style.display = "none";
    for (let i = 0; i < tempGraphs.length; ++i) {
        for (let j = 0; j < csvEditListGroup.length; ++j) {
            if (csvEditListGroup[j].returnCsvEditModeGraphName() === tempGraphs[i]) {
                csvEditListGroup[j].csvEditModeDelete();
                break;
            }
        }
    }
}
document.getElementById("editInput").addEventListener("click", () => { // für den input-range - Modal-Dialog
    mainModalTitle.innerHTML = "set input range";
    mainModalFooterBtn1.style.display = "none";
    mainModalFooterBtn2.innerHTML = "apply";
    mainModalInputRange.style.display = "block";
    let myInput = document.getElementById("mainModalInputRangeNumberInput");
    myInput.value = parseInt(inputRange.max);
    mainModalFooterBtn2.addEventListener("click", clicked);
    mainModal.addEventListener('hidden.bs.modal', detectModalClose); // auf mainModal-Schließung hören um private listener zu entfernen + auch diesen wieder
    function clicked() { // neuen Input Wert setzen --> dabei wenn vorheriger Wert zu gr0 für neuen Bereich, reset auf neuen nähesten Wert
        if (abs(inputRange.value) > abs(myInput.value)) {
            inputRange.value = inputRange.value >= 0 ? abs(myInput.value) : -abs(myInput.value);
            loadWithDefaults();
            rangeCounter.innerHTML = inputRange.value;
        }
        inputRange.max = abs(myInput.value);
        inputRange.min = - abs(myInput.value);
    }
    function detectModalClose() {
        mainModalFooterBtn2.removeEventListener("click", clicked); // immer direkt löschen --> keine Doppelten bei neuen Klicks
        mainModal.removeEventListener('hidden.bs.modal', detectModalClose);
    }

    $('#mainModal').modal('show');
})

let splitModesList = []; // bereits hier deklarieren, damit immer die einzelnen Instanzen bei Aufrufen von showSplitOptionModal() gelöscht werden können
function showSplitOptionModal(rawData) {
    mainModalTitle.innerHTML = "set csv filter method";
    splitModesList.forEach((elm) => {
        elm.delete();
    })
    splitModesList = [];
    document.getElementById("mainModalSplitMode").style.display = "block";
    let options = ["splitting via ';'", "splitting via ','"];
    for (let i = 0; i < options.length; ++i) {
        splitModesList.push(new BootstrapList("listGroupSplitMode", null, options[i], i));
        splitModesList[i].create(splitModesList);
        splitModesList[i].onClick_Listener("hideOthers");
    }
    splitModesList[0].click();
    mainModalFooterBtn1.style.display = "none";

    mainModalFooterBtn2.addEventListener("click", clicked);
    mainModal.addEventListener('hidden.bs.modal', detectModalClose); // auf mainModal-Schließung hören um private listener zu entfernen + auch diesen wieder
    let csvArray;
    function clicked() { // modus anwenden
        // Ergebnis (aktiv / aus) der Liste ausmachen
        let mode;
        for (let i = 0; i < splitModesList.length; ++i) {
            if (splitModesList[i].result() !== null) {
                if (i == 0) {
                    mode = ";";
                } else {
                    mode = ",";
                }
                break;
            }
        }

        csvArray = CSVToArray(rawData, mode);
        CSVArray = csvArray;
    }
    function detectModalClose() {
        mainModalFooterBtn2.removeEventListener("click", clicked); // immer direkt löschen --> keine Doppelten bei neuen Klicks
        mainModal.removeEventListener('hidden.bs.modal', detectModalClose);
        if (csvArray) { // zeight an ob geklcikt wurde oder nicht
            showCSVEditModal(); // hier aufrufen, da innerhalb clicked() zu früh ist um selbigen Modal neu aufzurufen ohne unzuverlässigen timeout
        }
    }


    $('#mainModal').modal('show');
}

let CSVArray;



let graphNames = [];
function showCSVEditModal() {
    mainModalTitle.innerHTML = "set graphs from csv";
    mainModalCSVEdit.style.display = "block";
    mainModalText.style.height = (screen.availHeight * 0.7).toString() + "px";
    mainModalFooterBtn2.innerHTML = "Create";
    mainModalFooterBtn1.innerHTML = "Cancel";
    modalDialog.classList.add("modal-lg");
    arrayToBootstrapTable(CSVArray, document.getElementById("CSVTable"), "mainTable");
    $('#mainModal').modal('show');
    mainModal.addEventListener('hidden.bs.modal', detectModalClose);
    mainModalFooterBtn2.addEventListener("click", createClick);
    //coordinates, zoomFactor, xOffset, yOffset, inputRange.value, showWhiteNow, showAxes
    function createClick() {
        tempGraphs = [];
        if (graphNames.length > 0) {
            let objRes = {};
            let counter = 0;
            for (let element of csvEditListGroup) {
                counter++;
                let obj = element.returnCsvEditModeGraph();
                // auf dieses Format bringen
                let color = obj.color;
                let shape = obj.shape;
                let numberString = counter.toString();
                objRes[obj.uniqueNum] = {};
                objRes[obj.uniqueNum].x = obj.x;
                objRes[obj.uniqueNum].y = obj.y;
                objRes[obj.uniqueNum].config = {
                    "color": color,
                    "shape": shape,
                    /*"emphasis": {
                      "partner": "2"
                    }*/
                }
                if (obj.emphasisPartner !== undefined) {
                    let emphasisObj = objRes[obj.uniqueNum].config.emphasis = {};
                    emphasisObj.partner = obj.emphasisPartner;
                }
                /*objRes = {
                    // template
                    "1": {
                        x: [],
                        y: []
                    },
                    "2": {
                        x: [],
                        y: []
                    }
                };*/


            }
            console.log(objRes);
            coordinates = objRes;
            loadWithDefaults();
        }
        document.getElementById("PCORDS").style.display = "none";
        document.getElementById("QCORDS").style.display = "none";
        document.getElementById("CONNECTIONLINES").innerHTML = "connection lines";
    }
    function detectModalClose() {
        mainModalFooterBtn2.removeEventListener("click", createClick);
        mainModal.removeEventListener('hidden.bs.modal', detectModalClose);
        csvTableAddListeners("mainTable", CSVArray, true);
    }

}

let createButtonCsvEdit = document.getElementById("btn_createNewGraph");
let csvEditContinueBtn = document.getElementById("btn_csvEditContinue");

let xSelection = [];
let ySelection = [];
let editCsvMode;

let csvEditListGroup = [];

createButtonCsvEdit.addEventListener("click", () => {
    csvEditContinueBtn = document.getElementById("btn_csvEditContinue"); // wegen replace
    if (!(createButtonCsvEdit.innerHTML === "Cancle")) {
        createButtonCsvEdit.innerHTML = "Cancle";
        let graphName = prompt("Please add a graph name for simplicity");
        while (graphName !== null && (graphNames.includes(graphName) || graphName.length > 30)) {
            alert("Please choose a different graph-name");
            graphName = prompt("Please add a graph name for simplicity");
        }
        let graphColor = null;
        let graphColors;
        let shape = null;
        if (graphName !== null) {
            graphColor = prompt("Please set rgb color for graph (like this: '50,205,50', so (0<=int<=255, 0<=int<=255, 0<=int<=255))");
            if (graphColor !== null) {
                graphColors = graphColor.split(",");
                while (graphColors.length != 3 || !Number.isInteger(parseInt(graphColors[0])) || !Number.isInteger(parseInt(graphColors[1])) || !Number.isInteger(parseInt(graphColors[2])) || parseInt(graphColors[0]) > 255 || parseInt(graphColors[0]) < 0 || parseInt(graphColors[1]) > 255 || parseInt(graphColors[1]) < 0 || parseInt(graphColors[2]) > 255 || parseInt(graphColors[2]) < 0) { // hätte auch vorher parseInt machen können ...
                    alert("Please follow the syntax");
                    graphColor = prompt("Please set rgb color for graph (like this: '50,205,50', so (0<=int<=255, 0<=int<=255, 0<=int<=255))");
                    if (graphColor !== null) {
                        graphColors = graphColor.split(",");
                    } else {
                        break;
                    }
                }
                if (graphColor !== null) {
                    shape = prompt("Please choose a marking shape choose between 'circle' and 'rectangle'");
                    if (shape !== null) {
                        while (shape !== "rectangle" && shape !== "circle") {
                            if (shape !== null) {
                                alert("Please type the exact letters");
                                shape = prompt("Please choose a marking shape choose between 'circle' and 'rectangle'");
                            } else {
                                break;
                            }
                        }
                    }
                }
            }
        }
        if (graphName !== null && graphColor !== null && shape !== null) {
            csvTable.classList.remove("table-striped");
            alert("Now choose x - coordinates from one column for your graph, " + graphName + ", by clicking table cells");
            editCsvMode = "x";
            csvTableAddListeners("mainTable", CSVArray);
            csvEditContinueBtn.style.display = "block";
            csvEditContinueBtn.addEventListener("click", continueClicked);
            function continueClicked() {
                let arr = getTableResultFromArray("mainTable", CSVArray)
                if (checkNumbers(arr)) {
                    if (editCsvMode === "x") {
                        alert("Now select y-values for your graph, " + graphName);
                        editCsvMode = "y";
                        xSelection = arr;
                    } else {
                        alert("Graph, " + graphName + ", successfully made! Feel free to add a main emphasis curve or delete this graph again");
                        ySelection = arr;
                        // Listen-Element hinzufügen
                        graphNames.push(graphName);
                        let index = csvEditListGroup.length;
                        csvEditListGroup.push(new BootstrapList("csvEditListGroup", null, graphName, index));
                        csvEditListGroup[index].create(csvEditListGroup);
                        csvEditListGroup[index].activate();
                        csvEditListGroup[index].csvEditMode(xSelection, ySelection, [parseInt(graphColors[0]), parseInt(graphColors[1]), parseInt(graphColors[2])], shape, graphName);
                        cancle();
                    }
                } else {
                    alert("Please only select numbers type float");
                }
                setFullTableToBackground("mainTable", CSVArray, [33, 37, 41]);
            }
        } else {
            cancle();
        }
    } else {
        cancle()
    }
    function cancle() {
        setFullTableToBackground("mainTable", CSVArray, [33, 37, 41]);
        if (!csvTable.classList.contains("table-striped")) {
            csvTable.classList.add("table-striped");
        }
        createButtonCsvEdit.innerHTML = "Create new Graph";
        csvEditContinueBtn.style.display = "none";
        //csvEditContinueBtn.removeEventListener("click", continueClicked); --> copy damit funktioniert
        let elClone = csvEditContinueBtn.cloneNode(true);
        try {
            csvEditContinueBtn.parentNode.replaceChild(elClone, csvEditContinueBtn);
        } catch (e) {

        }
        csvTableAddListeners("mainTable", CSVArray, true)
    }
    mainModal.addEventListener('hidden.bs.modal', detectModalClose);
    function detectModalClose() {
        mainModal.removeEventListener('hidden.bs.modal', detectModalClose);
        cancle();
    }
})
function checkNumbers(array) {
    if (array.length > 0) {
        for (let i = 0; i < array.length; ++i) {
            let item = array[i];
            item = item.replaceAll(",", ".");
            let num = parseFloat(item);
            if (isNaN(num)) {
                return false;
            } else {
                console.log("accepted: " + num);
            }
        }
        return true;
    } else {
        return false;
    }
}

let csvTableDiv = document.getElementById("CSVTableDiv");
// automatisches scrollen bei Tabellen-Div aktivieren
let scrollMode = null;
let scrollSpeed = 1;
let scrollSpeedBase = 6; // = max. Scroll-Speed
csvTableDiv.addEventListener("mousemove", async (event) => { // scroll - Modus herausfinden + while Schleife für scrollen
    let bounds = csvTableDiv.getBoundingClientRect();
    //console.log(bounds);
    let y = event.pageY;
    let x = event.pageX;
    let offset = 50;

    let downScrollInterval;
    let upScrollInterval;
    let leftScrollInterval;
    let rightScrollInterval;
    if (y > bounds.bottom - offset) {
        scrollSpeed = scrollSpeedBase * (1 - (bounds.bottom - y) / offset); // scrollSpeedBase mit multiplikator von 0-1 spielen lassen
        if (scrollMode !== "bottom") {
            scrollMode = "bottom";
            downScrollInterval = setInterval(downScrolling, 7); // (!)
            function downScrolling() {
                if (scrollMode === "bottom" && mouseDown) {
                    csvTableDiv.scrollBy({ top: scrollSpeed });
                } else {
                    clearInterval(downScrollInterval);
                }
            }
        }
    } else if (y < bounds.top + offset) {
        scrollSpeed = scrollSpeedBase * (1 - (y - bounds.top) / offset);
        if (scrollMode !== "top") {
            scrollMode = "top";
            upScrollInterval = setInterval(upScrolling, 7); // (!)
            function upScrolling() {
                if (scrollMode === "top" && mouseDown) {
                    csvTableDiv.scrollBy({ top: -scrollSpeed });
                } else {
                    clearInterval(upScrollInterval);
                }
            }
        }
    } else if (x > bounds.right - offset) {
        scrollSpeed = scrollSpeedBase * (1 - (bounds.right - x) / offset);
        if (scrollMode !== "right") {
            scrollMode = "right";
            rightScrollInterval = setInterval(rightScrolling, 7); // (!)
            function rightScrolling() {
                if (scrollMode === "right" && mouseDown) {
                    csvTableDiv.scrollBy({ left: scrollSpeed });
                } else {
                    clearInterval(rightScrollInterval);
                }
            }
        }
    } else if (x < bounds.left + offset) {
        scrollSpeed = scrollSpeedBase * (1 - (x - bounds.left) / offset);
        if (scrollMode !== "left") {
            scrollMode = "left";
            leftScrollInterval = setInterval(leftScrolling, 7); // (!)
            function leftScrolling() {
                if (scrollMode === "left" && mouseDown) {
                    csvTableDiv.scrollBy({ left: -scrollSpeed });
                } else {
                    clearInterval(leftScrollInterval);
                }
            }
        }
    } else {
        scrollMode = null;
    }
})

//
// events for csvTableAddListeners

function csvTableAddListeners(key, array, remove) { // key vom Erstellen des Tables benötigt, + array mit dem gearbeitet wurde
    let currentRow = 0;
    if (remove) {
        let longestElm = 0;
        array.forEach((elm) => { // einaml durchlaufen um längstes array herauszufinden
            if (elm.length > longestElm) {
                longestElm = elm.length;
            }
        })
        for (let i = 0; i < array.length; ++i) {
            for (let j = 0; j < longestElm; ++j) {
                let element = document.getElementById(key + "_tableTD-" + i + "," + j);
                if (element) {
                    let elClone = element.cloneNode(true);

                    element.parentNode.replaceChild(elClone, element); // durch copy ersetzen um listener zu löschen
                    /*element.removeEventListener("mouseover", mouseOver); // hat nicht funktioniert methoden vermutlich nicht erreichbar
                    element.removeEventListener("mouseleave", mouseLeave);
                    element.removeEventListener("mousedown", mouseDownEvent);*/
                }
            }
        }
    } else {

        let longestElm = 0;
        array.forEach((elm) => { // einaml durchlaufen um längstes array herauszufinden
            if (elm.length > longestElm) {
                longestElm = elm.length;
            }
        })

        for (let i = 0; i < array.length; ++i) {
            for (let j = 0; j < longestElm; ++j) {
                let element = document.getElementById(key + "_tableTD-" + i + "," + j);
                if (element) {
                    let backgroundColorBefore = getComputedStyle(element).backgroundColor;
                    element.addEventListener("mouseover", mouseOver);
                    let mouseOverStill = false;
                    function mouseOver() {
                        mouseOverStill = true;
                        if (mouseDown) {
                            let backgroundColor = window.getComputedStyle(element).backgroundColor;
                            if (backgroundColor === "rgb(11,94,215)" || backgroundColor === "rgb(11, 94, 215)") {
                                element.style.backgroundColor = backgroundColorBefore;
                            } else {
                                element.style.backgroundColor = "rgb(11,94,215)";
                                checkColumns(element.id);
                            }
                        }
                    }
                    element.addEventListener("mouseleave", mouseLeave);
                    function mouseLeave() {
                        mouseOverStill = false;
                    }
                    element.addEventListener("mousedown", mouseDownEvent);
                    function mouseDownEvent() {
                        if (mouseOverStill) {
                            let backgroundColor = window.getComputedStyle(element).backgroundColor;
                            if (backgroundColor === "rgb(11,94,215)" || backgroundColor === "rgb(11, 94, 215)") {
                                element.style.backgroundColor = backgroundColorBefore;
                            } else {
                                element.style.backgroundColor = "rgb(11,94,215)";
                                checkColumns(element.id);
                            }
                        }
                    }
                    function checkColumns(id) {
                        let mainArrInd = parseInt(id.split("-")[1].split(",")[0]);
                        let subArrInd = parseInt(id.split("-")[1].split(",")[1]);
                        if (subArrInd != currentRow) {
                            // set background to backgroundColorBefore for all items of column before
                            for (let i = 0; i < array.length; ++i) {
                                let element = document.getElementById(key + "_tableTD-" + i + "," + currentRow);
                                if (element) {
                                    element.style.backgroundColor = backgroundColorBefore;
                                }
                            }
                            currentRow = subArrInd;
                        }
                    }
                }
            }
        }
    }
}
function setFullTableToBackground(key, array, color) {
    let longestElm = 0;
    array.forEach((elm) => { // einaml durchlaufen um längstes array herauszufinden
        if (elm.length > longestElm) {
            longestElm = elm.length;
        }
    })
    let res = [];
    for (let i = 0; i < array.length; ++i) {
        for (let j = 0; j < longestElm; ++j) {
            let element = document.getElementById(key + "_tableTD-" + i + "," + j);
            if (element) {
                element.style.backgroundColor = "rgb(" + color[0] + ", " + color[1] + ", " + color[2] + ")";
            }
        }
    }
}
function getTableResultFromArray(key, array) { // return alle markierten items der Reihe
    let longestElm = 0;
    array.forEach((elm) => { // einaml durchlaufen um längstes array herauszufinden
        if (elm.length > longestElm) {
            longestElm = elm.length;
        }
    })
    let res = [];
    for (let i = 0; i < array.length; ++i) {
        for (let j = 0; j < longestElm; ++j) {
            let element = document.getElementById(key + "_tableTD-" + i + "," + j);
            if (element) {
                let backgroundColor = window.getComputedStyle(element).backgroundColor;
                if (backgroundColor === "rgb(11,94,215)" || backgroundColor === "rgb(11, 94, 215)") {
                    res.push(array[i][j]);
                }
            }
        }
    }
    return res;
}

function arrayToBootstrapTable(tableElm, bootstrapElm, key) {
    // alle children von parent entfernen
    try { // wenn noch keine elemente vorhaben --> 1 . Mal
        [...bootstrapElm.childNodes].forEach(el => el.remove());
    } catch (e) {

    }
    let longestElm = 0;
    tableElm.forEach((elm) => { // einaml durchlaufen um längstes array herauszufinden und Lücken im Vorherein zu füllen
        if (elm.length > longestElm) {
            longestElm = elm.length;
        }
    })
    let tbody = document.createElement("tbody");
    for (let i = -1; i < tableElm.length; ++i) {
        let tr = document.createElement("tr");
        let th = document.createElement("th");
        th.setAttribute("scope", "row");
        th.innerHTML = i + 1; // Zeilenindex
        tr.appendChild(th);
        if (i == -1) {
            for (let i = 0; i < longestElm; ++i) {
                let th = document.createElement("th");
                th.setAttribute("scope", "col");
                th.innerHTML = i + 1;
                tr.appendChild(th);
                tbody.appendChild(tr);
            }
        } else {
            tableElm[i].forEach((data, index) => {
                let td = document.createElement("td");
                td.innerHTML = data === "" || data === "\r" ? "-" : data;
                td.setAttribute("scope", "row");
                td.setAttribute("id", td.innerHTML === "-" ? key + "_tableTDNotNeeded" : key + "_tableTD-" + i + "," + index); // id setzen um später mit listener arbeiten zu können --> y,x --> Array Element, Array Element in parent Array
                tr.appendChild(td);
            });

            let rowLength = tableElm[i].length;
            if (rowLength < longestElm) { // mögliche Lücken füllen
                for (let i = 0; i < longestElm - rowLength; ++i) {
                    let td = document.createElement("th");
                    td.innerHTML = "-";
                    td.setAttribute("scope", "row");
                    tr.appendChild(td);
                }
            }
            tbody.appendChild(tr);
        }
    }
    bootstrapElm.appendChild(tbody);
}