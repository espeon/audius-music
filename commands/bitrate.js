module.exports = {
  name: "bitrate",
  description: "Gets the current bitrate!",
  execute(bot, msg, args, serverQueue) {
    if (!msg.member.voice.channel) {
      return msg.channel.send(`You are not in a voice channel!`);
    }
    if (!serverQueue) {
      return msg.channel.send(`There is nothing playing.`);
    }
    if (!args[0]) {
      return msg.channel.send(
        `The current bitrate is **${serverQueue.bitrate}kbps**`
      );
    }
    if (args[0] > 320) {
      // Why does this exist - Bass
      args[0] = 320;
    }
    if (args[0] < 1) {
      args[0] = 1;
    }
    serverQueue.bitrate = args;
    serverQueue.connection.dispatcher.setBitrate(args);
    return msg.channel.send(`Bitrate was set to **${args}kbps**`);
  }
};
