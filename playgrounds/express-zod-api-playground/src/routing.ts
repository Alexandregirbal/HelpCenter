import { Routing } from "express-zod-api";
import { helloWorldEndpoint } from "./helloWorld";

export const routingV1: Routing = {
  hello: helloWorldEndpoint,
};
