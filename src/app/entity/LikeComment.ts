import { Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne } from "typeorm";
import { User } from './User'
import { Comment } from './Comment'

@Entity()

export class LikeComment {
  
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(type => User, user => user.id, { nullable: false, eager: true })
  user: User;

  @ManyToOne(type => Comment, comment => comment.likes, { nullable: false, eager: true })
  comment: number;

  @CreateDateColumn({ select: false })
  createDate: Date;

  @UpdateDateColumn()
  updateDate: Date;

}