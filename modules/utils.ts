import { GuildMember, PermissionFlagsBits } from "discord.js";

export const intToBitField = (int: bigint): (keyof typeof PermissionFlagsBits)[] =>
  Object.keys(PermissionFlagsBits).filter(
    (perm) => int & PermissionFlagsBits[perm as keyof typeof PermissionFlagsBits]
  ) as (keyof typeof PermissionFlagsBits)[];

export const checkPermissions = (member: GuildMember, permissions: bigint): (keyof typeof PermissionFlagsBits)[] =>
  intToBitField(permissions).filter((perm) => !member.permissions.has(perm));
