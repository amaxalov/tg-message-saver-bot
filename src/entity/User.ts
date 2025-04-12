import { Entity, PrimaryGeneratedColumn, Column, OneToMany, JoinColumn } from 'typeorm'
import { Message } from './Message'

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

  @OneToMany(() => Message, (message) => message.user)
  @JoinColumn()
  messages!: Message[]
}
