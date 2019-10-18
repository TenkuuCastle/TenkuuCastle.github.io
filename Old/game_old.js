var tickSpeed = 1000;

//Object definitions
var Quark = {
    count: 0,
    spawnRate: 0.001,
    maxSpawnRate: 100,
    calculateSpeed: function() {
        return (this.count * this.spawnRate) - (Electron.spawnRate * 2);
    },
    click: function() {
        this.count++;
        updateTotals();
    },
    spawn: function() {
        var spawnNum = this.count * this.spawnRate;
        if (spawnNum < this.maxSpawnRate) {
            this.count += spawnNum;
        } else {
            this.count += this.maxSpawnRate;
        }
    },
    update: function() {
        document.getElementById("numQuark").innerHTML = this.count.toFixed(3);
        var speed = (tickSpeed * this.calculateSpeed())/1000;
        var speedOut = speed.toFixed(3) + "/s";
        document.getElementById("quarkSpeed").innerHTML = speedOut;
    }
}

var Electron = {
    count: 0,
    spawnRate: 0,
    unlock: false,
    cost: 2,
    autobuyer: 0,
    autobuyerSpeed: 0.01,
    autobuyerCost: 0,
    calculateSpeed: function() {
        this.spawnRate = this.autobuyer * this.autobuyerSpeed;
        return this.spawnRate;
    },
    click: function() {
        if (Quark.count >= 2) {
            this.count++;
            Quark.count-=2;
            updateTotals();
        }
    },
    spawn: function() {
        this.calculateSpeed();
        var spawnNum = this.spawnRate;
        Quark.count-=spawnNum * this.cost;
        this.count += spawnNum;
    },
    autobuyerPlus: function() {
        if (Quark.count >= this.autobuyerCost) {
            Quark.count-=this.autobuyerCost;
            this.autobuyer++;
            this.update();
        }
    },
    autobuyerMinus: function() {
        if (this.autobuyer > 0) {
            this.autobuyer--;
            this.update();
        }
    },
    update: function() {
        var buttonText = "" + this.cost + " Quark";
        if (this.cost > 1) {buttonText += "s";}
        document.getElementById("electronPrice").innerHTML = buttonText;
        document.getElementById("numElectron").innerHTML = this.count.toFixed(3);
        var speed = (tickSpeed * this.calculateSpeed())/1000;
        var speedOut = speed.toFixed(3) + "/s";
        document.getElementById("electronSpeed").innerHTML = speedOut;
        document.getElementById("electronAutobuyerCount").innerHTML = this.autobuyer;
    }
}

var Proton = {
    count: 0,
    spawnRate: 0,
    unlock: false,
    cost: 3,
    calculateSpeed: function() {
        return this.count * this.spawnRate;
    },
    click: function() {
        if (Quark.count >= 3) {
            this.count++;
            Quark.count-=3;
            updateTotals();
        }
    },
    spawn: function() {
        var spawnNum = this.count * this.spawnRate;
        this.count += spawnNum;
    },
    update: function() {
        var buttonText = "" + this.cost + " Quark";
        if (this.cost > 1) {buttonText += "s";}
        document.getElementById("protonPrice").innerHTML = buttonText;
        document.getElementById("numProton").innerHTML = this.count.toFixed(3);
        var speed = (tickSpeed * this.calculateSpeed())/1000;
        var speedOut = speed.toFixed(3) + "/s";
        document.getElementById("protonSpeed").innerHTML = speedOut;
    }
}

var Neutron = {
    count: 0,
    spawnRate: 0,
    unlock: false,
    cost: 3,
    calculateSpeed: function() {
        return this.count * this.spawnRate;
    },
    click: function() {
        if (Quark.count >= 3) {
            this.count++;
            Quark.count-=3;
            updateTotals();
        }
    },
    spawn: function() {
        var spawnNum = this.count * this.spawnRate;
        this.count += spawnNum;
    },
    update: function() {
        var buttonText = "" + this.cost + " Quark";
        if (this.cost > 1) {buttonText += "s";}
        document.getElementById("neutronPrice").innerHTML = buttonText;
        document.getElementById("numNeutron").innerHTML = this.count.toFixed(3);
        var speed = (tickSpeed * this.calculateSpeed())/1000;
        var speedOut = speed.toFixed(3) + "/s";
        document.getElementById("neutronSpeed").innerHTML = speedOut;
    }
}

var Hydrogen = {
    count: 0,
    spawnRate: 0,
    unlock: false,
    electronCost: 1,
    protonCost: 1,
    neutronCost: 1,
    autobuyerUnlock: false,
    calculateSpeed: function() {
        return this.count * this.spawnRate;
    },
    click: function() {
        if (Electron.count >= this.electronCost && Neutron.count >= this.neutronCost && Proton.count >= this.protonCost) {
            this.count++;
            Electron.count-=this.electronCost;
            Proton.count-=this.protonCost;
            Neutron.count-=this.neutronCost;
            updateTotals();
        }
    },
    spawn: function() {
        var spawnNum = this.count * this.spawnRate;
        this.count += spawnNum;
    },
    update: function() {
        var buttonText = "" + this.electronCost + " Electron</br>" + this.protonCost + " Proton</br>" + this.neutronCost + " Neutron";
        document.getElementById("hydrogenPrice").innerHTML = buttonText;
        document.getElementById("numHydrogen").innerHTML = this.count.toFixed(3);
        var speed = (tickSpeed * this.calculateSpeed())/1000;
        var speedOut = speed.toFixed(3) + "/s";
        document.getElementById("hydrogenSpeed").innerHTML = speedOut;
    }
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
}

function clearSave() {
    localStorage.clear();
    location.reload();
}

function load() {
    var savegame = JSON.parse(localStorage.getItem("save"));
    //go through each object in save and make sure not undefined
    //Quark
    if (typeof savegame.quarkSave.count !== "undefined") {Quark.count = savegame.quarkSave.count;}

    //Electron
    if (typeof savegame.electronSave.count !== "undefined") {Electron.count = savegame.electronSave.count;}
    if (typeof savegame.electronSave.unlock !== "undefined") {Electron.unlock = savegame.electronSave.unlock;}
    if (typeof savegame.electronSave.autobuyerUnlock !== "undefined") {Electron.autobuyerUnlock = savegame.electronSave.autobuyerUnlock;}
    if (typeof savegame.electronSave.autobuyer !== "undefined") {Electron.autobuyer = savegame.electronSave.autobuyer;}

    //Proton
    if (typeof savegame.protonSave.count !== "undefined") {Proton.count = savegame.protonSave.count;}
    if (typeof savegame.protonSave.unlock !== "undefined") {Proton.unlock = savegame.protonSave.unlock;}

    //Neutron
    if (typeof savegame.neutronSave.count !== "undefined") {Neutron.count = savegame.neutronSave.count;}
    if (typeof savegame.neutronSave.unlock !== "undefined") {Neutron.unlock = savegame.neutronSave.unlock;}

    //Hydrogen
    if (typeof savegame.hydrogenSave.count !== "undefined") {Hydrogen.count = savegame.hydrogenSave.count;}
    if (typeof savegame.hydrogenSave.unlock !== "undefined") {Hydrogen.unlock = savegame.hydrogenSave.unlock;}
}

window.onload = function() {
    try {load();} catch(err) {console.log("Error in reading last save")}
    updateTotals();
};

/*Helper classes*/


/*game loop classes*/
function checkButtons() { //check for new unlocks
    if (Quark.count >= 2 || Electron.unlock) {document.getElementById("electronContainer").style.display = "block"; Electron.unlock = true;} //unlock electrons if quark > 2
    if (Quark.count >= 3 || Proton.unlock) {document.getElementById("protonContainer").style.display = "block"; Proton.unlock = true;} //unlock protons if quark > 3
    if (Quark.count >= 3 || Neutron.unlock) {document.getElementById("neutronContainer").style.display = "block"; Neutron.unlock = true;} //unlock neutrons if quark > 3
    if (Quark.count >= 10 || Hydrogen.unlock) {document.getElementById("hydrogenContainer").style.display = "block"; Hydrogen.unlock = true;} //unlock hydrogen if quark > 10
    if (Hydrogen.count >= 10 || Electron.autobuyerUnlock) {document.getElementById("electronAutobuyerContainer").style.display = "inline-block"; Electron.autobuyerUnlock = true} //unlock electron autobuyers if hydrogen > 10
}

function updateTotals() { //update total numbers every tick, check if anything new has unlocked
    Quark.update();
    Electron.update();
    Proton.update();
    Neutron.update();
    Hydrogen.update();
    checkButtons();
}

window.setInterval(function(){ //Game Loop
    Quark.spawn();
    Electron.spawn();
    updateTotals();
    save();
}, tickSpeed);