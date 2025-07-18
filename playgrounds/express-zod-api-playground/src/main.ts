import { initServer } from "./initServer";

initServer()
  .then(() => {
    console.log("Server started");
  })
  .catch((e) => {
    console.error(e);
    throw e;
  });
