import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinTable, JoinColumn } from "typeorm";
import { User } from './User'
import { LikePost } from './LikePost'
import { Comment } from './Comment';
import { LikeComment } from './LikeComment'
@Entity()

export class Post {
  
  @PrimaryGeneratedColumn()
  id: number; 

  @ManyToOne(type => User, { nullable: false, eager: true })
  user: User;

  @Column({ length: 250 })
  post: string;

  @OneToMany(type => LikePost, likePost => likePost.post)
  likes: LikePost[];


  @OneToMany(type => Comment, comment => comment.post)
  comments: Comment[];

  @CreateDateColumn({ select: true })
  createDate: Date;

  @UpdateDateColumn({ select: false })
  updateDate: Date;

}