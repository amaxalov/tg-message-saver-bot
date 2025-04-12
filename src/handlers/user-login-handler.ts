import type { User as TelegramUser } from '@telegraf/types'
import { AppDataSource } from '../data-source'
import { User } from '../entity/User'

export async function userLoginHandler(from: TelegramUser): Promise<User | null> {
  if (!from) {
    return null
  }

  const userRepository = AppDataSource.getRepository(User)
  const user = await userRepository.findOne({ where: { telegramId: String(from.id) } })

  if (!user) {
    const newUser = new User()
    newUser.firstName = from.first_name
    newUser.lastName = from.last_name || ''
    newUser.telegramId = String(from.id)
    newUser.is_premium = from.is_premium || false
    newUser.language_code = from.language_code || 'ru'
    newUser.username = from.username || ''
    newUser.registrationDate = new Date()
    newUser.trialPeriodEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    const savedUser = await userRepository.save(newUser)

    return savedUser
  } else {
    return user
  }
}
