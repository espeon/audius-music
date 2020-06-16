module.exports = soundcloud;
const handleVideo = require("../../functions/handleVideo");
const request = require("request");
const axios = require("axios");
const findLengthOfm3u8 = require("../../functions/utils/findLengthOfm3u8");
const { sckey } = process.env;
async function soundcloud(msg, url, voiceChannel) {
  console.log(`https://localhost/api/sc/track?sc=${url}&v2=true`);
  let response = await fetchFromSoundCloud(url);
  if (response.statusCode == 404) {
    console.log(response);
    return msg.channel.send("This track can't be played.");
  }
  let body = response.data;
  console.log(body.media.transcodings);
  let soundcloud = body
  request(
    soundcloud.media.transcodings[0].url + `?client_id=${sckey}`,
    async function(error, response, body1) {
      if (response.statusCode !== 200) {
        console.log(response);
        return msg.channel.send("This track can't be played.");
      }
      console.log(response)
      let play = JSON.parse(body1);
      console.log(play.url);
      let info = [];
      info.id = "sc-" + soundcloud.id + soundcloud.media.transcodings[0].preset;
      info.title = soundcloud.title + "・" + soundcloud.user.username;
      info.murl = play.url;
      info.duration = await findLengthOfm3u8(info.murl);
      info.streamlink = url;
      return handleVideo(info, msg, voiceChannel);
    }
  );
}

async function fetchFromSoundCloud(uri) {
  const response = await axios.get(
    `http://api-v2.soundcloud.com/resolve?url=${uri}&client_id=DjuqaOFPLxEXimmFLFyAsBxaC3T4wAfK`,
    {
      headers: {
        "x-requested-with": "XMLHttpRequest",
        "x-access-token": "DjuqaOFPLxEXimmFLFyAsBxaC3T4wAfK"
      }
    }
  );
  return response;
}
