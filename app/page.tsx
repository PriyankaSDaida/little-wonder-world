"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type {
  CSSProperties,
  ChangeEvent,
  DragEvent,
  PointerEvent as ReactPointerEvent,
} from "react";

type Screen =
  | "village"
  | "room"
  | "garden"
  | "pet"
  | "story"
  | "draw"
  | "music"
  | "space"
  | "ocean"
  | "kindness"
  | "rewards"
  | "parent";
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
  stories: Array<{ id: string; title: string; text: string; choices: string }>;
  drawings: string[];
  drawingDraft: string;
  songs: Array<{ id: string; notes: string[] }>;
  planets: string[];
  seaCreatures: string[];
  kindnessHistory: string[];
  rewards: string[];
  soundEnabled: boolean;
  language: "English" | "Spanish" | "French";
  dyslexiaFont: boolean;
  highContrast: boolean;
  screenTimeMinutes: number;
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
  stories: [],
  drawings: [],
  drawingDraft: "",
  songs: [],
  planets: [],
  seaCreatures: [],
  kindnessHistory: [],
  rewards: [],
  soundEnabled: true,
  language: "English",
  dyslexiaFont: false,
  highContrast: false,
  screenTimeMinutes: 30,
};

const storyOptions = {
  heroes: ["Mila the Brave", "Pip the Puppy", "Nova the Fox"],
  settings: ["Moonlit Forest", "Cloud Castle", "Rainbow Reef"],
  companions: ["a tiny dragon", "a singing owl", "a friendly whale"],
  adventures: [
    "find a lost star",
    "help the flowers sing",
    "return the moonbeam",
  ],
};

const planets = [
  ["Mercury", "☿", "The smallest planet and the closest to the Sun."],
  ["Venus", "♀", "The hottest planet, wrapped in thick clouds."],
  ["Mars", "♂", "A rusty-red world with the tallest volcano we know."],
  ["Jupiter", "♃", "The biggest planet, with a storm larger than Earth."],
] as const;

const seaCreatures = [
  ["Clownfish", "🐠", "Clownfish live safely among sea anemones."],
  ["Dolphin", "🐬", "Dolphins communicate with clicks and whistles."],
  ["Octopus", "🐙", "An octopus has three hearts and excellent memory."],
  ["Turtle", "🐢", "Sea turtles can travel thousands of miles."],
  ["Whale", "🐋", "Blue whales are the largest animals on Earth."],
] as const;

const kindnessMissions = [
  "Say one kind thing to someone you love.",
  "Help put away three things without being asked.",
  "Draw a happy picture for someone.",
  "Thank someone who helped you today.",
  "Give a plant or pet a gentle moment of care.",
  "Invite someone to play with you.",
  "Tell yourself one thing you are proud of.",
];

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
  const [storyHero, setStoryHero] = useState(storyOptions.heroes[0]);
  const [storySetting, setStorySetting] = useState(storyOptions.settings[0]);
  const [storyCompanion, setStoryCompanion] = useState(
    storyOptions.companions[0],
  );
  const [storyAdventure, setStoryAdventure] = useState(
    storyOptions.adventures[0],
  );
  const [generatedStory, setGeneratedStory] = useState("");
  const [brushColor, setBrushColor] = useState("#ef8f78");
  const [brushSize, setBrushSize] = useState(8);
  const [drawingHistory, setDrawingHistory] = useState<string[]>([]);
  const [drawingFuture, setDrawingFuture] = useState<string[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedNotes, setRecordedNotes] = useState<string[]>([]);
  const [discovery, setDiscovery] = useState("");
  const [parentUnlocked, setParentUnlocked] = useState(false);
  const [pinDraft, setPinDraft] = useState("");
  const [parentMessage, setParentMessage] = useState(
    "Enter the grown-up PIN: 2468",
  );
  const [screenTimeReached, setScreenTimeReached] = useState(false);
  const [saveMessage, setSaveMessage] = useState("All progress saved");
  const [rareCreatureVisible, setRareCreatureVisible] = useState(true);
  const [oceanUnlockCount, setOceanUnlockCount] = useState(2);

  useEffect(() => {
    const restore = window.setTimeout(() => {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as Partial<WorldState>;
          const restored = { ...defaultWorld, ...parsed };
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
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(world));
      window.setTimeout(() => setSaveMessage("All progress saved"), 0);
    } catch {
      window.setTimeout(
        () => setSaveMessage("We couldn't save just now. Tap Save to retry."),
        0,
      );
    }
  }, [world, hydrated]);

  useEffect(() => {
    const autosave = window.setInterval(() => {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(world));
        setSaveMessage("Auto-saved just now");
      } catch {
        setSaveMessage("We couldn't save just now. Tap Save to retry.");
      }
    }, 30000);
    return () => window.clearInterval(autosave);
  }, [world]);

  useEffect(() => {
    if (screen !== "ocean") return;
    const unlock = window.setInterval(
      () => setOceanUnlockCount((count) => Math.min(4, count + 1)),
      12000,
    );
    const rare = window.setInterval(() => {
      const value = new Uint8Array(1);
      window.crypto.getRandomValues(value);
      setRareCreatureVisible(value[0] % 3 === 0);
    }, 6000);
    return () => {
      window.clearInterval(unlock);
      window.clearInterval(rare);
    };
  }, [screen]);

  useEffect(() => {
    const timer = window.setInterval(
      () => setIsNight((value) => !value),
      45000,
    );
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [screen]);

  useEffect(() => {
    if (!world.started) return;
    const reminder = window.setTimeout(
      () => setScreenTimeReached(true),
      world.screenTimeMinutes * 60 * 1000,
    );
    return () => window.clearTimeout(reminder);
  }, [world.screenTimeMinutes, world.started]);

  useEffect(() => {
    if (screen !== "draw" || !world.drawingDraft) return;
    const timer = window.setTimeout(() => {
      const canvas = canvasRef.current;
      const context = canvas?.getContext("2d");
      if (!canvas || !context) return;
      const image = new Image();
      image.onload = () => context.drawImage(image, 0, 0);
      image.src = world.drawingDraft;
    }, 0);
    return () => window.clearTimeout(timer);
  }, [screen, world.drawingDraft]);

  const childName = world.childName.trim() || "Explorer";
  const greeting =
    world.language === "Spanish"
      ? "HOLA"
      : world.language === "French"
        ? "BONJOUR"
        : "HELLO";
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

  function createStory() {
    const text = `${storyHero} stepped into the ${storySetting} with ${storyCompanion}. Together they promised to ${storyAdventure}. They listened carefully, helped everyone they met, and discovered that courage can be quiet and kindness can light the way home.`;
    setGeneratedStory(text);
  }

  function saveStory() {
    if (!generatedStory) return;
    const choices = `${storyHero} · ${storySetting} · ${storyCompanion} · ${storyAdventure}`;
    setWorld((current) => ({
      ...current,
      stories: [
        ...current.stories,
        {
          id: `${Date.now()}`,
          title: `${storyHero} and the ${storySetting}`,
          text: generatedStory,
          choices,
        },
      ],
      stars: current.stars + 1,
    }));
  }

  function narrate(text: string) {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const voice = new SpeechSynthesisUtterance(text);
    voice.rate = 0.82;
    window.speechSynthesis.speak(voice);
  }

  function download(name: string, blob: Blob) {
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = name;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(link.href), 500);
  }

  function exportStoryPdf() {
    if (!generatedStory) return;
    const lines = generatedStory.match(/.{1,76}(?:\s|$)/g) ?? [generatedStory];
    const escaped = lines
      .slice(0, 14)
      .map(
        (line) =>
          `(${line.trim().replaceAll(/([()\\])/g, "\\$1")}) Tj 0 -18 Td`,
      )
      .join("\n");
    const stream = `BT /F1 18 Tf 50 750 Td (Little Wonder World Story) Tj 0 -34 Td /F1 11 Tf ${escaped} ET`;
    const bodies = [
      "<</Type/Catalog/Pages 2 0 R>>",
      "<</Type/Pages/Kids[3 0 R]/Count 1>>",
      "<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Resources<</Font<</F1 4 0 R>>>>/Contents 5 0 R>>",
      "<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>",
      `<</Length ${stream.length}>> stream\n${stream}\nendstream`,
    ];
    let pdf = "%PDF-1.4\n";
    const offsets = [0];
    bodies.forEach((body, index) => {
      offsets.push(pdf.length);
      pdf += `${index + 1} 0 obj\n${body}\nendobj\n`;
    });
    const xref = pdf.length;
    pdf += `xref\n0 ${bodies.length + 1}\n0000000000 65535 f \n`;
    pdf += offsets
      .slice(1)
      .map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`)
      .join("");
    pdf += `trailer <</Size ${bodies.length + 1}/Root 1 0 R>>\nstartxref\n${xref}\n%%EOF`;
    download(
      "little-wonder-story.pdf",
      new Blob([pdf], { type: "application/pdf" }),
    );
  }

  function canvasPoint(event: ReactPointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * canvas.width,
      y: ((event.clientY - rect.top) / rect.height) * canvas.height,
    };
  }

  function beginDrawing(event: ReactPointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    setDrawingHistory((history) => [...history.slice(-19), canvas.toDataURL()]);
    setDrawingFuture([]);
    drawingRef.current = true;
    canvas.setPointerCapture(event.pointerId);
    const point = canvasPoint(event);
    context.beginPath();
    context.moveTo(point.x, point.y);
  }

  function continueDrawing(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current) return;
    const context = canvasRef.current?.getContext("2d");
    if (!context) return;
    const point = canvasPoint(event);
    context.strokeStyle = brushColor;
    context.lineWidth = brushSize;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.lineTo(point.x, point.y);
    context.stroke();
  }

  function restoreCanvas(dataUrl: string) {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    const image = new Image();
    image.onload = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0);
    };
    image.src = dataUrl;
  }

  function autosaveDrawing() {
    const data = canvasRef.current?.toDataURL("image/png");
    if (!data) return;
    setWorld((current) => ({ ...current, drawingDraft: data }));
  }

  function undoDrawing() {
    const previous = drawingHistory.at(-1);
    const canvas = canvasRef.current;
    if (!previous || !canvas) return;
    setDrawingFuture((future) => [canvas.toDataURL(), ...future]);
    restoreCanvas(previous);
    setDrawingHistory((history) => history.slice(0, -1));
  }

  function redoDrawing() {
    const next = drawingFuture[0];
    const canvas = canvasRef.current;
    if (!next || !canvas) return;
    setDrawingHistory((history) => [...history, canvas.toDataURL()]);
    restoreCanvas(next);
    setDrawingFuture((future) => future.slice(1));
  }

  function addSticker(sticker: string) {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    setDrawingHistory((history) => [...history.slice(-19), canvas.toDataURL()]);
    context.font = "64px sans-serif";
    context.fillText(
      sticker,
      100 + ((drawingHistory.length * 83) % 500),
      100 + ((drawingHistory.length * 47) % 300),
    );
    autosaveDrawing();
  }

  function saveDrawing() {
    const data = canvasRef.current?.toDataURL("image/png");
    if (!data) return;
    setWorld((current) => ({
      ...current,
      drawings: [...current.drawings, data],
      drawingDraft: data,
      stars: current.stars + 1,
    }));
  }

  function manualSave() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(world));
      setSaveMessage("Saved safely on this device");
    } catch {
      setSaveMessage(
        "Save still needs help. Free a little device storage and retry.",
      );
    }
  }

  function exportDrawing() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (blob) download("little-wonder-art.png", blob);
    }, "image/png");
  }

  function playNote(note: string, frequency: number) {
    if (world.soundEnabled) playSound(frequency);
    if (isRecording) setRecordedNotes((notes) => [...notes, note]);
  }

  function replaySong(notes: string[]) {
    const frequencies: Record<string, number> = {
      C: 262,
      D: 294,
      E: 330,
      F: 349,
      G: 392,
      A: 440,
      B: 494,
    };
    notes.forEach((note, index) =>
      window.setTimeout(() => playSound(frequencies[note] ?? 330), index * 240),
    );
  }

  const todayKey = new Date().toISOString().slice(0, 10);
  const todayMission = kindnessMissions[new Date().getDay()];

  function completeKindness() {
    if (world.kindnessHistory.includes(todayKey)) return;
    setWorld((current) => ({
      ...current,
      kindnessHistory: [...current.kindnessHistory, todayKey],
      stars: current.stars + 3,
    }));
  }

  function discoverPlanet(name: string) {
    if (world.planets.includes(name)) return;
    setWorld((current) => ({
      ...current,
      planets: [...current.planets, name],
      stars: current.stars + 1,
    }));
  }

  function discoverCreature(name: string) {
    if (world.seaCreatures.includes(name)) return;
    setWorld((current) => ({
      ...current,
      seaCreatures: [...current.seaCreatures, name],
      stars: current.stars + 1,
    }));
  }

  function backupWorld() {
    download(
      "little-wonder-backup.json",
      new Blob([JSON.stringify(world, null, 2)], { type: "application/json" }),
    );
  }

  function exportAllDrawings() {
    world.drawings.forEach((drawing, index) => {
      fetch(drawing)
        .then((response) => response.blob())
        .then((blob) => download(`drawing-${index + 1}.png`, blob));
    });
  }

  function restoreWorld(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    file.text().then((text) => {
      try {
        setWorld({ ...defaultWorld, ...(JSON.parse(text) as WorldState) });
        setParentMessage("Backup restored successfully.");
      } catch {
        setParentMessage("That backup could not be read.");
      }
    });
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
    <main
      className={`game ${isNight ? "night" : "day"}${world.highContrast ? " high-contrast" : ""}${world.dyslexiaFont ? " dyslexia-font" : ""}`}
    >
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
          <button
            className="save-button"
            onClick={manualSave}
            title={saveMessage}
          >
            💾 <span>Save</span>
          </button>
          <span className="star-count">⭐ {world.stars}</span>
          <span className="player-avatar">{avatarEmoji}</span>
          <span>
            <small>{greeting}</small>
            <b>{childName}</b>
          </span>
          <button
            className="parent-button"
            onClick={() => setScreen("parent")}
            aria-label="Open grown-up dashboard"
          >
            ⚙
          </button>
        </div>
      </header>

      {screenTimeReached && (
        <div
          className="screen-time-reminder"
          role="dialog"
          aria-label="Gentle screen-time reminder"
        >
          <span>🌙</span>
          <p>
            <b>Time for a little rest?</b>Your world will wait right here.
          </p>
          <button onClick={() => setScreenTimeReached(false)}>
            Keep playing gently
          </button>
        </div>
      )}

      {screen === "village" && (
        <section className="village-screen" aria-labelledby="village-title">
          <div className="village-hero">
            <div className="village-copy">
              <p className="kicker">YOUR MAGICAL HOME</p>
              <h1 id="village-title">Where should we explore?</h1>
              <p>Everything here is yours to touch, grow, and make special.</p>
            </div>
            <div
              className="progress-pill"
              aria-label={`${overallProgress} of 3 adventures started`}
            >
              <span>{overallProgress}/3</span>
              <small>world places discovered</small>
            </div>
          </div>
          <div className="village-layout">
            <div
              className="village-world"
              aria-label="Interactive home village"
            >
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
                <b>
                  {world.pet ? `${world.pet.name}’s Cottage` : "Pet Cottage"}
                </b>
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
            <aside
              className="village-side-panel"
              aria-label="Creative adventures"
            >
              <div className="side-panel-heading">
                <p className="kicker">MORE TO DISCOVER</p>
                <h2>Choose an adventure</h2>
                <p>Make, imagine, explore, or do something kind.</p>
              </div>
              <div className="adventure-dock" aria-label="More adventures">
                {(
                  [
                    ["story", "📚", "Story Builder"],
                    ["draw", "🎨", "Drawing Studio"],
                    ["music", "🎵", "Music Garden"],
                    ["space", "🚀", "Space"],
                    ["ocean", "🐠", "Ocean"],
                    ["kindness", "💛", "Kindness"],
                    ["rewards", "🎁", "Rewards"],
                  ] as Array<[Screen, string, string]>
                ).map(([id, icon, label]) => (
                  <button key={id} onClick={() => setScreen(id)}>
                    <span>{icon}</span>
                    <b>{label}</b>
                    <small>Open →</small>
                  </button>
                ))}
              </div>
              <div className="gentle-note">
                <span>💛</span>
                <p>
                  <b>Your world waits for you.</b>No timers, no losing, and no
                  need to hurry.
                </p>
              </div>
            </aside>
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

      {screen === "story" && (
        <section
          className="activity-screen creative-screen"
          aria-labelledby="story-builder-title"
        >
          <div className="activity-heading">
            <div>
              <p className="kicker">STORY BUILDER</p>
              <h1 id="story-builder-title">Make a magical story</h1>
              <p>
                Choose the pieces. Your imagination will weave them together.
              </p>
            </div>
          </div>
          <div className="story-builder-grid">
            <div className="story-controls">
              {(
                [
                  [
                    "Choose a hero",
                    storyOptions.heroes,
                    storyHero,
                    setStoryHero,
                  ],
                  [
                    "Choose a setting",
                    storyOptions.settings,
                    storySetting,
                    setStorySetting,
                  ],
                  [
                    "Choose a companion",
                    storyOptions.companions,
                    storyCompanion,
                    setStoryCompanion,
                  ],
                  [
                    "Choose an adventure",
                    storyOptions.adventures,
                    storyAdventure,
                    setStoryAdventure,
                  ],
                ] as Array<[string, string[], string, (value: string) => void]>
              ).map(([title, choices, value, setter]) => (
                <fieldset key={title}>
                  <legend>{title}</legend>
                  <div>
                    {choices.map((choice) => (
                      <button
                        key={choice}
                        className={value === choice ? "selected" : ""}
                        onClick={() => setter(choice)}
                        aria-pressed={value === choice}
                      >
                        {choice}
                      </button>
                    ))}
                  </div>
                </fieldset>
              ))}
              <button className="magic-button" onClick={createStory}>
                ✨ Create my story
              </button>
            </div>
            <article className="story-book">
              <div className="story-illustration">
                <span>
                  {storySetting === "Rainbow Reef"
                    ? "🐋"
                    : storySetting === "Cloud Castle"
                      ? "🏰"
                      : "🌲"}
                </span>
                <i>
                  {storyHero.includes("Pip")
                    ? "🐶"
                    : storyHero.includes("Nova")
                      ? "🦊"
                      : avatarEmoji}
                </i>
              </div>
              <p className="kicker">YOUR STORY</p>
              <h2>
                {generatedStory
                  ? `${storyHero} and the ${storySetting}`
                  : "Your story is waiting…"}
              </h2>
              <p>
                {generatedStory ||
                  "Make four choices, then tap the magic button."}
              </p>
              {generatedStory && (
                <div className="story-actions">
                  <button onClick={() => narrate(generatedStory)}>
                    🔊 Narrate
                  </button>
                  <button onClick={saveStory}>♥ Save story</button>
                  <button onClick={exportStoryPdf}>PDF Export</button>
                </div>
              )}
            </article>
          </div>
          <section className="saved-gallery">
            <h2>
              My story shelf <span>{world.stories.length}</span>
            </h2>
            {world.stories.length ? (
              <div>
                {world.stories.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setGeneratedStory(item.text)}
                  >
                    <span>📖</span>
                    <b>{item.title}</b>
                    <small>{item.choices}</small>
                  </button>
                ))}
              </div>
            ) : (
              <p>Saved stories will appear here.</p>
            )}
          </section>
        </section>
      )}

      {screen === "draw" && (
        <section
          className="activity-screen creative-screen"
          aria-labelledby="drawing-title"
        >
          <div className="activity-heading">
            <div>
              <p className="kicker">DRAWING STUDIO</p>
              <h1 id="drawing-title">Make your mark</h1>
              <p>
                Draw with a mouse, finger, stylus, or keyboard-friendly sticker
                tools.
              </p>
            </div>
            <div className="activity-actions">
              <button onClick={undoDrawing} disabled={!drawingHistory.length}>
                ↶ Undo
              </button>
              <button onClick={redoDrawing} disabled={!drawingFuture.length}>
                ↷ Redo
              </button>
              <button
                onClick={() => {
                  canvasRef.current
                    ?.getContext("2d")
                    ?.clearRect(0, 0, 900, 520);
                  setWorld((current) => ({ ...current, drawingDraft: "" }));
                }}
              >
                Clear
              </button>
            </div>
          </div>
          <div className="drawing-workspace">
            <aside className="art-tools">
              <h2>Art tools</h2>
              <p>Brush color</p>
              <div className="color-tools">
                {[
                  "#ef8f78",
                  "#f7c961",
                  "#6faf78",
                  "#5ba6bd",
                  "#9b86c6",
                  "#26463f",
                ].map((color) => (
                  <button
                    key={color}
                    style={{ background: color }}
                    className={brushColor === color ? "selected" : ""}
                    onClick={() => setBrushColor(color)}
                    aria-label={`Choose ${color}`}
                  />
                ))}
              </div>
              <label>
                Brush size
                <input
                  type="range"
                  min="3"
                  max="30"
                  value={brushSize}
                  onChange={(event) => setBrushSize(Number(event.target.value))}
                />
              </label>
              <p>Stickers</p>
              <div className="sticker-tools">
                {["⭐", "🌈", "🦋", "🌻", "🐾", "💛"].map((sticker) => (
                  <button key={sticker} onClick={() => addSticker(sticker)}>
                    {sticker}
                  </button>
                ))}
              </div>
              <button className="magic-button" onClick={saveDrawing}>
                Save artwork +1 ⭐
              </button>
              <button className="export-button" onClick={exportDrawing}>
                Export PNG
              </button>
            </aside>
            <div className="canvas-frame">
              <canvas
                ref={canvasRef}
                width={900}
                height={520}
                aria-label="Drawing canvas"
                onPointerDown={beginDrawing}
                onPointerMove={continueDrawing}
                onPointerUp={() => {
                  drawingRef.current = false;
                  autosaveDrawing();
                }}
                onPointerCancel={() => {
                  drawingRef.current = false;
                  autosaveDrawing();
                }}
              />
            </div>
          </div>
          <section className="saved-gallery">
            <h2>
              My art wall <span>{world.drawings.length}</span>
            </h2>
            {world.drawings.length ? (
              <div>
                {world.drawings.map((drawing, index) => (
                  <button
                    key={`${drawing.slice(-12)}-${index}`}
                    onClick={() => restoreCanvas(drawing)}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={drawing} alt={`Saved artwork ${index + 1}`} />
                  </button>
                ))}
              </div>
            ) : (
              <p>Saved drawings will appear here.</p>
            )}
          </section>
        </section>
      )}

      {screen === "music" && (
        <section
          className="activity-screen music-screen"
          aria-labelledby="music-title"
        >
          <div className="activity-heading">
            <div>
              <p className="kicker">MUSIC GARDEN</p>
              <h1 id="music-title">Make the garden sing</h1>
              <p>
                Every flower has a note. Play together, record, and listen
                again.
              </p>
            </div>
            <div className="record-controls">
              <button
                className={isRecording ? "recording" : ""}
                onClick={() => {
                  setIsRecording((value) => !value);
                  if (!isRecording) setRecordedNotes([]);
                }}
              >
                {isRecording ? "■ Stop recording" : "● Record song"}
              </button>
              <button
                onClick={() => replaySong(recordedNotes)}
                disabled={!recordedNotes.length}
              >
                ▶ Replay
              </button>
              <button
                onClick={() =>
                  setWorld((current) => ({
                    ...current,
                    songs: [
                      ...current.songs,
                      { id: `${Date.now()}`, notes: recordedNotes },
                    ],
                  }))
                }
                disabled={!recordedNotes.length}
              >
                Save song
              </button>
            </div>
          </div>
          <div className="music-garden">
            {(
              [
                ["C", 262, "🌷"],
                ["D", 294, "🌻"],
                ["E", 330, "🌸"],
                ["F", 349, "🌼"],
                ["G", 392, "🪻"],
                ["A", 440, "🌺"],
                ["B", 494, "🌹"],
              ] as Array<[string, number, string]>
            ).map(([note, frequency, flower]) => (
              <button key={note} onClick={() => playNote(note, frequency)}>
                <span>{flower}</span>
                <b>{note}</b>
              </button>
            ))}
          </div>
          <div className="music-track" aria-live="polite">
            <b>{isRecording ? "Recording…" : "Your notes"}</b>
            <span>
              {recordedNotes.length
                ? recordedNotes.join(" · ")
                : "Tap a flower to begin"}
            </span>
          </div>
          <section className="saved-gallery">
            <h2>
              My songs <span>{world.songs.length}</span>
            </h2>
            <div>
              {world.songs.map((song, index) => (
                <button key={song.id} onClick={() => replaySong(song.notes)}>
                  <span>🎶</span>
                  <b>Garden Song {index + 1}</b>
                  <small>{song.notes.join(" ")}</small>
                </button>
              ))}
            </div>
          </section>
        </section>
      )}

      {screen === "space" && (
        <section
          className="activity-screen adventure-screen space-screen"
          aria-labelledby="space-title"
        >
          <div className="activity-heading">
            <div>
              <p className="kicker">SPACE ADVENTURE</p>
              <h1 id="space-title">Rocket through the stars</h1>
              <p>
                Visit each planet, collect a star, and discover something
                amazing.
              </p>
            </div>
            <strong>
              {world.planets.length}/{planets.length} planets visited
            </strong>
          </div>
          <div className="space-map">
            <div className="rocket">🚀</div>
            {planets.map(([name, icon, fact], index) => (
              <button
                key={name}
                className={world.planets.includes(name) ? "discovered" : ""}
                onClick={() => {
                  discoverPlanet(name);
                  setDiscovery(`${name}: ${fact}`);
                }}
                style={{ "--orbit": index } as CSSProperties}
              >
                <span>{icon}</span>
                <b>{name}</b>
                <small>
                  {world.planets.includes(name)
                    ? "⭐ Discovered"
                    : "Visit planet"}
                </small>
              </button>
            ))}
            <div className="space-stars">✦　·　✧　·　✦　·　✧　·　✦</div>
          </div>
          {discovery && (
            <div className="discovery-card" role="status">
              🔭 <b>{discovery}</b>
            </div>
          )}
        </section>
      )}

      {screen === "ocean" && (
        <section
          className="activity-screen adventure-screen ocean-screen"
          aria-labelledby="ocean-title"
        >
          <div className="activity-heading">
            <div>
              <p className="kicker">OCEAN EXPLORER</p>
              <h1 id="ocean-title">Dive into a living reef</h1>
              <p>
                Meet sea creatures and welcome each discovery to your aquarium.
              </p>
            </div>
            <strong>
              {world.seaCreatures.length}/{seaCreatures.length} creatures found
            </strong>
          </div>
          <div className="ocean-map">
            <div className="bubbles">○　°　○　°　○</div>
            {seaCreatures.map(([name, emoji, fact], index) => {
              const unlocked =
                index < oceanUnlockCount || world.seaCreatures.includes(name);
              const visible =
                name !== "Whale" ||
                rareCreatureVisible ||
                world.seaCreatures.includes(name);
              if (!visible) return null;
              return (
                <button
                  key={name}
                  className={
                    world.seaCreatures.includes(name) ? "discovered" : ""
                  }
                  onClick={() => {
                    discoverCreature(name);
                    setDiscovery(`${name}: ${fact}`);
                  }}
                  disabled={!unlocked}
                  style={{ "--swim": index } as CSSProperties}
                >
                  <span>{emoji}</span>
                  <b>{name}</b>
                  <small>
                    {world.seaCreatures.includes(name)
                      ? "In your aquarium"
                      : unlocked
                        ? "Discover"
                        : "Swimming closer…"}
                  </small>
                </button>
              );
            })}
            {!rareCreatureVisible && !world.seaCreatures.includes("Whale") && (
              <p className="rare-hint">✨ A rare friend may swim by soon…</p>
            )}
          </div>
          {discovery && (
            <div className="discovery-card" role="status">
              🌊 <b>{discovery}</b>
            </div>
          )}
          <div className="aquarium">
            <h2>My aquarium</h2>
            {world.seaCreatures.length ? (
              world.seaCreatures.map((name) => (
                <span key={name}>
                  {seaCreatures.find(([creature]) => creature === name)?.[1]}
                </span>
              ))
            ) : (
              <p>Your discoveries will swim here.</p>
            )}
          </div>
        </section>
      )}

      {screen === "kindness" && (
        <section
          className="activity-screen kindness-screen"
          aria-labelledby="kindness-title"
        >
          <div className="kindness-card">
            <span>💛</span>
            <p className="kicker">TODAY’S KINDNESS</p>
            <h1 id="kindness-title">A little mission with a big heart</h1>
            <blockquote>{todayMission}</blockquote>
            {world.kindnessHistory.includes(todayKey) ? (
              <div className="mission-done">
                ✨ You brought kindness into the world today.
              </div>
            ) : (
              <button className="magic-button" onClick={completeKindness}>
                I did it! Collect 3 ⭐
              </button>
            )}
            <small>One new mission each day · No streaks · No pressure</small>
          </div>
          <div className="kindness-history">
            <h2>Kindness garden</h2>
            <p>{world.kindnessHistory.length} caring moments remembered</p>
            <div>
              {world.kindnessHistory.map((day) => (
                <span key={day}>
                  🌼<small>{day}</small>
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {screen === "rewards" && (
        <section
          className="activity-screen rewards-screen"
          aria-labelledby="rewards-title"
        >
          <div className="activity-heading">
            <div>
              <p className="kicker">MY TREASURE SHELF</p>
              <h1 id="rewards-title">Every little achievement shines</h1>
              <p>Rewards never expire, and there is no negative score.</p>
            </div>
            <strong>⭐ {world.stars} stars</strong>
          </div>
          <div className="reward-grid">
            {[
              ["First Room", "🎈", roomCount > 0, "Place one room decoration"],
              [
                "Garden Friend",
                "🌻",
                world.stars >= 2,
                "Harvest your first plant",
              ],
              ["Pet Helper", "🐾", Boolean(world.pet), "Adopt a pet"],
              ["Story Spark", "📖", world.stories.length > 0, "Save a story"],
              [
                "Young Artist",
                "🎨",
                world.drawings.length > 0,
                "Save a drawing",
              ],
              [
                "Space Scout",
                "🚀",
                world.planets.length === planets.length,
                "Visit every planet",
              ],
              [
                "Ocean Friend",
                "🐋",
                world.seaCreatures.length === seaCreatures.length,
                "Find every sea creature",
              ],
              [
                "Kind Heart",
                "💛",
                world.kindnessHistory.length > 0,
                "Complete a kindness mission",
              ],
            ].map(([name, icon, unlocked, requirement]) => {
              const claimed = world.rewards.includes(String(name));
              return (
                <article
                  key={String(name)}
                  className={`${unlocked ? "unlocked" : "locked"}${claimed ? " claimed" : ""}`}
                >
                  <span>{unlocked ? icon : "🔒"}</span>
                  <h2>{name}</h2>
                  <p>
                    {unlocked
                      ? claimed
                        ? "Safe on your shelf forever"
                        : "Ready to unwrap!"
                      : requirement}
                  </p>
                  {unlocked && !claimed && (
                    <button
                      onClick={() =>
                        setWorld((current) => ({
                          ...current,
                          rewards: [...current.rewards, String(name)],
                        }))
                      }
                    >
                      🎉 Unwrap reward
                    </button>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      )}

      {screen === "parent" && (
        <section
          className="activity-screen parent-screen"
          aria-labelledby="parent-title"
        >
          {!parentUnlocked ? (
            <div className="pin-card">
              <span>🔐</span>
              <p className="kicker">GROWN-UP SPACE</p>
              <h1 id="parent-title">Parent dashboard</h1>
              <p>Child settings stay protected behind a PIN.</p>
              <label>
                4-digit PIN
                <input
                  value={pinDraft}
                  onChange={(event) =>
                    setPinDraft(
                      event.target.value.replace(/\D/g, "").slice(0, 4),
                    )
                  }
                  inputMode="numeric"
                  type="password"
                />
              </label>
              <button
                onClick={() => {
                  if (pinDraft === "2468") {
                    setParentUnlocked(true);
                    setParentMessage("Dashboard unlocked.");
                  } else setParentMessage("That PIN did not match. Try 2468.");
                }}
              >
                Unlock dashboard
              </button>
              <small role="status">{parentMessage}</small>
            </div>
          ) : (
            <>
              <div className="activity-heading">
                <div>
                  <p className="kicker">GROWN-UP SPACE</p>
                  <h1 id="parent-title">Mila’s protected settings</h1>
                  <p>Manage comfort, exports, and the local family backup.</p>
                </div>
                <button
                  onClick={() => {
                    setParentUnlocked(false);
                    setPinDraft("");
                  }}
                >
                  Lock dashboard
                </button>
              </div>
              <div className="parent-grid">
                <section>
                  <h2>Comfort & accessibility</h2>
                  <label>
                    Sounds
                    <input
                      type="checkbox"
                      checked={world.soundEnabled}
                      onChange={(event) =>
                        setWorld((current) => ({
                          ...current,
                          soundEnabled: event.target.checked,
                        }))
                      }
                    />
                  </label>
                  <label>
                    High contrast
                    <input
                      type="checkbox"
                      checked={world.highContrast}
                      onChange={(event) =>
                        setWorld((current) => ({
                          ...current,
                          highContrast: event.target.checked,
                        }))
                      }
                    />
                  </label>
                  <label>
                    Dyslexia-friendly font
                    <input
                      type="checkbox"
                      checked={world.dyslexiaFont}
                      onChange={(event) =>
                        setWorld((current) => ({
                          ...current,
                          dyslexiaFont: event.target.checked,
                        }))
                      }
                    />
                  </label>
                  <label>
                    Language
                    <select
                      value={world.language}
                      onChange={(event) =>
                        setWorld((current) => ({
                          ...current,
                          language: event.target
                            .value as WorldState["language"],
                        }))
                      }
                    >
                      <option>English</option>
                      <option>Spanish</option>
                      <option>French</option>
                    </select>
                  </label>
                  <label>
                    Screen-time reminder: {world.screenTimeMinutes} minutes
                    <input
                      type="range"
                      min="10"
                      max="90"
                      step="5"
                      value={world.screenTimeMinutes}
                      onChange={(event) =>
                        setWorld((current) => ({
                          ...current,
                          screenTimeMinutes: Number(event.target.value),
                        }))
                      }
                    />
                  </label>
                </section>
                <section>
                  <h2>Family data</h2>
                  <button onClick={backupWorld}>Download full backup</button>
                  <label className="file-button">
                    Restore backup
                    <input
                      type="file"
                      accept="application/json"
                      onChange={restoreWorld}
                    />
                  </label>
                  <button
                    onClick={() =>
                      setWorld((current) => ({
                        ...current,
                        kindnessHistory: [],
                      }))
                    }
                  >
                    Reset kindness missions
                  </button>
                  <button
                    onClick={exportAllDrawings}
                    disabled={!world.drawings.length}
                  >
                    Export all drawings
                  </button>
                  <button
                    onClick={() =>
                      download(
                        "stories.txt",
                        new Blob(
                          [
                            world.stories
                              .map((story) => `${story.title}\n${story.text}`)
                              .join("\n\n"),
                          ],
                          { type: "text/plain" },
                        ),
                      )
                    }
                  >
                    Export all stories
                  </button>
                  <p role="status">{parentMessage}</p>
                </section>
                <section className="parent-summary">
                  <h2>World summary</h2>
                  <p>
                    <b>{world.stories.length}</b> stories
                  </p>
                  <p>
                    <b>{world.drawings.length}</b> drawings
                  </p>
                  <p>
                    <b>{world.songs.length}</b> songs
                  </p>
                  <p>
                    <b>{world.planets.length + world.seaCreatures.length}</b>{" "}
                    discoveries
                  </p>
                  <p>
                    <b>{world.kindnessHistory.length}</b> kindness missions
                  </p>
                </section>
              </div>
            </>
          )}
        </section>
      )}
    </main>
  );
}
