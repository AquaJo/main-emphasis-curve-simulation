
class BootstrapList { // Klasse von meinem anderen Project übernommen + leicht modifiziert 
    constructor(_listID, _key, _title, _index) {
        this.mainList = document.getElementById(_listID);
        this.key = _key;
        this.element;
        this.title;
        this.uniqueID = null;
        this.directTitle = _title;
        this.index = _index;
        this.meArray;

        this.csvEditShape;
        this.csvEditColor;
        this.csvEditX;
        this.csvEditY;
        this.csvEditGraphName;
        this.csvEditPartnerNum = null;
        this.csvEditPartnerName;
    }
    async create(_meArray) {
        this.meArray = _meArray;
        let title;
        let uniqueID; //
        if (this.directTitle === undefined) { // brauche keine Verbindung hierbei zur hue bridge (rest API)
            await getData("http://" + bridgeIP + "/api/" + apiKey + "/lights/" + this.key, settings.fetchTime) // 200 --> maybe higher
                .then(async (data) => {
                    //get basic information + set global for this obj
                    title = data["name"];
                    uniqueID = data["uniqueid"];
                });
            this.title = title;
            this.uniqueID = uniqueID;
        } else {
            this.title = this.directTitle;
        }
        let listItemClone = document.getElementById("list_addRom_AExample").cloneNode(true); // copy paste code here would also work .... ..
        listItemClone.classList.remove("hiddenOwn");
        listItemClone.classList.remove("active");
        listItemClone.classList.add("normal");
        listItemClone.innerHTML = this.title;
        this.mainList.append(listItemClone);

        this.element = listItemClone;
    }

    onClick_Listener(mode) {
        let self = this;
        this.element.addEventListener("click", function () {
            if (self.element.classList.contains("active")) {
                if (mode !== "hideOthers") {
                    self.element.classList.remove("active");
                    self.element.classList.add("normal");
                }
            } else {
                if (mode === "hideOthers") {
                    for (let elements of self.meArray) {
                        elements.deactivate();
                    }
                }
                self.element.classList.add("active");
                self.element.classList.remove("normal");
            }
        })
    }
    activate() {
        if (!this.element.classList.contains("active")) {
            this.element.classList.add("active");
            this.element.classList.remove("normal");
        }
    }
    deactivate() {
        if (this.element.classList.contains("active")) {
            this.element.classList.remove("active");
            this.element.classList.add("normal");
        }
    }
    click() {
        this.element.click();
    }
    result(mode) {
        if (this.element.classList.contains("active")) {
            if (mode !== "index") {
                return this.uniqueID === null ? this.title : this.uniqueID;
            } else {
                return this.index;
            }
        } else {
            return null;
        }
    }
    delete() {
        try {
            this.element.remove();
        } catch (err) {

        }
    }
    returnCsvEditModeGraph() {
        let obj = {};
        obj.color = this.csvEditColor;
        obj.x = this.csvEditX;
        obj.y = this.csvEditY;
        if (this.csvEditShape === "circle") {
            obj.shape = "CIRCLE";
        } else {
            obj.shape = "RECT";
        }
        if (this.csvEditPartnerNum !== null) {
            obj.emphasisPartner = this.csvEditPartnerNum;
        }
        return obj;
    }
    returnCsvEditModeGraphName() {
        return this.csvEditGraphName;
    }
    csvEditModeRefreshPartnerNum() { // aufgerufen von anderen Instanzen bei Löschung
        if (this.csvEditPartnerNum !== null) {
            if (graphNames.includes(otherName)) {
                for (let i = 0; i < csvEditListGroup.length; ++i) { // vielleicht nicht der schönste Weg innerhalb einer Klasse ...
                    if (csvEditListGroup[i].returnCsvEditModeGraphName === otherName) {
                        this.csvEditPartnerNum = i + 1; // da ab 1 anfängt (obj für coordinates)
                        this.csvEditPartnerName = otherName;
                    }
                }
            } else {
                this.csvEditPartnerNum = null;
                this.csvEditPartnerName = undefined;
            }
        }
    }
    csvEditMode(x, y, color, shape, graphName) {
        this.csvEditGraphName = graphName;
        let xNew = [];
        for (let i = 0; i < x.length; ++i) { // x und y von String array zu float Array
            x[i] = x[i].replaceAll(",", ".");
            xNew.push(parseFloat(x[i]));
        }
        let yNew = [];
        for (let i = 0; i < y.length; ++i) {
            y[i] = y[i].replaceAll(",", ".");
            yNew.push(parseFloat(y[i]));
        }
        this.csvEditShape = shape;
        this.csvEditColor = color;
        this.csvEditX = xNew;
        this.csvEditY = yNew;
        let createEmphasisCurveClone = document.getElementById("createEmphasisCurve").cloneNode(true);
        let trashbinClone = document.getElementById("trashBin").cloneNode(true);
        this.element.append(createEmphasisCurveClone);
        this.element.append(trashbinClone);
        this.element.classList.add("exampelListCSVEDIT")
        createEmphasisCurveClone.style.display = "block";
        trashbinClone.style.display = "block";
        let self = this;
        trashbinClone.addEventListener("click", () => {
            graphNames.splice(graphNames.indexOf(self.title), 1);
            for (let i = 0; i < csvEditListGroup.length; ++i) {
                this.csvEditListGroup[i].csvEditModeRefreshPartnerNum();
            }
            self.delete();
        })
        createEmphasisCurveClone.addEventListener("click", () => {
            let otherName = prompt("Please type the graphs partner name here (must be declared in this dialog, else feel free to reload and rebuild ... (maybe gets improved in the future))");
            if (prompt !== null) {
                while (!graphNames.includes(otherName) && otherName !== null) {
                    alert("Please type the right name");
                    otherName = prompt("Please type the graphs partner name here (must be declared in this dialog, else feel free to reload and rebuild ... (maybe gets improved in the future))");
                }
                if (otherName !== null) {
                    for (let i = 0; i < csvEditListGroup.length; ++i) { // vielleicht nicht der schönste Weg innerhalb einer Klasse ...
                        if (csvEditListGroup[i].returnCsvEditModeGraphName() === otherName) {
                            self.csvEditPartnerNum = i + 1; // da ab 1 anfängt (obj für coordinates)
                            self.csvEditPartnerName = otherName;
                            console.log("set partner");
                        }
                    }
                }
            }
        })
    }
}