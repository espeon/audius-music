module.exports = findLengthOfm3u8;
var m3u8Parser = require("m3u8-parser");
const axios = require("axios");
  async function findLengthOfm3u8(url) {
  var parser = new m3u8Parser.Parser();
  const instance = await axios.get(url);

  parser.push(instance.data);
  parser.end();

  var parsedManifest = parser.manifest;

  let array = [];
  let totalduration = 0;
  await parsedManifest.segments.forEach(segment => {
    totalduration = totalduration + segment.duration;
  });
  console.log(Math.round(totalduration));
  return Math.round(totalduration);
}
