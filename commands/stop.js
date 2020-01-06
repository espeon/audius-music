module.exports = {
  name: "stop",
  description: "Stop! Hammer Time!",
  execute(bot, msg, args, serverQueue) {
    const leaveVC = require("../functions/leaveVC");
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