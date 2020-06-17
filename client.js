const { Client } = require("klasa");
require("dotenv").config();
const { token, prefix, ytkey, sckey } = process.env;
// set up perms
Client.defaultPermissionLevels
  .add(
    5,
    msg =>
      msg.member &&
      msg.guild.settings.dj &&
      msg.member.roles.has(msg.guild.settings.dj),
    { fetch: true }
  )
  .add(
    6,
    msg =>
      msg.member &&
      ((msg.guild.settings.administrator &&
        msg.member.roles.has(msg.guild.settings.administrator)) ||
        msg.member.permissions.has("MANAGE_GUILD")),
    { fetch: true }
  );

//load the bot
let client = new Client({
  fetchAllMembers: false,
  prefix: prefix,
  disabledCorePieces: ["commands"],
  disabledEvents: ["TYPING_START"],
  commandEditing: true,
  typing: false,
  console: { useColor: true, utc: true },
  pieceDefaults: {
    commands: { deletable: true, promptLimit: 5, quotedStringSupport: true }
  },
  readyMessage: client =>
    `Logged in as ${client.user.username}#${client.user.discriminator} and serving ${client.guilds.cache.size} guilds.`
}).login(token);

// init project
const express = require("express");
const app = express();

const axios = require("axios");

// we've started you off with Express,
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function(request, response) {
  response.redirect(301, "https://audius.co");
});

app.get("/api", function async (req, res) {
  if(!global.queue) {return res.status(500).send("hello")}
  console.log(global.queue)
  let currentlyPlaying = {}
  global.queue.forEach(queue => {
    currentlyPlaying[queue.voiceChannel.id] = {
    guild_name: queue.voiceChannel.guild.name,
    voicechannel: {name:queue.voiceChannel.name,
                   id: queue.textChannel.id},
    textchannel: {name:queue.textChannel.name,
                  id: queue.textChannel.id},
    playing: queue.songs[0],
  }
  })
  if(currentlyPlaying == {}) return res.status(400).send("nothing playing!")
  res.json(currentlyPlaying)
})

app.get("/guilds", function async(req, res){
console.log(client)
  res.json(client)
})

// listen for requests :)
const listener = app.listen(process.env.PORT, function() {
  console.log("Your app is listening on port " + listener.address().port);
});
