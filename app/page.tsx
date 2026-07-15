"use client";

import { useEffect, useState } from "react";

const places = [
  {
    id: "home",
    icon: "⌂",
    name: "Mila’s House",
    note: "Dress up & decorate",
    x: 23,
    y: 53,
    tone: "peach",
  },
  {
    id: "garden",
    icon: "✿",
    name: "Sunny Garden",
    note: "3 flowers ready",
    x: 50,
    y: 62,
    tone: "green",
  },
  {
    id: "stories",
    icon: "☾",
    name: "Story Nook",
    note: "A new tale awaits",
    x: 73,
    y: 44,
    tone: "purple",
  },
  {
    id: "studio",
    icon: "✎",
    name: "Cloudberry Studio",
    note: "Make something",
    x: 84,
    y: 68,
    tone: "blue",
  },
];

const seasons = {
  spring: { label: "Spring", icon: "🌷" },
  summer: { label: "Summer", icon: "☀️" },
  autumn: { label: "Autumn", icon: "🍂" },
  winter: { label: "Winter", icon: "❄️" },
};

export default function Home() {
  const [season, setSeason] = useState<keyof typeof seasons>("spring");
  const [weather, setWeather] = useState<"sunny" | "rainy" | "night">("sunny");
  const [selected, setSelected] = useState("home");
  const [petHappy, setPetHappy] = useState(false);
  const [watered, setWatered] = useState(false);
  const [surprise, setSurprise] = useState(false);
  const [story, setStory] = useState(false);
  const [parentPanel, setParentPanel] = useState(false);
  const [activity, setActivity] = useState<string | null>(null);
  const place = places.find((item) => item.id === selected) ?? places[0];

  useEffect(() => {
    const restore = window.setTimeout(() => {
      const saved = window.localStorage.getItem("little-wonder-world");
      if (!saved) return;
      const data = JSON.parse(saved) as {
        season?: keyof typeof seasons;
        watered?: boolean;
        petHappy?: boolean;
      };
      if (data.season) setSeason(data.season);
      setWatered(Boolean(data.watered));
      setPetHappy(Boolean(data.petHappy));
    }, 0);
    if ("serviceWorker" in navigator)
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    return () => window.clearTimeout(restore);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(
      "little-wonder-world",
      JSON.stringify({ season, watered, petHappy }),
    );
  }, [season, watered, petHappy]);

  function visit(id: string) {
    setSelected(id);
    if (id === "stories") setStory(true);
    else setActivity(id);
  }

  return (
    <main className={`world ${season} ${weather}`}>
      <header className="topbar">
        <a href="#village" className="brand">
          <span>✦</span>
          <span>
            <b>Little Wonder World</b>
            <small>made for gentle days</small>
          </span>
        </a>
        <nav aria-label="Main navigation">
          <button className="active">My Village</button>
          <button onClick={() => setStory(true)}>Storybook</button>
          <button onClick={() => setSelected("studio")}>Create</button>
        </nav>
        <div className="family">
          <div className="avatar mila">M</div>
          <div>
            <small>GOOD AFTERNOON</small>
            <b>Mila</b>
          </div>
          <button
            className="gift-button"
            onClick={() => setSurprise(true)}
            aria-label="Open today’s surprise"
          >
            🎁
          </button>
          <button
            onClick={() => setParentPanel(true)}
            aria-label="Open grown-up settings"
          >
            ⚙
          </button>
        </div>
      </header>

      <section className="welcome">
        <div>
          <span className="eyebrow">TUESDAY · A GENTLE SPRING DAY</span>
          <h1>
            Welcome home, Mila <em>♥</em>
          </h1>
          <p>
            Your little world has been waiting for you. What would you like to
            do today?
          </p>
        </div>
        <div className="calm-controls">
          <label>
            <span>WORLD WEATHER</span>
            <select
              value={weather}
              onChange={(e) => setWeather(e.target.value as typeof weather)}
            >
              <option value="sunny">Sunny afternoon</option>
              <option value="rainy">Gentle rain</option>
              <option value="night">Starry evening</option>
            </select>
          </label>
          <label>
            <span>SEASON</span>
            <select
              value={season}
              onChange={(e) =>
                setSeason(e.target.value as keyof typeof seasons)
              }
            >
              {Object.entries(seasons).map(([value, item]) => (
                <option key={value} value={value}>
                  {item.icon} {item.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="village-shell" id="village">
        <div className="village-guide">
          <span>🐶</span>
          <div>
            <small>PIP SAYS</small>
            <b>What should we explore?</b>
            <p>Tap a big picture below. There’s no wrong choice!</p>
          </div>
        </div>
        <div className="sky">
          <span className="sun" />
          <span className="cloud c1">☁</span>
          <span className="cloud c2">☁</span>
          {weather === "rainy" && (
            <div className="raindrops">· · · · · · · · · · · ·</div>
          )}
          {weather === "night" && (
            <div className="stars">✦ · ✧ · ✦ · ✧ · ✦</div>
          )}
        </div>
        <div className="hills far" />
        <div className="hills near" />
        <div className="river" />
        <div className="path" />
        <div className="tree t1">♣</div>
        <div className="tree t2">♣</div>
        <div className="tree t3">♣</div>
        <div className="tree t4">♣</div>
        <div className="house-scene">
          <div className="chimney" />
          <div className="roof" />
          <div className="house">
            <span className="window">✦</span>
            <span className="door">•</span>
          </div>
          <div className="fence">╫ ╫ ╫ ╫</div>
        </div>
        <div className="garden-scene">
          <span>{watered ? "🌷 🌻 🌸 🌼" : "🌱 🌷 🌱 🌼"}</span>
          <i>◡</i>
        </div>
        <div className="nook-scene">
          <div className="trunk">▥</div>
          <span>♣</span>
          <i>☾</i>
        </div>
        <div className="studio-scene">
          <div className="awning">▰</div>
          <div>✎</div>
          <span>
            Cloudberry
            <br />
            Studio
          </span>
        </div>
        <div className={`pet ${petHappy ? "happy" : ""}`}>
          <span>🐶</span>
          <i>{petHappy ? "♥" : ""}</i>
        </div>
        <div className="butterflies">⌁　⌁</div>

        {places.map((item) => (
          <button
            key={item.id}
            className={`place ${item.tone} ${selected === item.id ? "selected" : ""}`}
            style={{ left: `${item.x}%`, top: `${item.y}%` }}
            onClick={() => visit(item.id)}
          >
            <i>{item.icon}</i>
            <span>
              <b>{item.name}</b>
              <small>{item.note}</small>
            </span>
          </button>
        ))}

        <div className="adventure-dock" aria-label="Choose an activity">
          <span className="dock-title">What sounds fun?</span>
          <button className="home-choice" onClick={() => visit("home")}>
            <i>🏡</i>
            <b>My cozy home</b>
            <small>Dress up & decorate</small>
          </button>
          <button className="pet-choice" onClick={() => setActivity("pet")}>
            <i>🐶</i>
            <b>Play with Pip</b>
            <small>Cuddle, feed & care</small>
          </button>
          <button className="garden-choice" onClick={() => visit("garden")}>
            <i>🌻</i>
            <b>Grow my garden</b>
            <small>Water something lovely</small>
          </button>
          <button className="story-choice" onClick={() => setStory(true)}>
            <i>📚</i>
            <b>Read a story</b>
            <small>A new tale is waiting</small>
          </button>
          <button className="art-choice" onClick={() => visit("studio")}>
            <i>🎨</i>
            <b>Make some art</b>
            <small>Colors, shapes & imagination</small>
          </button>
        </div>

        <aside className="today-card">
          <header>
            <span>IN YOUR WORLD TODAY</span>
            <i>no rush, ever</i>
          </header>
          <button
            onClick={() => {
              setPetHappy(true);
              setSelected("home");
            }}
          >
            <span className="activity-icon peach">🐶</span>
            <span>
              <b>{petHappy ? "Pip feels loved" : "Pip would love a cuddle"}</b>
              <small>
                {petHappy
                  ? "You made his tail wag"
                  : "He’s resting by the garden gate"}
              </small>
            </span>
            <em>{petHappy ? "♥" : "→"}</em>
          </button>
          <button
            onClick={() => {
              setWatered(true);
              setSelected("garden");
            }}
          >
            <span className="activity-icon green">🌱</span>
            <span>
              <b>
                {watered
                  ? "The garden is sparkling"
                  : "The daisies look thirsty"}
              </b>
              <small>
                {watered
                  ? "Tiny new petals are opening"
                  : "Water them whenever you like"}
              </small>
            </span>
            <em>{watered ? "✓" : "→"}</em>
          </button>
          <button onClick={() => setStory(true)}>
            <span className="activity-icon purple">📖</span>
            <span>
              <b>Tonight’s bedtime story</b>
              <small>The Moon Who Lost Her Glow</small>
            </span>
            <em>→</em>
          </button>
        </aside>

        <div className="now-playing">
          <span className={`place-icon ${place.tone}`}>{place.icon}</span>
          <div>
            <small>YOU’RE VISITING</small>
            <b>{place.name}</b>
          </div>
          <button onClick={() => visit(place.id)}>
            Open <span>→</span>
          </button>
        </div>
      </section>

      <section className="family-strip">
        <div>
          <span className="eyebrow">TOGETHER IN YOUR WORLD</span>
          <h2>Someone special is nearby</h2>
          <p>Family can visit the village without interrupting Mila’s play.</p>
        </div>
        <div className="visitors">
          <div className="visitor">
            <span className="avatar dad">D</span>
            <span>
              <b>Dad</b>
              <small>At the Story Nook</small>
            </span>
            <button onClick={() => setStory(true)}>Join</button>
          </div>
          <div className="visitor">
            <span className="avatar nani">N</span>
            <span>
              <b>Nani</b>
              <small>Left you a flower</small>
            </span>
            <button onClick={() => setWatered(true)}>See</button>
          </div>
          <button className="invite">＋ Invite family</button>
        </div>
      </section>

      <footer>
        <div className="promise">
          <span>♥</span>
          <p>
            <b>A world that moves at your child’s pace.</b>
            <small>No ads · No timers · No streaks · No pressure to win</small>
          </p>
        </div>
        <span>Private by design　·　Works offline　·　Made with care</span>
      </footer>

      {surprise && (
        <div
          className="modal-layer"
          role="dialog"
          aria-modal="true"
          aria-labelledby="surprise-title"
        >
          <section className="surprise-card">
            <button
              className="close"
              onClick={() => setSurprise(false)}
              aria-label="Close surprise"
            >
              ×
            </button>
            <div className="gift-glow">
              <span>🎁</span>
            </div>
            <small>A LITTLE SURPRISE FROM PIP</small>
            <h2 id="surprise-title">A pocketful of sunshine</h2>
            <p>
              Pip found a tiny golden button near the garden. He thought it
              belonged in your keepsake box.
            </p>
            <div className="keepsake">
              ☀️{" "}
              <span>
                <b>Golden sunshine button</b>
                <small>A small thing to remember a happy day</small>
              </span>
            </div>
            <button className="primary" onClick={() => setSurprise(false)}>
              Keep it safe <span>♥</span>
            </button>
          </section>
        </div>
      )}

      {story && (
        <div
          className="modal-layer story-layer"
          role="dialog"
          aria-modal="true"
          aria-labelledby="story-title"
        >
          <section className="story-card">
            <button
              className="close"
              onClick={() => setStory(false)}
              aria-label="Close story"
            >
              ×
            </button>
            <span className="moon-art">
              ☾<i>✦</i>
            </span>
            <small>TONIGHT’S STORY · 6 MIN READ</small>
            <h2 id="story-title">The Moon Who Lost Her Glow</h2>
            <p>
              One quiet evening, the moon looked into the silver lake and
              noticed something strange. Her light was gone—but the little
              village below knew exactly where to look…
            </p>
            <button className="primary" onClick={() => setStory(false)}>
              Read together <span>→</span>
            </button>
          </section>
        </div>
      )}

      {activity && (
        <div
          className="modal-layer activity-layer"
          role="dialog"
          aria-modal="true"
          aria-labelledby="activity-title"
        >
          <section className={`activity-card ${activity}`}>
            <button
              className="close"
              onClick={() => setActivity(null)}
              aria-label="Close activity"
            >
              ×
            </button>
            <div className="activity-hero">
              {activity === "home"
                ? "🏡"
                : activity === "garden"
                  ? "🌻"
                  : activity === "studio"
                    ? "🎨"
                    : "🐶"}
            </div>
            <small>YOUR LITTLE MOMENT</small>
            <h2 id="activity-title">
              {activity === "home"
                ? "Make your home feel cozy"
                : activity === "garden"
                  ? "Help something grow"
                  : activity === "studio"
                    ? "What will you imagine?"
                    : "Pip is happy to see you!"}
            </h2>
            <p>
              {activity === "home"
                ? "Choose one sweet thing for Mila’s room. You can change it whenever you like."
                : activity === "garden"
                  ? "The flowers don’t mind waiting. Give them a little water when you’re ready."
                  : activity === "studio"
                    ? "There are no mistakes here—only new ideas waiting to happen."
                    : "Pip has nowhere else to be. Stay, play, or give him a gentle cuddle."}
            </p>
            <div className="activity-actions">
              {activity === "home" && (
                <>
                  <button onClick={() => setActivity(null)}>
                    <i>🧸</i>
                    <b>Teddy corner</b>
                  </button>
                  <button onClick={() => setActivity(null)}>
                    <i>⭐</i>
                    <b>Star lights</b>
                  </button>
                  <button onClick={() => setActivity(null)}>
                    <i>🪴</i>
                    <b>Tiny plant</b>
                  </button>
                </>
              )}
              {activity === "garden" && (
                <>
                  <button
                    onClick={() => {
                      setWatered(true);
                      setActivity(null);
                    }}
                  >
                    <i>💧</i>
                    <b>Water gently</b>
                  </button>
                  <button onClick={() => setActivity(null)}>
                    <i>🌱</i>
                    <b>Plant a seed</b>
                  </button>
                  <button onClick={() => setActivity(null)}>
                    <i>🦋</i>
                    <b>Watch butterflies</b>
                  </button>
                </>
              )}
              {activity === "studio" && (
                <>
                  <button onClick={() => setActivity(null)}>
                    <i>🖌️</i>
                    <b>Finger paint</b>
                  </button>
                  <button onClick={() => setActivity(null)}>
                    <i>✂️</i>
                    <b>Paper shapes</b>
                  </button>
                  <button onClick={() => setActivity(null)}>
                    <i>🌈</i>
                    <b>Mix colors</b>
                  </button>
                </>
              )}
              {activity === "pet" && (
                <>
                  <button
                    onClick={() => {
                      setPetHappy(true);
                      setActivity(null);
                    }}
                  >
                    <i>🤗</i>
                    <b>Gentle cuddle</b>
                  </button>
                  <button
                    onClick={() => {
                      setPetHappy(true);
                      setActivity(null);
                    }}
                  >
                    <i>🥕</i>
                    <b>Give a snack</b>
                  </button>
                  <button
                    onClick={() => {
                      setPetHappy(true);
                      setActivity(null);
                    }}
                  >
                    <i>⚽</i>
                    <b>Roll the ball</b>
                  </button>
                </>
              )}
            </div>
            <button className="maybe-later" onClick={() => setActivity(null)}>
              Maybe later—that’s okay
            </button>
          </section>
        </div>
      )}

      {parentPanel && (
        <div
          className="modal-layer"
          role="dialog"
          aria-modal="true"
          aria-labelledby="parent-title"
        >
          <section className="parent-card">
            <button
              className="close"
              onClick={() => setParentPanel(false)}
              aria-label="Close grown-up settings"
            >
              ×
            </button>
            <span className="eyebrow">GROWN-UP SPACE</span>
            <h2 id="parent-title">Mila’s world, thoughtfully protected</h2>
            <p>
              Family controls stay separate from play. Progress is private and
              stored on this device in the showcase.
            </p>
            <label>
              <span>Reduce animation</span>
              <input type="checkbox" />
            </label>
            <label>
              <span>Read text aloud</span>
              <input type="checkbox" />
            </label>
            <label>
              <span>High contrast</span>
              <input type="checkbox" />
            </label>
            <button className="primary" onClick={() => setParentPanel(false)}>
              Save preferences
            </button>
          </section>
        </div>
      )}
    </main>
  );
}
