export function mergeSavedWorld(defaults, saved) {
  return { ...defaults, ...saved };
}

export function gardenMessage(watered) {
  return watered ? "The garden is sparkling" : "The daisies look thirsty";
}

export function placeRoomItem(room, slot, itemId) {
  const next = { ...room };
  for (const [currentSlot, currentItem] of Object.entries(next)) {
    if (currentItem === itemId) delete next[currentSlot];
  }
  next[slot] = itemId;
  return next;
}

export function growPlant(plant) {
  if (!plant || plant.stage >= 3) return plant;
  return { ...plant, stage: plant.stage + 1, watered: true };
}

export function updatePetStat(pet, stat, amount) {
  return { ...pet, [stat]: Math.min(100, Math.max(0, pet[stat] + amount)) };
}
