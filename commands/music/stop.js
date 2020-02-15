const { Command } = require('klasa');
const {
  Permissions: { FLAGS }
} = require("discord.js");

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: 'stop',
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
      usage: '[song:string]',
      usageDelim: '',
      extendedHelp: 'Fetches song by YouTube URL or returns first search parameter, or an uploaded music file.',
    });
    this.exp = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/\S*(?:(?:\/e(?:mbed)?)?\/|watch\/?\?(?:\S*?&?v=))|youtu\.be\/)([\w-]{11})(?:[^\w-]|$)/;
  }

  async init() { global.queue = new Map(); }
  
  async run(msg) {
    const serverQueue = global.queue.get(msg.guild.id);
        const leaveVC = require("../../functions/leaveVC");
    if (!msg.member.voice.channel) {
      return msg.channel.send(`Please join a voice channel first.`);
    }
    if (global.queue.get(msg.guild.id) == undefined)
      return msg.channel.send(`There isn't anything playing!`);
    if (!serverQueue && global.queue.get(msg.guild.id) != undefined) {
      serverQueue.voiceChannel.leave();
      return msg.channel.send(`There isn't anything playing!`);
    }
    leaveVC(serverQueue, serverQueue.textChannel.guild, false);
    return;
    }
  };