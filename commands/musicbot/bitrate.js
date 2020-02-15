const { Command } = require('klasa');
const {
  Permissions: { FLAGS }
} = require("discord.js");

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: 'bitrate',
      enabled: true,
      runIn: ['text'],
      cooldown: 2,
      bucket: 1,
      aliases: [],
      permLevel: 0,
      botPerms: [],
      requiredConfigs: [],
      description: 'Sets or displays the bitrate the bot is streaming at.',
      quotedStringSupport: true,
      usage: '[args:string]',
      usageDelim: ''
    });
    this.exp = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/\S*(?:(?:\/e(?:mbed)?)?\/|watch\/?\?(?:\S*?&?v=))|youtu\.be\/)([\w-]{11})(?:[^\w-]|$)/;
  }

  async init() { global.queue = new Map(); }
  
  async run(msg, [args]) {
        const serverQueue = global.queue.get(msg.guild.id);
        if (!msg.member.voice.channel) {
      return msg.channel.send(`You are not in a voice channel!`);
    }
    if (!serverQueue) {
      return msg.channel.send(`There is nothing playing.`);
    }
    if (!args) {
      return msg.channel.send(
        `The current bitrate is **${serverQueue.bitrate}kbps**`
      );
    }
    if (args > serverQueue.voiceChannel.bitrate / 1000) {
      args = serverQueue.voiceChannel.bitrate / 1000;
    }
    if (args < 1) {
      args = 1;
    }
    serverQueue.bitrate = args;
    serverQueue.connection.dispatcher.setBitrate(args);
    return msg.channel.send(`Bitrate was set to **${args}kbps**`);
    }
  
  };