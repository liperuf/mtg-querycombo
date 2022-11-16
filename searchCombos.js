import comboObject from './comboObjectify.js';

function searchCombos (combos, decklist, cardLimit = 3) {
  
  const results = combos.filter(combo => {

    const comboCards = combo.filter((card, i) => i>0 && i<11 && card).map(card => card.trim());

    return (
      comboCards.length > 0 &&
      comboCards.length <= cardLimit &&
      comboCards.every(card => decklist.cards.includes(card))
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