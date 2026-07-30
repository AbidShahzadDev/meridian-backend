import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne } from "typeorm";
import { LeaderBoard } from "./leaderBoard";

@Entity("User")
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  // @Column({ unique: true })
  // telegramId: string;

  @Column()
  username: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true, nullable: true })
  phoneNo: string;

  @Column({ nullable: true })
  profilePicture: string;

  @CreateDateColumn({ type: "timestamptz", default: () => "NOW()", select: false })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamptz", default: () => "NOW()", onUpdate: "NOW()", select: false })
  updated_at: Date;

  @OneToOne(() => LeaderBoard, (leaderBoard) => leaderBoard.user)
  level: LeaderBoard;
}
