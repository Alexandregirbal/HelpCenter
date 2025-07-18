import { createServer } from "express-zod-api";
import { expressZodApiConfig } from "./config";
import { routing } from "./routing";

export const initServer = async () => {
  createServer(expressZodApiConfig, routing);
};
