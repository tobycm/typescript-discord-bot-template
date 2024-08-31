import { Attachment, GuildMember } from "discord.js";

type SupportedTypes = string | number | boolean | GuildMember | Attachment;

export default class CommandOptions {
  private options = new Map<string, SupportedTypes>();

  set(key: string, value: SupportedTypes): this {
    this.options.set(key, value);
    return this;
  }

  get<T extends SupportedTypes = string>(key: string): T | undefined;
  get<T extends SupportedTypes = string>(key: string, required: true): T;
  get(key: string, required = false) {
    const v = this.options.get(key);
    if (required) return v!;
    return v;
  }
}
