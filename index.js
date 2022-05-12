import express from 'express'

import parseMoxfield from './parseMoxfield.js';
import parseCommanderSpellbook from './parseCommanderSpellbook.js';
import searchCombos from './searchCombos.js';

const app = express()
const port = process.env.PORT || 3000;

app.get('/moxfield/:moxfieldId', async (req, res) => {
  
  const queryDecklist = searchCombos(
    await parseCommanderSpellbook(),
    await parseMoxfield(req.params.moxfieldId),
  )
  
  res.json(queryDecklist)
})



// app.get('/podcastPlays', async (req, res) => {
  
//   console.log("[index]: Starting podcastPlays routine!");
  
//   res.send(await podcastPlays())
// })

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})