import express from 'express';
import telegramBot from 'node-telegram-bot-api';

import parseMoxfield from './parseMoxfield.js';
import parseCommanderSpellbook from './parseCommanderSpellbook.js';
import searchCombos from './searchCombos.js';
import searchNearCombos from './searchNearCombos.js';

const app = express()
const port = process.env.PORT || 3000;

const telegramBotOptions = {
  // polling: true,
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

bot.onText(/\/__combomox (.+)/, (msg, match) => {
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

bot.on('message', function onMessage(msg) {
  // bot.sendMessage(msg.chat.id, 'I am alive on Heroku!');
  console.log('msg incoming.');

  const moxfieldRegex = /moxfield.com\/decks\/([\w\-]+)/;
  const debugString = /debug/;

  if(moxfieldRegex.test(msg.text)) {

  	const moxfieldId = msg.text.match(moxfieldRegex)[1];
  	const chatId = msg.chat.id;

		if(debugString.test(msg.text)) {
  		console.log(`Hm, I see ${moxfieldId} mentioned here.`);
    }

  	parseCommanderSpellbook().then(commanderSpellbookResponse => {
		
			parseMoxfield(moxfieldId).then(moxfieldResponse => {

				const queryDecklist = searchCombos(
					commanderSpellbookResponse,
					moxfieldResponse,
					9
				);

			  const queryNearCombos = searchNearCombos(
			    commanderSpellbookResponse,
			    moxfieldResponse,
			    9
			  );


				if(debugString.test(msg.text)) {
					console.log('Moxfield Response ------------------------------------------------------')
					console.log(moxfieldResponse)
					console.log('------------------------------------------------------------------------')

					console.log('Query Decklist ---------------------------------------------------------')
					console.log(queryDecklist)
					console.log('------------------------------------------------------------------------')
				}

				const pretty = queryDecklist.reduce((acc, combo) => {
					return `${acc} - <a href="https://commanderspellbook.com/combo/${combo.id}">${combo.id}</a> ${combo.cards.join(', ')} \n`
				}, "");

			  const groupBy = function groupBy (xs, key) {
			    return xs.reduce(function(rv, x) {
			      (rv[x[key]] = rv[x[key]] || []).push(x);
			      return rv;
			    }, {});
			  };

			  const prettyNearCombos = Object.entries(groupBy(queryNearCombos, "addCard")).sort((a,b) => b[1].length - a[1].length).reduce((acc, arrAddCard) => {

			    const addCard = arrAddCard[0];
			    const possibleCombos = arrAddCard[1].length;
			    const comboList = arrAddCard[1].reduce((accj, combo) => {

			    	const otherCardsList = combo.cards.filter(card => card != addCard);

			    	let output = "";
			    	output += `${accj}`;
			      output += `  • <a href="https://commanderspellbook.com/combo/${combo.id}">${combo.id}</a> ${otherCardsList[0]}${otherCardsList.length > 1? ` and ${otherCardsList.length-1} more cards` : ``}\n`;
			      
			      return output;
			    
			    }, "")

			    return `${acc}${addCard} ${possibleCombos > 1? `+${possibleCombos}` : ``}\n${comboList}\n`;

			  },"");

			  let prettyResponse = "";
			  prettyResponse += `You've searched combos for <a href="${moxfieldResponse.publicUrl}">${moxfieldResponse.name}</a>\n\n`;
			  prettyResponse += queryDecklist.length>0? `<b>${queryDecklist.length} combos found</b>\n` : `This deck is <b>Combo Free!</b>\n`;
			  prettyResponse += `${pretty}\n`;
			  if(queryNearCombos.length > 0) {
				  prettyResponse += `<b>${queryNearCombos.length} potential combos if you add...</b>\n\n`
				  prettyResponse += `${prettyNearCombos}`;
			  } else {
			  	prettyResponse += `This decklist has potential combos 🙈`;
			  }

			  let shortResponse = ``;
			  shortResponse += `You've searched combos for <a href="${moxfieldResponse.publicUrl}">${moxfieldResponse.name}</a>\n\n`;
			  shortResponse += queryDecklist.length>0? `<b>${queryDecklist.length} combos found</b>\n` : `This deck is <b>Combo Free!</b>\n`;
			  shortResponse += `${pretty}\n\n`;
			  shortResponse += `Whoa there comboy 🤠\nTake it easy... You want me to diplay the other ${queryNearCombos.length} potential combos with this decklist? You gotta be kidding 🙊`;

				bot.sendMessage(
					chatId, 
					prettyResponse.length < 4096? prettyResponse : shortResponse.length < 4096? shortResponse : `${queryDecklist.length} combos and ${queryNearCombos.length} combos missing one card`,
					{ 
						parse_mode: 'HTML',
						disable_web_page_preview: true
					}
				);
			
			})
		})

  }

});


// app.listen(port, () => {
//   console.log(`Server is listening at port: ${port}`)
// })