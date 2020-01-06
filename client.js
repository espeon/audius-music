require('dotenv').config()
const Discord = require("discord.js");
const YouTube = require("simple-youtube-api");
const ytdl = require("ytdl-core");
const ydl = require("youtube-dl");
const fs = require("fs"); // For reading command files - Bass
global.message; // Message placeholder - Bass
const client = new Discord.Client({ disableEveryone: true });
client.commands = new Discord.Collection();
const { token, prefix, ytkey, sckey } = process.env;
const youtube = new YouTube(ytkey);

const commandFiles = fs.readdirSync("./commands"); // read the folder that holds the commands,
// and blocks all other code from running until it completes
for (const file of commandFiles) {
  // for each file in commandFiles...
  const command = require(`./commands/${file}`); // ...require it...
  client.commands.set(command.name, command); // ...and add to list of commands
}

let id = "id-001";
let title = "NGGYU";
let murl = "https://youtube.com";
let streamlink = "https://audius.co/this-is/a-link-1332";
let bitrate = 320;

global.queue = new Map();

client.on("warn", console.warn);

client.on("error", console.error);

client.on("ready", () => {
  console.log(`Online and ready to DJ! Prefix is ${prefix}`);
  client.user.setActivity("some hot tunes", { type: "LISTENING" });
});

client.on("message", async msg => {
  global.message = msg; // Used for errors

  // eslint-disable-line
  if (!msg.content.startsWith(prefix) || msg.author.bot) {
    return; // No need for `return undefined` - Bass
  }
  // if (msg.channel.type === "dm") return undefined
  // Might have no need for this, my bot doesn't respond to DMs anyways - Bass

  function parseArgs(argString, argCount, allowSingleQuote = true) {
    // Replace smart quotes (i.e. “ ” ‘ ’ ) with straight double quotes " "
    argString = argString
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/>/g, "")
      .replace(/</g, "");
    const re = allowSingleQuote
      ? /\s*(?:("|')([^]*?)\1|(\S+))\s*/g
      : /\s*(?:(")([^]*?)"|(\S+))\s*/g;
    const result = [];
    let match = [];
    // Large enough to get all items
    argCount = argCount || argString.length;
    // Get match and push the capture group that is not null to the result
    while (--argCount && (match = re.exec(argString)))
      result.push(match[2] || match[3]);
    // If text remains, push it to the array as-is (except for wrapping quotes, which are removed)
    if (match && re.lastIndex < argString.length) {
      const re2 = allowSingleQuote ? /^("|')([^]*)\1$/g : /^(")([^]*)"$/g;
      result.push(argString.substr(re.lastIndex).replace(re2, "$2"));
    }
    return result;
  }

  const args = parseArgs(msg.content.slice(prefix.length)); // slices the prefix from the command
  const command = args
    .shift()
    .toLowerCase(); /* make the command lowercase 
                                                EXAMPLE: let string = 'ArE yoU MoCkInG Me?'
                                                let lowerString = string.shift().toLowerCase()
                                                // lowerString is 'are you mocking me?' 
                                                - Bass
                                                */
  const searchString = args.join(" ");
  const url = args[1] ? args[1].replace(/<(.+)>/g, "$1") : "";
  const serverQueue = global.queue.get(msg.guild.id);

  const cmd =
    client.commands.get(command) ||
    client.commands.find(
      cmdo => cmdo.aliases && cmdo.aliases.includes(command)
    );
  if (cmd === "restart"){
    if (msg.author.id == 267121875765821440) {
      msg.channel.send("Restarting music bot...");
      client.destroy();
      process.exit(1);
    }
    return msg.channel.send("You cannot use this command.");
  }
  if (cmd == undefined) return;
  console.log(cmd);
  try {
    cmd.execute(client, msg, args, serverQueue, youtube);
  } catch (error) {
    console.error(error);
    msg.channel.send("there was an error trying to execute that command!");
  }
  
  return undefined;
});

process.on("unhandledRejection", function(error) {
  console.error(`Uncaught Promise Rejection:\n${error}`);
  global.message.reply(`Uncaught Promise Rejection:\n${error}`);
});
// ^ Promise rejections are confusing, heres a link: https://davidwalsh.name/promises - Bass

process.on("uncaughtException", function(err) {
  console.log(`Caught exception: ${err}`);
  global.message.reply(
    `Fatal error, please alert an Audius staff member about this!`
  );
  client.destroy();
});
// ^ These are dangerous, if yall want yall can add logging to files so yall can see what went wrong

// Kills the bot when it recieves a SIGINT, Control+C - Bass

process.on("SIGINT", () => {
  console.log("Stopping bot.");
  client.destroy();
});

client.login(token);
