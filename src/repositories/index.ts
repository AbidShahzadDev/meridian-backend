import PostgresDataSource from "../data-source";
import { LeaderBoard } from "../models/leaderBoard";
import { Tier } from "../models/tier";
import { User } from "../models/user";

export const UserRepository = PostgresDataSource.getRepository(User);
export const TierRepository = PostgresDataSource.getRepository(Tier);
export const LeaderBoardRepository = PostgresDataSource.getRepository(LeaderBoard);
