const { Client } = require('klasa');
require('dotenv').config()
const { token, prefix, ytkey, sckey } = process.env;

// set up perms
Client.defaultPermissionLevels
	.add(5, (msg) => msg.member && msg.guild.settings.dj && msg.member.roles.has(msg.guild.settings.dj), { fetch: true })
	.add(6, (msg) => msg.member
		&& ((msg.guild.settings.administrator && msg.member.roles.has(msg.guild.settings.administrator))
            || msg.member.permissions.has('MANAGE_GUILD')), { fetch: true });

//load the bot
new Client({
    fetchAllMembers: false,
    prefix: prefix,
    disabledCorePieces: ['commands'],
    disabledEvents:["TYPING_START"],
    commandEditing: true,
    typing: false,
    console: { useColor: true, utc: true },
	  pieceDefaults: { commands: { deletable: true, promptLimit: 5, quotedStringSupport: true } },
    readyMessage: (client) => `Logged in as ${client.user.username}#${client.user.discriminator} and serving ${client.guilds.cache.size} guilds.`
}).login(token);

// init project
const express = require("express");
const app = express();

// we've started you off with Express,
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function(request, response) {
  response.redirect(301, 'https://audius.co')
});

// listen for requests :)
const listener = app.listen(process.env.PORT, function() {
  console.log("Your app is listening on port " + listener.address().port);
});
