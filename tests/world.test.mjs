import assert from "node:assert/strict";
import test from "node:test";
import {
  gardenMessage,
  growPlant,
  mergeSavedWorld,
  placeRoomItem,
  updatePetStat,
} from "../lib/world.mjs";

test("restores a child’s local world without losing defaults", () => {
  assert.deepEqual(
    mergeSavedWorld({ season: "spring", watered: false }, { watered: true }),
    { season: "spring", watered: true },
  );
});

test("uses gentle, non-competitive garden feedback", () => {
  assert.equal(gardenMessage(false), "The daisies look thirsty");
  assert.equal(gardenMessage(true), "The garden is sparkling");
});

test("room items move between valid slots without duplicating", () => {
  const first = placeRoomItem({}, "floor-left", "teddy");
  assert.deepEqual(placeRoomItem(first, "wall-right", "teddy"), {
    "wall-right": "teddy",
  });
});

test("watering advances a plant one stage and stops at maturity", () => {
  const seed = { kind: "sunflower", stage: 0, watered: false };
  assert.deepEqual(growPlant(seed), {
    kind: "sunflower",
    stage: 1,
    watered: true,
  });
  assert.equal(growPlant({ ...seed, stage: 3 }).stage, 3);
});

test("pet care stats never exceed their safe range", () => {
  const pet = { happiness: 92 };
  assert.equal(updatePetStat(pet, "happiness", 20).happiness, 100);
  assert.equal(updatePetStat(pet, "happiness", -200).happiness, 0);
});
