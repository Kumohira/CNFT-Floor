require("dotenv").config();

const { Client } = require('discord.js');
const axios = require('axios');

const DELETE_INTERVAL = 4000;
const EXTENDED_DELETE_INTERVAL = 10000;
const FLOOR_URL = 'https://server.jpgstoreapis.com/collection/';
const PROJECT_NAME_URL = 'https://server.jpgstoreapis.com/search/collections?nameQuery=';

const client = new Client({ partials: ['MESSAGE'] });

client.on('ready', ()  => {
  console.log(`${client.user.tag} has logged in.`);
});

client.on('message', user => {
	if (user.channel.id !== '973544830569443389') return;
	if (user.author.bot) return;

	let splitedUserMsg = user.content.split(' ');

	if (!splitedUserMsg[0].startsWith('!')) {
		replyToAndDelete(user, `Warning ! Dont chat -_-`, DELETE_INTERVAL);
	} else if(splitedUserMsg[0] === '!floor') {
		if(splitedUserMsg.length !== 2) {
			replyToAndDelete(user, `Use: **!floor projectName** (without spaces !)`, DELETE_INTERVAL);
		} else {
			getFloorByName(splitedUserMsg[1].trim())
				.then(floorPrice => {
					replyToAndDelete(user, `Floor Price -> ${floorPrice}`, DELETE_INTERVAL);
				})
				.catch(error => {
					if (error.response.status === 500)
						replyToAndDelete(user, `Error -> Project Not Found`, DELETE_INTERVAL)
				})
		}
	} else if(splitedUserMsg[0] === '!search') {
		if(splitedUserMsg.length < 2) {
			replyToAndDelete(user, `Use: **!search Name**`, DELETE_INTERVAL);
		} else {
			splitedUserMsg.splice(0, 1);
			const name = splitedUserMsg.join('+');
			getUrlName(name)
				.then(urlNames => {
					replyToAndDelete(user, `Use **!floor** with one of those names: => ${urlNames.join(' | ')}`, EXTENDED_DELETE_INTERVAL);
				})
				.catch(error => {
					replyToAndDelete(user, `Error -> Internal Server Error`, DELETE_INTERVAL)
				})
		}
	} else {
		replyToAndDelete(user, `Only **!floor** and **!search** are allowed.`, DELETE_INTERVAL);
	}

	user.delete({ timeout: DELETE_INTERVAL });
});

async function getFloorByName(projectName){
	let floorPrice = null;
	await axios({
	  method: 'get',
	  url: FLOOR_URL + projectName + '/floor',
		headers: {},
	})
		.then(function(response) {
			if (!response.data) { return; }
			floorPrice = response.data.floor/1000000;
		});
	return floorPrice;
}

async function getUrlName(name){
	let urlNames = [];
	await axios({
		method: 'get',
		url: PROJECT_NAME_URL + name + '&verified=should-be-verified&pagination=%7B%7D&size=5',
		headers: {},
	})
		.then(function(response) {
			if (!response.data) { return; }
			if (!response.data.collections.length) { return; }
			response.data.collections.forEach(item => {
				urlNames.push('**'+item.url+'**')
			});
		});
	return urlNames;
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
