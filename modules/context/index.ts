import Bot from "Bot";
import {
  ButtonInteraction,
  ChatInputCommandInteraction,
  Guild,
  GuildMember,
  GuildTextBasedChannel,
  InteractionResponse,
  Message,
  MessageCreateOptions,
  MessageMentionOptions,
  MessageReplyOptions,
  TextBasedChannel,
  User,
} from "discord.js";
import CommandOptions from "./options";

interface ReplyOptions {
  content: string;
  allowedMentions?: MessageMentionOptions;
  ephemeral?: boolean;
  components?: MessageReplyOptions["components"];
}

export interface BaseContext<GuildOnly extends boolean = false> {
  bot: Bot<true>;
  channel: GuildOnly extends true ? GuildTextBasedChannel : TextBasedChannel;
  guild: GuildOnly extends true ? Guild : Guild | null;
  author: User;
  member: GuildOnly extends true ? GuildMember : GuildMember | null;

  original: Message | ChatInputCommandInteraction | InteractionResponse | ButtonInteraction;

  options: CommandOptions;

  send(message: string): Promise<BaseContext>;

  reply(message: string): Promise<BaseContext>;
  reply(options: MessageReplyOptions): Promise<BaseContext>;
}

export interface MessageContext<GuildOnly extends boolean = false> extends BaseContext<GuildOnly> {
  original: Message;

  send(message: string): Promise<MessageContext>;
  send(options: MessageCreateOptions): Promise<MessageContext>;

  reply(message: string): Promise<MessageContext>;
  reply(options: ReplyOptions): Promise<MessageContext>;
}

export const MessageContext = (message: Message): MessageContext => ({
  bot: message.client,
  channel: message.channel,
  guild: message.guild,
  author: message.author,
  member: message.member,
  original: message,
  options: new CommandOptions(),
  send: async (content) => MessageContext(await message.channel.send(content)),
  reply: async (content) => MessageContext(await message.reply(content)),
});

// export class MessageContext extends BaseContext {
//   constructor(message: Message) {
//     super();
//     this.bot = message.client;
//     this.original = message;

//     this.channel = message.channel;
//     this.guild = message.guild;
//     this.author = message.author;
//     this.member = message.member; // hope nothing goes wrong

//     // remember to convert message arguments to interaction options
//   }

//   options = new CommandOptions();

//   declare original: Message;

//   async send(message: string) {
//     const m = await this.original.channel.send(message);
//     return new MessageContext(m);
//   }

//   async reply(message: string | ReplyOptions) {
//     const m = await this.original.reply(message);
//     return new MessageContext(m);
//   }
// }

export interface ChatInputInteractionContext<GuildOnly extends boolean = false> extends BaseContext<GuildOnly> {
  original: ChatInputCommandInteraction;

  send(message: string): Promise<InteractionResponseContext>;
  send(options: MessageCreateOptions): Promise<InteractionResponseContext>;

  reply(message: string): Promise<InteractionResponseContext>;
  reply(options: ReplyOptions): Promise<InteractionResponseContext>;
}

export const ChatInputInteractionContext = (interaction: ChatInputCommandInteraction): ChatInputInteractionContext => ({
  bot: interaction.client,
  channel: interaction.channel!,
  guild: interaction.guild,
  author: interaction.user,
  member: interaction.member as GuildMember | null,
  original: interaction,
  options: new CommandOptions(),
  // @ts-ignore
  send: async (content) => InteractionResponseContext(await interaction.reply(content)),
  reply: async (content) => InteractionResponseContext(await interaction.reply(content)),
});

// export class ChatInputInteractionContext extends BaseContext {
//   constructor(interaction: ChatInputCommandInteraction) {
//     super();
//     this.bot = interaction.client;
//     this.original = interaction;

//     this.channel = interaction.channel!;
//     this.guild = interaction.guild;

//     this.author = interaction.user;
//     this.member = interaction.member as GuildMember;

//     for (const option of interaction.options.data) {
//       if (typeof option.value !== "string") continue;
//       this.options.set(option.name, option.value);
//     }
//   }

//   declare original: ChatInputCommandInteraction;

//   options = new CommandOptions();

//   async send(message: string) {
//     const response = await this.original.reply(message);
//     return new InteractionResponseContext(response);
//   }

//   async reply(message: string | ReplyOptions) {
//     const response = await this.original.reply(message);
//     return new InteractionResponseContext(response);
//   }
// }

export interface InteractionResponseContext extends BaseContext {
  original: InteractionResponse<true>;

  send(message: string): Promise<MessageContext>;
  send(options: MessageCreateOptions): Promise<MessageContext>;

  reply(message: string): Promise<MessageContext>;
  reply(options: ReplyOptions): Promise<MessageContext>;
}

export const InteractionResponseContext = (response: InteractionResponse<true>): InteractionResponseContext => ({
  bot: response.client as Bot<true>,
  channel: response.interaction.channel!,
  guild: response.interaction.guild,
  author: response.interaction.user,
  member: response.interaction.member,
  original: response,
  options: new CommandOptions(),
  send: async (content) => MessageContext(await response.interaction.channel!.send(content)),
  reply: async (content) => MessageContext(await (await response.fetch()).reply(content)),
});

// export class InteractionResponseContext extends BaseContext {
//   constructor(response: InteractionResponse<true>) {
//     super();
//     this.bot = response.client;
//     this.original = response;

//     this.channel = response.interaction.channel!;
//     this.guild = response.interaction.guild;

//     this.author = response.interaction.user;
//     this.member = response.interaction.member;
//   }

//   options = new CommandOptions();

//   declare original: InteractionResponse<true>;

//   async send(message: string) {
//     const response = await this.channel.send(message);
//     return new MessageContext(response);
//   }

//   async reply(message: string | ReplyOptions) {
//     const response = await (await this.original.fetch()).reply(message);
//     return new MessageContext(response);
//   }
// }

export interface ButtonInteractionContext extends BaseContext {
  original: ButtonInteraction;

  send(message: string): Promise<MessageContext>;
  send(options: MessageCreateOptions): Promise<MessageContext>;

  reply(message: string): Promise<InteractionResponseContext>;
  reply(options: ReplyOptions): Promise<InteractionResponseContext>;
}

export const ButtonInteractionContext = (interaction: ButtonInteraction): ButtonInteractionContext => ({
  bot: interaction.client,
  author: interaction.user,
  channel: interaction.channel!,
  guild: interaction.guild,
  member: interaction.member as GuildMember | null,
  original: interaction,
  options: new CommandOptions(),
  send: async (content) => MessageContext(await interaction.channel!.send(content)),
  reply: async (content) => InteractionResponseContext(await interaction.reply(content)),
});
