import { Redis } from "ioredis";

declare module "discord.js" {
  export interface Client {
    db: Redis;
  }
}
