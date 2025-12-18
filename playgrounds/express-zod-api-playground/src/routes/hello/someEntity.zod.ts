import { z } from "zod/v4";

export const someEntitySchema = z.object({
  simpleString: z.string(),
  simpleLiteral: z.literal("hello"),
  simpleNumber: z.number(),
  simpleBoolean: z.boolean(),
  arrayOfStrings: z.array(z.string()),
  simpleObject: z.object({
    objectString: z.string(),
    objectNumber: z.number(),
  }),
  arrayOfEnums: z.array(z.enum(["hello", "world"])),
  arrayOfObjects: z.array(
    z.object({
      objectString: z.string(),
      objectNumber: z.number(),
    })
  ),
});
