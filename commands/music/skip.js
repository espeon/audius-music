const { Command } = require("klasa");
const {
  Permissions: { FLAGS }
} = require("discord.js");

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: "skip",
      enabled: true,
      runIn: ["text"],
      cooldown: 2,
      bucket: 1,
      aliases: [],
      permLevel: 0,
      botPerms: [],
      requiredConfigs: [],
      description: "Adds a song to queue from YouTube URL or search term.",
      quotedStringSupport: true,
      usage: "[song:string]",
      usageDelim: "",
      extendedHelp:
        "Fetches song by YouTube URL or returns first search parameter, or an uploaded music file."
    });
    this.exp = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/\S*(?:(?:\/e(?:mbed)?)?\/|watch\/?\?(?:\S*?&?v=))|youtu\.be\/)([\w-]{11})(?:[^\w-]|$)/;
  }

  async run(msg) {
    const serverQueue = global.queue.get(msg.guild.id);
    let skip = false;
    if (!msg.member.voice.channel) {
      return msg.channel.send(`Please join a voice channel first.`);
    }
    console.log(serverQueue);
    if (!serverQueue) {
      return msg.channel.send(`There isn't anything playing!`);
    }
    //serverQueue.connection.dispatcher.end("Skip command has been used!");
    if (serverQueue.voiceChannel.members.size > 4) {
      if (!(await msg.hasAtLeastPermissionLevel(5))) {
        serverQueue.connection.dispatcher.end("Skip command has been used!");
      } else {
        this.handleSkips(msg.author.id, serverQueue);
      }
    }else{
      serverQueue.connection.dispatcher.end("Skip command has been used!");
    }
    skip = true;
    return;
  }

  handleSkips(user, serverQueue) {
    if (!global.queue.skips) global.queue.skips = new Set();
    if (global.queue.skips.has(user))
      return "You have already voted to skip this song.";
    global.queue.skips.add(user);
    const members = serverQueue.voiceChannel.members.size - 1;
    return this.shouldInhibit(members, global.queue.skips.size);
  }

  shouldInhibit(total, size) {
    if (total <= 3) return true;
    return size >= total * 0.4
      ? false
      : `🔸 | Votes: ${size} of ${Math.ceil(total * 0.4)}`;
  }
};
