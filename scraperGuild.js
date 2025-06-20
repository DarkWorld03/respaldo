async function scrapeGuildData() {
  return {
    guildName: "Prueba",
    players: [
      { id: "1", name: "Jugador1", points: "100" },
      { id: "2", name: "Jugador2", points: "200" }
    ]
  };
}

module.exports = scrapeGuildData;
