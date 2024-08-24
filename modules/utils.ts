import { ApplicationCommandOptionBase, ApplicationCommandOptionType, GuildMember, PermissionFlagsBits } from "discord.js";
import Command from "./command";

export type Perm = keyof typeof PermissionFlagsBits;

export const intToBitField = (int: bigint): Perm[] => (Object.keys(PermissionFlagsBits) as Perm[]).filter((perm) => int & PermissionFlagsBits[perm]);

export const checkPermissions = (member: GuildMember, permissions: bigint): Perm[] =>
  intToBitField(permissions).filter((perm) => !member.permissions.has(perm));

type ValueOf<T> = T[keyof T];

function getEnumKeyFromValue<R extends string | number, T extends { [key: string]: R }>(myEnum: T, enumValue: ValueOf<T>): string {
  let keys = Object.keys(myEnum).filter((x) => myEnum[x] == enumValue);
  return keys.length > 0 ? keys[0] : "";
}

export function commandUsage(command: Command): string {
  const options = command.data.options as ApplicationCommandOptionBase[];

  const args: string[] = [];

  for (const option of options) {
    const type = getEnumKeyFromValue(ApplicationCommandOptionType, option.type) as keyof typeof ApplicationCommandOptionType;

    if (type === "Subcommand" || type === "SubcommandGroup") {
      // not supported
      continue;
    }

    const name = option.name;

    let wrappers = ["[", "]"]; // optional
    if (option.required) wrappers = ["<", ">"]; // required

    args.push(`${wrappers[0]}${name}: ${type}${wrappers[1]}`);
  }

  return args.join(" ");
}
