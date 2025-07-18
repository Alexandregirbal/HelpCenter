import { createConfig } from "express-zod-api";

export const expressZodApiConfig = createConfig({
  http: { listen: 3000 },
  cors: false,
});
