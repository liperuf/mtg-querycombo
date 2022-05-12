function comboObject (value) {

  const cards = value.filter((card, i) => i>0 && i<11 && card);

  return {
    id: value[0],
    cards,
    ci: value[11].split(","),
    pre: value[12],
    steps: value[13],
    result: value[14]
  }
}

function searchCombos (combos, decklist, cardLimit = 3) {
  
  const results = combos.filter(combo => {

    const comboCards = combo.filter((card, i) => i>0 && i<11 && card);

    return (
      comboCards.length > 0 &&
      comboCards.length <= cardLimit &&
      comboCards.every(card => decklist.includes(card))
    )

  })

  return results.map(comboObject);
}


function legacy_searchCombos (combos, cards, ci, cardLimit) {
  const results = combos.filter(combo => {
    const comboCards = combo.filter((card, i) => i>0 && i<11 && card);
    return (
      comboCards.length <= cardLimit &&
      intersect(cards, comboCards).length && 
      intersect(ci, combo[11].split(",")).length
    );
  })

  return results.map(comboObject);
}

function intersect (arrayLeft, arrayRight) {
  const setArrayRight = new Set(arrayRight);
  return [...new Set(arrayLeft)].filter(item => setArrayRight.has(item));
}


export default searchCombos;