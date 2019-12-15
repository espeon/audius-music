module.exports = {
    name: 'skip',
    description: 'Skips the currently playing song!',
    aliases: ['sk'],
    execute(bot, msg, args, serverQueue) {
        let skip = false
        if (!msg.member.voiceChannel) {
            return msg.channel.send(`Please join a voice channel first.`)
        }
        if (!serverQueue) {
            return msg.channel.send(`There isn't anything playing!`)
        }
        serverQueue.connection.dispatcher.end("Skip command has been used!")
        skip = true
        return
    },
}