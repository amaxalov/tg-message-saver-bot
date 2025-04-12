import { Telegraf, Context } from 'telegraf'
import dotenv from 'dotenv'
import type { Update } from '@telegraf/types'
import 'reflect-metadata'
import { AppDataSource } from './data-source'
import { User } from './entity/User'
import { userLoginHandler } from './handlers/user-login-handler'
import { Sender } from './entity/Sender'
import { Message } from './entity/Message'

dotenv.config()

const token = process.env.TELEGRAM_TOKEN
if (!token) {
  process.exit(1)
}
const bot = new Telegraf(token)
const imageUrl = 'https://i.ibb.co/gLWbCjXY/photo-2025-04-03-07-03-17.jpg'

let user: User | null = null

const sendFirstMessage = async (ctx: Context<any>): Promise<void> => {
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

bot.command('start', async (ctx: Context<Update.MessageUpdate>): Promise<void> => {
  await sendFirstMessage(ctx)

  await ctx.reply(
    '<b>✅ За регистрацию вам предоставлен пробный период на 7 дней</b>\n\nСкорее подключайте бота и используйте все его возможности!',
    { parse_mode: 'HTML' }
  )

  console.log('ctx', ctx)

  user = await userLoginHandler(ctx.update.message.from)
})

bot.on('message', async (ctx) => {
  await sendFirstMessage(ctx)
})

bot.on('business_message', async (ctx: Context<Update.BusinessMessageUpdate>): Promise<void> => {
  if (!user) {
    const fetchedUser = await userLoginHandler(ctx.update.business_message.from)
    if (!fetchedUser) {
      console.error('User not found')
      return
    }
    user = fetchedUser
  }
  const message = ctx.update.business_message
  const sender = message.from
  console.log('sender', sender)
  console.log('message', message)
  const senderRepository = AppDataSource.getRepository(Sender)
  const senderEntity = await senderRepository.findOne({
    where: {
      telegramId: String(sender.id),
    },
  })

  const newMessage = new Message()
  newMessage.messageId = message.message_id
  // @ts-ignore
  newMessage.text = message.text
  newMessage.createdAt = new Date()
  newMessage.user = user

  if (!senderEntity) {
    const newSender = new Sender()
    newSender.telegramId = String(sender.id)
    newSender.first_name = sender.first_name
    newSender.last_name = sender.last_name || ''
    newSender.username = sender.username || ''
    newSender.user = user

    newMessage.sender = newSender
    newSender.messages = [newMessage]

    console.log('newSender', newSender)

    // await senderRepository.save(newSender)
  } else {
    console.log('senderEntity', senderEntity)
    senderEntity.messages.push(newMessage)
    // await senderRepository.save(senderEntity)
  }
})

bot.on('edited_business_message', async (ctx: Context<Update.EditedBusinessMessageUpdate>): Promise<void> => {
  const message = ctx.update.edited_business_message
  console.log('message', message)
  const messageRepository = AppDataSource.getRepository(Message)

  const editedMessage = await messageRepository.findOne({
    where: {
      messageId: message.message_id,
    },
    relations: ['sender'],
  })

  if (!editedMessage) {
    console.error('Message not found')
    return
  }
  // @ts-ignore
  editedMessage.text = message.text

  await messageRepository.save(editedMessage)
})

bot.on('deleted_business_messages', async (ctx) => {
  // const deleted = ctx.update.deleted_business_messages.chat as Chat.PrivateChat
  // const data = await readData()
  // if (data.userId && deleted.id !== ctx.botInfo.id) {
  //   await ctx.telegram.sendMessage(
  //     data.userId,
  //     `📝 Сообщение удалено:\n` +
  //       `От: ${deleted.first_name} ${deleted.last_name || ''} (@${deleted.username || 'нет username'})`,
  //     { parse_mode: 'HTML' }
  //   )
  // }
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
