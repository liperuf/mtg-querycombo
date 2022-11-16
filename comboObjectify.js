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

export default comboObject;