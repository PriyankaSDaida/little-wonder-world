import assert from "node:assert/strict";
import test from "node:test";
import { gardenMessage, mergeSavedWorld } from "../lib/world.mjs";

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
