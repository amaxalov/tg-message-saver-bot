import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import type { Context } from 'telegraf';
import type { BotData } from './types';
import type { Chat } from '@telegraf/types';

dotenv.config();

const token = process.env.TELEGRAM_TOKEN;
if (!token) {
  process.exit(1);
}

// Создаем файл data.json при первом запуске, если его нет
const initDataFile = async () => {
  try {
    await fs.access('data.json');
  } catch {
    await fs.writeFile('data.json', JSON.stringify({ userId: null }, null, 2));
  }
};

const bot = new Telegraf(token);

const imageUrl = 'https://i.ibb.co/gLWbCjXY/photo-2025-04-03-07-03-17.jpg';

// Функция для чтения данных из файла
const readData = async () => {
  try {
    const data = await fs.readFile('data.json', 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { userId: null };
  }
};

// Функция для сохранения данных в файл
const saveData = async (data: BotData) => {
  try {
    await fs.writeFile('data.json', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error saving data:', error);
  }
};

const sendFirstMessage = async (ctx: Context) => {
  await ctx.replyWithPhoto(imageUrl, {
    caption: `🕵️‍♂️ Наш бот создан для отслеживания действий собеседников в переписке.\n\n<blockquote>Если ваш собеседник изменит или удалит сообщение — вы моментально об этом узнаете 📱\n\nТакже бот умеет скачивать одноразовые (отправленные с таймером) фото, видео, голосовые и кружки ⌛️</blockquote>\n\n❓ Как подключить бота — смотри на картинке 👆\n\nИмя бота: <code>@${ctx.botInfo?.username}</code> (скопируйте для подключения)\n\nДемонстрация работы бота:`,
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [{ text: 'Подключить бота', callback_data: 'connect_bot' }],
        [{ text: 'Инструкция', callback_data: 'instruction' }]
      ]
    }
  });
}

bot.command('start', async (ctx) => {
  await sendFirstMessage(ctx);
  
  const data = await readData();
  data.userId = ctx.chat.id;
  await saveData(data);
  
  await ctx.reply(
    '<b>✅ За регистрацию вам предоставлен пробный период на 7 дней</b>\n\nСкорее подключайте бота и используйте все его возможности!',
    { parse_mode: 'HTML' }
  );
});

bot.on('message', async (ctx) => {
  await sendFirstMessage(ctx);
});

bot.on('business_message', async (ctx) => {
  // db sender
});

bot.on('edited_business_message', async (ctx) => {
  const message = ctx.update.edited_business_message;
  
  const data = await readData();
  if (data.userId && message.from.id !== ctx.botInfo.id) {
    await ctx.telegram.sendMessage(
      data.userId,
      `📝 Сообщение изменено:\n` +
      `От: ${message.from.first_name} ${message.from.last_name || ''} (@${message.from.username || 'нет username'})`,
      { parse_mode: 'HTML' }
    );
  }
});

bot.on('deleted_business_messages', async (ctx) => {
  const deleted = ctx.update.deleted_business_messages.chat as Chat.PrivateChat;
  
  const data = await readData();

  if (data.userId && deleted.id !== ctx.botInfo.id) {
    await ctx.telegram.sendMessage(
      data.userId,
      `📝 Сообщение удалено:\n` +
      `От: ${deleted.first_name} ${deleted.last_name || ''} (@${deleted.username || 'нет username'})`,
      { parse_mode: 'HTML' }
    );
  }
});

bot.action('connect_bot', async (ctx) => {
  await ctx.reply('Подключение бота...');
  await ctx.answerCbQuery();
});

bot.action('instruction', async (ctx) => {
  await ctx.reply('Инструкция...');
  await ctx.answerCbQuery();
});

bot.catch((err) => {
  console.error('Bot error:', err);
});

(async () => {
  try {
    await initDataFile();
    await bot.launch();
  } catch (error) {
    console.error('Error during bot initialization:', error);
    process.exit(1);
  }
})();

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))