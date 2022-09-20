
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
}