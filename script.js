(function () {
  "use strict";

  const COLORS = {
    P: "#F49AC2",
    p: "#E88FAE",
    Y: "#FFD75E",
    y: "#E8B93F",
    O: "#8B5E34",
    R: "#E0567A",
    r: "#C23F63",
    W: "#FFFFFF",
    C: "#FFC4DD",
    L: "#B18FD1",
    g: "#6BAF6B",
    G: "#4E8B4E",
    T: "#8FB88A",
    t: "#79A874",
    K: "#8B6F47",
    B: "#7FB07A",
    b: "#5F9159",
    D: "#FFFFFF",
    F: "#F5D8A8",
    S: "#F6D36B"
  };


  const PATTERNS = {

    seed: [
      "...",
      ".O.",
      ".g.",
      ".g."
    ],

    tulip: [
      ".PP.PP.",
      "PPPPPPP",
      ".PPPPP.",
      "..PPP..",
      "...g...",
      "...g...",
      "..gGg..",
      "...g..."
    ],

    sunflower: [
      ".YYYYY.",
      "YOYYYOY",
      "YOOOOOY",
      ".YOOOY.",
      "..OOO..",
      "...g...",
      "..gGg..",
      "...g..."
    ],

    rose: [
      ".RRRR..",
      "RRRRRR.",
      "RRRRRRR",
      ".RRRRR.",
      "..RRR..",
      "...g...",
      "..gGg..",
      "...g..."
    ],

    daisy: [
      ".W.W.W.",
      "WWWWWWW",
      ".WYYYW.",
      "WWWWWWW",
      ".W.W.W.",
      "...g...",
      "..gGg..",
      "...g..."
    ],

    blossom: [
      ".C.C.C.",
      "CCCCCCC",
      ".CCCCC.",
      "C.CCC.C",
      "...g...",
      "..gGg..",
      "...g...",
      "..GgG.."
    ],

    lavender: [
      "..L..",
      ".LLL.",
      "LLLLL",
      ".LLL.",
      "..L..",
      ".LLL.",
      "LLLLL",
      "..g.."
    ]
  };


  const FLOWER_TYPES = [
    "tulip",
    "sunflower",
    "rose",
    "daisy",
    "blossom",
    "lavender"
  ];


  const STORAGE_KEY = "bloomyState.v2";


  const defaultState = {
    goals: [],
    flowers: [],
    completedCount: 0,
    plantedCount: 0,
    level: 1,
    achievements: {},
    theme: "day",
    soilSlotCount: 12
  };


  let state = loadState();


  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }


  function loadState() {

    try {

      const saved =
        localStorage.getItem(STORAGE_KEY);

      if (!saved) {
        return clone(defaultState);
      }

      return Object.assign(
        clone(defaultState),
        JSON.parse(saved)
      );

    } catch {
      return clone(defaultState);
    }
  }


  function saveState() {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(state)
    );
  }


  function cryptoId() {

    return (
      "id-" +
      Math.random()
        .toString(36)
        .slice(2, 10) +
      Date.now().toString(36)
    );
  }


  function renderPixelArt(pattern, size) {

    const wrapper =
      document.createElement("div");

    wrapper.className = "pixel-art";

    wrapper.style.setProperty(
      "--cell",
      size + "px"
    );

    wrapper.style.gridTemplateColumns =
      `repeat(${pattern[0].length}, var(--cell))`;


    pattern.forEach(row => {

      for (
        let i = 0;
        i < row.length;
        i++
      ) {

        const cell =
          document.createElement("div");

        cell.className = "cell";

        const code = row[i];

        if (COLORS[code]) {
          cell.style.background =
            COLORS[code];
        }

        wrapper.appendChild(cell);
      }

    });

    return wrapper;
  }


  /* =========================
     SEEDS + FLOWERS
  ========================= */

  function findEmptySlot() {

    const used =
      new Set(
        state.goals
          .map(goal => goal.slot)
          .filter(slot => slot !== undefined)
      );


    for (
      let i = 0;
      i < state.soilSlotCount;
      i++
    ) {

      if (!used.has(i)) {
        return i;
      }

    }


    state.soilSlotCount++;

    return state.soilSlotCount - 1;
  }


  function renderGarden() {

    const grid =
      document.getElementById("soilGrid");

    if (!grid) return;

    grid.innerHTML = "";


    const slots = {};


    state.goals.forEach(goal => {

      if (goal.slot !== undefined) {
        slots[goal.slot] = goal;
      }

    });


    for (
      let i = 0;
      i < state.soilSlotCount;
      i++
    ) {

      const slot =
        document.createElement("div");

      slot.className = "soil-slot";


      const goal = slots[i];


      if (goal) {

        const holder =
          document.createElement("div");

        holder.className =
          "pixel-art-wrap";


        if (goal.completed) {

          const flower =
            goal.flowerType || "tulip";

          holder.appendChild(
            renderPixelArt(
              PATTERNS[flower],
              4
            )
          );

          holder.classList.add(
            "flower-sway"
          );

        } else {

          holder.appendChild(
            renderPixelArt(
              PATTERNS.seed,
              5
            )
          );

          holder.classList.add(
            "seed-idle"
          );
        }


        slot.appendChild(holder);
      }


      grid.appendChild(slot);
    }
  }


  /* =========================
     GOALS
  ========================= */

  function addGoal(text) {

    const trimmed =
      text.trim();

    if (!trimmed) {
      showToast("🌱 Type a goal first!");
      return;
    }


    const slot =
      findEmptySlot();


    const goal = {

      id: cryptoId(),

      text: trimmed,

      completed: false,

      slot: slot,

      flowerType: null

    };


    state.goals.unshift(goal);

    state.plantedCount++;


    saveState();

    renderGoals();

    renderGarden();

    renderStats();


    showToast(
      "🌱 Your seed has been planted!"
    );
  }


  function renderGoals() {

    const list =
      document.getElementById("goalList");

    const empty =
      document.getElementById("goalEmptyHint");

    if (!list) return;


    list.innerHTML = "";


    if (state.goals.length === 0) {

      list.classList.add("hidden");

      empty.classList.remove("hidden");

      return;
    }


    list.classList.remove("hidden");

    empty.classList.add("hidden");


    state.goals.forEach(goal => {

      const li =
        document.createElement("li");

      li.className =
        "goal-item" +
        (
          goal.completed
            ? " completed"
            : ""
        );

      li.dataset.id =
        goal.id;


      const check =
        document.createElement("button");

      check.className =
        "goal-check";

      check.type = "button";

      check.textContent =
        goal.completed
          ? "✔"
          : "";


      const text =
        document.createElement("span");

      text.className =
        "goal-text";

      text.textContent =
        goal.text;


      const deleteButton =
        document.createElement("button");

      deleteButton.className =
        "goal-delete";

      deleteButton.type =
        "button";

      deleteButton.textContent =
        "✕";


      li.appendChild(check);

      li.appendChild(text);

      li.appendChild(deleteButton);

      list.appendChild(li);

    });
  }


  function completeGoal(id) {

    const goal =
      state.goals.find(
        item => item.id === id
      );


    if (!goal || goal.completed) {
      return;
    }


    goal.completed = true;


    goal.flowerType =
      FLOWER_TYPES[
        Math.floor(
          Math.random() *
          FLOWER_TYPES.length
        )
      ];


    state.completedCount++;


    state.level =
      Math.floor(
        state.completedCount / 5
      ) + 1;


    saveState();

    renderGoals();

    renderGarden();

    renderStats();


    showToast(
      "🌸 Your seed bloomed!"
    );
  }


  function deleteGoal(id) {

    state.goals =
      state.goals.filter(
        goal => goal.id !== id
      );


    saveState();

    renderGoals();

    renderGarden();

    renderStats();
  }


  /* =========================
     STATS
  ========================= */

  function renderStats() {

    const flowers =
      state.goals.filter(
        goal => goal.completed
      ).length;


    document.getElementById(
      "flowerCount"
    ).textContent = flowers;


    document.getElementById(
      "completedCount"
    ).textContent =
      state.completedCount;


    document.getElementById(
      "levelValue"
    ).textContent =
      state.level;


    const progress =
      state.completedCount % 5;


    document.getElementById(
      "progressFill"
    ).style.width =
      (progress / 5 * 100) + "%";


    document.getElementById(
      "progressCaption"
    ).textContent =
      `${progress} / 5 to next level`;
  }


  /* =========================
     CLOUDS
  ========================= */

  function createCloud(left, top, size) {

    const cloud =
      document.createElement("div");

    cloud.className =
      "cloud";


    cloud.style.left =
      left + "%";

    cloud.style.top =
      top + "%";


    cloud.style.setProperty(
      "--cloud-size",
      size + "px"
    );


    cloud.innerHTML = `
      <span></span>
      <span></span>
      <span></span>
      <span></span>
    `;


    document
      .getElementById("cloudsLayer")
      .appendChild(cloud);
  }


  function spawnClouds() {

    const layer =
      document.getElementById(
        "cloudsLayer"
      );


    if (!layer) return;


    layer.innerHTML = "";


    createCloud(8, 14, 12);

    createCloud(48, 25, 10);

    createCloud(72, 9, 14);
  }


  /* =========================
     STARS
  ========================= */

  function spawnStars() {

    const layer =
      document.getElementById(
        "stars"
      );

    if (!layer) return;


    layer.innerHTML = "";


    for (
      let i = 0;
      i < 35;
      i++
    ) {

      const star =
        document.createElement("div");

      star.className = "star";

      star.style.left =
        Math.random() * 100 + "%";

      star.style.top =
        Math.random() * 65 + "%";

      layer.appendChild(star);
    }
  }


  /* =========================
     THEME
  ========================= */

  function applyTheme(theme) {

    state.theme = theme;

    document.body.dataset.theme =
      theme;


    document.getElementById(
      "themeIcon"
    ).textContent =
      theme === "night"
        ? "🌙"
        : "☀️";


    document.getElementById(
      "themeLabel"
    ).textContent =
      theme === "night"
        ? "Night"
        : "Day";


    saveState();
  }


  function toggleTheme() {

    applyTheme(
      state.theme === "day"
        ? "night"
        : "day"
    );
  }


  /* =========================
     TOAST
  ========================= */

  let toastTimer;


  function showToast(message) {

    const toast =
      document.getElementById("toast");

    toast.textContent =
      message;

    toast.classList.add("show");


    clearTimeout(toastTimer);


    toastTimer =
      setTimeout(() => {

        toast.classList.remove("show");

      }, 2200);
  }


  /* =========================
     RESET
  ========================= */

  function resetGarden() {

    const theme =
      state.theme;

    state =
      clone(defaultState);

    state.theme =
      theme;

    saveState();

    renderAll();

    showToast(
      "🌱 Garden reset!"
    );
  }


  /* =========================
     EVENTS
  ========================= */

  function bindEvents() {

    document
      .getElementById("goalForm")
      .addEventListener(
        "submit",
        event => {

          event.preventDefault();


          const input =
            document.getElementById(
              "goalInput"
            );


          addGoal(
            input.value
          );


          input.value = "";

          input.focus();
        }
      );


    document
      .getElementById("goalList")
      .addEventListener(
        "click",
        event => {

          const item =
            event.target.closest(
              ".goal-item"
            );


          if (!item) return;


          const id =
            item.dataset.id;


          if (
            event.target.classList.contains(
              "goal-check"
            )
          ) {

            completeGoal(id);

          }


          if (
            event.target.classList.contains(
              "goal-delete"
            )
          ) {

            deleteGoal(id);

          }

        }
      );


    document
      .getElementById("themeToggle")
      .addEventListener(
        "click",
        toggleTheme
      );


    document
      .getElementById("resetBtn")
      .addEventListener(
        "click",
        () => {

          document
            .getElementById(
              "confirmModal"
            )
            .classList.remove(
              "hidden"
            );
        }
      );


    document
      .getElementById("confirmResetNo")
      .addEventListener(
        "click",
        () => {

          document
            .getElementById(
              "confirmModal"
            )
            .classList.add(
              "hidden"
            );
        }
      );


    document
      .getElementById("confirmResetYes")
      .addEventListener(
        "click",
        () => {

          document
            .getElementById(
              "confirmModal"
            )
            .classList.add(
              "hidden"
            );

          resetGarden();
        }
      );
  }


  /* =========================
     START
  ========================= */

  function renderAll() {

    applyTheme(
      state.theme
    );

    spawnClouds();

    spawnStars();

    renderGarden();

    renderGoals();

    renderStats();
  }


  document.addEventListener(
    "DOMContentLoaded",
    () => {

      bindEvents();

      renderAll();

    }
  );

})();