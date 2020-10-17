const { Command } = require('klasa');
const {
  Permissions: { FLAGS }
} = require("discord.js");

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: 'pause',
      enabled: true,
      runIn: ['text'],
      cooldown: 2,
      bucket: 1,
      aliases: [],
      permLevel: 0,
      botPerms: [],
      requiredConfigs: [],
      description: 'Pauses music.',
      quotedStringSupport: true,
      usageDelim: '',
    });
    this.exp = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/\S*(?:(?:\/e(?:mbed)?)?\/|watch\/?\?(?:\S*?&?v=))|youtu\.be\/)([\w-]{11})(?:[^\w-]|$)/;
  }

  async init() { global.queue = new Map(); }
  
  async run(msg) {
        const serverQueue = global.queue.get(msg.guild.id);
        if (!msg.member.voice.channel) {
            return msg.channel.send(`Please join a voice channel first.`) 
         }
        if (serverQueue && serverQueue.playing) {
            serverQueue.playing = false
            serverQueue.connection.dispatcher.pause()
            return msg.channel.send(`music has been paused.`)
        }else{
        return msg.channel.send(`There is nothing playing.`)
        }
    }
  };