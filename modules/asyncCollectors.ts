import { InteractionCollector as DInteractionCollector, Interaction } from "discord.js";

export function collectFirstInteraction<Type extends Interaction = Interaction>(...args: ConstructorParameters<typeof DInteractionCollector>) {
  if (!args[1]) args[1] = {};
  args[1].max = 1;

  return new Promise<Type>((resolve, reject) => {
    new DInteractionCollector(...args).on("collect", resolve);

    setTimeout(() => {
      reject("No interactions collected");
    }, args[1]!.time);
  });
}
