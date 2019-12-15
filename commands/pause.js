module.exports = {
    name: 'pause',
    description: 'Pauses the currently playing song!',
    execute(bot, msg, args, serverQueue) {
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
    },
} 