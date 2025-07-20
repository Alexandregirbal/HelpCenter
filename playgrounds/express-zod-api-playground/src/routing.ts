import { Routing } from "express-zod-api";
import { helloWorldEndpoint } from "./routes/helloWorld";

const routingV1: Routing = {
  hello: helloWorldEndpoint,
};

export const routing: Routing = {
  v1: routingV1,
};
