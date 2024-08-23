import Bot from "Bot";
import { ChatInputCommandInteraction, Guild, GuildMember, GuildTextBasedChannel, InteractionResponse, Message, User } from "discord.js";
import CommandOptions from "./options";

interface ReplyOptions {
  content: string;
  ephemeral?: boolean;
}

export abstract class BaseContext {
  bot: Bot;
  channel: GuildTextBasedChannel;
  guild: Guild;
  author: User;
  member: GuildMember;

  original: Message | ChatInputCommandInteraction | InteractionResponse;

  options: CommandOptions; // only support string options for now

  abstract send(message: string): Promise<BaseContext>;

  abstract reply(message: string): Promise<BaseContext>;
  abstract reply(options: ReplyOptions): Promise<BaseContext>;
}

export class MessageContext extends BaseContext {
  constructor(message: Message<true>) {
    super();
    this.bot = message.client;
    this.original = message;

    this.channel = message.channel;
    this.guild = message.guild;
    this.author = message.author;
    this.member = message.member;

    // remember to convert message arguments to interaction options
  }

  options: CommandOptions = new CommandOptions();

  declare original: Message<true>;

  async send(message: string) {
    const m = await this.original.channel.send(message);
    return new MessageContext(m);
  }

  async reply(message: string | ReplyOptions) {
    const m = await this.original.reply(message);
    return new MessageContext(m);
  }
}

export class ChatInputInteractionContext extends BaseContext {
  constructor(interaction: ChatInputCommandInteraction) {
    super();
    this.bot = interaction.client;
    this.original = interaction;

    this.channel = interaction.channel;
    this.guild = interaction.guild;

    this.author = interaction.user;
    this.member = interaction.member as GuildMember;

    for (const option of interaction.options.data) {
      if (typeof option.value !== "string") continue;
      this.options.set(option.name, option.value);
    }
  }

  declare original: ChatInputCommandInteraction;

  options: CommandOptions = new CommandOptions();

  async send(message: string) {
    const response = await this.original.reply(message);
    return new InteractionResponseContext(response);
  }

  async reply(message: string | ReplyOptions) {
    const response = await this.original.reply(message);
    return new InteractionResponseContext(response);
  }
}

export class InteractionResponseContext extends BaseContext {
  constructor(response: InteractionResponse<true>) {
    super();
    this.bot = response.client;
    this.original = response;

    this.channel = response.interaction.channel;
    this.guild = response.interaction.guild;

    this.author = response.interaction.user;
    this.member = response.interaction.member;
  }

  options: CommandOptions = new CommandOptions();

  declare original: InteractionResponse<true>;

  async send(message: string) {
    const response = await this.original.interaction.channel.send(message);
    return new MessageContext(response);
  }

  async reply(message: string | ReplyOptions) {
    const response = await ((await this.original.fetch()) as Message<true>).reply(message);
    return new MessageContext(response);
  }
}
