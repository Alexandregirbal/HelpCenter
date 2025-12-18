import { defaultEndpointsFactory } from "express-zod-api";
import { z } from "zod/v4";

const sortSchema = z.object({
  objectString: z.string(),
  objectNumber: z.number(),
});

const exampleSchema = z.string().transform((val) => {
  if (typeof val === "string") {
    return val.split(",");
  }
  return val;
});

type ExampleSchema = z.infer<typeof exampleSchema>;

export default defaultEndpointsFactory.build({
  method: "get",
  input: z.object({
    simpleString: z.string(),
    simpleLiteral: z.literal("hello"),
    simpleNumber: z.coerce.number(),
    simpleBoolean: z.coerce.boolean(),
    arrayOfStrings: z.preprocess(
      (val: string) => (val.trim() === "" ? undefined : val),
      z.string().max(1000).optional()
    ),
    arrayOfStringsTransformed: z.string().transform((val) => {
      if (typeof val === "string") {
        return val.split(",");
      }
    }),
    simpleObject: z.transform((val) => {
      if (typeof val === "string") {
        return sortSchema.parse(JSON.parse(val));
      }
      return sortSchema.parse(val);
    }),
    arrayOfEnums: z.preprocess((val) => {
      if (typeof val === "string") {
        return val.split(",");
      }
      return val;
    }, z.array(z.enum(["hello", "world"]))),
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
