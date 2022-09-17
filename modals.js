
let mainModal = document.getElementById("mainModal");
let mainModalText = document.getElementById("mainModalText");
let mainModalTitle = document.getElementById("mainModalTitle");
let mainModalFooterBtn1 = document.getElementById("mainModalFooterBtn1");
let mainModalFooterBtn2 = document.getElementById("mainModalFooterBtn2");
let mainModalInputRange = document.getElementById("mainModalInputRange");
let mainModalSplitMode = document.getElementById("mainModalSplitMode");
let mainModalCSVEdit = document.getElementById("mainModalCSVEdit");
let modalDialog = document.getElementById("modalDialog");
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
    }
    function detectModalClose() {
        mainModalFooterBtn2.removeEventListener("click", clicked); // immer direkt löschen --> keine Doppelten bei neuen Klicks
        mainModal.removeEventListener('hidden.bs.modal', detectModalClose);
        if (csvArray) { // zeight an ob geklcikt wurde oder nicht
            showCSVEditModal(csvArray); // hier aufrufen, da innerhalb clicked() zu früh ist um selbigen Modal neu aufzurufen ohne unzuverlässigen timeout
        }
    }


    $('#mainModal').modal('show');
}

function showCSVEditModal(csvArray) {
    mainModalTitle.innerHTML = "set graphs from csv";
    mainModalCSVEdit.style.display = "block";
    mainModalText.style.height = (screen.availHeight * 0.7).toString() + "px";
    mainModalFooterBtn2.innerHTML = "Create";
    mainModalFooterBtn1.innerHTML = "Cancel";
    modalDialog.classList.add("modal-lg");
    mainModalText.style.overflow;
    arrayToBootstrapTable(csvArray, document.getElementById("CSVTable"));
    $('#mainModal').modal('show');

}

function arrayToBootstrapTable(tableElm, bootstrapElm) {
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
    for (let i = 0; i < tableElm.length; ++i) {
        if (i == -1) {
            // Title der einzelnen Spalten setzen
            let thead = document.createElement("thead"); // einzelne Elemente erstellen + an die parents anhängen
            let tr = document.createElement("tr");
            let th = document.createElement("th");
            th.innerHTML = "#";
            th.setAttribute("scope", "col");
            tr.appendChild(th);
            tableElm[i].forEach((data) => {
                th = document.createElement("th");
                th.innerHTML = data === "" || data === "\r" ? "-" : data;
                th.setAttribute("scope", "col");
                tr.appendChild(th);
            });
            let headerLength = tableElm[i].length;
            if (headerLength < longestElm) { // mögliche Lücken füllen
                for (let i = 0; i < longestElm - headerLength; ++i) {
                    th = document.createElement("th");
                    th.innerHTML = "-";
                    th.setAttribute("scope", "col");
                    tr.appendChild(th);
                }
            }
            thead.appendChild(tr)
            bootstrapElm.appendChild(thead);
        } else {
            let tr = document.createElement("tr");
            let th = document.createElement("th");
            th.setAttribute("scope", "row");
            th.innerHTML = i; // Zeilenindex
            tr.appendChild(th);

            tableElm[i].forEach((data) => {
                let td = document.createElement("td");
                td.innerHTML = data === "" || data === "\r" ? "-" : data;
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