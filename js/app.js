
(function(){
  const STORAGE_KEY = 'laya_pet_framebased_v1';
  const ANIMS = {
    idle: {prefix:'assets/frames/idle/idle_', frames:5, duration:130},
    blink:{prefix:'assets/frames/blink/blink_', frames:4, duration:85},
    happy:{prefix:'assets/frames/happy/happy_', frames:5, duration:90},
    sleep:{prefix:'assets/frames/sleep/sleep_', frames:4, duration:170},
    love: {prefix:'assets/frames/love/love_', frames:4, duration:110},
    sad:  {prefix:'assets/frames/sad/sad_', frames:4, duration:150},
    hurt: {prefix:'assets/frames/hurt/hurt_', frames:3, duration:85}
  };

  const defaultState = {
    coin:120, score:78, hunger:78, energy:64, happy:86, clean:71, bond:82,
    mood:'idle', lastSavedAt:null, lastPlayedAt:Date.now()
  };

  function loadState(){
    try{
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? {...defaultState, ...JSON.parse(raw)} : {...defaultState};
    }catch(e){
      return {...defaultState};
    }
  }

  const state = loadState();
  const petFrame = document.getElementById('petFrame');
  let playTimer = null;
  let blinkTimer = null;

  const moodDescriptions = {
    idle:'ลอยและยุบพองแบบเฟรมจริง',
    happy:'กระโดดเด้งจากหลายเฟรม',
    love:'อบอุ่นและมีหัวใจลอยรอบตัว',
    sad:'เคลื่อนไหวช้าลงเหมือนงอแง',
    sleep:'พักผ่อนด้วยเฟรมหลับจริง',
    hurt:'สะดุ้งสั้นๆ จากหลายเฟรม'
  };
  const speechs = {
    idle:'ตอนนี้น้องขยับจากเฟรมจริง ไม่ใช่ภาพเดียวขยับแล้ว 💖',
    happy:'ดีใจที่สุดเลย! ✨',
    love:'ความผูกพันของเราอบอุ่นมาก 💗',
    sad:'วันนี้ขออยู่ใกล้ๆได้ไหม',
    sleep:'ขอพักสักหน่อยนะ… Zz',
    hurt:'โอ๊ย… แต่ฉันยังไหว'
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

  function framePath(prefix, idx){
    return `${prefix}${String(idx).padStart(2,'0')}.png`;
  }

  function saveState(showLog=false){
    state.lastSavedAt = Date.now();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    updateSaveLabels();
    if(showLog) pushLog('💾','Save','บันทึกสถานะปัจจุบันแล้ว');
  }

  function updateSaveLabels(){
    const text = state.lastSavedAt ? `💾 Saved ${new Date(state.lastSavedAt).toLocaleTimeString()}` : '💾 ยังไม่เคยบันทึก';
    ['saveStateLabel','saveStateLabelDesktop'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    });
  }

  function renderBars(prefix=''){
    [['Hunger',state.hunger],['Energy',state.energy],['Happy',state.happy],['Clean',state.clean],['Bond',state.bond]].forEach(([k,v])=>{
      const bar = document.getElementById('bar'+k+prefix);
      const txt = document.getElementById('txt'+k+prefix);
      if(bar) bar.style.width = v + '%';
      if(txt) txt.textContent = v + '%';
    });
  }

  function renderAll(){
    ['','D'].forEach(prefix => renderBars(prefix));
    document.getElementById('coinDisplay').textContent = `🪙 ${state.coin}`;
    document.getElementById('scoreDisplay').textContent = `📈 Score ${state.score}`;
    document.getElementById('speechBubble').textContent = speechs[state.mood] || speechs.idle;
    document.getElementById('petSub').textContent = moodDescriptions[state.mood] || moodDescriptions.idle;
    updateSaveLabels();
  }

  function pushLog(icon,title,text){
    const html = `<div class="log-item"><div class="log-icon">${icon}</div><div class="log-text"><strong>${title}</strong><span>${text}</span></div></div>`;
    ['logArea','logAreaDesktop'].forEach(id=>{
      const el = document.getElementById(id);
      if(!el) return;
      el.insertAdjacentHTML('afterbegin', html);
      while(el.children.length > 5) el.removeChild(el.lastElementChild);
    });
  }

  function stopAnim(){
    if (playTimer) clearInterval(playTimer);
    playTimer = null;
  }

  function playLoop(name){
    stopAnim();
    const anim = ANIMS[name] || ANIMS.idle;
    let idx = 0;
    petFrame.src = framePath(anim.prefix, idx);
    playTimer = setInterval(() => {
      idx = (idx + 1) % anim.frames;
      petFrame.src = framePath(anim.prefix, idx);
    }, anim.duration);
  }

  function playOnce(name, thenName){
    stopAnim();
    const anim = ANIMS[name];
    if (!anim){ playLoop(thenName || 'idle'); return; }
    let idx = 0;
    petFrame.src = framePath(anim.prefix, idx);
    playTimer = setInterval(() => {
      idx += 1;
      if (idx >= anim.frames){
        clearInterval(playTimer);
        playTimer = null;
        playLoop(thenName || inferMood());
        return;
      }
      petFrame.src = framePath(anim.prefix, idx);
    }, anim.duration);
  }

  function scheduleBlink(){
    clearTimeout(blinkTimer);
    const delay = 2200 + Math.random() * 3200;
    blinkTimer = setTimeout(() => {
      if (state.mood === 'idle' || state.mood === 'happy' || state.mood === 'love'){
        playOnce('blink', state.mood);
      }
      scheduleBlink();
    }, delay);
  }

  function handleAction(action){
    if(action==='feed'){
      state.hunger = clamp(state.hunger + 16);
      state.happy = clamp(state.happy + 4);
      state.coin += 2;
      pushLog('🍓','Feed','Nova อิ่มขึ้นและอารมณ์ดีขึ้น');
    }
    if(action==='play'){
      state.happy = clamp(state.happy + 14);
      state.energy = clamp(state.energy - 8);
      state.bond = clamp(state.bond + 3);
      pushLog('🎮','Play','Nova กระโดดเด้งมากขึ้น');
    }
    if(action==='clean'){
      state.clean = clamp(state.clean + 18);
      state.happy = clamp(state.happy + 3);
      pushLog('🛁','Clean','ตัวน้องสดชื่นและสบายใจขึ้น');
    }
    if(action==='sleep'){
      state.energy = clamp(state.energy + 20);
      state.hunger = clamp(state.hunger - 4);
      pushLog('😴','Sleep','Nova พักผ่อนและฟื้นพลัง');
    }
    state.lastPlayedAt = Date.now();
    state.mood = inferMood();
    saveState();
    renderAll();
    if (state.mood === 'happy') playOnce('happy', 'happy');
    else if (state.mood === 'sleep') playLoop('sleep');
    else if (state.mood === 'love') playLoop('love');
    else if (state.mood === 'sad') playLoop('sad');
    else if (state.mood === 'hurt') playOnce('hurt', 'idle');
    else playLoop('idle');
  }

  function resetState(){
    localStorage.removeItem(STORAGE_KEY);
    Object.assign(state, {...defaultState, lastPlayedAt: Date.now()});
    pushLog('🗑️','Reset Save','ล้างข้อมูลและเริ่มใหม่เรียบร้อย');
    saveState();
    renderAll();
    playLoop('idle');
  }

  document.querySelectorAll('[data-action]').forEach(btn => btn.addEventListener('click', ()=>handleAction(btn.dataset.action)));
  ['saveNowBtn','saveNowBtnDesktop'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', ()=>saveState(true));
  });
  ['resetSaveBtn','resetSaveBtnDesktop'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', resetState);
  });

  // offline decay
  const elapsedSteps = Math.floor((Date.now() - (state.lastPlayedAt || Date.now())) / 12000);
  if (elapsedSteps > 0){
    state.hunger = clamp(state.hunger - elapsedSteps);
    state.energy = clamp(state.energy - elapsedSteps);
    state.clean = clamp(state.clean - elapsedSteps);
    state.lastPlayedAt = Date.now();
  }

  state.mood = inferMood();
  pushLog('🎞️','Frame Based','รอบนี้เปลี่ยนเป็นหลายเฟรมจริงต่อ action แล้ว');
  renderAll();
  playLoop(state.mood in ANIMS ? state.mood : 'idle');
  scheduleBlink();
})();
