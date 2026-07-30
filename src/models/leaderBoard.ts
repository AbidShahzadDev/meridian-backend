import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  ManyToOne,
} from "typeorm";
import { User } from "./user";
import { Tier } from "./tier";

//comment
@Entity("LeaderBoard")
export class LeaderBoard {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  position: number;

  @CreateDateColumn({ type: "timestamptz", default: () => "NOW()", select: false })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamptz", default: () => "NOW()", onUpdate: "NOW()", select: false })
  updated_at: Date;

  @OneToOne(() => User, (user) => user.level)
  user: User;

  @ManyToOne(() => Tier, (tier) => tier.leaderBoard)
  tier: Tier;
}
