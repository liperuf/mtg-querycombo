import comboObject from './comboObjectify.js';

function searchNearCombos (combos, decklist, cardLimit = 3) {
  
  const results = combos

    .filter(combo => {

      const comboCards = combo.filter((card, i) => i>0 && i<11 && card).map(card => card.trim());
      const comboCI = combo.filter((ci, i) => i == 11).flatMap(ci => ci.trim().toUpperCase().split(","));

      return (
        comboCards[0] &&
        comboCards.length > 0 &&
        comboCards.length <= cardLimit &&
        comboCI.every(c => decklist.ci.includes(c)) &&
        comboCards.map(card => decklist.cards.includes(card)).filter(v => v == false).length == 1
      )
    })

    .map(comboObject)

    .map(combo => {

      return { 
        ...combo,
        addCard: combo.cards.filter(card => !decklist.cards.includes(card))
      }

    })

  return results
}

export default searchNearCombos;