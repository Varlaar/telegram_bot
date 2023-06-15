import { Telegraf } from "telegraf";
import requestWeather from "./api/weatherAPI.js";
import "dotenv/config";

const { BOT_TOKEN, WEBHOOK_URL, PORT } = process.env;

if (!BOT_TOKEN) throw new Error('"BOT_TOKEN" env var is required!');

const bot = new Telegraf(BOT_TOKEN);

bot.start((ctx) =>
  ctx.reply(
    `Добро пожаловать, ${ctx.update.message.from.first_name}! Меня зовут ShirmanovTech бот.`
  )
);

bot.command("weather", async (ctx) => {
  try {
    await ctx.reply("Какой город вас интересует?");
    await ctx.reply("/Ulyanovsk");
  } catch (err) {
    console.log(err.message);
  }
});

bot.on("message", async (ctx) => {
  try {
    const message = ctx.message.text;
    const response = await requestWeather(message);
    const city = response.data.location.name;
    const temp_c = response.data.current.temp_c;
    ctx.reply(`Текущая температура в ${city}: ${temp_c}°C`);
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

bot.telegram.setWebhook(`${WEBHOOK_URL}/bot${BOT_TOKEN}`);
bot.startWebhook(`/bot${BOT_TOKEN}`, null, PORT);

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM")); 

