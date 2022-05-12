import parseMoxfield from './parseMoxfield.js';
import parseCommanderSpellbook from './parseCommanderSpellbook.js';
import searchCombos from './searchCombos.js';

const decklistReference = process.argv.slice(2)[0]

async function main() {

  const queryDecklist = searchCombos(
    await parseCommanderSpellbook(),
    await parseMoxfield(decklistReference),
  )

  console.log(queryDecklist);
  console.log(queryDecklist.length);
}


main()