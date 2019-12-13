module.exports = {
    name: 'play',
    description: 'Play a song in VC!',
    async execute(bot, msg, args, serverQueue, youtube) {
        const handleVideo = require('../functions/handleVideo')
        const axios = require('axios')
        const request = require("request")

        const voiceChannel = msg.member.voiceChannel

        if (!voiceChannel) {
            return msg.channel.reply(`connecting to the vc you're in-\nwait... you aren't in one!`)
        }

        const permissions = voiceChannel.permissionsFor(msg.client.user)
        if (!permissions.has("CONNECT")) {
            return msg.channel.send(`I may not have permissions to connect to vc... could someone please check?`)
        }
        if (!permissions.has("SPEAK")) {
            return msg.channel.send(`i may not have permissions to speak in vc... could someone please check?`)
        }

        if (url.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)) {
        const playlist = await youtube.getPlaylist(url)
        const videos = await playlist.getVideos()
        for (const video of Object.values(videos)) {
            const video2 = await youtube.getVideoByID(video.id) // eslint-disable-line no-await-in-loop
            await handleVideo(video2, msg, voiceChannel, true) // eslint-disable-line no-await-in-loop
        }
        return msg.channel.send(
            `✅ Playlist: **${playlist.title}** has been added to the queue!`
        )
        } else {
        try {
            if (typeof url == "") {
            return msg.channel.send("you didn't tell me what to play!!!")
            }
            /*if (url.includes("soundcloud.com")) {
            request(
                `https://kanbot-api.glitch.me/api/sc/track?sc=${url}`,
                function(error, response, body) {
                console.log(body)
                if (response.statusCode == 404) {
                    return msg.channel.send("This track can't be played.")
                }
                let soundcloud = JSON.parse(body)
                ydl.exec(url, ["-f", "mp3", "-g"], {}, (err, outp) => {
                    id = "sc-" + soundcloud.id
                    title = soundcloud.title + " by " + soundcloud.user.username
                    murl = outp[0] //soundcloud.stream_url + `?client_id=${sckey}`
                    return handleVideo(murl, msg, voiceChannel)
                })
                }
            )*/
                if (url.includes("soundcloud.com")) {
                    let response = await axios.get(`https://kanbot-api.glitch.me/api/sc/track?sc=${url}&v2=true`)

                    if (response.statusCode == 404) {
                    console.log(body)
                    return msg.channel.send(`This track can't be played.`)
                        }
                    let soundcloud = JSON.parse(body)[0]
                    console.log(soundcloud.media.transcodings[0].url)

                    let response2 = axios.get(`${soundcloud.media.transcodings[0].url}?client_id=Vu5tlmvC9eCLFZkxXG32N1yQMfDSAPAA`)

                    if (response2.statusCode == 404) {
                        return msg.channel.send(`This track can't be played.`)
                    }
                    let play = JSON.parse(body1)
                    console.log(play.url.replace(/&/gm, "%"))
                    id = "sc-" + soundcloud.id + soundcloud.media.transcodings[0].preset
                    title = soundcloud.title + " by " + soundcloud.user.username
                    murl = play.url
                    streamlink = url
                    return await handleVideo(murl, msg, voiceChannel)
                } 
                else if (url.includes("audius")) {
                    let link = url
                    if(link.slice(0, -1) === "/"){
                    link = link.slice(0, -1)
                    }
                    let username = link.replace("https://audius.co/", "").split("/")[0]
                    let slugpre = decodeURIComponent(link)
                    .replace("https://audius.co/", "")
                    .split("/")[1]
                    .split("-")
                    slugpre.pop()
                    let slug = slugpre.join("-")
                    let id = link
                    .replace("https://audius.co/", "")
                    .split("-")
                    .pop()
                    let options = {
                    method: "POST",
                    url:
                        "https://discoveryprovider2.audius.co/tracks_including_unlisted",
                    headers: { "Content-Type": "application/json" },
                    body: {
                        tracks: [
                        {
                            id: id,
                            url_title: slug,
                            handle: username
                        }
                        ]
                    },
                    json: true
                    }
                    console.log(slug)
                    request(options, function(error, response, body) { // I don't even know how to switch this to axios - Bass
                    if (body.success != true) {
                        console.log(body.success)
                        return msg.channel.send("This may not be a valid Audius link.")
                    }
                    let soundcloud = body
                    id = id
                    title = soundcloud.data[0].title
                    murl = `https://kanbot-api.glitch.me/api/audius/generate.m3u8?id=${id}&title=${slug}&handle=${username}`
                    streamlink = link
                    return await handleVideo(murl, msg, voiceChannel)
                    })
                } else {
                    let video = await youtube.getVideo(url)
                }
            } catch (error) {
                try {
                    if (searchString == "") {
                    return msg.channel.reply(`you didn't tell me what to play!!!`)
                    }
                    let videos = await youtube.searchVideos(searchString, 10)
                    let index = 0
                    msg.channel.send(`__**Song selection:**__\n${videos.map(video2 => `**${++index} -** ${video2.title}`).join("\n")}`)
                    .then(msg =>
                        setTimeout(function() {
                        msg.delete()
                        }, 10500)
                    )
                    // eslint-disable-next-line max-depth
                    try {
                        setTimeout(function() {
                            // Do nothing! Yall want a sleep function? - Bass
                        }, 250)
                        const filter = m => m.content > 0 && m.content < 11
                        let response = await msg.channel.awaitMessages(filter, {
                            max: 1,
                            time: 10000,
                            errors: ["time"]
                        })
                    } catch (err) {
                        console.error(`Error: ${err}`)
                        if (typeof response != undefined) {
                            return msg.channel.send(
                            `It looks like you've entered something I wasn't expecting. Could you please try again?`
                            )
                        } else {
                            return
                        }
                    }

                    const videoIndex = parseInt(response.first().content)
                    let video = await youtube.getVideoByID(videos[videoIndex - 1].id)
                } catch (err) {
                    console.error(err)
                    return msg.channel.send(`I couldn't get any results.`)
                }

                id = video.id
                title = Util.escapeMarkdown(video.title)
                murl = video.url
                streamlink = video.url
                return await handleVideo(video, msg, voiceChannel)
            }
        }    
    },
}