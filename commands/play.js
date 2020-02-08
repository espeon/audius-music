module.exports = {
  name: "play",
  description: "Play a song in VC!",
  aliases: "p",
  async execute(bot, msg, args, serverQueue, youtube) {
    args = JSON.stringify(args)
    const getLinks = require("../functions/getLinks");
    const discord = require("discord.js");
    const axios = require("axios");
    const request = require("request");
    const voiceChannel = msg.member.voice.channel;

    if (!voiceChannel) {
      return msg.channel.send(
        `It seems you aren't in a voice channel.`
      );
    }

    const permissions = voiceChannel.permissionsFor(msg.client.user);
    if (!permissions.has("CONNECT")) {
      return msg.channel.send(
        `I may not have permissions to connect to vc... could someone please check?`
      );
    }
    if (!permissions.has("SPEAK")) {
      return msg.channel.send(
        `i may not have permissions to speak in vc... could someone please check?`
      );
    }
    getLinks(msg, args, voiceChannel, youtube)
  }
};
