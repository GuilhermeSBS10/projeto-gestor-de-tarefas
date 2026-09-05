import "dotenv/config";
import { app } from "./app";

const port = Number(process.env.API_PORT ?? 3333);

app.listen(port, () => {
  console.log(`API rodando em http://localhost:${port}`);
});

