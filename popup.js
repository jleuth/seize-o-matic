const DEFAULTS = { enabled:false, speed:15, palette:"rainbow" };
const PALETTES = ["rainbow","trans","bi","pan","ace","lesbian","progress"];

async function getState(){
  const result = await chrome.storage.sync.get(['globalState']);
  return { ...DEFAULTS, ...(result.globalState||{}) };
}

async function setState(state){
  await chrome.storage.sync.set({ globalState: state });
  const [tab] = await chrome.tabs.query({ active:true, currentWindow:true });
  if (tab) {
    try {
      await chrome.tabs.sendMessage(tab.id, { type:"state:update", state });
    } catch (e) {
      // Content script not ready, ignore
    }
  }
}

function q(id){ return document.getElementById(id); }

(async function init(){
  try {
    const [tab] = await chrome.tabs.query({ active:true, currentWindow:true });
    if (!tab) {
      console.error("No active tab");
      return;
    }
    
    let st = await getState();

    q("enabled").checked = st.enabled;
    q("speed").value = st.speed;
    const sel = q("palette");
    PALETTES.forEach(p=>{
      const o = document.createElement("option");
      o.value = p;
      o.textContent = p;
      sel.appendChild(o);
    });
    sel.value = st.palette;

    q("enabled").addEventListener("change", async e=> {
      st = await getState();
      await setState({ ...st, enabled:e.target.checked });
    });
    
    q("speed").addEventListener("change", async e=> {
      st = await getState();
      await setState({ ...st, speed: +e.target.value });
    });
    
    q("palette").addEventListener("change", async e=> {
      st = await getState();
      await setState({ ...st, palette: e.target.value });
    });
    
    q("once").addEventListener("click", async ()=>{
      try {
        await chrome.tabs.sendMessage(tab.id, { type:"flash:once" });
      } catch (e) {
        // Content script not ready, ignore
      }
    });
  } catch (err) {
    console.error("Init error:", err);
  }
})();
