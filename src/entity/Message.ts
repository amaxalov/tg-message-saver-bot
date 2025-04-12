import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm'
import { User } from './User'

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

  @Column()
  assets!: string

  @ManyToOne(() => User, (user) => user.messages, {
    onDelete: 'CASCADE',
    cascade: true,
  })
  user!: User
}
