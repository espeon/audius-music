module.exports = {
    name: 'ping',
    description: 'Gets latency of the bot and API!',
    execute(bot, msg, args) {
        msg.channel.send(`Getting Latency...`) // send initial message...
            .then(function(m) {
                return m.edit(`${m.createdTimestamp - message.createdTimestamp}ms`) // ...then edit with latency
            })
    },
}