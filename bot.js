const { Telegraf, Markup } = require('telegraf');
const gameModule = require('./game.js');
const items = gameModule.items;
require('dotenv').config();

const bot = new Telegraf(process.env.BOT_TOKEN)

const startMesage = "Welcome! Here are some basic rules:\n1. There are 3 rounds\n2. Each round there are a random ammount of buckshot and blank rounds inside the shotgun\n3. You always start first, and you decide wether you shoot the dealer or yourseld\n4. If you shoot yourself with a blank, you get one more move, but if you shoot dealer with a blank, he's gonna move next.\n5. If you shoot yourself with a buckshot, you lose health, if you shoot dealer with a buckshot, he looses health. \n6. If you get to 0 health, dealer wins, if dealer gets to 0 health, he looses and you move to the next round. \n7. If you win three rounds in a row, you win the game. \n\nGood luck!";

let itemsDescriptions = "Here are items that can be helpful. \n"

for(let i = 0; i < items.itemNames.length; i++) {
    let newItemIcons = items.itemIcons[i]
    let newItemName = items.itemNames[i]
    let newItemDescription = items.itemDescriptions[i]

    itemsDescriptions += `${i+1}. ${newItemIcons} ${newItemName} - ${newItemDescription}. `
}

const shootingButtons = Markup.inlineKeyboard([
    [Markup.button.callback('Shoot Yourself', 'shoot_yourself')],
    [Markup.button.callback('Shoot dealer', 'shoot_dealer')],
])

const inventoryButtons = Markup.inlineKeyboard([
    [Markup.button.callback('Use 🍺', 'use_beer')],
    [Markup.button.callback('Use 🚬', 'use_cigarette')],
    [Markup.button.callback('Use 🔍', 'use_magnifying_glass')],
    [Markup.button.callback('Use 🔗', 'use_handcuffs')],
    [Markup.button.callback('Use 🔪', 'use_saw')]
])

bot.start((ctx) => {
    gameModule.addUser(ctx.update.message.from.id)
    ctx.reply(startMesage)
});
bot.command('startgame', (ctx) => ctx.reply('Let the game begin!'))
bot.command('useitem', (ctx) => ctx.reply("What item do you want to use?", inventoryButtons))
bot.command('endgame', (ctx) => ctx.reply('Let the game begin!'))

bot.on('message', (ctx) => {
    if(ctx.update.message.text == "text") {
        return ctx.reply(
            'What do you want to do?',shootingButtons
        )
    }
});

// Using items

bot.action(/^use_\w+$/, async (ctx) => {
    const action = ctx.match.input;
    const item = action.split("use_")[1].replaceAll("_", " ");
    let allowedItems = []
    items.itemNames.forEach((element) => { allowedItems.push(element.toLowerCase()) })

    if(allowedItems.includes(item) == true) {
        await gameModule.game(ctx, 
            {
                action: "useItem",
                data: {
                    lobby: {
                        id: ctx.update.callback_query.from.id
                    },
                    item: item.charAt(0).toUpperCase() + item.slice(1), // all this shit is used to change the first letter from lowercase to uppercase
                    author: "player"
                }
            });
        ctx.editMessageText(`You used ${item}`)
    }
});

// Shooting actions
bot.action('shoot_yourself', (ctx) => {
    return ctx.editMessageText('You decide to shoot yourself')
    // Shooting logic
});

bot.action('shoot_dealer', (ctx) => {
    return ctx.editMessageText('You decide to shoot dealer')
    // Shooting logic
});

bot.launch().then(() => {
    console.log('Bot has been started :D') // this doesnt work btw
})

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))