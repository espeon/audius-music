module.exports = {
    name: 'stop',
    description: 'Stop! Hammer Time!',
    execute(bot, msg, args, serverQueue) {
        if (!msg.member.voice.channel) {
           return msg.channel.send(`Please join a voice channel first.`) 
        }
        if (!serverQueue){
            return msg.channel.send(`There isn't anything playing!`)
        }
        serverQueue.songs = []
        serverQueue.connection.dispatcher.end(`Stop command has been used!`)
        msg.channel.send(`okie! queue has been cleared!`)
        return
    },
}