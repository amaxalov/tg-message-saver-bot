import { Telegraf, Context } from 'telegraf'
import dotenv from 'dotenv'
import type { Update } from '@telegraf/types'
import 'reflect-metadata'
import { In } from 'typeorm'
import { AppDataSource } from './data-source'
import { userLoginHandler } from './handlers/user-login-handler'
import { Sender } from './entity/Sender'
import { Message } from './entity/Message'
import { User } from './entity/User'

dotenv.config()

const token = process.env.TELEGRAM_TOKEN

if (!token) {
  process.exit(1)
}

const bot = new Telegraf<Context>(token)
const imageUrl = 'https://i.ibb.co/gLWbCjXY/photo-2025-04-03-07-03-17.jpg'

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

  await userLoginHandler(ctx.update.message.from)
})

bot.on('message', async (ctx: Context<Update.MessageUpdate>) => {
  await sendFirstMessage(ctx)
})

bot.on('business_message', async (ctx: Context<Update.BusinessMessageUpdate>): Promise<void> => {
  const message = ctx.update.business_message
  const currentUser = ctx.update.business_message.from.id
  const userRepository = AppDataSource.getRepository(User)
  const userEntity = await userRepository.findOne({
    where: {
      telegramId: String(currentUser),
    },
  })

  if (!userEntity) {
    const ownerEntity = await userRepository.findOne({
      where: {
        business_connection_ids: In([String(message.business_connection_id)]),
      },
    })

    if (!ownerEntity) {
      console.log('ownerEntity not found')
      return
    }

    const text = (message as typeof ctx.update.business_message & { text: string }).text
    const sender = message.from
    const senderRepository = AppDataSource.getRepository(Sender)
    const senderEntity = await senderRepository.findOne({
      where: {
        telegramId: String(sender.id),
      },
    })

    const newMessage = new Message()
    newMessage.messageId = String(message.message_id)
    newMessage.text = text
    newMessage.createdAt = new Date()
    newMessage.user = ownerEntity

    if (!senderEntity) {
      const newSender = new Sender()
      newSender.telegramId = String(sender.id)
      newSender.first_name = sender.first_name
      newSender.last_name = sender.last_name || ''
      newSender.username = sender.username || ''
      newSender.user = ownerEntity

      newMessage.sender = newSender
      newSender.messages = [newMessage]

      await senderRepository.save(newSender)
    } else {
      newMessage.sender = senderEntity
      await senderRepository.manager.save(newMessage)
    }
  } else {
    if (!userEntity.business_connection_ids.includes(message.business_connection_id)) {
      userEntity.business_connection_ids = [...userEntity.business_connection_ids, message.business_connection_id]
      await userRepository.save(userEntity)
    }
  }
})

bot.on('edited_business_message', async (ctx: Context<Update.EditedBusinessMessageUpdate>): Promise<void> => {
  const message = ctx.update.edited_business_message
  const text = (message as typeof ctx.update.edited_business_message & { text: string }).text
  const messageRepository = AppDataSource.getRepository(Message)

  const editedMessage = await messageRepository.findOne({
    where: {
      messageId: String(message.message_id),
    },
    relations: ['sender'],
  })

  if (!editedMessage) {
    return
  }

  await ctx.telegram.sendMessage(
    editedMessage.sender.user.telegramId,
    `📝 Сообщение изменено:\n` +
      `От: ${editedMessage.sender.first_name} ${editedMessage.sender.last_name || ''} 
      (@${editedMessage.sender.username || ''})\n
      Прежнее сообщение: ${editedMessage.text}\n
      Новое сообщение: ${text}`,
    { parse_mode: 'HTML' }
  )

  editedMessage.text = text

  await messageRepository.save(editedMessage)
})

bot.on('deleted_business_messages', async (ctx: Context<Update.DeletedBusinessMessagesUpdate>): Promise<void> => {
  const message = ctx.update.deleted_business_messages
  const messageIds = message.message_ids
  const messageRepository = AppDataSource.getRepository(Message)

  const editedMessages = await messageRepository.find({
    where: {
      messageId: In(messageIds.map(String)),
    },
  })

  console.log('Found messages:', editedMessages)

  if (!editedMessages.length) {
    return
  }

  // Затем явно загрузим отношения для первого сообщения
  const firstMessage = await messageRepository
    .createQueryBuilder('message')
    .leftJoinAndSelect('message.sender', 'sender')
    .leftJoinAndSelect('sender.user', 'user')
    .where('message.id = :id', { id: editedMessages[0].id })
    .getOne()

  if (!firstMessage || !firstMessage.sender || !firstMessage.sender.user) {
    console.error('Failed to load message with relations')
    return
  }

  await ctx.telegram.sendMessage(
    firstMessage.sender.user.telegramId,
    `📝 Сообщение удалено:\n` +
      `От: ${firstMessage.sender.first_name} ${firstMessage.sender.last_name || ''} 
      (@${firstMessage.sender.username || ''})
      ${editedMessages.map((message) => `\n${message.text}`).join('')}`,
    { parse_mode: 'HTML' }
  )
})

bot.action('connect_bot', async (ctx: Context): Promise<void> => {
  await ctx.reply('Подключение бота...')
  await ctx.answerCbQuery()
})

bot.action('instruction', async (ctx: Context): Promise<void> => {
  await ctx.reply('Инструкция...')
  await ctx.answerCbQuery()
})

bot.on('business_connection', async (ctx) => {
  console.log('new_chat_members', ctx)
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
