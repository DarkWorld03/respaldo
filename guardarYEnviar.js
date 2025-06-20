require("dotenv").config();

const fs = require("fs");
const path = require("path");
const axios = require("axios");
const FormData = require("form-data");
const scrapeGuildData = require("./scraperGuild");

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

async function guardarYEnviarDatos() {
  const data = await scrapeGuildData();

  if (!data || !data.players || data.players.length === 0) {
    console.error("❌ No se pudo obtener información del scraper.");
    throw new Error("Datos del scraper vacíos");
  }

  const hoy = new Date();
  const yyyy = hoy.getFullYear();
  const mm = String(hoy.getMonth() + 1).padStart(2, "0");
  const dd = String(hoy.getDate()).padStart(2, "0");
  const fecha = `${yyyy}-${mm}-${dd}`;

  const folderPath = path.join(__dirname, "data");
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath);
  }

  const jugadores = data.players.map((jugador) => ({
    id: jugador.id,
    name: jugador.name,
    points: Number(jugador.points.replace(/[^0-9]/g, "")),
  }));

  const salida = {
    date: fecha,
    players: jugadores,
  };

  const filePath = path.join(folderPath, `${fecha}.json`);
  fs.writeFileSync(filePath, JSON.stringify(salida, null, 2));
  console.log(`✅ Archivo guardado correctamente: ${filePath}`);

  // Enviar a Telegram
  const form = new FormData();
  form.append("chat_id", CHAT_ID);
  form.append("caption", `📄 Datos de la guild (${fecha})`);
  form.append("document", fs.createReadStream(filePath));

  try {
    await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendDocument`, form, {
      headers: form.getHeaders(),
    });
    console.log("✅ Enviado por Telegram con éxito.");
  } catch (error) {
    console.error("❌ Error enviando el archivo por Telegram:", error.response?.data || error.message);
    throw error;
  }
}

if (require.main === module) {
  guardarYEnviarDatos().catch((err) => {
    console.error("❌ Error en ejecución directa:", err);
  });
}

module.exports = guardarYEnviarDatos;
