module.exports = leaveVC;

async function leave(serverQueue, guild) {
  if (!global.queue.get(guild.id)) {
        serverQueue.voiceChannel.leave()
    return serverQueue.textChannel.send("bye!")
  }
}

async function leaveVC(serverQueue, guild, timer = false) {
  global.queue.delete(guild.id);
  if (timer != true) return leave(serverQueue, guild);
  serverQueue.textChannel.send("Leaving in 3 minutes...").then(msg =>
    setTimeout(function() {
      msg.delete();
    }, 210000)
  );
  setTimeout(function() {
    leave(serverQueue, guild);
  }, 180000);
}
