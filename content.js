// Color palettes
const PALETTES = {
  rainbow: ["#e40303","#ff8c00","#ffed00","#008026","#004dff","#750787"],
  trans: ["#5bcefa","#f5a9b8","#ffffff","#f5a9b8","#5bcefa"],
  bi: ["#d60270","#d60270","#9b4f96","#0038a8","#0038a8"],
  pan: ["#ff218c","#ffd800","#21b1ff"],
  ace: ["#000000","#a3a3a3","#ffffff","#800080"],
  lesbian: ["#d52d00","#ff9a56","#ffffff","#d481a3","#a30262"],
  progress: ["#000000","#784F17","#ffffff","#e40303","#ff8c00","#ffed00","#008026","#004dff","#750787"]
};

let overlay = null;
let animStyle = null;
let state = { enabled:false, speed:15, palette:"rainbow" };

const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function ensureNodes(){
  if (!overlay){
    overlay = document.createElement("div");
    overlay.id = "__pride_overlay__";
    Object.assign(overlay.style, {
      position:"fixed", inset:"0", pointerEvents:"none",
      zIndex:"2147483647", opacity:"0", transition:"opacity .25s ease",
      mixBlendMode:"normal"
    });
    document.documentElement.appendChild(overlay);
  }
  if (!animStyle){
    animStyle = document.createElement("style");
    document.documentElement.appendChild(animStyle);
  }
}

function buildCSSGradient(palette){
  const stops = palette.map((c,i)=> `${c} ${(i/palette.length)*100}% ${( (i+1)/palette.length)*100}%`).join(", ");
  return `conic-gradient(${stops})`;
}

function applyOverlay(){
  ensureNodes();
  const pal = PALETTES[state.palette] || PALETTES.rainbow;
  const bg = buildCSSGradient(pal);
  overlay.style.background = bg;

  const hz = state.speed;
  const dur = Math.max(0.01, 1/Math.max(0.5, hz));

  const key = `
@keyframes prideSpin { 
  from { transform: rotate(0turn); } 
  to   { transform: rotate(1turn); } 
}
#__pride_overlay__ { 
  animation: prideSpin ${dur}s linear infinite; 
  filter: saturate(2) brightness(1.3) contrast(1.2); 
  opacity: 0.9;
}
`;
  animStyle.textContent = key;
  overlay.style.opacity = state.enabled ? "0.9" : "0";
}

function flashOnce(ms=1200){
  ensureNodes();
  overlay.style.opacity = "1";
  setTimeout(()=>{ if (!state.enabled) overlay.style.opacity = "0"; }, ms);
}

chrome.runtime.onMessage.addListener((msg)=>{
  if (msg.type === "state:update"){
    state = msg.state;
    applyOverlay();
  } else if (msg.type === "flash:once"){
    flashOnce();
  }
});

// Random chance flash on page load
function colorRoulette(){
  if (state.enabled) {
    return;
  }
  
  const roll = Math.random();
  
  if (roll < 0.1) {
    const paletteNames = Object.keys(PALETTES);
    const randomPalette = paletteNames[Math.floor(Math.random() * paletteNames.length)];
    
    const originalState = { ...state };
    state.palette = randomPalette;
    
    // Random duration between 3-5 seconds (3000-5000ms)
    const flashDuration = Math.floor(Math.random() * 2000) + 3000;
    
    flashOnce(flashDuration);
    
    setTimeout(() => {
      state = originalState;
      applyOverlay();
    }, flashDuration);
  }
}

// Initialize
(async function init(){
  ensureNodes();
  const all = await chrome.storage.sync.get(['globalState']);
  state = { enabled:false, speed:15, palette:"rainbow", ...(all.globalState||{}) };
  applyOverlay();

  if (!prefersReduced) {
    colorRoulette();
  }

  // Keyboard shortcut: Ctrl+Shift+Y
  window.addEventListener("keydown", (e)=>{
    if (e.ctrlKey && e.shiftKey && e.code === "KeyY"){
      state.enabled = !state.enabled; 
      applyOverlay();
      chrome.storage.sync.set({ globalState: state });
    }
  });
})();

