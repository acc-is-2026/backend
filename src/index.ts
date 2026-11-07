import "dotenv/config";
import express from "express";
import cors from "cors";
import apiRoutes from "./routes";

const app = express();
const PORT = Number(process.env.PORT) || 8000;

app.use(cors());
app.use(express.json());

app.use("/api", apiRoutes);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
