import { Integration } from "express-zod-api";
import fs from "fs";

import path from "path";
import { routing } from "../routing";

const generateClient = () => {
  console.log("Generating client...");
  const clientPath = path.join(__dirname, "../generatedClient.ts");

  const client = new Integration({
    routing,
    variant: "client",
  });

  fs.writeFileSync(clientPath, client.print());

  console.log(`Client generated successfully at ${clientPath}`);
};

generateClient();
