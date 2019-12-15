module.exports = {
    name: 'queue',
    description: 'Bot queue',
    execute(bot, msg, args, serverQueue) {
        if (!serverQueue) return msg.channel.send("There is nothing playing.")
        if (global.queue.get(msg.guild.id) == undefined) return
    return msg.channel.send({
      embed: {
        title: `Queue:`,
        description: `${serverQueue.songs
          .map(song => `**-** [${song.title}](${song.link})`)
          .join("\n")}\n**Now playing: **[${
          serverQueue.songs[0].title
        }](serverQueue.songs[0].link)`
      }
    })
    },
}