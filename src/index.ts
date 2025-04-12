import { Telegraf, Context } from 'telegraf'
import dotenv from 'dotenv'
import type { Chat } from '@telegraf/types'
import 'reflect-metadata'
import type { BotData } from './types'
import { AppDataSource } from './data-source'
import { User } from './entity/User'

dotenv.config()

const token = process.env.TELEGRAM_TOKEN
if (!token) {
  process.exit(1)
}
const bot = new Telegraf(token)
const imageUrl = 'https://i.ibb.co/gLWbCjXY/photo-2025-04-03-07-03-17.jpg'

const readData = async (): Promise<BotData> => {
  return { userId: null }
}

const saveData = async (): Promise<void> => {
  console.error('Error saving data:')
}

const sendFirstMessage = async (ctx: Context): Promise<void> => {
  await ctx.replyWithPhoto(imageUrl, {
    caption: `🕵️‍♂️ Наш бот создан для отслеживания действий собеседников в переписке.\n\n<blockquote>Если ваш собеседник изменит или удалит сообщение — вы моментально об этом узнаете 📱\n\nТакже бот умеет скачивать одноразовые (отправленные с таймером) фото, видео, голосовые и кружки ⌛️</blockquote>\n\n❓ Как подключить бота — смотри на картинке 👆\n\nИмя бота: <code>@${ctx.botInfo?.username}</code> (скопируйте для подключения)\n\nДемонстрация работы бота:`,
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [{ text: 'Подключить бота', callback_data: 'connect_bot' }],
        [{ text: 'Инструкция', callback_data: 'instruction' }],
      ],
    },
  })
}

bot.command('start', async (ctx: Context): Promise<void> => {
  await sendFirstMessage(ctx)

  const data = await readData()
  if (ctx.chat) {
    data.userId = ctx.chat.id
    await saveData()
  }

  await ctx.reply(
    '<b>✅ За регистрацию вам предоставлен пробный период на 7 дней</b>\n\nСкорее подключайте бота и используйте все его возможности!',
    { parse_mode: 'HTML' }
  )

  const userRepository = AppDataSource.getRepository(User)

  console.log('ctx', ctx)

  const user = new User()
  user.firstName = 'Timber'
  user.lastName = 'Saw'
  user.telegramId = '1234567890'
  user.registrationDate = new Date()
  user.trialPeriodEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  await userRepository.save(user)

  const allUsers = await userRepository.find()

  console.log('allUsers', allUsers)

  // if (timber) {
  //   await userRepository.remove(timber)
  // }
})

bot.on('message', async (ctx) => {
  await sendFirstMessage(ctx)
})

bot.on('business_message', async (): Promise<void> => {
  // db sender
})

bot.on('edited_business_message', async (ctx) => {
  const message = ctx.update.edited_business_message

  const data = await readData()
  if (data.userId && message.from.id !== ctx.botInfo.id) {
    await ctx.telegram.sendMessage(
      data.userId,
      `📝 Сообщение изменено:\n` +
        `От: ${message.from.first_name} ${message.from.last_name || ''} (@${message.from.username || 'нет username'})`,
      { parse_mode: 'HTML' }
    )
  }
})

bot.on('deleted_business_messages', async (ctx) => {
  const deleted = ctx.update.deleted_business_messages.chat as Chat.PrivateChat

  const data = await readData()

  if (data.userId && deleted.id !== ctx.botInfo.id) {
    await ctx.telegram.sendMessage(
      data.userId,
      `📝 Сообщение удалено:\n` +
        `От: ${deleted.first_name} ${deleted.last_name || ''} (@${deleted.username || 'нет username'})`,
      { parse_mode: 'HTML' }
    )
  }
})

bot.action('connect_bot', async (ctx: Context): Promise<void> => {
  await ctx.reply('Подключение бота...')
  await ctx.answerCbQuery()
})

bot.action('instruction', async (ctx: Context): Promise<void> => {
  await ctx.reply('Инструкция...')
  await ctx.answerCbQuery()
})

bot.catch((err: Error): void => {
  console.error('Bot error:', err)
})
;(async (): Promise<void> => {
  try {
    await AppDataSource.initialize()
    console.log('Data Source has been initialized!')
    await bot.launch()
  } catch (error) {
    console.error('Error during initialization:', error)
    process.exit(1)
  }
})()

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
