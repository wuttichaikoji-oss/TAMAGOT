
(function(){
  const total = 12;
  const prefix = 'assets/frames/idle/idle_';
  const img = document.getElementById('anim');
  let idx = 0;
  let timer = null;

  function src(i){
    return `${prefix}${String(i).padStart(2,'0')}.png`;
  }
  function render(){ img.src = src(idx); }
  function play(){
    if (timer) return;
    timer = setInterval(() => {
      idx = (idx + 1) % total;
      render();
    }, 250);
  }
  function pause(){
    clearInterval(timer);
    timer = null;
  }
  function step(){
    idx = (idx + 1) % total;
    render();
  }

  document.getElementById('playBtn').addEventListener('click', play);
  document.getElementById('pauseBtn').addEventListener('click', pause);
  document.getElementById('stepBtn').addEventListener('click', step);

  render();
  play();
})();
