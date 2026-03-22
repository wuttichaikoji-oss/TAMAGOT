
(function(){
  const STORAGE_KEY = 'laya_pet_github_ready_v2_living';
  const moods = ['idle','happy','love','sad','sleep','hurt','attack','dash'];
  const defaultState = {
    coin:120, score:78, hunger:78, energy:64, happy:86, clean:71, bond:82,
    mood:'idle', battlePrepared:false, battleBuff:0, enemyPower:74, lastSavedAt:null, lastPlayedAt:Date.now()
  };
  function loadState(){ try{ const raw = localStorage.getItem(STORAGE_KEY); return raw ? {...defaultState, ...JSON.parse(raw)} : {...defaultState}; }catch(e){ return {...defaultState}; } }
  const state = loadState();

  const petImg = document.getElementById('petImg');
  const petShell = document.getElementById('petShell');

  const moodDescriptions = {
    idle:'ดุ๊กดิ๊กเบาๆ แบบมีชีวิต', happy:'เด้งถี่ขึ้นเพราะมีความสุข', love:'อบอุ่นและผูกพันมาก',
    sad:'เคลื่อนไหวช้าลงเหมือนงอแง', sleep:'กำลังพักผ่อนและลอยช้าๆ', hurt:'สะดุ้งเล็กน้อยเมื่อเสียใจ',
    attack:'พร้อมสู้และขยับกระฉับกระเฉง', dash:'พลังงานสูงและเคลื่อนไหวไว'
  };
  const speechs = {
    idle:'ตอนนี้น้องจะดุ๊กดิ๊กแบบมีชีวิตแล้ว 💖',
    happy:'ดีใจที่สุดเลย! ✨',
    love:'ความผูกพันของเราอบอุ่นมาก 💗',
    sad:'วันนี้ขออยู่ใกล้ๆได้ไหม',
    sleep:'ขอพักสักหน่อยนะ… Zz',
    hurt:'โอ๊ย… แต่ฉันยังไหว',
    attack:'ฉันพร้อมสู้เพื่อเธอ ✨',
    dash:'ไปกันเลย! ⚡'
  };

  function clamp(v){ return Math.max(0, Math.min(100, v)); }
  function inferMood(){
    if (state.energy <= 20) return 'sleep';
    if (state.hunger <= 20 || state.clean <= 20) return 'sad';
    if (state.happy <= 18) return 'hurt';
    if (state.bond >= 88 && state.happy >= 75) return 'love';
    if (state.happy >= 80) return 'happy';
    return 'idle';
  }
  function battlePower(){
    const base = (state.bond * 0.5) + (state.happy * 0.3) + (state.energy * 0.1) + (state.clean * 0.05) + (state.hunger * 0.05);
    return Math.round(base + state.battleBuff);
  }
  function battleHint(){
    const my = battlePower(), diff = my - state.enemyPower;
    if (diff >= 18) return `ได้เปรียบมาก · Power ${my} vs ${state.enemyPower}`;
    if (diff >= 8) return `ได้เปรียบเล็กน้อย · Power ${my} vs ${state.enemyPower}`;
    if (diff > -8) return `สูสี · Power ${my} vs ${state.enemyPower}`;
    return `คู่ต่อสู้น่ากลัว · Power ${my} vs ${state.enemyPower}`;
  }
  function saveState(showLog=false){
    state.lastSavedAt = Date.now();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    document.getElementById('saveStateLabel').textContent = `💾 Saved ${new Date(state.lastSavedAt).toLocaleTimeString()}`;
    if(showLog) pushLog('💾','Save','บันทึกสถานะปัจจุบันแล้ว');
  }
  function renderBars(){
    [['Hunger',state.hunger],['Energy',state.energy],['Happy',state.happy],['Clean',state.clean],['Bond',state.bond]].forEach(([k,v])=>{
      document.getElementById('bar'+k).style.width = v + '%';
      document.getElementById('txt'+k).textContent = v + '%';
    });
  }
  function renderPet(){
    petImg.src = `assets/${state.mood}.png`;
    petShell.className = `pet-shell ${state.mood}`;
  }
  function renderAll(){
    document.getElementById('coinDisplay').textContent = `🪙 ${state.coin}`;
    document.getElementById('scoreDisplay').textContent = `📈 Score ${state.score}`;
    document.getElementById('speechBubble').textContent = speechs[state.mood];
    document.getElementById('petSub').textContent = moodDescriptions[state.mood];
    document.getElementById('battlePreview').innerHTML = `${battleHint()}${state.battlePrepared ? ' · เตรียมพร้อมแล้ว' : ''}`;
    renderBars();
    renderPet();
    document.querySelectorAll('[data-mood]').forEach(btn => btn.classList.toggle('active', btn.dataset.mood === state.mood));
    if(state.lastSavedAt) document.getElementById('saveStateLabel').textContent = `💾 Saved ${new Date(state.lastSavedAt).toLocaleTimeString()}`;
  }
  function pushLog(icon,title,text){
    const el = document.getElementById('logArea');
    el.insertAdjacentHTML('afterbegin', `<div class="log-item"><div class="log-icon">${icon}</div><div class="log-text"><strong>${title}</strong><span>${text}</span></div></div>`);
    while(el.children.length > 5) el.removeChild(el.lastElementChild);
  }

  let idleTimer = null;
  function triggerMicroMotion(type){
    petImg.classList.remove('micro-pop','micro-squish','micro-tilt-left','micro-tilt-right','micro-hop');
    void petImg.offsetWidth;
    petImg.classList.add(type);
    setTimeout(()=>petImg.classList.remove(type), 240);
  }
  function scheduleIdleMicro(){
    if (idleTimer) clearTimeout(idleTimer);
    const delay = 1600 + Math.random() * 2400;
    idleTimer = setTimeout(() => {
      const current = state.mood;
      const pool = current === 'sleep'
        ? ['micro-squish']
        : current === 'sad'
        ? ['micro-tilt-left','micro-tilt-right','micro-squish']
        : current === 'happy' || current === 'love'
        ? ['micro-pop','micro-hop','micro-tilt-left','micro-tilt-right']
        : ['micro-pop','micro-squish','micro-tilt-left','micro-tilt-right','micro-hop'];
      const pick = pool[Math.floor(Math.random()*pool.length)];
      triggerMicroMotion(pick);
      scheduleIdleMicro();
    }, delay);
  }

  function handleAction(action){
    if(action==='feed'){ state.hunger=clamp(state.hunger+16); state.happy=clamp(state.happy+4); state.coin+=2; pushLog('🍓','Feed','Nova อิ่มขึ้นและอารมณ์ดีขึ้น'); triggerMicroMotion('micro-pop'); }
    if(action==='play'){ state.happy=clamp(state.happy+14); state.energy=clamp(state.energy-8); state.bond=clamp(state.bond+3); pushLog('🎮','Play','Nova ดุ๊กดิ๊กแรงขึ้นและ bond เพิ่ม'); triggerMicroMotion('micro-hop'); }
    if(action==='clean'){ state.clean=clamp(state.clean+18); state.happy=clamp(state.happy+3); pushLog('🛁','Clean','ตัวน้องสดชื่นและดูสบายใจขึ้น'); triggerMicroMotion('micro-tilt-right'); }
    if(action==='sleep'){ state.energy=clamp(state.energy+20); state.hunger=clamp(state.hunger-4); pushLog('😴','Sleep','Nova พักผ่อนและฟื้นพลัง'); triggerMicroMotion('micro-squish'); }
    state.lastPlayedAt = Date.now(); state.mood = inferMood(); saveState(); renderAll();
  }
  function prepareBattle(){
    state.battlePrepared = true; state.battleBuff = Math.round((state.bond * 0.06) + (state.happy * 0.04));
    state.happy = clamp(state.happy + 4); state.bond = clamp(state.bond + 2);
    pushLog('🛡️','Prep Battle',`เตรียมตัวก่อนสู้ · Battle Buff +${state.battleBuff}`);
    state.mood = state.bond >= 85 ? 'love' : 'attack'; saveState(); renderAll(); triggerMicroMotion('micro-pop');
  }
  function startBattle(){
    const finalPower = battlePower() + Math.round((Math.random()*16)-8);
    const win = finalPower >= state.enemyPower;
    if(win){
      state.score += 6; state.coin += 12; state.bond = clamp(state.bond + 3); state.happy = clamp(state.happy + 5);
      pushLog('🏆','Battle Win',`ชนะเพราะ Bond/Happy ดี · ${finalPower} vs ${state.enemyPower}`);
      state.mood = state.bond >= 88 ? 'love' : 'happy';
      triggerMicroMotion('micro-hop');
    } else {
      state.happy = clamp(state.happy - 8); state.energy = clamp(state.energy - 6);
      pushLog('💥','Battle Lose',`แพ้แบบสูสี · ${finalPower} vs ${state.enemyPower}`);
      state.mood = 'hurt';
      triggerMicroMotion('micro-tilt-left');
    }
    state.battlePrepared = false; state.battleBuff = 0; state.enemyPower = 66 + Math.floor(Math.random()*20);
    saveState(); renderAll();
  }
  function resetState(){
    localStorage.removeItem(STORAGE_KEY); Object.assign(state, {...defaultState, lastPlayedAt:Date.now()});
    pushLog('🗑️','Reset Save','ล้างข้อมูลและเริ่มใหม่เรียบร้อย'); saveState(); renderAll();
  }

  const moodBox = document.getElementById('moodButtons');
  moods.forEach(m=>{
    const btn = document.createElement('button');
    btn.className = 'mood'; btn.dataset.mood = m; btn.textContent = m;
    btn.addEventListener('click', ()=>{ state.mood = m; saveState(); renderAll(); pushLog('✨','Mood Change',`สลับอารมณ์เป็น ${m}`); });
    moodBox.appendChild(btn);
  });
  document.querySelectorAll('[data-action]').forEach(btn => btn.addEventListener('click', ()=>handleAction(btn.dataset.action)));
  document.getElementById('prepBattleBtn').addEventListener('click', prepareBattle);
  document.getElementById('startBattleBtn').addEventListener('click', startBattle);
  document.getElementById('saveNowBtn').addEventListener('click', ()=>saveState(true));
  document.getElementById('resetSaveBtn').addEventListener('click', resetState);

  const elapsedSteps = Math.floor((Date.now() - (state.lastPlayedAt || Date.now())) / 9000);
  if(elapsedSteps > 0){
    state.hunger = clamp(state.hunger - elapsedSteps);
    state.energy = clamp(state.energy - elapsedSteps);
    state.clean = clamp(state.clean - elapsedSteps);
    state.lastPlayedAt = Date.now();
  }
  pushLog('🫧','Living Motion','เพิ่มระบบดุ๊กดิ๊กให้ pet ดูมีชีวิตมากขึ้นแล้ว');
  renderAll();
  scheduleIdleMicro();
})();
