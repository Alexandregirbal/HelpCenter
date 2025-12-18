import { defaultEndpointsFactory } from "express-zod-api";
import { z } from "zod/v4";
import { someEntitySchema } from "./someEntity.zod";

export default defaultEndpointsFactory.build({
  method: "post",
  input: someEntitySchema,
  output: z.object({
    greetings: z.string(),
  }),
  handler: async ({ input, options, logger }) => {
    logger.debug("Options:", options);
    logger.debug("Input:", input);
    return { greetings: `Hello,  happy coding!` };
  },
});
