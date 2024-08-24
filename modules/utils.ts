import { GuildMember, PermissionFlagsBits } from "discord.js";

type Perm = keyof typeof PermissionFlagsBits;

export const intToBitField = (int: bigint): Perm[] =>
  Object.keys(PermissionFlagsBits).filter((perm) => int & PermissionFlagsBits[perm as Perm]) as Perm[];

export const checkPermissions = (member: GuildMember, permissions: bigint): Perm[] =>
  intToBitField(permissions).filter((perm) => !member.permissions.has(perm));
