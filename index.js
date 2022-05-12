import express from 'express';
import telegramBot from 'node-telegram-bot-api';

import parseMoxfield from './parseMoxfield.js';
import parseCommanderSpellbook from './parseCommanderSpellbook.js';
import searchCombos from './searchCombos.js';

const app = express()
const port = process.env.PORT || 3000;
const bot = new telegramBot(process.env.TELEGRAM_TOKEN, { polling: true });

bot.onText(/\/moxfield (.+)/, async (msg, match) => {
	const moxfieldId = match[1];
	const chatId = msg.chat.id;

	const queryDecklist = searchCombos(
		await parseCommanderSpellbook(),
		await parseMoxfield(moxfieldId)
	)

	bot.sendMessage(chatId, queryDecklist)
})


app.get('/moxfield/:moxfieldId', async (req, res) => {
  
  const queryDecklist = searchCombos(
    await parseCommanderSpellbook(),
    await parseMoxfield(req.params.moxfieldId),
  )
  
  res.json(queryDecklist)
})

app.listen(port, () => {
  console.log(`Server is listening at port: ${port}`)
})