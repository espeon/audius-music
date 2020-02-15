const keysec = process.env
const {
    Command,
    clie
} = require('klasa');
module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            name: 'fm',
            enabled: true,
            runIn: ['text', 'dm'],
            aliases: ['fm', 'lastfm'],
            subcommands: false,
            usage: '<arg:str>',
            description: 'gets last played track on last.fm',
            extendedHelp: 'No extended help available.'
        });
    }

    run(message, args) {
        var req = require('request');
            const fm = args + ""
            console.log(keysec.lastfmapi)
            if (fm === ' ') {
                return message.channel.send('hi uwu');
            }
            let link = `http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${fm}&api_key=a0eed701b74a0eac6dd9a13cdff63a9c&format=json`
            console.log(link)
            req.get(link, function (error, response, body) {
                let hash = body.replace(/#/g, 'n');
                hash = JSON.parse(hash);
                return message.channel.send({
                    'embed': {
                        'title': `${fm}'s last.fm`,
                        'description': `${hash.recenttracks.track[0].name} by ${hash.recenttracks.track[0].artist.ntext} \n on ${hash.recenttracks.track[0].album.ntext} \n [view on last.fm >](${hash.recenttracks.track[0].url})`,
                        'url': `https://last.fm/user/${fm}`,
                        'color': 2708478,
                        'footer': {
                            'text': 'カンボット by kanbaru#7887',
                        },
                        'thumbnail': {
                            'url': `${hash.recenttracks.track[0].image[2].ntext}`,
                        },
                    },

                });
            })
    }

};