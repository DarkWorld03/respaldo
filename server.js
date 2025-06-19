const express = require("express");
const app = express();
const ejecutar = require("./guardarYEnviar");

app.get("/", (req, res) => {
  res.send("Servidor activo 🚀");
});

app.get("/run", async (req, res) => {
  try {
    await ejecutar();
    res.send("✅ Datos enviados por Telegram.");
  } catch (err) {
    console.error("❌ Error ejecutando:", err);
    res.status(500).send("❌ Error al ejecutar el scraper.");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🟢 Servidor escuchando en http://localhost:${PORT}`);
});
