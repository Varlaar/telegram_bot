import { Telegraf } from "telegraf";
import { fmt, bold, mention } from "telegraf/format";
import requestWeather from "./api/weatherAPI.js";
import "dotenv/config";

const { BOT_TOKEN } = process.env; // Деструктуризация BOT_TOKEN из .env
// if (!BOT_TOKEN) throw new Error('"BOT_TOKEN" env var is required!'); // Проверка существует ли токен

/* Эта переменная содержит номер порта, который будет использоваться вебхуком, и она должна быть настроена на вашем бесплатном хостинге.
Например, для хостинга Heroku эта переменная будет автоматически установлена для вашего приложения.
Если порт не был установлен, то по умолчанию используется порт 443 для HTTPS или порт 80 для HTTP. */
const options = {
  webHook: {
    port: process.env.PORT,
  },
};

const url = "https://shirmanov-tech-bot.onrender.com"; // url хостинга

const bot = new Telegraf(BOT_TOKEN, options); // создаем новый экземпляр Telegram-бота

// bot.setWebHook(
//   `${url}/bot${BOT_TOKEN}`
// ); /* После установки вебхука Telegram будет отправлять все входящие сообщения и события боту по этому URL-адресу.
// Таким образом, бот будет получать уведомления в режиме реального времени вместо опроса сервера Telegram на наличие новых сообщений.
// */

// Команды меню
const commands = [
  { command: "start", description: "Перезапустить бота" },
  { command: "weather", description: "Узнать погоду" },
  { command: "time", description: "Узнать время" },
];

// Обработчик команды /start
bot.command("start", (ctx) => {
  ctx.reply(
    `Добро пожаловать, ${ctx.update.message.from.first_name}! Меня зовут ShirmanovTech бот.`
  );
  bot.telegram.setMyCommands(commands);
});

// Обработчик команды /weather
bot.command("weather", async (ctx) => {
  await ctx.reply("Какой город вас интересует?");
  await ctx.reply(`/Ulyanovsk`);
});

// Обработчик команды /weather
bot.command("time", async (ctx) => {
  await ctx.reply("Какой город вас интересует?");
  await ctx.reply(`/Ulyanovsk`);
});

// Получение данных о температуре
bot.on("message", async (ctx) => {
  try {
    const message = ctx.message.text;
    const response = await requestWeather(message);
    const city = response.data.location.name;
    const temp_c = response.data.current.temp_c;
    ctx.reply(
      fmt`Текущая температура в ${bold`${mention(
        city,
        ctx.from.id
      )}`}${bold` : ${temp_c}`}°C`
    );
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

// запускает бота и начинает прослушивать входящие сообщения и команды от пользователей
bot.launch();

// Остановка бота
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
