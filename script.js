const scenes = [...document.querySelectorAll(".scene")];
const progressBar = document.querySelector("#progressBar");
const toast = document.querySelector("#toast");
let current = "cover";
let explored = new Set(["cover"]);
const completedStops = new Set();
const introScreen = document.querySelector("#introScreen");
let audioContext;
const requiredStops = ["memories", "moments", "playlist", "letter"];

function sfx(frequency, duration, type = "sine") {
  audioContext ??= new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = type;
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.12, audioContext.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + duration);
  oscillator.connect(gain).connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + duration + 0.03);
}

document.querySelector("#startIntro")?.addEventListener("click", () => {
  sfx(440, 0.14);
  introScreen.classList.add("intro-play");
  document.body.classList.remove("intro-active");
  window.setTimeout(() => {
    introScreen.classList.add("leave");
    showScene("cover");
  }, 850);
});

document.querySelector("#hatch")?.addEventListener("click", () => {
  if (!introScreen.classList.contains("intro-play")) return;
  sfx(180, 0.22, "square");
  introScreen.classList.add("hatch-now");
  const runner = document.querySelector(".intro-runner");
  const hatch = document.querySelector(".hatch");
  if (runner) {
    runner.style.animation = "none";
    requestAnimationFrame(() => {
      runner.style.animation = "runnerIntoHatch .8s .05s cubic-bezier(.55,.08,.68,.53) forwards";
    });
  }
  if (hatch) hatch.style.animation = "hatchWiggle .55s ease forwards";
});

function markStopComplete(stopName) {
  if (!stopName) return;
  completedStops.add(stopName);
  const stopBtn = document.querySelector(`.map-stop[data-stop="${stopName}"]`);
  if (stopBtn && !stopBtn.querySelector(".stop-check")) {
    const check = document.createElement("span");
    check.className = "stop-check";
    check.textContent = " ✓";
    stopBtn.appendChild(check);
    stopBtn.classList.add("completed");
  }
  updateMapStops();
}

function updateMapStops() {
  const allRequiredDone = requiredStops.every(s => completedStops.has(s));
  document.querySelectorAll(".map-stop").forEach(btn => {
    const stop = btn.dataset.stop;
    if (stop === "birthday") {
      btn.style.display = allRequiredDone && completedStops.has("birthday") === false && !completedStops.has("discovery") ? "flex" : (completedStops.has("birthday") ? "none" : "flex");
      if (!allRequiredDone) btn.style.display = "none";
      else if (completedStops.has("birthday")) btn.style.display = "none";
      else btn.style.display = "flex";
    } else if (stop === "discovery") {
      if (!allRequiredDone) {
        btn.style.display = "none";
        return;
      }
      if (!completedStops.has("birthday")) {
        btn.style.display = "none";
        return;
      }
      if (completedStops.has("discovery")) {
        btn.style.display = "none";
        return;
      }
      btn.style.display = "flex";
    } else if (requiredStops.includes(stop)) {
      btn.style.display = "flex";
    } else {
      btn.style.display = "flex";
    }
  });
  if (allRequiredDone && completedStops.has("birthday") && !completedStops.has("discovery")) {
    const secretBtn = document.querySelector(".map-stop[data-stop='discovery']");
    if (secretBtn) secretBtn.style.display = "flex";
  }
}

function showScene(name) {
  const target = document.querySelector(`[data-scene="${name}"]`);
  if (!target) return;
  if (current !== "map" && name === "map") {
    const from = document.querySelector(`[data-scene="${current}"]`);
    if (from) {
      const stop = from.dataset.scene;
      markStopComplete(stop);
      updateMapStops();
    }
  }
  if (name === "map") {
    updateMapStops();
  }
  if (name === "finale") {
    document.querySelectorAll(".map-stop").forEach(btn => {
      btn.style.display = "none";
    });
  }
  scenes.forEach(scene => scene.classList.toggle("active", scene === target));
  current = name;
  explored.add(name);
  const percent = Math.max(8, Math.round((explored.size / scenes.length) * 100));
  progressBar.style.width = `${percent}%`;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

document.addEventListener("click", event => {
  const destination = event.target.closest("[data-next]");
  if (destination) {
    const nextScene = destination.dataset.next;
    if (nextScene === "map" && current !== "map") {
      const currentScene = document.querySelector(`[data-scene="${current}"]`);
      if (currentScene) {
        markStopComplete(currentScene.dataset.scene);
        updateMapStops();
      }
    }
    if (nextScene === "discovery" && current === "birthday") {
      markStopComplete("birthday");
      updateMapStops();
    }
    showScene(nextScene);
  }

  const secret = event.target.closest(".monkey-secret");
  if (secret) {
    toast.textContent = secret.dataset.message;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2800);
  }
});

document.querySelector("#musicBtn")?.addEventListener("click", event => {
  // Abrir playlist en Spotify
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") showScene("map");
});
