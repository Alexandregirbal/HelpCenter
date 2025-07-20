import { DependsOnMethod, Routing } from "express-zod-api";
import getHelloWorldEndpoint from "./routes/hello/getHelloWorld";
import postHelloWorldEndpoint from "./routes/hello/postHelloWorld";

const routingV1: Routing = {
  hello: new DependsOnMethod({
    get: getHelloWorldEndpoint,
    post: postHelloWorldEndpoint,
  }),
};

export const routing: Routing = {
  v1: routingV1,
};
