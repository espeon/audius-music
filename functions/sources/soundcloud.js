module.exports = soundcloud
const handleVideo = require("../../functions/handleVideo");
const request = require("request");
const findLengthOfm3u8 = require('../../functions/utils/findLengthOfm3u8')
const {sckey} = process.env;
async function soundcloud(msg, url, voiceChannel){
  console.log(`https://kanbot-api.glitch.me/api/sc/track?sc=${url}&v2=true`)
  request(
      `https://kanbot-api.glitch.me/api/sc/track?sc=${url}&v2=true`,
      function(error, response, body) {
        if (response.statusCode == 404) {
          console.log(response)
          return msg.channel.send("This track can't be played.");
        }
        let soundcloud = JSON.parse(body)[0];
        request(
          soundcloud.media.transcodings[0].url + `?client_id=${sckey}`,
          async function(error, response, body1) {
            if (response.statusCode == 404) {
              console.log(response)
              return msg.channel.send("This track can't be played.");
            }
            let play = JSON.parse(body1);
            console.log(play.url)
            let info = [];
            info.id =
              "sc-" + soundcloud.id + soundcloud.media.transcodings[0].preset;
            info.title = soundcloud.title + "・" + soundcloud.user.username;
            info.murl = play.url;
            info.duration = await findLengthOfm3u8(info.murl);
            info.streamlink = url;
            return handleVideo(info, msg, voiceChannel);
          }
        );
      }
    );
}