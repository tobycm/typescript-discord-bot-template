import { CollectedInteraction, InteractionCollector as DInteractionCollector, Interaction } from "discord.js";

export function collectFirstInteraction(...args: ConstructorParameters<typeof DInteractionCollector>) {
  if (!args[1]) args[1] = {};
  args[1].max = 1;

  type InteractionType = (typeof args)[1] extends undefined ? Interaction : (typeof args)[1];

  return new Promise<CollectedInteraction>((resolve, reject) => {
    new DInteractionCollector(...args).on("collect", resolve);

    setTimeout(() => {
      reject("No interactions collected");
    }, args[1]!.time);
  });
}
