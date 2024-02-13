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

function getPlayerInfo(userId) {
    let playerListFile = fs.readFileSync("./players.json"); // read database
    return JSON.parse(playerListFile)[`user-${userId}`]; // get data about the current player
}

function changePlayerInfo(userId, callback) {
    let playerListFile = fs.readFileSync("./players.json"); // read database
    let playerInfo = JSON.parse(playerListFile); // get data about the current player

    switch(callback.action) {
        case "changeHealth":
            playerInfo[`user-${userId}`].health += callback.data.changeBy
            fs.writeFileSync("./players.json", JSON.stringify(playerInfo));
            break;
        case "changeScore":
            callback.data.newScore
            break;
        case "changeInventory":
            playerInfo[`user-${userId}`].inventory = callback.data.newInventory
            fs.writeFileSync("./players.json", JSON.stringify(playerInfo));
            break;
        case "changeLobbyState":
            callback.data.item
            break;
        case "changeGameState":
            callback.data.item
            break;
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

function viewShotgunShells(lobbyId) { // returns what's loaded rn
    let blanks = 0;
    let buckshots = 0;
    let lobbyInfo = getLobbyInfo(callback.data.lobby.id)[`lobby-${lobbyId}`];

    for (let i = 0; i < lobbyInfo.shotgun.length; i++){
        if (lobbyInfo.shotgun.length[i] == 0){ // if blank, increment blank
            blanks++;
        } else { // else, increment buckshots
            buckshots++;
        }
    }
    return blanks, buckshots;
}

function shootShotgun(callback) {
    let lobbyInfo = getLobbyInfo(callback.data.lobby.id)[`lobby-${callback.data.lobby.id}`];

    if (callback.action == "shootYourself") {
        if (lobbyInfo.shotgun[0] == 0){
            changeLobbyInfo(callback.data.lobby.id, {
                action: "cycleShotgun"
            })
            // next move is player
        } 
        else {
            changeLobbyInfo(callback.data.lobby.id, {
                action: "cycleShotgun"
            })
            changePlayerInfo(callback.data.author, {
                data: {
                    changeBy: -1
                }
            })
        }
    } else if (callback.action == "shootOpponent") {
        if (lobbyInfo.shotgun[0] == 0) {
            changeLobbyInfo(callback.data.lobby.id, {
                action: "cycleShotgun"
            })
            // next move is dealer
        } 
        else {
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

function getLobbyInfo(lobbyId) {
    let lobbyListFile = fs.readFileSync("./lobbies.json"); // read database
    return JSON.parse(lobbyListFile)[`lobby-${lobbyId}`]; // get data about the current player
}

// TODO: we need to create fucking lobbies
// function createLobby() {
//     let lobbyInfo = 
// }

function changeLobbyInfo(lobbyId, callback) {
    let lobbyListFile = fs.readFileSync("./lobbies.json"); // read database
    let lobbyInfo = JSON.parse(lobbyListFile); // get data about the current player

    switch(callback.action) {
        case "changeShotgunSawedOffStatus":
            lobbyInfo[`lobby-${lobbyId}`].isShotgunSawedOff = callback.data.newShotgunSawedOffStatus
            fs.writeFileSync("./lobbies.json", JSON.stringify(lobbyInfo));
            break;
        case "changeShotgunAmmo":
            callback.data.newShotgunAmmo
            break;
        case "changeAiInventory":
            lobbyInfo[`lobby-${lobbyId}`].aiInventory = callback.data.newAiInventory
            fs.writeFileSync("./lobbies.json", JSON.stringify(lobbyInfo));
            break;
        case "changeAiHealth":
            lobbyInfo[`lobby-${lobbyId}`].aiHealth += callback.data.changeBy
            fs.writeFileSync("./lobbies.json", JSON.stringify(lobbyInfo));
            break;
        case "endGame":
            callback.data.item
            break;
        case "cycleShotgun":
            lobbyInfo[`lobby-${lobbyId}`].shotgun.shift();
            fs.writeFileSync("./lobbies.json", JSON.stringify(lobbyInfo));
            break;
    }
}

function removeItemFromInventory(userId, callback) {
    if(callback.data.author == "player") {
        let playerInfo = getPlayerInfo(userId)
        playerInfo.inventory = playerInfo.inventory.filter((element) => {
            return element != callback.data.item
        })

        changePlayerInfo(userId, {
            action: "changeInventory",
            data: {
                newInventory: playerInfo.inventory
            }
        })
    }
    else if(callback.data.author == "ai") {
        let lobbyInfo = getLobbyInfo(callback.data.lobby.id)
        lobbyInfo.aiInventory = lobbyInfo.aiInventory.filter((element) => {
            return element != callback.data.item
        })

        changeLobbyInfo(callback.data.lobby.id, {
            action: "changeAiInventory",
            data: {
                newAiInventory: lobbyInfo.aiInventory
            }
        })
    }
}

async function game(ctx, callback) {
    switch(callback.action) { // TODO: take items away from playes/ai when they use them. Also add actions when ai uses items
        case "gameStart":
            break;
        case "useItem":
            let checks = await ( async () => { // check if author is handcuffed and has an item
                if(callback.data.author == "ai") {
                    let lobbyInfo = await getLobbyInfo(callback.data.lobby.id);
                    
                    if(lobbyInfo.aiInventory.includes("HandcuffsOn") == true) { // first layer of checks, check if author is handcuffed
                        return "no-no wanna :("
                    }
                    else { // second layer, check if author has item
                        if(lobbyInfo.aiInventory.includes(callback.data.item) == false) {
                            return "no-no wanna :("
                        }
                    }
                }
                else if(callback.data.author == "player") {
                    let playerInfo = await getPlayerInfo(ctx.update.callback_query.from.id)

                    if(playerInfo.inventory.includes("HandcuffsOn") == true) { // first layer of checks, check if author is handcuffed
                        return "no-no wanna :("
                    }
                    else { // second layer, check if author has item
                        if(playerInfo.inventory.includes(callback.data.item) == false) {
                            ctx.editMessageText(`You can't use this item because you don't have it in your inventory.`)
                            return "no-no wanna :("
                        }
                    }
                }
            })();

            if(checks === "no-no wanna :(") { // if one of the check failes = terminate the switch statement
                break;
            }

            switch(callback.data.item) {
                case "Shotgun":
                    if(callback.data.action == "shootYourself") {
                        if(callback.data.author == "player") {
                            shootShotgun({
                                action: "shootYourself",
                                data: {
                                    lobby: {
                                        id: ctx.update.callback_query.from.id
                                    }
                                }
                            })
                        }
                    }
                    else if(callback.data.action == "shootOpponent") {
                        if(callback.data.author == "player") {
                            shootShotgun({
                                action: "shootOpponent",
                                data: {
                                    lobby: {
                                        id: ctx.update.callback_query.from.id
                                    }
                                }
                            })
                        }
                    }
                    
                    break;
                case "Beer":
                    changeLobbyInfo(callback.data.lobby.id, {
                        action: "cycleShotgun"
                    })
                    break;
                case "Cigarette":
                    if(callback.data.author == "player") {
                        changePlayerInfo(ctx.update.callback_query.from.id, {
                            action: "changeHealth",
                            data: {
                                changeBy: 1
                            }
                        })
                    }
                    break;
                case "Magnifying glass":
                    if(callback.data.author == "player") {
                        let currentAmmo = (() => {
                            const lobbyInfo = getLobbyInfo(ctx.update.callback_query.from.id);
    
                            if(lobbyInfo.shotgun[0] == 0) {
                                return "Blank."
                            }
                            else if(lobbyInfo.shotgun[0] == 1){
                                return "Live ammunition."
                            }
                        })();
    
                        ctx.sendMessage(currentAmmo, ctx.update.callback_query.from.id)
                    }
                    break;
                case "Handcuffs":
                    if(callback.data.author == "player") {
                        let lobbyInfo = getLobbyInfo(callback.data.lobby.id)

                        if(lobbyInfo.aiInventory.includes("HandcuffsOn") == false) {
                            lobbyInfo.aiInventory.push("HandcuffsOn")
                            changeLobbyInfo(callback.data.lobby.id, {
                                action: "changeAiInventory",
                                data: {
                                    newAiInventory: lobbyInfo.aiInventory
                                }
                            })
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
                        changeLobbyInfo(callback.data.lobby.id, {
                            action: "changeShotgunSawedOffStatus",
                            data: {
                                newShotgunSawedOffStatus: true
                            }
                        })
                        removeItemFromInventory(callback.data.lobby.id, callback) // test function, i don't want to reuse the code below every time i need to remove an item from some1's inventory. Needs testing.
                        // if(callback.data.author == "player") {
                        //     let playerInfo = getPlayerInfo(ctx.update.callback_query.from.id)
                        //     playerInfo.inventory = playerInfo.inventory.filter((element) => {
                        //         return element != callback.data.item
                        //     })

                        //     changePlayerInfo(ctx.update.callback_query.from.id, {
                        //         action: "changeInventory",
                        //         data: {
                        //             newInventory: playerInfo.inventory
                        //         }
                        //     })
                        // }
                        // else if(callback.data.author == "ai") {
                        //     lobbyInfo.aiInventory = lobbyInfo.aiInventory.filter((element) => {
                        //         return element != callback.data.item
                        //     })

                        //     changeLobbyInfo(callback.data.lobby.id, {
                        //         action: "changeAiInventory",
                        //         data: {
                        //             newAiInventory: lobbyInfo.aiInventory
                        //         }
                        //     })
                        // }
                    }
                    else {
                        return ctx.editMessageText("You can't use this item, the shotgun is already sawn off.")
                    }
                    break;
            }
            ctx.editMessageText(`You used ${callback.data.item}`)
            break;
        case "endGame":
            break;
    }
}

module.exports = {
    game,
    items,
    addUser
};