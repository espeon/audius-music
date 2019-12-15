module.exports = {
    name: 'resume',
    description: 'Resumes the currently paused song!',
    aliases: ['res'],
    execute(bot, msg, args, serverQueue) {
        if (!msg.member.voiceChannel) {
            return msg.channel.send(`Please join a voice channel first.`) 
         }
        if (serverQueue && !serverQueue.playing) {
            serverQueue.playing = true
            serverQueue.connection.dispatcher.resume()
            return msg.channel.send(`I've resumed the music!`)
          }
          return msg.channel.send(`There is nothing playing.`)
    },
}