module.exports = {
    name: 'volume',
    description: 'Changes the volume!',
    execute(bot, msg, args, serverQueue) {
        if (!msg.member.voice.channel) {
            return msg.channel.send(`You are not in a voice channel!`)
        }
        if (!global.queue.get(msg.guild.id)) {
            return msg.channel.send(`There is nothing playing.`)
        }
        if (!args[0]) {
          return msg.channel.send(`The current volume is **${serverQueue.volume}%**`)  
        }
        serverQueue.volume = args[0]
        serverQueue.connection.dispatcher.setVolumeLogarithmic(args[0] / 100)
        return msg.channel.send(`I set the volume to **${args[0]}%**`)
    },
}