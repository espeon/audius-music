const { Command } = require('klasa');
const {
  Permissions: { FLAGS }
} = require("discord.js");

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: 'queue',
      enabled: true,
      runIn: ['text'],
      cooldown: 2,
      bucket: 1,
      aliases: [],
      permLevel: 0,
      botPerms: [],
      requiredConfigs: [],
      description: 'Adds a song to queue from YouTube URL or search term.',
      quotedStringSupport: true,
      usage: '[num:string]',
      usageDelim: '',
      extendedHelp: 'Fetches song by YouTube URL or returns first search parameter, or an uploaded music file.',
    });
    this.exp = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/\S*(?:(?:\/e(?:mbed)?)?\/|watch\/?\?(?:\S*?&?v=))|youtu\.be\/)([\w-]{11})(?:[^\w-]|$)/;
  }

  async init() { global.queue = new Map(); }
  
  async run(msg, [num]) {
    const serverQueue = global.queue.get(msg.guild.id);
    if (!serverQueue) return msg.channel.send("There is nothing playing.");
    let pg = 0;
    let max =
      Math.round(serverQueue.songs.length / 10) +
      (serverQueue.songs.length % 10 < 5 ? 1 : 0);
    if (!isNaN(num)) {
      if(num > max) return msg.channel.send(`There are not enough pages! Please choose a number from 1 to ${max}`)
      pg = (JSON.parse(num) - 1) * 10;
    }
    return msg.channel.send({
      embed: {
        title: `Queue:`,
        description: `${serverQueue.songs
          .slice(1 + pg, 11 + pg)
          .map(song => `**-** [${song.title}](${song.link}) (${song.duration})`)
          .join("\n")}\n
          **Now playing: **[${serverQueue.songs[0].title}](${
          serverQueue.songs[0].link
        })`,
        footer: {
          text: `page ${pg / 10 + 1} / ${max} | ${
            serverQueue.songs.length
          } songs`
        }
      }
    });
    }
  };