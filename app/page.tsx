"use client";

import { useEffect, useMemo, useState } from "react";
import type { DragEvent } from "react";

type Screen = "village" | "room" | "garden" | "pet";
type Avatar = "fox" | "bunny" | "bear" | "cat";
type PetKind = "puppy" | "kitten" | "panda";
type PlantKind = "sunflower" | "strawberry" | "tulip";

type Plant = {
  kind: PlantKind;
  stage: number;
  watered: boolean;
};

type Pet = {
  kind: PetKind;
  name: string;
  hunger: number;
  happiness: number;
  energy: number;
  cleanliness: number;
};

type WorldState = {
  childName: string;
  avatar: Avatar;
  started: boolean;
  stars: number;
  room: Record<string, string>;
  garden: Array<Plant | null>;
  pet: Pet | null;
};

const STORAGE_KEY = "little-wonder-world-v2";
const avatars: Array<{ id: Avatar; emoji: string; label: string }> = [
  { id: "fox", emoji: "🦊", label: "Clever fox" },
  { id: "bunny", emoji: "🐰", label: "Happy bunny" },
  { id: "bear", emoji: "🐻", label: "Cozy bear" },
  { id: "cat", emoji: "🐱", label: "Curious cat" },
];

const furnitureNames = [
  "Cloud bed",
  "Rainbow rug",
  "Moon lamp",
  "Book basket",
  "Teddy chair",
  "Star pillow",
  "Tiny table",
  "Flower vase",
  "Toy chest",
  "Bunny clock",
  "Leaf cushion",
  "Dream canopy",
  "Music box",
  "Wall rainbow",
  "Cozy blanket",
  "Window plant",
  "Fox stool",
  "Sun mirror",
  "Story shelf",
  "Paper lantern",
  "Acorn basket",
  "Cloud mobile",
  "Berry cushion",
  "Wooden train",
  "Doll house",
];

const furniture = Array.from({ length: 50 }, (_, index) => ({
  id: `item-${index + 1}`,
  name: furnitureNames[index % furnitureNames.length],
  emoji: ["🛏️", "🧸", "🪴", "📚", "🪑", "🛋️", "🪞", "🧺", "🪁", "🕯️"][
    index % 10
  ],
  color: ["peach", "mint", "sky", "lilac", "sunny"][index % 5],
}));

const roomSlots = [
  "window-left",
  "window-right",
  "floor-left",
  "floor-center",
  "floor-right",
  "wall-left",
  "wall-center",
  "wall-right",
];

const plantInfo: Record<PlantKind, { emoji: string[]; name: string }> = {
  sunflower: { emoji: ["🌰", "🌱", "🌿", "🌻"], name: "Sunflower" },
  strawberry: { emoji: ["🌰", "🌱", "🌿", "🍓"], name: "Strawberry" },
  tulip: { emoji: ["🌰", "🌱", "🌿", "🌷"], name: "Tulip" },
};

const petInfo: Record<PetKind, { emoji: string; label: string }> = {
  puppy: { emoji: "🐶", label: "Puppy" },
  kitten: { emoji: "🐱", label: "Kitten" },
  panda: { emoji: "🐼", label: "Panda" },
};

const defaultWorld: WorldState = {
  childName: "",
  avatar: "fox",
  started: false,
  stars: 0,
  room: {},
  garden: [null, null, null, null],
  pet: null,
};

function clamp(value: number) {
  return Math.min(100, Math.max(0, value));
}

export default function Home() {
  const [world, setWorld] = useState<WorldState>(defaultWorld);
  const [screen, setScreen] = useState<Screen>("village");
  const [hydrated, setHydrated] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [avatarDraft, setAvatarDraft] = useState<Avatar>("fox");
  const [isNight, setIsNight] = useState(false);
  const [activeObject, setActiveObject] = useState("");
  const [selectedFurniture, setSelectedFurniture] = useState(furniture[0].id);
  const [roomHistory, setRoomHistory] = useState<Array<Record<string, string>>>(
    [],
  );
  const [roomFuture, setRoomFuture] = useState<Array<Record<string, string>>>(
    [],
  );
  const [roomMessage, setRoomMessage] = useState(
    "Choose something, then tap a space.",
  );
  const [seed, setSeed] = useState<PlantKind>("sunflower");
  const [petReaction, setPetReaction] = useState(
    "Your new friend is ready to play!",
  );

  useEffect(() => {
    const restore = window.setTimeout(() => {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const restored = {
            ...defaultWorld,
            ...(JSON.parse(saved) as WorldState),
          };
          setWorld(restored);
          setNameDraft(restored.childName);
          setAvatarDraft(restored.avatar);
        } catch {
          window.localStorage.removeItem(STORAGE_KEY);
        }
      }
      setHydrated(true);
    }, 0);
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }
    return () => window.clearTimeout(restore);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(world));
  }, [world, hydrated]);

  useEffect(() => {
    const timer = window.setInterval(
      () => setIsNight((value) => !value),
      45000,
    );
    return () => window.clearInterval(timer);
  }, []);

  const childName = world.childName.trim() || "Explorer";
  const avatarEmoji =
    avatars.find((item) => item.id === world.avatar)?.emoji ?? "🦊";
  const roomCount = Object.keys(world.room).length;
  const gardenCount = world.garden.filter(Boolean).length;

  const overallProgress = useMemo(() => {
    const milestones = [roomCount > 0, gardenCount > 0, Boolean(world.pet)];
    return milestones.filter(Boolean).length;
  }, [roomCount, gardenCount, world.pet]);

  function startAdventure() {
    setWorld((current) => ({
      ...current,
      childName: nameDraft.trim(),
      avatar: avatarDraft,
      started: true,
    }));
  }

  function rememberRoom(next: Record<string, string>) {
    setRoomHistory((history) => [...history.slice(-19), world.room]);
    setRoomFuture([]);
    setWorld((current) => ({ ...current, room: next }));
  }

  function placeFurniture(slot: string, itemId = selectedFurniture) {
    if (world.room[slot] && world.room[slot] !== itemId) {
      setRoomMessage("That cozy spot is full. Try another glowing space!");
      return;
    }
    const previousSlot = Object.entries(world.room).find(
      ([, id]) => id === itemId,
    )?.[0];
    const next = { ...world.room };
    if (previousSlot) delete next[previousSlot];
    next[slot] = itemId;
    rememberRoom(next);
    setRoomMessage("Perfect! Your room remembered that spot.");
  }

  function undoRoom() {
    const previous = roomHistory.at(-1);
    if (!previous) return;
    setRoomFuture((future) => [world.room, ...future]);
    setWorld((current) => ({ ...current, room: previous }));
    setRoomHistory((history) => history.slice(0, -1));
  }

  function redoRoom() {
    const next = roomFuture[0];
    if (!next) return;
    setRoomHistory((history) => [...history, world.room]);
    setWorld((current) => ({ ...current, room: next }));
    setRoomFuture((future) => future.slice(1));
  }

  function dropFurniture(event: DragEvent<HTMLButtonElement>, slot: string) {
    event.preventDefault();
    const itemId = event.dataTransfer.getData("text/plain");
    if (itemId) placeFurniture(slot, itemId);
  }

  function plant(index: number) {
    if (world.garden[index]) return;
    const garden = [...world.garden];
    garden[index] = { kind: seed, stage: 0, watered: false };
    setWorld((current) => ({ ...current, garden }));
  }

  function waterPlant(index: number) {
    const garden = [...world.garden];
    const current = garden[index];
    if (!current || current.stage >= 3) return;
    garden[index] = {
      ...current,
      watered: true,
      stage: Math.min(3, current.stage + 1),
    };
    setWorld((value) => ({ ...value, garden }));
  }

  function harvest(index: number) {
    const garden = [...world.garden];
    const current = garden[index];
    if (!current || current.stage < 3) return;
    garden[index] = null;
    setWorld((value) => ({ ...value, garden, stars: value.stars + 2 }));
  }

  function playSound(frequency: number) {
    try {
      const AudioContextClass = window.AudioContext;
      const context = new AudioContextClass();
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.08, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.25);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.25);
    } catch {
      // Sound is an enhancement; play remains available when audio is blocked.
    }
  }

  function careForPet(action: "feed" | "play" | "sleep" | "bathe") {
    if (!world.pet) return;
    const pet = { ...world.pet };
    if (action === "feed") {
      pet.hunger = clamp(pet.hunger + 18);
      setPetReaction("Yum! That was a delicious snack.");
      playSound(520);
    }
    if (action === "play") {
      pet.happiness = clamp(pet.happiness + 20);
      pet.energy = clamp(pet.energy - 8);
      setPetReaction("Wheee! Your friend loves playing with you.");
      playSound(660);
    }
    if (action === "sleep") {
      pet.energy = clamp(pet.energy + 25);
      setPetReaction("Shhh… a tiny, cozy nap.");
      playSound(330);
    }
    if (action === "bathe") {
      pet.cleanliness = clamp(pet.cleanliness + 22);
      setPetReaction("Splish splash! All clean and fluffy.");
      playSound(440);
    }
    setWorld((current) => ({ ...current, pet }));
  }

  if (!hydrated) {
    return (
      <main className="loading-world" aria-label="Loading your world">
        ✦
      </main>
    );
  }

  if (!world.started) {
    return (
      <main className="onboarding">
        <div className="welcome-sky" aria-hidden="true">
          <i className="cloud cloud-one" />
          <i className="cloud cloud-two" />
          <span className="welcome-sun">☀</span>
          <div className="welcome-hills" />
          <div className="welcome-home">🏡</div>
        </div>
        <section className="welcome-card" aria-labelledby="welcome-title">
          <span className="brand-star">✦</span>
          <p className="kicker">A LITTLE WORLD OF YOUR OWN</p>
          <h1 id="welcome-title">Little Wonder World</h1>
          <p className="welcome-copy">
            A gentle place to grow flowers, decorate a cozy room, and care for a
            new best friend.
          </p>
          <div className="avatar-picker" aria-label="Choose your explorer">
            {avatars.map((avatar) => (
              <button
                key={avatar.id}
                className={avatarDraft === avatar.id ? "chosen" : ""}
                onClick={() => setAvatarDraft(avatar.id)}
                aria-pressed={avatarDraft === avatar.id}
              >
                <span>{avatar.emoji}</span>
                {avatar.label}
              </button>
            ))}
          </div>
          <label className="name-field">
            <span>
              What should we call you? <em>Optional</em>
            </span>
            <input
              value={nameDraft}
              onChange={(event) =>
                setNameDraft(event.target.value.slice(0, 18))
              }
              placeholder="Your name or nickname"
              autoComplete="off"
            />
          </label>
          <button className="start-button" onClick={startAdventure}>
            Start Adventure <span>→</span>
          </button>
          <small>No account · No ads · Your world stays on this device</small>
        </section>
      </main>
    );
  }

  return (
    <main className={`game ${isNight ? "night" : "day"}`}>
      <header className="game-header">
        <button className="game-brand" onClick={() => setScreen("village")}>
          <span>✦</span>
          <b>Little Wonder World</b>
        </button>
        <nav aria-label="World navigation">
          {(
            [
              ["village", "🏡", "Village"],
              ["room", "🛏️", "My Room"],
              ["garden", "🌻", "Garden"],
              ["pet", "🐾", "My Pet"],
            ] as Array<[Screen, string, string]>
          ).map(([id, icon, label]) => (
            <button
              key={id}
              className={screen === id ? "active" : ""}
              onClick={() => setScreen(id)}
            >
              <span>{icon}</span>
              {label}
            </button>
          ))}
        </nav>
        <div className="player-chip">
          <span className="star-count">⭐ {world.stars}</span>
          <span className="player-avatar">{avatarEmoji}</span>
          <span>
            <small>HELLO</small>
            <b>{childName}</b>
          </span>
        </div>
      </header>

      {screen === "village" && (
        <section className="village-screen" aria-labelledby="village-title">
          <div className="village-copy">
            <p className="kicker">YOUR MAGICAL HOME</p>
            <h1 id="village-title">Where should we explore?</h1>
            <p>Everything here is yours to touch, grow, and make special.</p>
          </div>
          <div
            className="progress-pill"
            aria-label={`${overallProgress} of 3 adventures started`}
          >
            <span>{overallProgress}/3</span> adventures started
          </div>
          <div className="village-world" aria-label="Interactive home village">
            <div className="sky-stars" aria-hidden="true">
              ✦　·　✧　·　✦　·　✧
            </div>
            <i className="cloud moving-cloud cloud-a" />
            <i className="cloud moving-cloud cloud-b" />
            <span className="bird bird-a" aria-hidden="true">
              ⌁⌁
            </span>
            <span className="bird bird-b" aria-hidden="true">
              ⌁
            </span>
            <button
              className={`village-sun ${activeObject === "sun" ? "object-pop" : ""}`}
              aria-label="Touch the sun"
              onClick={() => {
                setIsNight((value) => !value);
                setActiveObject("sun");
              }}
            >
              {isNight ? "🌙" : "☀️"}
            </button>
            <div className="mountains" aria-hidden="true">
              <i />
              <i />
              <i />
            </div>
            <div className="trees" aria-hidden="true">
              <i>♣</i>
              <i>♣</i>
              <i>♣</i>
              <i>♣</i>
              <i>♣</i>
            </div>

            <button
              className={`world-place house-place ${activeObject === "house" ? "object-pop" : ""}`}
              onClick={() => {
                setActiveObject("house");
                setScreen("room");
              }}
            >
              <span className="place-art">🏡</span>
              <b>My Cozy Room</b>
              <small>
                {roomCount
                  ? `${roomCount} things placed`
                  : "Make it feel like you"}
              </small>
            </button>
            <button
              className={`world-place garden-place ${activeObject === "garden" ? "object-pop" : ""}`}
              onClick={() => {
                setActiveObject("garden");
                setScreen("garden");
              }}
            >
              <span className="place-art">🌻</span>
              <b>Sunny Garden</b>
              <small>
                {gardenCount
                  ? `${gardenCount} plants growing`
                  : "Plant your first seed"}
              </small>
            </button>
            <button
              className={`world-place pet-place ${activeObject === "pet" ? "object-pop" : ""}`}
              onClick={() => {
                setActiveObject("pet");
                setScreen("pet");
              }}
            >
              <span className="place-art">
                {world.pet ? petInfo[world.pet.kind].emoji : "🐾"}
              </span>
              <b>{world.pet ? `${world.pet.name}’s Cottage` : "Pet Cottage"}</b>
              <small>
                {world.pet ? "Your friend is waiting" : "Meet a new friend"}
              </small>
            </button>
            <button
              className={`tiny-object pond ${activeObject === "pond" ? "object-pop" : ""}`}
              onClick={() => setActiveObject("pond")}
            >
              <span>🦆</span>
              <small>Quack!</small>
            </button>
            <button
              className={`tiny-object mailbox ${activeObject === "mail" ? "object-pop" : ""}`}
              onClick={() => setActiveObject("mail")}
            >
              <span>📬</span>
              <small>A hello from Nani!</small>
            </button>
          </div>
          <div className="gentle-note">
            <span>💛</span>
            <p>
              <b>Your world waits for you.</b>No timers, no losing, and no need
              to hurry.
            </p>
          </div>
        </section>
      )}

      {screen === "room" && (
        <section
          className="activity-screen room-screen"
          aria-labelledby="room-title"
        >
          <div className="activity-heading">
            <div>
              <p className="kicker">MY COZY SPACE</p>
              <h1 id="room-title">Decorate your room</h1>
              <p>
                Drag something into the room, or choose it and tap a glowing
                space.
              </p>
            </div>
            <div className="activity-actions">
              <button onClick={undoRoom} disabled={!roomHistory.length}>
                ↶ Undo
              </button>
              <button onClick={redoRoom} disabled={!roomFuture.length}>
                ↷ Redo
              </button>
              <button onClick={() => rememberRoom({})} disabled={!roomCount}>
                Reset room
              </button>
            </div>
          </div>
          <div className="room-workspace">
            <aside className="furniture-tray">
              <div>
                <h2>Toy box</h2>
                <span>{furniture.length} things</span>
              </div>
              <p>Choose one to place</p>
              <div className="furniture-grid">
                {furniture.map((item) => (
                  <button
                    key={item.id}
                    draggable
                    onDragStart={(event) =>
                      event.dataTransfer.setData("text/plain", item.id)
                    }
                    onClick={() => setSelectedFurniture(item.id)}
                    className={`${item.color} ${selectedFurniture === item.id ? "selected" : ""}`}
                    aria-pressed={selectedFurniture === item.id}
                    title={item.name}
                  >
                    <span>{item.emoji}</span>
                    <small>{item.name}</small>
                  </button>
                ))}
              </div>
            </aside>
            <div className="bedroom">
              <div className="room-window">
                <span>☁️</span>
                <i />
              </div>
              <div className="room-message" role="status">
                {roomMessage}
              </div>
              {roomSlots.map((slot) => {
                const placed = furniture.find(
                  (item) => item.id === world.room[slot],
                );
                return (
                  <button
                    key={slot}
                    className={`room-slot ${slot} ${placed ? "filled" : ""}`}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => dropFurniture(event, slot)}
                    onClick={() => placeFurniture(slot)}
                    aria-label={
                      placed
                        ? `${placed.name}, move selected item here`
                        : `Place selected item in ${slot.replaceAll("-", " ")}`
                    }
                  >
                    {placed ? (
                      <>
                        <span>{placed.emoji}</span>
                        <small>{placed.name}</small>
                      </>
                    ) : (
                      <span>＋</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {screen === "garden" && (
        <section
          className="activity-screen garden-screen"
          aria-labelledby="garden-title"
        >
          <div className="activity-heading">
            <div>
              <p className="kicker">SUNNY GARDEN</p>
              <h1 id="garden-title">Grow something wonderful</h1>
              <p>Plant, water, watch it grow, then gather two golden stars.</p>
            </div>
            <div className="seed-picker" aria-label="Choose a seed">
              {(Object.keys(plantInfo) as PlantKind[]).map((kind) => (
                <button
                  key={kind}
                  className={seed === kind ? "selected" : ""}
                  onClick={() => setSeed(kind)}
                  aria-pressed={seed === kind}
                >
                  {plantInfo[kind].emoji[3]} {plantInfo[kind].name}
                </button>
              ))}
            </div>
          </div>
          <div className="garden-scene">
            <div className="garden-sun">☀️</div>
            <i className="garden-cloud cloud" />
            <div className="garden-birds">⌁　⌁</div>
            <div className="garden-plots">
              {world.garden.map((plantItem, index) => (
                <article
                  className={`garden-plot ${plantItem?.watered ? "sparkle" : ""}`}
                  key={index}
                >
                  <div className="plant-visual">
                    {plantItem
                      ? plantInfo[plantItem.kind].emoji[plantItem.stage]
                      : "·"}
                  </div>
                  {!plantItem ? (
                    <button onClick={() => plant(index)}>
                      Plant {plantInfo[seed].name}
                    </button>
                  ) : plantItem.stage < 3 ? (
                    <button onClick={() => waterPlant(index)}>
                      💧 Water · stage {plantItem.stage + 1}/3
                    </button>
                  ) : (
                    <button className="harvest" onClick={() => harvest(index)}>
                      ✨ Gather +2 stars
                    </button>
                  )}
                  <small>
                    {plantItem
                      ? `${plantInfo[plantItem.kind].name} · ${plantItem.stage === 3 ? "Blooming!" : plantItem.watered ? "Happy and growing" : "Ready for water"}`
                      : "An empty patch of soft soil"}
                  </small>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {screen === "pet" && (
        <section
          className="activity-screen pet-screen"
          aria-labelledby="pet-title"
        >
          {!world.pet ? (
            <div className="adoption-card">
              <p className="kicker">A NEW BEST FRIEND</p>
              <h1 id="pet-title">Who would you like to care for?</h1>
              <p>Every friend is gentle, playful, and happy to meet you.</p>
              <div className="pet-choices">
                {(Object.keys(petInfo) as PetKind[]).map((kind) => (
                  <button
                    key={kind}
                    onClick={() =>
                      setWorld((current) => ({
                        ...current,
                        pet: {
                          kind,
                          name: petInfo[kind].label,
                          hunger: 70,
                          happiness: 70,
                          energy: 70,
                          cleanliness: 70,
                        },
                      }))
                    }
                  >
                    <span>{petInfo[kind].emoji}</span>
                    <b>{petInfo[kind].label}</b>
                    <small>Adopt me</small>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className="activity-heading">
                <div>
                  <p className="kicker">PET COTTAGE</p>
                  <h1 id="pet-title">Care for {world.pet.name}</h1>
                  <p>
                    Small acts of care make your friend glow with happiness.
                  </p>
                </div>
              </div>
              <div className="pet-cottage">
                <div className="pet-room">
                  <div className="pet-window">☀️　☁️</div>
                  <div className="pet-bed">🧺</div>
                  <div className="pet-bowl">🥣</div>
                  <div className="pet-character" key={petReaction}>
                    <span>{petInfo[world.pet.kind].emoji}</span>
                    <i>♥</i>
                  </div>
                  <p role="status">{petReaction}</p>
                </div>
                <aside className="care-panel">
                  <h2>How is {world.pet.name} feeling?</h2>
                  {(
                    [
                      ["Full tummy", world.pet.hunger, "🥕"],
                      ["Happiness", world.pet.happiness, "💛"],
                      ["Energy", world.pet.energy, "⚡"],
                      ["Clean & fluffy", world.pet.cleanliness, "🫧"],
                    ] as Array<[string, number, string]>
                  ).map(([label, value, icon]) => (
                    <div className="pet-meter" key={label}>
                      <span>{icon}</span>
                      <div>
                        <b>{label}</b>
                        <i>
                          <em style={{ width: `${value}%` }} />
                        </i>
                      </div>
                      <strong>{value}</strong>
                    </div>
                  ))}
                  <div className="care-actions">
                    <button onClick={() => careForPet("feed")}>
                      🥕<b>Feed</b>
                    </button>
                    <button onClick={() => careForPet("play")}>
                      ⚽<b>Play</b>
                    </button>
                    <button onClick={() => careForPet("sleep")}>
                      🌙<b>Sleep</b>
                    </button>
                    <button onClick={() => careForPet("bathe")}>
                      🫧<b>Bathe</b>
                    </button>
                  </div>
                </aside>
              </div>
            </>
          )}
        </section>
      )}
    </main>
  );
}
