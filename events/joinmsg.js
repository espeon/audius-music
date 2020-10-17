const { Event } = require('klasa');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { event: 'guildCreate' });
	}

	run(guild) {
		if (!guild.available) return;
    this.client.channels.cache.get(guild.systemChannelID).send("hey 🏄‍♀️🌊👋🎧🎵\nif you ever need help with anything relating to me, please do `"+ process.env.prefix + "help`.")
	}

};