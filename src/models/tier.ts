import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { LeaderBoard } from "./leaderBoard";

@Entity("Tier")
export class Tier {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column()
  time: number;

  @Column()
  points: number;

  @CreateDateColumn({ type: "timestamptz", default: () => "NOW()", select: false })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamptz", default: () => "NOW()", onUpdate: "NOW()", select: false })
  updated_at: Date;

  @OneToMany(() => LeaderBoard, (leaderBoard) => leaderBoard.tier)
  leaderBoard: LeaderBoard;
}
