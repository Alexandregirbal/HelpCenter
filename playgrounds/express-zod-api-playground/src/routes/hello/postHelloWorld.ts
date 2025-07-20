import { defaultEndpointsFactory } from "express-zod-api";
import { z } from "zod/v4";

export default defaultEndpointsFactory.build({
  method: "post",
  input: z.object({
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
  }),
  output: z.object({
    greetings: z.string(),
  }),
  handler: async ({ input, options, logger }) => {
    logger.debug("Options:", options);
    logger.debug("Input:", input);
    return { greetings: `Hello,  happy coding!` };
  },
});
