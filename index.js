require("dotenv").config();
const express = require("express");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v10");
const { Client, GatewayIntentBits } = require("discord.js");
const commands = require("./commands");
require('colors');
const { updatePlayerCount } = require("./status");

// Initialize Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.DirectMessages,
  ],
});

// Initialize Express app
const app = express();
const PORT = 9020;

// Express server for bot status
app.get("/", (req, res) => {
  res.send("Discord bot is running!");
});

// Start the Express server
app.listen(PORT, () => {
  console.log(`Express server running on http://localhost:${PORT}`.cyan);
});

// Discord bot ready event
client.on("ready", async () => {
  console.clear();
  console.log(`Bot ${client.user.tag} is now online`.green);

  if (process.env.STATUS === "true") {
    updatePlayerCount(client, process.env.SecondsToUpdateStatus);
  }

  const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

  (async () => {
    try {
      await rest.put(
        Routes.applicationGuildCommands(process.env.ClientID, process.env.GuildID),
        { body: commands }
      );
      console.log(`Registered Guild Commands.`.green);
    } catch (error) {
      console.error(error);
    }
  })();

  require("./whitelist")(client);
});

// Log in to Discord
client.login(process.env.TOKEN);
