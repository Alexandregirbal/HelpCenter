import { createServer } from "express-zod-api";
import { expressZodApiConfig } from "./config";
import { routingV1 } from "./routing";

export const initServer = async () => {
  createServer(expressZodApiConfig, {
    v1: routingV1,
  });
};
