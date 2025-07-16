import express from 'express';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = 3005;

// Pfad ermitteln
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.join(__dirname, 'data', 'responses.json');

app.use(express.static('public'));
app.use(express.json());

// Initialdaten sichern, falls Datei fehlt
await fs.ensureFile(dataPath);
if (!(await fs.readFile(dataPath, 'utf8')).trim()) {
  await fs.writeJson(dataPath, { step1: [], step2: [], step3: [] });
}

// Abrufen der Antworten
app.get('/api/responses', async (req, res) => {
  const data = await fs.readJson(dataPath);
  res.json(data);
});

// Speichern einer Antwort
app.post('/api/response', async (req, res) => {
  const { step, option } = req.body;
  const data = await fs.readJson(dataPath);
  data[`step${step}`].push(option);
  await fs.writeJson(dataPath, data);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`🚀 Server läuft auf http://localhost:${PORT}`);
});
