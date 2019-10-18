var tickSpeed = 1000;

class Resource {
    name = "";
    count = 0;
    cost = {};
    spawnRate = 0;
    autobuyer = 0;
    autobuyerSpeed = 0.01;
    autobuyerCost = 0;
    successfulAutobuys = 0;
    unlock = false;
    autobuyerUnlock = false;
    modifier = 1;
    resourceUsage = {};
    constructor(_name, _cost, _spawnRate, _autobuyerSpeed, _autobuyerCost) {
        this.name = _name;
        this.cost = _cost;
        this.spawnRate = _spawnRate;
        this.autobuyerSpeed = _autobuyerSpeed;
        this.autobuyerCost = _autobuyerCost;
    }
    canBuy() {
        var canBuy = true;
        for (var item in this.cost) {
            var resourceCount = resources[item].count;
            if (resourceCount < this.cost[item]) {
                canBuy = false;
            }
        }
        
        return canBuy;
    }
    click() {
        
        if (this.canBuy()) {
            this.count++;
            for (var item in this.cost) {
                resources[item].count = resources[item].count - this.cost[item];
            }
        }

        this.updateCount();
    }
    autobuyerClick() { //TODO: make less resource intensive
        
        if (this.canBuy()) {
            this.count += this.autobuyerSpeed;
            for (var item in this.cost) {
                resources[item].count = resources[item].count - (this.cost[item] * this.autobuyerSpeed);
            }
        }

        this.updateCount();
    }
    spawn() {
        if (!mass.isFull) {
            var spawnNum = this.count * this.spawnRate;
            this.count += spawnNum;
        }

        this.successfulAutobuys = 0;
        for (var i = 0; i < this.autobuyer; i++) {
            if (this.canBuy()) {
                
                this.autobuyerClick();
                this.successfulAutobuys++;
            }
        }

        for (var item in this.cost) {
            resources[item].resourceUsage[this.name] = this.successfulAutobuys * this.autobuyerSpeed * this.cost[item];
        }
        

        this.update();
    }
    autobuyerPlus() { //Currently autobuyers all cost quarks
        if (Quark.count >= this.autobuyerCost) {
            Quark.count -= this.autobuyerCost;
            this.autobuyer++;
            this.update();
        }
    }
    autobuyerMinus() {
        if (this.autobuyer > 0) {
            this.autobuyer--;
            this.update();
        }
    }
    calculateSpeed() {
        var totalSpeed = 0;
        if (!mass.isFull) {
            totalSpeed = this.spawnRate * this.count;
        }
        totalSpeed += this.successfulAutobuys * this.autobuyerSpeed;
        for (var item in this.resourceUsage) {
            totalSpeed -= this.resourceUsage[item];
        }

    

        return totalSpeed;
    }
    update() {
        //Update Prices
        var priceText = "";
        for (var price in this.cost) {
            priceText += this.cost[price] + " " + price;
            if (this.cost[price] > 1) {priceText += "s";}
            priceText += "</br>";
        }
        document.getElementById(this.name + "Price").innerHTML = priceText;

        //update count
        this.updateCount();

        //update speed
        var speed = (tickSpeed * this.calculateSpeed())/1000;
        var speedOut = speed.toFixed(3) + "/s";
        document.getElementById(this.name + "Speed").innerHTML = speedOut;

        //update autobuyer number
        document.getElementById(this.name + "AutobuyerCount").innerHTML = this.autobuyer;
    }
    updateCount() {
        document.getElementById("num" + this.name).innerHTML = this.count.toFixed(3);
    }
}

class Mass {
    massCap = 0;
    currentMass = 0;
    isFull = 0;
    constructor(_massCap) {
        this.massCap = _massCap;
    }
    checkMass() { //check if mass is over limit, destroy either electrons or quarks until back into correct range
        this.currentMass = 0;
        for (var item in resources) {
            this.currentMass += this.calculateMass(resources[item]);
        }


        if(this.currentMass >= this.massCap) {
            this.isFull = true;
            if (Quark.count > Electron.count) {
                Quark.count -= this.currentMass-this.massCap;
            } else {
                Electron.count -= this.currentMass-this.massCap;
            }
        }
    }
    calculateMass(_resource) { //TODO: rewrite to work with particle AMUs
        var massTotal = 0;
        
        if (_resource.name == "Quark" || _resource.name == "Electron") {
            massTotal += _resource.count;
        }

        for (var item in _resource.cost) {
            if (item == "Quark" || _resource == "Electron") {
                massTotal += _resource.count * _resource.cost[item];
            }
            else {
                massTotal += _resource.count * this.getQuarkEquivalent(item);
            }
        }

        return massTotal;
    }
    getQuarkEquivalent(_resourceName) {
        var quarkEquiv = 0;
        for (var item in resources[_resourceName].cost) {
            if (item == "Quark" || item == "Electron") {
                quarkEquiv += resources[_resourceName].cost[item];
            } else {
                quarkEquiv += this.getQuarkEquivalent(item);
            }
        }

        return quarkEquiv;
    }
    update() {
        this.checkMass();
        
        document.getElementById("massCount").innerHTML = this.currentMass.toFixed(3) + " / " + this.massCap.toFixed(3);

    }
}

class Upgrade {
    upgradeId = "";
    name = "";
    details = "";
    unlocked = false;
    bought = false;
    cost = {};
    effects = {};
    unlockConditions = {};
    
    constructor(_upgradeId, _name, _details,  _cost, _effects, _unlockConditions) {
        this.upgradeId = _upgradeId;
        this.name = _name;
        this.details = _details;
        this.cost = _cost;
        this.effects = _effects;
        this.unlockConditions =_unlockConditions;
    }

    buy() {
        if (this.canBuy()) {
            this.applyEffects();
            this.bought = true;
            for (var item in this.cost) {
                resources[item].count = resources[item].count - this.cost[item];
            }
        }

        this.updateName()
    }

    unlock() {//check if unlock conditions are met, then add to upgrade list
        if (!this.unlocked) {
            var unlockable = true;
            for (var item in this.unlockConditions) {
                var resourceCount = resources[item].count;
                if (resourceCount < this.unlockConditions[item]) {
                    unlockable = false;
                }
            }
            
            if (unlockable) {
                this.unlocked = true;
                this.addToPage();
            }
        } else if (document.getElementById(this.upgradeId) == null) {
            this.addToPage();
        }

    }

    applyEffects() {
        for (var item in this.effects) {
            resources[item].modifier = resources[item].modifier * this.effects[item];
        }
    }

    addToPage() { //create upgrade div and populate with info
        var upgradeDiv = document.createElement("Div");
        upgradeDiv.id = this.upgradeId;
        var upgradeName = document.createElement("H1");
        upgradeName.id = this.upgradeId + "name";
        upgradeName.innerHTML = (this.name);
        var upgradeDetails = document.createElement("H2");
        upgradeDetails.appendChild(document.createTextNode(this.details));
        upgradeDiv.appendChild(upgradeName);
        upgradeDiv.appendChild(upgradeDetails);

        document.getElementById("upgradeContainer").appendChild(upgradeDiv);
        var self = this;
        document.getElementById(this.upgradeId).onclick = function() {self.buy()};
    }

    hide() {
        document.getElementById(this.upgradeId).style.display = "none";
    }

    show() {
        document.getElementById(this.upgradeId).style.display = "inline-block";
    }

    canBuy() {
        var canBuy = true;
        for (var item in this.cost) {
            var resourceCount = resources[item].count;
            if (resourceCount < this.cost[item]) {
                canBuy = false;
            }
        }
        
        return canBuy;
    }

    updateName() {
        if (this.bought) {
            document.getElementById(this.upgradeId + "name").innerHTML = this.name + " (purchased)"
        }
    }

}


var resources = {
    "Quark" : Quark = new Resource("Quark", {}, 0.003, 0, 0),
    "Electron" : Electron = new Resource("Electron", {}, 0.001, 0, 0),
    "Proton" : Proton = new Resource("Proton", {"Quark" : 3}, 0, 0.01, 0),
    "Neutron" : Neutron = new Resource("Neutron", {"Quark" : 3}, 0, 0.01, 0),
    "Hydrogen" : Hydrogen = new Resource("Hydrogen", {"Electron" : 1, "Proton" : 1, "Neutron" : 1}, 0, 0.01, 0),
    "Carbon" : Carbon = new Resource("Carbon", {"Electron" : 6, "Proton" : 6, "Neutron" : 6}, 0, 0.01, 0)
}

var mass = new Mass(10000);

var upgrades = {
    "quarkSpeedUpgrade1" : DoubleQuarkSpeed1 = new Upgrade("quarkSpeedUpgrade1", 
                                                            "Double Quark Speed",
                                                            "Multiply the rate Quarks generate by 2!",
                                                            {"Quark" : 10},
                                                            {"Quark" : 2},
                                                            {"Quark" : 5} ),

}



//save/clear
var saveFile = {
    quarkSave: Quark,
    electronSave: Electron,
    protonSave: Proton,
    neutronSave: Neutron,
    hydrogenSave: Hydrogen,
}

function save() {
    localStorage.setItem("save",JSON.stringify(saveFile));
    localStorage.setItem("save2",JSON.stringify(upgrades));
}

function clearSave() {
    localStorage.clear();
    location.reload();
}

function load() {
    var savegame = JSON.parse(localStorage.getItem("save"));
    var upgradeSave = JSON.parse(localStorage.getItem("save2"));

    for (var item in savegame) {//load resources
        for (var property in savegame[item]) {
            if (savegame[item][property] !== "undefined") {
                resources[savegame[item].name][property] = savegame[item][property];
            }
        }
    }

    for (var item in upgradeSave) { //TODO: FIX
        for (var property in upgradeSave[item]) {
            if (upgradeSave[item][property] !== "undefined") {
                upgrades[upgradeSave[item].name][property] = upgradeSave[item][property];
            }
        }
    }
}

window.onload = function() {
    try {load();} catch(err) {console.log("Error in reading last save")}
    updateTotals();
    checkButtons();
};

/*game loop classes*/
function checkButtons() { //check for new unlocks
    if (Quark.count >= 2 || Electron.unlock) {document.getElementById("ElectronContainer").style.display = "block"; Electron.unlock = true;} //unlock electrons if quark > 2
    if (Quark.count >= 3 || Proton.unlock) {document.getElementById("ProtonContainer").style.display = "block"; Proton.unlock = true;} //unlock protons if quark > 3
    if (Quark.count >= 3 || Neutron.unlock) {document.getElementById("NeutronContainer").style.display = "block"; Neutron.unlock = true;} //unlock neutrons if quark > 3
    if (Quark.count >= 10 || Hydrogen.unlock) {document.getElementById("HydrogenContainer").style.display = "block"; Hydrogen.unlock = true;} //unlock hydrogen if quark > 10
    if (Quark.count >= 100 || Carbon.unlock) {document.getElementById("CarbonContainer").style.display = "block"; Carbon.unlock = true;}
    if (Hydrogen.count >= 1 || Proton.autobuyerUnlock) {document.getElementById("ProtonAutobuyerContainer").style.display = "inline-block"; Proton.autobuyerUnlock = true}
    if (Hydrogen.count >= 1 || Neutron.autobuyerUnlock) {document.getElementById("NeutronAutobuyerContainer").style.display = "inline-block"; Neutron.autobuyerUnlock = true}
    if (Carbon.count >= 1 || Hydrogen.autobuyerUnlock) {document.getElementById("HydrogenAutobuyerContainer").style.display = "inline-block"; Hydrogen.autobuyerUnlock = true}
    if (Hydrogen.count >= 10 || Carbon.autobuyerUnlock) {document.getElementById("CarbonAutobuyerContainer").style.display = "inline-block"; Carbon.autobuyerUnlock = true}
}

function updateTotals() { //update total numbers every tick, check if anything new has unlocked, or if mass cap has been reached

    for (var item in resources) {
        resources[item].update();
    }    
    checkButtons();
    for (var item in upgrades) {
        upgrades[item].unlock();
    }
    mass.update();
}

window.setInterval(function(){ //Game Loop
    for (var item in resources) {
        resources[item].spawn();
    }
    updateTotals();
    save();
}, tickSpeed);