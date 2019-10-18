var tickSpeed = 1000;
var hideUpgrades = false;

class Resource {//TODO: clean up class, add function to generate HTML
    name = "";
    count = 0;
    massAMU = 0;
    cost = {};
    autobuyer = 0;
    autobuyerSpeed = 0.01;
    autobuyerCost = {};
    successfulAutobuys = 0;
    unlock = false;
    autobuyerUnlock = false;
    modifier = 1;
    resourceUsage = {};
    priceRatio = 1;
    autobuyerCostInitial = {};
    constructor(_name, _cost, _massAMU, _autobuyerSpeed, _autobuyerCost, _priceRatio) {
        this.name = _name;
        this.cost = _cost;
        this.massAMU = _massAMU;
        this.autobuyerSpeed = _autobuyerSpeed;
        this.autobuyerCost = _autobuyerCost;
        this.autobuyerCostInitial = _autobuyerCost;
        this.priceRatio = _priceRatio;
    }
    canBuy(_cost) {
        var canBuy = true;
        if (!mass.isFull) {
            for (var item in _cost) {
                var resourceCount = resources[item].count;
                if (resourceCount < _cost[item]) {
                    canBuy = false;
                }
            }
        }  else {
            canBuy = false;
        }
        
        return canBuy;
    }
    click() {
        
        if (this.canBuy(this.cost)) {
            this.count += this.modifier;
            for (var item in this.cost) {
                resources[item].count = resources[item].count - (this.cost[item] * this.modifier);
            }
        }

        this.updateCount();
    }
    autobuyerClick() {
        
        if (this.canBuy(this.cost)) {
            this.count += this.autobuyerSpeed * this.modifier;
            for (var item in this.cost) {
                resources[item].count = resources[item].count - (this.cost[item] * this.autobuyerSpeed) * this.modifier;
            }
        }

        this.updateCount();
    }
    spawn() { //TODO: make less resource intensive
        
        this.successfulAutobuys = 0;
        for (var i = 0; i < this.autobuyer; i++) {
            if (this.canBuy(this.cost)) {
                
                this.autobuyerClick();
                this.successfulAutobuys++;
            }
        }

        for (var item in this.cost) {
            resources[item].resourceUsage[this.name] = this.successfulAutobuys * this.autobuyerSpeed * this.cost[item] * this.modifier;
        }
        

        this.update();
    }
    autobuyerPlus() {
        if (this.canBuy(this.autobuyerCost)) {
            this.autobuyer++;
            this.update();
            for (var item in this.autobuyerCost) {
                resources[item].count -= this.autobuyerCost[item];
            }
            this.updateAutobuyerCost();
        }
    }
    autobuyerMinus() {
        if (this.autobuyer > 0) {
            this.autobuyer--;
            this.update();
            this.updateAutobuyerCost();
        }
    }
    updateAutobuyerCost() {
        for (var item in this.autobuyerCost) {
            this.autobuyerCost[item] = this.autobuyerCostInitial[item] * Math.pow(this.priceRatio, this.autobuyer);
        }
    }
    calculateSpeed() {
        var totalSpeed = 0;

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

        //update autobuyer cost
        for (var item in this.autobuyerCost) {
            document.getElementById(this.name + "AutobuyerPrice").innerHTML = this.autobuyerCost[item].toFixed(3) + " " + item;
        }
    }
    updateCount() {
        document.getElementById("num" + this.name).innerHTML = this.count.toFixed(3);
    }
}

class Mass {//TODO: add code to stop production when max mass is reached
    massCap = 10000;
    currentMass = 0;
    isFull = false;
    constructor(_massCap) {
        this.massCap = _massCap;
    }
    checkMass() { //check if mass is over limit, (destroy mass until back into correct range?)
        this.currentMass = 0;
        for (var item in resources) {
            this.currentMass += this.calculateMass(resources[item]);
        }

        if (this.currentMass >= this.massCap) {
            this.isFull = true;
        } else {
            this.isFull = false;
        }
    }
    calculateMass(_resource) {
        var massTotal = 0;
        
        massTotal = _resource.count * _resource.massAMU;

        return massTotal;
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
    effects;
    unlockConditions = {};
    nameUpdated = false;
    
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
            this.effects();
            this.bought = true;
            for (var item in this.cost) {
                resources[item].count = resources[item].count - this.cost[item];
            }
            this.updateName();
            if (hideUpgrades) {
                this.hide();
            }
        }

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

    addToPage() { //create upgrade div and populate with info
        var upgradeDiv = document.createElement("Div");
        upgradeDiv.id = this.upgradeId;
        var upgradeName = document.createElement("H1");
        upgradeName.id = this.upgradeId + "name";
        upgradeName.innerHTML = (this.name);
        var upgradeDetails = document.createElement("H2");
        upgradeDetails.appendChild(document.createTextNode(this.details));
        var upgradeCost = document.createElement("P");
        var brVar;
        for (var item in this.cost) {
            upgradeCost.appendChild(document.createTextNode(item + " " + this.cost[item]));
            brVar = document.createElement("br");
            upgradeCost.appendChild(brVar);
        }



        upgradeDiv.appendChild(upgradeName);
        upgradeDiv.appendChild(upgradeDetails);
        upgradeDiv.appendChild(document.createTextNode("Cost:"))
        upgradeDiv.appendChild(upgradeCost);

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
        if (this.bought) {
            canBuy = false;
        } else {
            for (var item in this.cost) {
                var resourceCount = resources[item].count;
                if (resourceCount < this.cost[item]) {
                    canBuy = false;
                }
            }
        }  
        
        return canBuy;
    }

    updateName() {
        if (this.bought && !this.nameUpdated) {
            document.getElementById(this.upgradeId + "name").innerHTML = this.name + " (purchased)";
            this.nameUpdated = true;
        }
    }

}

function hideAllUpgrades() {
    for (var item in upgrades) {
        if (upgrades[item].bought && upgrades[item].unlocked) {
            upgrades[item].hide();
        }
    }
    hideUpgrades = true;
    swapUpgradeButtons();
}

function showAllUpgrades() {
    for (var item in upgrades) {
        if (upgrades[item].unlocked) {
            upgrades[item].show();
        }
    }
    hideUpgrades = false;
    swapUpgradeButtons();
}

function swapUpgradeButtons() {
    if (hideUpgrades) {
        document.getElementById("hideUpgradesButton").style.display = "none";
        document.getElementById("showUpgradesButton").style.display = "inline-block";   
    } else {
        document.getElementById("showUpgradesButton").style.display = "none";
        document.getElementById("hideUpgradesButton").style.display = "inline-block";
    }
}

var resources = {
    "Electron" : Electron = new Resource("Electron", {}, 0.00054, 0.1, {"Hydrogen" : 1}, 1.2),
    "Proton" : Proton = new Resource("Proton", {}, 1.0073, 0.1, {"Hydrogen" : 1}, 1.2),
    "Neutron" : Neutron = new Resource("Neutron", {}, 1.0087, 0.1, {"Hydrogen" : 1}, 1.2),
    "Hydrogen" : Hydrogen = new Resource("Hydrogen", {"Electron" : 1, "Proton" : 1, "Neutron" : 1}, 1.008, 0.1, {"Carbon" : 1}, 1.2),
    "Carbon" : Carbon = new Resource("Carbon", {"Hydrogen" : 1, "Electron" : 5, "Proton" : 5, "Neutron" : 5}, 12.011, 0, 0.01)
}

var mass = new Mass(10000);

var upgrades = {
    "hydrogenUnlock" : hydrogenUnlock = new Upgrade(
        "hydrogenUnlockUpgrade",
        "Unlock Hydrogen",
        "",
        {"Electron" : 10, "Proton" : 10, "Neutron" : 10},
        function() {
            Hydrogen.unlock = true;
        },
        {"Electron" : 5},
    ),
    "carbonUnlock" : carbonUnlock = new Upgrade(
        "carbonUnlockUpgrade",
        "Unlock Carbon",
        "",
        {"Hydrogen" : 100},
        function() {
            Carbon.unlock = true;
        },
        {"Hydrogen" : 20}
    ),
    "electronSpeedUpgrade1" : electronSpeedUpgrade1 = new Upgrade(
        "electronSpeedUpgrade1",
        "Electron Autobuyer Speed",
        "Double the speed at which Electrons generate!",
        {"Hydrogen" : 20},
        function() {
            Electron.autobuyerSpeed = Electron.autobuyerSpeed * 2;
        },
        {"Hydrogen" : 10}
    ),
    "protonSpeedUpgrade1" : protonSpeedUpgrade1 = new Upgrade(
        "protonSpeedUpgrade1",
        "Proton Autobuyer Speed",
        "Double the speed at which Protons generate!",
        {"Hydrogen" : 30},
        function() {
            Proton.autobuyerSpeed = Proton.autobuyerSpeed * 2;
        },
        {"Hydrogen" : 20}
    ),
    "neutronSpeedUpgrade1" : neutronSpeedUpgrade1 = new Upgrade(
        "neutronSpeedUpgrade1",
        "Neutron Autobuyer Speed",
        "Double the speed at which Neutrons generate!",
        {"Hydrogen" : 40},
        function() {
            Neutron.autobuyerSpeed = Neutron.autobuyerSpeed * 2;
        },
        {"Hydrogen" : 30}
    ),

}



//save/clear


function save() {
    localStorage.setItem("save",JSON.stringify(resources));
    localStorage.setItem("save2",JSON.stringify(upgrades));
    localStorage.setItem("save3",JSON.stringify(hideUpgrades));
}

function clearSave() {
    localStorage.clear();
    location.reload();
}

function load() {
    var savegame = JSON.parse(localStorage.getItem("save"));
    var upgradeSave = JSON.parse(localStorage.getItem("save2"));
    var miscSave = JSON.parse(localStorage.getItem("save3"));

    for (var item in savegame) {//load resources
        for (var property in savegame[item]) {
            if (savegame[item][property] !== "undefined") {
                resources[savegame[item].name][property] = savegame[item][property];
            }
        }
    }

    for (var item in upgradeSave) {
        upgrades[item].unlocked = upgradeSave[item].unlocked;
        upgrades[item].bought = upgradeSave[item].bought;
    }

    hideUpgrades = miscSave;

}

window.onload = function() {
    try {load();} catch(err) {console.log("Error in reading last save")}
    updateTotals();
    checkButtons();
    swapUpgradeButtons();
    if (hideUpgrades) {
        hideAllUpgrades();
    }
};

/*game loop classes*/
function checkButtons() { //check for new unlocks (TODO: make run with loops)
    if (Hydrogen.unlock) {document.getElementById("HydrogenContainer").style.display = "block";} //unlock hydrogen if upgrade has been purchased
    if (Carbon.unlock) {document.getElementById("CarbonContainer").style.display = "block";} //unlock carbon if upgrade has been purchased
    if (Hydrogen.count >= 1 || Proton.autobuyerUnlock) {document.getElementById("ProtonAutobuyerContainer").style.display = "inline-block"; Proton.autobuyerUnlock = true}
    if (Hydrogen.count >= 1 || Neutron.autobuyerUnlock) {document.getElementById("NeutronAutobuyerContainer").style.display = "inline-block"; Neutron.autobuyerUnlock = true}
    if (Hydrogen.count >= 1 || Electron.autobuyerUnlock) {document.getElementById("ElectronAutobuyerContainer").style.display = "inline-block"; Electron.autobuyerUnlock = true}
    if (Carbon.count >= 1 || Hydrogen.autobuyerUnlock) {document.getElementById("HydrogenAutobuyerContainer").style.display = "inline-block"; Hydrogen.autobuyerUnlock = true}
    if (Carbon.autobuyerUnlock) {document.getElementById("CarbonAutobuyerContainer").style.display = "inline-block"; Carbon.autobuyerUnlock = true}
    for (var item in resources) {
        if (resources[item].autobuyerUnlock) {
            document.getElementById("autobuyerLabel").style.display = "inline-block";
            document.getElementById("autobuyerCostLabel").style.display = "inline-block";
        }
    }
}

function updateTotals() { //update total numbers every tick, check if anything new has unlocked, or if mass cap has been reached

    for (var item in resources) {
        resources[item].update();
    }    
    checkButtons();
    for (var item in upgrades) {
        upgrades[item].unlock();
        upgrades[item].updateName();
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