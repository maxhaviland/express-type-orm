import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from "typeorm";
import { User } from './User'

@Entity()

export class Follower {
  
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(type => User, user => user.followers, { nullable: false, eager: true })
  follower: User;

  @ManyToOne(type => User, user => user.following, { nullable: false, eager: true })
  followed: User;

  @CreateDateColumn({ select: false })
  createDate: Date;

  @UpdateDateColumn({ select: false })
  updateDate: Date;

}