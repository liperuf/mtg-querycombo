import express from 'express';
import telegramBot from 'node-telegram-bot-api';

import parseMoxfield from './parseMoxfield.js';
import parseCommanderSpellbook from './parseCommanderSpellbook.js';
import searchCombos from './searchCombos.js';

const app = express()
const port = process.env.PORT || 3000;

const telegramBotOptions = {
  polling: true,
  webHook: {
    port: process.env.PORT
  }
};
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const appURL = process.env.APP_URL || 'https://combomox.herokuapp.com:443';
const bot = new telegramBot(TELEGRAM_TOKEN, telegramBotOptions);


app.all('*', function(req, res, next) {
     var origin = req.get('origin'); 
     res.header('Access-Control-Allow-Origin', origin);
     res.header("Access-Control-Allow-Headers", "X-Requested-With");
     res.header('Access-Control-Allow-Headers', 'Content-Type');
     next();
});

bot.onText(/\/combomoxlegacy (.+)/, (msg, match) => {
	const moxfieldId = match[1];
	const chatId = msg.chat.id;

	parseCommanderSpellbook().then(commanderSpellbookResponse => {
		
		parseMoxfield(moxfieldId).then(moxfieldResponse => {

			const queryDecklist = searchCombos(
				commanderSpellbookResponse,
				moxfieldResponse
			)

			const pretty = queryDecklist.map(combo => combo.cards).reduce((acc, combo) => {
				return `${acc} - ${combo.join(', ')} \n`
			}, "")

			bot.sendMessage(chatId, `${queryDecklist.length} combos found: \n${pretty}`)
		
		})
	})
})

bot.onText(/\/combomox (.+)/, (msg, match) => {
	const moxfieldId = match[1];
	const chatId = msg.chat.id;

	parseCommanderSpellbook().then(commanderSpellbookResponse => {
		
		parseMoxfield(moxfieldId).then(moxfieldResponse => {

			const queryDecklist = searchCombos(
				commanderSpellbookResponse,
				moxfieldResponse
			)

			const pretty = queryDecklist.reduce((acc, combo) => {
				return `${acc} - <a href="https://commanderspellbook.com/combo/${combo.id}/">${combo.id}</a> ${combo.cards.join(', ')} \n`
			}, "")

			bot.sendMessage(
				chatId, 
				`${queryDecklist.length} combos found: \n${pretty}`,
				{ 
					parse_mode: 'HTML',
					disable_web_page_preview: true
				}
			)
		
		})
	})
})

bot.onText(/\/combomoxbeta (.+)/, (msg, match) => {

	const moxfieldId = match[1].match(/^(.+) /)[0];
	const quantity = match[1].match(/([0-9]*)$/)[0] || 3;
	const chatId = msg.chat.id;

	parseCommanderSpellbook().then(commanderSpellbookResponse => {
		
		parseMoxfield(moxfieldId).then(moxfieldResponse => {

			const queryDecklist = searchCombos(
				commanderSpellbookResponse,
				moxfieldResponse,
				quantity
			)

			const pretty = queryDecklist.reduce((acc, combo) => {
				return `${acc} - <a href="https://commanderspellbook.com/combo/${combo.id}/">${combo.id}</a> ${combo.cards.join(', ')} \n`
			}, "")

			bot.sendMessage(
				chatId, 
				`${moxfieldId} - ${quantity} \n ${queryDecklist.length} combos found: \n${pretty}`,
				{ 
					parse_mode: 'HTML',
					disable_web_page_preview: true
				}
			)
		
		})
	})
})


app.get('/moxfield/:moxfieldId', async (req, res) => {
  
  const queryDecklist = searchCombos(
    await parseCommanderSpellbook(),
    await parseMoxfield(req.params.moxfieldId),
  )
  
  res.json(queryDecklist)
})

app.get('/moxpretty/:moxfieldId', async (req, res) => {
  
	parseCommanderSpellbook().then(commanderSpellbookResponse => {
		
		parseMoxfield(req.params.moxfieldId).then(moxfieldResponse => {

			const queryDecklist = searchCombos(
				commanderSpellbookResponse,
				moxfieldResponse
			)

			const pretty = queryDecklist.map(combo => combo.cards).reduce((acc, combo) => {
				return `${acc} - ${combo.join(', ')} \n`
			}, "")

			res.send(`${queryDecklist.length} combos found: \n${pretty}`)
		
		})
	})  
})


bot.setWebHook(`${appURL}/bot${TELEGRAM_TOKEN}`);

// Just to ping!
bot.on('message', function onMessage(msg) {
  // bot.sendMessage(msg.chat.id, 'I am alive on Heroku!');
  console.log('im alive!!! on webhook');
});


app.listen(port, () => {
  console.log(`Server is listening at port: ${port}`)
})