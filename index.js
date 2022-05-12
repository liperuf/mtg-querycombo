import express from 'express';
import telegramBot from 'node-telegram-bot-api';

import parseMoxfield from './parseMoxfield.js';
import parseCommanderSpellbook from './parseCommanderSpellbook.js';
import searchCombos from './searchCombos.js';

const app = express()
const port = process.env.PORT || 3000;
const bot = new telegramBot(process.env.TELEGRAM_TOKEN, { polling: true });

bot.onText(/\/combomox (.+)/, (msg, match) => {
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

app.listen(port, () => {
  console.log(`Server is listening at port: ${port}`)
})