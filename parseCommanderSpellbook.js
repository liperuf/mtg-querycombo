import fetch from 'node-fetch';

const commanderSpellbookJSONURL = "https://sheets.googleapis.com/v4/spreadsheets/1KqyDRZRCgy8YgMFnY0tHSw_3jC99Z0zFvJrPbfm66vA/values:batchGet?ranges=combos!A2:Q&key=AIzaSyBD_rcme5Ff37Evxa4eW5BFQZkmTbgpHew";

export default async function parseCommanderSpellbook() {

  const response = await fetch(commanderSpellbookJSONURL).then(response => response.json());

  return response.valueRanges[0].values;
}