import { GuildMember, PermissionFlagsBits } from "discord.js";

type Perm = keyof typeof PermissionFlagsBits;

export const intToBitField = (int: bigint): Perm[] => (Object.keys(PermissionFlagsBits) as Perm[]).filter((perm) => int & PermissionFlagsBits[perm]);

export const checkPermissions = (member: GuildMember, permissions: bigint): Perm[] =>
  intToBitField(permissions).filter((perm) => !member.permissions.has(perm));
