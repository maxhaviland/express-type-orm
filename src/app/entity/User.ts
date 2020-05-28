import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { Post } from "./Post";
import { Follower } from './Follower';
import { LikePost } from './LikePost'

@Entity()

export class User {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, nullable: false, select: true })
  firstName: string;

  @Column({ length: 50, nullable: false, select: true })
  lastName: string;

  @Column({ nullable: false, select:false })
  dateOfBirth: Date;

  @Column({ unique: true, length: 100, nullable: false, select: false })
  email: string;

  @Column({ unique: true, length: 50, nullable: false })
  username: string;

  @Column({ length: 100, nullable: false, select: false })
  password: string;

  @Column({ length: 1, nullable: false, select: false })
  sex: string;

  @Column({ default: false, select: false })
  isActive: boolean;

  @OneToMany(type => Post, post => post.user)
  posts: Post[];

  @OneToMany(type => Follower, follower => follower.follower)
  followers: Follower[];

  @OneToMany(type => Follower, follower => follower.followed)
  following: Follower[];

  @OneToMany(type => LikePost, likePost => likePost.user)
  likePost: LikePost[];

  @Column({ default: false, select: false })
  firstAccess: boolean;

  @Column({ select: false, nullable: true })
  requestToken: string;

  @Column({ select: false, nullable: true })
  timeRequestToken: Date;

  @CreateDateColumn({ select: false })
  createDate: Date;

  @UpdateDateColumn({ select: false })
  updateDate: Date;

  public setId(id: number) {
    this.id = id;
  }

}