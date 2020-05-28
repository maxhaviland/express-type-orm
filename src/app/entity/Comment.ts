import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from "typeorm";
import { User } from './User'
import { Post } from './Post'
import { LikeComment } from './LikeComment';

@Entity()

export class Comment {
  
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(type => User, user => user.id, { nullable: false, eager: true })
  user: number;

  @ManyToOne(type => Post, post => post.comments, { nullable: false, eager: true })
  post: number;

  @Column({ length: 250 })
  comment: string;

  @OneToMany(type => LikeComment, likeComment => likeComment.comment)
  likes: LikeComment[];

  @CreateDateColumn({ select: false })
  createDate: Date;

  @UpdateDateColumn()
  updateDate: Date;

}