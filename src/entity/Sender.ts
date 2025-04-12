import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, OneToMany, JoinColumn } from 'typeorm'
import { User } from './User'
import { Message } from './Message'

@Entity()
export class Sender {
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  first_name!: string

  @Column()
  last_name!: string

  @Column()
  username!: string

  @Column()
  telegramId!: string

  @ManyToOne(() => User, (user) => user.senders, {
    onDelete: 'CASCADE',
    cascade: true,
  })
  user!: User

  @OneToMany(() => Message, (message) => message.sender)
  @JoinColumn()
  messages!: Message[]
}
