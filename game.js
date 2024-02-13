const fs = require('fs');

const items = {
    itemIcons: ["🔫", "🍺", "🚬", "🔍", "🔗", "🔪"],
    itemNames: ["Shotgun", "Beer", "Cigarette", "Magnifying glass", "Handcuffs", "Saw"],
    itemDescriptions: ["Shoot to shoot the shotgun", "Ejects current round inside the shotgun", "Regains one health point", "Shows current loaded round", "Skips opponents next move", "Deals double damage to opponent"]
}

function checkUser(userId) {
    let playerListFile = fs.readFileSync("./players.json"); // read database
    let playerList = JSON.parse(playerListFile); // get data about the current channel
    if(playerList[`user-${userId}`] == undefined) { // check if user already exists
        return false // user already exists
    }
    else {
        return true // user doesnt exist 
    }
}

async function addUser(userId) { // check if user exists in database
    if (checkUser(userId) == false) {
        let playerListFile = fs.readFileSync("./players.json"); // read database
        let playerList = JSON.parse(playerListFile); // get data about the current channel
        playerList[`user-${userId}`] = {
            gameState: false,
            lobbyState: false,
            lobbyId: 0,
            language: "eng",
            inventory: [],
            health: 0,
            score: 0
        }

        try {
            fs.writeFileSync("./players.json", JSON.stringify(playerList)); // push local var with new id to the database
            return true // user isn't registered
        }
        catch (error) {
            console.log(error)
            return "error" // error :O (spooky)
        }
    }
    else {
        return false // user already exists
    }
}

function getRandomNumber(min, max) { // "if you have questions, go fuck yourself" @Andrii // "facts" @Maxim
    return Math.random() * (max - min) + min;
}

function reloadShotgun() {
    let lobbyInfo = getLobbyInfo(callback.data.lobby.id);
    if (lobbyInfo.shotgun.length == 0) { // if shotgun is empty
        switch (lobbyInfo.round){
            case 1:  // if current round is 1, load 2 shells
                size = 2;
            case 2: // if current round is 2, load 4 shells
                size = 4;
            case 3: // if current round is 3, load 8 shells
                size = 8;
            default: // if issue, load 6(emergency stuff idk)
                size = 6;
            }
        let newShotgun = [];
        for (let i = 0; i < size; i++) { // loads the shotgun
            newShotgun.push(getRandomNumber(0, 1));
        }
        changeLobbyInfo(callback.data.lobby.id, {
            action: "changeShotgunAmmo",
            data: {
                newShotgunAmmo: newShotgun
            }
        });
    }
}

function viewShotgunShells(){
    let blanks = 0;
    let buckshots = 0;

    for (let i = 0; i < shotgun.length; i++){
        if (shotgun[i] == 0){ // if blank, increment blank
            blanks++;
        } else { // else, increment buckshots
            buckshots++;
        }
    }
    return blanks, buckshots;
}

function shootShotgun(callback) {
    if (callback.action == "shoot_yourself") {
        if (shotgun[0] == 0){
            changeLobbyInfo(callback.data.lobby.id, {
                action: "cycleShotgun"
            })
            // next move is player
        } else {
            changeLobbyInfo(callback.data.lobby.id, {
                action: "cycleShotgun"
            })
            changePlayerInfo(callback.data.author, {
                data: {
                    changeBy: -1
                }
            })
        }
    } else if (callback.action == "shoot_dealer") {
        if (shotgun[0] == 0) {
            changeLobbyInfo(callback.data.lobby.id, {
                action: "cycleShotgun"
            })
            // next move is dealer
        } else {
            changeLobbyInfo(callback.data.lobby.id, {
                action: "cycleShotgun"
            })
            changeLobbyInfo(callback.data.lobby.id, {
                action: "changeAiHealth",
                data: {
                    changeBy: -1
                }
            })
        }
    }
}

function getPlayerInfo(userId) {
    let playerListFile = fs.readFileSync("./players.json"); // read database
    return JSON.parse(playerListFile)[`user-${userId}`]; // get data about the current player
}

function changePlayerInfo(userId, callback) {
    let playerListFile = fs.readFileSync("./players.json"); // read database
    let playerInfo = JSON.parse(playerListFile)[`user-${userId}`]; // get data about the current player

    switch(callback.action) {
        case "changeHealth":
            playerInfo.health += callback.data.changeBy
            break;
        case "changeScore":
            callback.data.newScore
            break;
        case "changeItems":
            callback.data.item
            break;
        case "changeLobbyState":
            callback.data.item
            break;
        case "changeGameState":
            callback.data.item
            break;
        
    }
}

function getLobbyInfo(lobbyId) {
    let lobbyListFile = fs.readFileSync("./lobbies.json"); // read database
    return JSON.parse(lobbyListFile)[`lobby-${lobbyId}`]; // get data about the current player
}

function changeLobbyInfo(lobbyId, callback) {
    let lobbyListFile = fs.readFileSync("./lobbies.json"); // read database
    let lobbyInfo = JSON.parse(lobbyListFile)[`lobby-${lobbyId}`]; // get data about the current player

    switch(callback.action) {
        case "changeShotgun":
            callback.data.newShotgun
            break;
        case "changeAiInventory":
            callback.data.newAiInventory
            break;
        case "changeAiHealth":
            lobbyInfo.aiHealth += callback.data.changeBy
            break;
        case "endGame":
            callback.data.item
            break;
        case "cycleShotgun":
            lobbyInfo.shotgun.shift();
            break;
    }
}

async function game(ctx, callback) { // callback.action = start the game, use item, end game; callback.data = game data (e.g. used item, who lost)
    switch(callback.action) { // TODO: take items away from playes/ai when they use them. Also add actions when ai uses items
        case "gameStart":
            break;
        case "useItem":
            (() => {
                if(callback.data.author == "ai") {
                    let lobbyInfo = getLobbyInfo(callback.data.lobby.id);
                    
                    if(lobbyInfo.aiInventory.includes("HandcuffsOn") == true) {
                        return "no-no wanna :("
                    }
                }
                else if(callback.data.author == "player") {
                    let playerInfo = getPlayerInfo(ctx.update.message.from.id)

                    if(playerInfo.inventory.include("HandcuffsOn") == true) {
                        return "no-no wanna :("
                    }
                }
            })()
            switch(callback.data.item) {
                case "Shotgun":
                    shootShotgun(callback.data.action)
                    break;
                case "Beer":
                    changeLobbyInfo(callback.data.lobby.id, {
                        action: "cycleShotgun"
                    })
                    break;
                case "Ciggarette":
                    if(callback.data.author == "player") {
                        changePlayerInfo(ctx.update.message.from.id, {
                            data: {
                                changeBy: 1
                            }
                        })
                    }
                    break;
                case "Magnifying glass":
                    if(callback.data.author == "player") {
                        let currentAmmo = (() => {
                            const lobbyInfo = getLobbyInfo(ctx.update.message.from.id);
    
                            if(lobbyInfo.shotgun[0] == 0) {
                                return "Blank."
                            }
                            else if(lobbyInfo.shotgun[0] == 1){
                                return "Live ammunition."
                            }
                        })();
    
                        ctx.sendMessage(currentAmmo, ctx.update.message.from.id)
                    }
                    break;
                case "Handcuffs":
                    if(callback.data.author == "player") {
                        let lobbyInfo = getLobbyInfo(callback.data.lobby.id);

                        if(lobbyInfo.aiInventory.includes("HandcuffsOn") == false) {
                            lobbyInfo.aiInventory.push("HandcuffsOn");
                        }
                        else {
                            return "i no-no wanna :("
                        }
                    }
                    break;
                case "Saw":
                    let lobbyInfo = getLobbyInfo(callback.data.lobby.id);

                    if(lobbyInfo.isShotgunSawedOff == false) {
                        lobbyInfo.isShotgunSawedOff = true;
                    }
                    else {
                        return "i no-no wanna :("
                    }
                    break;
            }
            break;
        case "endGame":
            break;
    }
}

module.exports = {
    game,
    items
};