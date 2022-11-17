import { readFileSync } from 'fs';

import parseMoxfield from './parseMoxfield.js';
import parseCommanderSpellbook from './parseCommanderSpellbook.js';
import searchCombos from './searchCombos.js';
import searchNearCombos from './searchNearCombos.js';
import comboObject from './comboObjectify.js';

const decklistReference = process.argv.slice(2)[0]

async function main() {

  const spellbookCombos = await parseCommanderSpellbook();
  const moxfieldDecklist = await parseMoxfield(decklistReference);

  const queryNearCombos = searchNearCombos(
    spellbookCombos,
    moxfieldDecklist,
    9
  )

  const queryCombos = searchCombos(
    spellbookCombos,
    moxfieldDecklist,
    9
  )

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


  const prettyCombos = queryCombos.reduce((acc, combo) => {
    return `${acc} - <a href="https://commanderspellbook.com/combo/${combo.id}/">${combo.id}</a> ${combo.cards.join(', ')} \n`
  }, "")


  console.log(`**${queryCombos.length} combos found**\n${prettyCombos}\n**${queryNearCombos.length} potential combos**\n${prettyNearCombos}`);
}


main()

async function cedhdb() {

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
