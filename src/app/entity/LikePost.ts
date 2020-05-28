import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from "typeorm";
import { User } from './User'
import { Post } from './Post'

@Entity()

export class LikePost {
  
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(type => User, user => user.likePost, { nullable: false, eager: true })
  user: User;

  @ManyToOne(type => Post, post => post.likes, { nullable: false, eager: true })
  post: number;

  @CreateDateColumn({ select: false })
  createDate: Date;

  @UpdateDateColumn()
  updateDate: Date;

}