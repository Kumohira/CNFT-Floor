require("dotenv").config();

const { Client } = require('discord.js');
const axios = require('axios');

const DELETE_INTERVAL = 4000;
const BASE_URL = 'https://server.jpgstoreapis.com/collection/';

const client = new Client({ partials: ['MESSAGE'] });

client.on('ready', ()  => {
  console.log(`${client.user.tag} has logged in.`);
});

client.on('message', user => {
	if (user.channel.id !== '895470721780809828') return;
	if (user.author.bot) return;

	const splitedUserMsg = user.content.split(' ');

	if (!splitedUserMsg[0].startsWith('!')) {
		replyToAndDelete(user, `Warning ! Dont chat -_-`, DELETE_INTERVAL);
	} else if(splitedUserMsg.length !== 2) {
		replyToAndDelete(user, `Use: !floor projectName (without spaces !)`, DELETE_INTERVAL);
	} else if(splitedUserMsg[0] === '!floor') {
		getFloorByName(splitedUserMsg[1].trim())
			.then(floorPrice => {
				replyToAndDelete(user, `Floor Price -> ${floorPrice}`, DELETE_INTERVAL);
			})
			.catch(error => {
				if (error.response.status === 500)
					replyToAndDelete(user, `Error -> Project Not Found`, DELETE_INTERVAL)
			})
	} else {
		replyToAndDelete(user, `Use: !floor projectName (without spaces !)`, DELETE_INTERVAL);
	}

	user.delete({ timeout: DELETE_INTERVAL });
});

async function getFloorByName(projectName){
	let floorPrice = null;
	await axios({
	  method: 'get',
	  url: BASE_URL + projectName + '/floor',
		headers: {},
	})
		.then(function(response) {
			if (!response.data) { return; }
			floorPrice = response.data.floor/1000000;
		});
	return floorPrice;
}

function replyToAndDelete(endUser, replyMessage, deleteInterval) {
	endUser.reply(replyMessage)
		.then(botMsg => {
			botMsg.delete({ timeout: deleteInterval })
				.catch(console.error);
		})
		.catch(console.error);
}

client.login(process.env.DISCORDJS_BOT_TOKEN);
