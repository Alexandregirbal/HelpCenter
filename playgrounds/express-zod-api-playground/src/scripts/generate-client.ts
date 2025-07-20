import { Integration } from "express-zod-api";
import fs from "fs";

import path from "path";
import { routing } from "../routing";

const generateClient = () => {
  console.log("Generating client...");
  const clientPath = path.join(__dirname, "../../client/generatedClient.ts");

  const clientIntegration = new Integration({
    routing,
    variant: "client",
    serverUrl: "http://playground.alexandre-girbal.dev",
  });

  fs.writeFileSync(clientPath, clientIntegration.print());

  console.log(`Client generated successfully at ${clientPath}`);
};

generateClient();
