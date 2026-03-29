import { app } from "./src/app";

const port = Number(process.env.PORT ?? 4000);

app.listen(port);

console.log(`[api] UAPS API running at http://localhost:${port}`);