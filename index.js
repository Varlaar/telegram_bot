import { Telegraf, Markup, Composer, Scenes, session } from "telegraf";
import { commands } from "./assets/constants.js";
import requestWeather from "./api/weatherAPI.js";
import "dotenv/config";

const { BOT_TOKEN } = process.env; // Деструктуризация BOT_TOKEN из .env
if (!BOT_TOKEN) throw new Error('"BOT_TOKEN" env var is required!'); // Проверка существует ли токен

const { WEBHOOK_DOMAIN } = process.env; // url хостинга
if (!WEBHOOK_DOMAIN) throw new Error('"WEBHOOK_DOMAIN" env var is required!'); // Проверка существует ли токен

const { PORT } = process.env; // url хостинга
if (!PORT) throw new Error('"PORT" env var is required!'); // Проверка существует ли токен

const bot = new Telegraf(BOT_TOKEN); // создаем новый экземпляр Telegram-бота

bot.telegram.setMyCommands(commands);

// Обработчик команды /start
bot.command("start", (ctx) => {
  ctx.replyWithHTML(
    `Добро пожаловать, <b><span class="tg-spoiler">${
      ctx.update.message.from.first_name
    } ${
      ctx.update.message.from?.last_name || ""
    }</span></b>!<tg-emoji emoji-id="128075">👋</tg-emoji>
Меня зовут <b>ShirmanovTech бот.</b><tg-emoji emoji-id="129302">🤖</tg-emoji>
Вот что я умею:`,
    Markup.inlineKeyboard([
      [Markup.button.callback("Узнать погоду в Ульяновске", "bth_ulsk")],
    ])
  );
});

// Обработчик команды /weather
bot.command("weather", async (ctx) => {
  try {
    await ctx.reply(
      "Какой город вас интересует?",
      Markup.inlineKeyboard([
        [Markup.button.callback("Узнать погоду в Ульяновске", "bth_ulsk")],
        [Markup.button.callback("Узнать погоду в другом городе", "bth_other")],
      ])
    );
  } catch (err) {
    console.log(err.message);
  }
});

bot.action("bth_ulsk", async (ctx) => {
  try {
    await ctx.answerCbQuery();
    const response = await requestWeather("Ульяновск");
    const city = response.data.location.name;
    const temp_c = response.data.current.temp_c;
    ctx.replyWithHTML(`Сейчас температура в <b>${city}е:</b> ${temp_c}°C`);
    ctx.deleteMessage();
  } catch (err) {
    console.log(err.message);
    ctx.reply(`Произошла ошибка. Попробуйте позднее.`);
  }
});

bot.action("bth_other", (ctx) => {
  ctx.reply("Данная функция находится в разработке.");
  ctx.deleteMessage();
});

// // Получение данных о температуре
// bot.on("message", async (ctx) => {
//   try {
//     const message = ctx.message.text;
//     const response = await requestWeather(message);
//     const city = response.data.location.name;
//     const temp_c = response.data.current.temp_c;
//     ctx.reply(`Текущая температура в <b>${city}:</b> <b>${temp_c}</b>°C`, {
//       parse_mode: "HTML",
//     });
//   } catch (err) {
//     if (err.response && err.response.status === 400) {
//       ctx.reply(
//         `Город с таким названием не найден.\nПроверьте правильность написания города.`
//       );
//     } else {
//       console.log(err.message);
//       ctx.reply(`Произошла ошибка. Попробуйте позднее.`);
//     }
//   }
// });

// // запускает бота и начинает прослушивать входящие сообщения и команды от пользователей
bot.launch({
  webhook: {
    domain: WEBHOOK_DOMAIN,
    port: PORT,
  },
});

// bot.launch().then(console.log("Бот запущен!"));

// Остановка бота
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
