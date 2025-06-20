const puppeteer = require("puppeteer"); // usa puppeteer completo

async function scrapeGuildData() {
  try {
    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      // No especificar executablePath para que Puppeteer use su Chromium
    });

    const page = await browser.newPage();

    await page.setRequestInterception(true);
    page.on("request", (req) => {
      const type = req.resourceType();
      if (["image", "stylesheet", "font", "media"].includes(type)) {
        req.abort();
      } else {
        req.continue();
      }
    });

    await page.goto("https://axieclassic.com/guilds/mGfOIl8T", {
      waitUntil: "domcontentloaded",
      timeout: 0,
    });

    await page.waitForSelector('a[href^="/profile/"]', { timeout: 30000 });
    await page.waitForSelector("span.text-base.font-semibold", { timeout: 30000 });

    const guildData = await page.evaluate(() => {
      const guildName =
        document.querySelector("h2.text-center.text-2xl.font-bold")?.innerText || "Desconocida";
      const players = Array.from(document.querySelectorAll('a[href^="/profile/"]')).map(
        (player, index) => {
          const pointsElements = document.querySelectorAll("span.text-base.font-semibold");
          return {
            name: player.innerText.trim() || "Sin nombre",
            id: player.getAttribute("href").replace("/profile/", ""),
            points: pointsElements[index]?.innerText.trim() || "0",
          };
        }
      );
      return { guildName, players };
    });

    await browser.close();
    return guildData;
  } catch (error) {
    console.error("❌ Error en scraper:", error);
    return null;
  }
}

module.exports = scrapeGuildData;
