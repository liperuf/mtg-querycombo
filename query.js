import { readFileSync } from 'fs';

import parseMoxfield from './parseMoxfield.js';
import parseCommanderSpellbook from './parseCommanderSpellbook.js';
import searchCombos from './searchCombos.js';

// const decklistReference = process.argv.slice(2)[0]



async function main() {

  const commanderSpellbook = await parseCommanderSpellbook();
  const cedhdbFile = readFileSync('./cedhdb_12may.json');
  const cedhdbDecks = JSON.parse(cedhdbFile);


  const list = cedhdbDecks.flatMap(item => {
    return item.decklists.filter(decklist => {
      return decklist.link.match(/moxfield/)
    }).map(decklist => decklist.link)
  })

  // list.slice(0, 2).forEach(async (link) => {
  list.forEach(async (link) => {

    let queryDecklist = searchCombos(
      commanderSpellbook,
      await parseMoxfield(link),
    )

    queryDecklist = queryDecklist.reduce((acc, combo) => { return `${acc}\n ${combo.id}; ${combo.cards.join(";")}` }, "")

  console.log(queryDecklist);
  // console.log(queryDecklist.length);

  })

  // const queryDecklist = searchCombos(
  //   await parseCommanderSpellbook(),
  //   await parseMoxfield(decklistReference),
  // )

  // console.log(queryDecklist);
  // console.log(queryDecklist.length);
}


main()