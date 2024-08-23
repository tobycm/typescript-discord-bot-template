export default class CommandOptions extends Map<string, string | undefined> {
  get(key: string): string | undefined;
  get(key: string, required: true): string;
  get(key: string, required: boolean = false) {
    return super.get(key);
  }
}
