import fetch from 'node-fetch';

export default async function parseMoxfield(decklistReference) {

  const decklistId = decklistReference.match(/^http/)? 
    decklistReference.split("/").slice(-1)[0] :
    decklistReference;

  const response = await fetch(`https://api.moxfield.com/v2/decks/all/${decklistId}`).then(response => response.json());

  if(!response) return [];
  if(!response.mainboard) return [];
  if(!response.commanders) return [];
  if(!response.companions) return [];

  return [
    ...Object.entries(response.mainboard).map(key => key[0]),
    ...Object.entries(response.commanders).map(key => key[0]),
    ...Object.entries(response.companions).map(key => key[0])
  ];
}