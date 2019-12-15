module.exports = {
    name: 'skip',
    description: 'Skips the currently playing song!',
    execute(bot, msg, args, serverQueue) {
        let skip = false
        if (!msg.member.voice.channel) {
            return msg.channel.send(`Please join a voice channel first.`)
        }
        if (global.queue.get(msg.guild.id) == undefined) return
        console.log(serverQueue)
        if (!serverQueue) {
            return msg.channel.send(`There isn't anything playing!`)
        }
        serverQueue.connection.dispatcher.end("Skip command has been used!")
        skip = true
        return
    },
}