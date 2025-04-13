import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm'
import { User } from './User'
import { Sender } from './Sender'

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  messageId!: string

  @Column()
  text!: string

  @Column()
  createdAt!: Date

  @Column({ nullable: true })
  assets!: string

  @ManyToOne(() => User, (user) => user.messages, {
    onDelete: 'CASCADE',
    cascade: true,
  })
  user!: User

  @ManyToOne(() => Sender, (sender) => sender.messages)
  sender!: Sender
}
