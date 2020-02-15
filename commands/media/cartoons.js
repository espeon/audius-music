const { Command } = require("klasa");
var req = require("request");

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: "cartoons",
      enabled: true,
      runIn: ["text", "dm"],
      aliases: ["a", "anime", "am"],
      subcommands: true,
      description: "searches for anime",
      usageDelim: " ",
      usage: "<episode|search|e|s:default> (args:str) [...]"
    });
  }

  async search(message, args) {
    if(args.includes(`-ep`)){
      return this.episode(message, args)
    }
    var kitsu = await this.searchKitsu(message, args);
    message.channel.send({
      embed: {
        title: `${kitsu[0].formattedTitle}`,
        description: `${kitsu[0].attributes.synopsis}\n—————\nPopularity: #${kitsu[0].attributes.popularityRank}\nRatings: #${kitsu[0].attributes.ratingRank}\nContent Rating: ${kitsu[0].attributes.ageRating}`,
        url: `https://kitsu.io/anime/${kitsu[0].attributes.slug}`,
        color: 2708478,
        footer: {
          text: "カンボット by kanbaru#7887 | kitsu.io"
        },
        thumbnail: {
          url: `${kitsu[0].attributes.posterImage.original}`
        }
      }
    });
  }

  async episode(message, args) {
    let episode = 0
    if(args.includes(`-ep`)){
      episode = args[args.indexOf(`-ep`) + 1] - 1
      args.splice(args.indexOf(`-ep`), 2);
    }else{
      return message.channel.send("Could you specify an episode? (ex: `-ep 1`)")
    }
    let kitsu = await this.searchKitsu(message, args);
    let episodeInfo = await this.getEpisodeofSeries(message, episode, kitsu[0]);
    if(episodeInfo.attributes.canonicalTitle == null){
      return message.channel.send("I couldn't get information about this episode.")
    }
    await message.channel.send({
      embed: {
        title: `${kitsu[0].formattedTitle}`,
        description: `Episode ${episode + 1}・${episodeInfo.attributes.canonicalTitle}\n${await this.trimString(episodeInfo.attributes.synopsis, 1000)}`,
        url: `${episodeInfo.attributes.thumbnail == null ? episodeInfo.links.self : episodeInfo.attributes.thumbnail}`,
        color: 2708478,
        footer: {
          text: "カンボット by kanbaru#7887 | kitsu.io"
        },
        thumbnail: {
          url: `${kitsu[0].attributes.posterImage.original}`
        }
      }
    });
  }

  async e(message, args) {
    this.episode(message, args);
  }

  async s(message, args) {
    this.search(message, args);
  }

  //more modular shite

  async trimString(desc, amount){
    return new Promise(resolve => {
      if (desc.length > amount) {
        desc =
          desc.length > amount ? desc.substring(0, amount - 3) + "..." : desc;
        resolve(desc)
      } else {
        resolve(desc)
      }
    });
  }
  
  async searchKitsu(message, args) {
    //kitsu link, requests a search for var `args`
    let link = `https://kitsu.io/api/edge/anime?filter[text]=${args}`;
    //epic promise, returns json to parent function
    return new Promise(resolve => {
      req(link, function(error, response, body) {
        let kitsu = JSON.parse(body);
        //checks if english title is the same as japanese title
                let name_rom = kitsu.data[0].attributes.titles.en_jp.toUpperCase().replace("-", " ");
                kitsu.data[0].formattedTitle = kitsu.data[0].attributes.titles.en_jp
                if (typeof kitsu.data[0].attributes.titles.en != "undefined") {
                    let name_eng = kitsu.data[0].attributes.titles.en.toUpperCase().replace("-", " ");
                    if (name_rom === name_eng) {
                        kitsu.data[0].formattedTitle = kitsu.data[0].attributes.titles.en_jp
                    } else {
                        kitsu.data[0].formattedTitle = kitsu.data[0].attributes.titles.en_jp + " / " + kitsu.data[0].attributes.titles.en
                    }
                }
        //if data is undefined, send message back
        if (kitsu.data[0] == undefined) {
          return message.channel.send(
            "It seems this anime may not be on Kitsu"
          );
        } else {
          //otherwise return the data back to parent
          resolve(kitsu.data);
        }
      });
    });
  }

  async searchWS(message, args) {
    //ws link, requests a search for var `args`
    let link = `https://www.wonderfulsubs.com/api/v1/media/search?options=summary&q=${args}`;
    //epic promise, returns json to parent function
    return new Promise(resolve => {
      req(link, function(error, response, body) {
        let tw = JSON.parse(body);
        //if data is undefined, send message back
        if (tw.data[0] == undefined) {
          return message.channel.send(
            "It seems this anime may not be on our main source."
          );
        } else {
          //otherwise return the data back to parent
          resolve(tw.data);
        }
      });
    });
  }
  async getEpisodeofSeries(message, episode, kitsu) {
    //gets kitsu episode list
    let link = `https://kitsu.io/api/edge/anime/${kitsu.id}/episodes`;
    //promises, nothing new
    return new Promise(resolve => {
      req(link, function(error, response, body) {
        //parse json and "choose" episode
        let kitsuEpisodes = JSON.parse(body);
        kitsuEpisodes = kitsuEpisodes.data[episode]
        //if data is undefined, send message back
        if (kitsuEpisodes == undefined) {
          return message.channel.send(
            "It seems this episode may not be on Kitsu"
          );
        } else {
          //otherwise return the data back to parent
          resolve(kitsuEpisodes)
        }
      });
    });
  }
};
