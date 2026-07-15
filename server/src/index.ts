import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import compileRoute from "./routes/compile";
import templatesRoute from "./routes/templates";
import resumesRoute from "./routes/resumes";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(morgan("dev"));
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api/compile", compileRoute);
app.use("/api/templates", templatesRoute);
app.use("/api/resumes", resumesRoute);

app.use((req, res) => {
  res.status(404).json({ error: `No route for ${req.method} ${req.path}` });
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error." });
});

app.listen(PORT, () => {
  console.log(`Resume builder API listening on http://localhost:${PORT}`);
  console.log(`LaTeX engine: ${process.env.LATEX_ENGINE || "tectonic"}`);
});
