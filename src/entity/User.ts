import { Entity, PrimaryGeneratedColumn, Column, OneToMany, JoinColumn } from 'typeorm'
import { Message } from './Message'
import { Sender } from './Sender'

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  firstName!: string

  @Column()
  lastName!: string

  @Column()
  telegramId!: string

  @Column()
  registrationDate!: Date

  @Column({ nullable: true })
  trialPeriodEnd!: Date

  @Column({ nullable: true })
  subscriptionEndDate!: Date

  @Column({ nullable: true })
  subscriptionStartDate!: Date

  @Column({ nullable: true })
  is_premium!: boolean

  @Column({ nullable: true })
  language_code!: string

  @Column({ nullable: true })
  last_name!: string

  @Column({ nullable: true })
  username!: string

  @OneToMany(() => Message, (message) => message.user)
  @JoinColumn()
  messages!: Message[]

  @OneToMany(() => Sender, (sender) => sender.user)
  @JoinColumn()
  senders!: Sender[]

  @Column({ type: 'jsonb', default: [] })
  business_connection_ids!: string[]
}
