const { Telegraf, Markup } = require('telegraf');
const { token, adPrice, adminChatId } = require('./config.json');
const fs = require('fs');

const bot = new Telegraf(token);

const userStates = new Map();

async function waitForAd(ctx) {
    ctx.deleteMessage();
    const userId = parseInt(ctx.match[1]);
    userStates.set(userId, { isListening: true });
    ctx.reply('Очікую на повідомлення... ⏳');
}

bot.start((ctx) => {
    const chatId = ctx.chat.id;
    const isPrivateChat = ctx.chat.type === 'private';

    const userId = ctx.from.id;

    if (isPrivateChat) {
        ctx.replyWithMarkdownV2(`Ласкаво просимо до Оренди Авто Тернопіль\\!\nЩоби залишити свою заявку на оголошення, використайте команду \/newad\n***НЕ ЗАБУВАЙТЕ\\!*** Оголошення не безкоштовні\\! Ціна одного оголошення ${adPrice}₴\\(грн\\)`)
    }
});

bot.command('newad', async (ctx) => {
    fs.readFile('bannedIds.json', 'utf8', async (error, data) => {
        if (error) {
            console.error('Error reading the file:', err);
            return;
        }

        const userIds = JSON.parse(data);
        const isIncluded = userIds.includes(parseInt(ctx.update.message.from.id));

        if (isIncluded) {
            return ctx.reply("❌ Ви заблоковані від додавання нових оголошень!")
        }
        else {
            const chatId = ctx.chat.id;
            const isPrivateChat = ctx.chat.type === 'private';

            const userId = ctx.from.id;

            if (isPrivateChat) {
                await ctx.replyWithMarkdownV2(`Приклад оголошення:`)
                await ctx.replyWithPhoto({url: "https://cdn.vo1ter.me/lanos.webp"}, {caption: `Daewoo Lanos, 1.3 газ/бензин, розхід 8л/100км, 2000 грн/тиждень.\nЯ відповідаю за ремонт та обслуговування.\n\nУмови оренди:\nПотрібний депозит у розмірі 100 доларів США + попередження за 1 тиждень до початку оренди. Здається в оренду від 1 місяця. (Не здаю на 1-2 тижні)\nПеред початком роботи водії проходять перевірку по базах МВС.\nБезвіповідальним та залежним не турбувати.\nВік понад 25 років з досвідом від 3 років\nРозрахунок в кінці кожного тижня. Реєстрація у Тернополі.\nЗ та без брендування.\n+380XXXXXXXX Олег`})
                const inlineKeyboard = Markup.inlineKeyboard([
                    Markup.button.callback('✔ Так', `continue:${userId}`),
                    Markup.button.callback('❌ Ні', 'cancel'),
                ]);

                ctx.reply('Бажаєте продовжити?', inlineKeyboard);
            }
        }
    });
});

bot.action(/continue:(\d+)/, (ctx) => {
    waitForAd(ctx);
});

bot.action(/edit:(\d+)/, (ctx) => {
    waitForAd(ctx);
});

bot.on('message', async (ctx) => {
    const userId = ctx.from.id;
    const userState = userStates.get(userId);

    if (userState && userState.isListening) {
        if (ctx.message.photo == undefined) {
            return ctx.reply("Будь ласка, додайте хочаб одне фото.")
        } 
        await ctx.reply('Повідомлення отримано. Перевірте ваше оголошення:');
        await bot.telegram.forwardMessage(ctx.chat.id, ctx.chat.id, ctx.update.message.message_id)
        userState.isListening = false;

        const inlineKeyboard = Markup.inlineKeyboard([
            Markup.button.callback('✔ Так, я хочу відправити моє оголошення', `sendAdToAdmins`),
            Markup.button.callback('✍ Ні, я хочу редагувати моє оголошення', `edit:${userId}`),
            Markup.button.callback('❌ Ні, я не хочу відправляти це оголошення', 'cancel')
        ]);
    
        ctx.reply('Бажаєте відправити ваше оголошення на огляд?', inlineKeyboard);
    }
});

bot.action("sendAdToAdmins", async (ctx) => {
    await ctx.deleteMessage()
    await bot.telegram.forwardMessage(adminChatId, ctx.chat.id, ctx.update.callback_query.message.message_id - 1);
    await bot.telegram.sendMessage(adminChatId, `Нікнейм користувача: \@${ctx.update.callback_query.from.username}\nID користувача: ${ctx.update.callback_query.from.id}`)
    await ctx.reply('Ваше оголошення потрапило на огляд. Очікуйте доки з вами зв\'яжуться для обговорення деталей.');
});

bot.action('cancel', (ctx) => {
    ctx.deleteMessage();
    ctx.reply('Дію відмінено.');
});

bot.startPolling();