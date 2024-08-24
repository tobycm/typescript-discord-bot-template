export default class CommandOptions extends Map<string, any | undefined> {
  get<T extends string | number = string>(key: string, required = false): T | undefined {
    const v = super.get(key) as T | undefined;

    if (required) return v!;
    return v;
  }
}
