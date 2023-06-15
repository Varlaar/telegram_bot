import { Telegraf } from "telegraf";
import { commands } from "./assets/constants.js";
import requestWeather from "./api/weatherAPI.js";
import "dotenv/config";

const { BOT_TOKEN } = process.env; // Деструктуризация BOT_TOKEN из .env
if (!BOT_TOKEN) throw new Error('"BOT_TOKEN" env var is required!'); // Проверка существует ли токен

const { WEBHOOK_DOMAIN } = process.env; // url хостинга
const { PORT } = process.env; // url хостинга

const bot = new Telegraf(BOT_TOKEN); // создаем новый экземпляр Telegram-бота

bot.telegram.setMyCommands(commands); // Команды меню

// Обработчик команды /start
bot.command("start", (ctx) => {
  ctx.reply(
    `Добро пожаловать, ${ctx.update.message.from.first_name}! Меня зовут ShirmanovTech бот.`
  );
});

// Обработчик команды /weather
bot.command("weather", async (ctx) => {
  try {
    await ctx.reply("Какой город вас интересует?");
    await ctx.reply(`/Ulyanovsk`);
  } catch (err) {
    console.log(err.message);
  }
});

// Получение данных о температуре
bot.on("message", async (ctx) => {
  try {
    const message = ctx.message.text;
    const response = await requestWeather(message);
    const city = response.data.location.name;
    const temp_c = response.data.current.temp_c;
    ctx.reply(`Текущая температура в <b>${city}</b>: <b>${temp_c}</b>°C`, {
      parse_mode: "HTML",
    });
  } catch (err) {
    if (err.response && err.response.status === 400) {
      ctx.reply(
        `Город с таким названием не найден.\nПроверьте правильность написания города.`
      );
    } else {
      console.log(err.message);
      ctx.reply(`Произошла ошибка. Попробуйте позднее.`);
    }
  }
});

// // // запускает бота и начинает прослушивать входящие сообщения и команды от пользователей
bot.launch({
  webhook: {
    domain: WEBHOOK_DOMAIN,
    port: PORT
  }
})

// Остановка бота
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
