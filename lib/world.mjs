export function mergeSavedWorld(defaults, saved) {
  return { ...defaults, ...saved };
}

export function gardenMessage(watered) {
  return watered ? "The garden is sparkling" : "The daisies look thirsty";
}
