// ========================================================
  //  AirWorker — Main Script
  // ========================================================

  // ---- State ----
  const state = {
    activePanel: 'hacker',
    hackerRunning: false,
    sheetRunning: false,
    soundStates: { typing: false, sigh: false, click: false, phone: false },
    masterVolume: 0.6,
    totalCommits: 0,
    deepNightCommits: 0,
    bossDetectCount: 0,
    bossEvadeCount: 0,
    meetingCamOn: true,
    noddingActive: true,
    currentFace: '😐',
    startTime: Date.now(),
    escPressCount: 0,
    escTimer: null,
    jigglerInterval: null,
    audioCtx: null,
    soundIntervals: {},
    panicActive: false,
  };

  // ---- Audio Context (lazy init) ----
  function getAudioCtx() {
    if (!state.audioCtx) {
      state.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return state.audioCtx;
  }

  // ---- Synthesize Sounds ----
  function playTypingSound() {
    const ctx = getAudioCtx();
    const count = Math.floor(Math.random() * 6) + 4;
    for (let i = 0; i < count; i++) {
      const buf = ctx.createBuffer(1, ctx.sampleRate * 0.04, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let j = 0; j < data.length; j++) {
        data[j] = (Math.random() * 2 - 1) * (1 - j / data.length) * 0.8;
      }
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const gain = ctx.createGain();
      gain.gain.value = state.masterVolume * (0.4 + Math.random() * 0.6);
      src.connect(gain);
      gain.connect(ctx.destination);
      src.start(ctx.currentTime + i * (0.05 + Math.random() * 0.08));
    }
  }

  function playSighSound() {
    const ctx = getAudioCtx();
    const duration = 1.5;
    const buf = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let j = 0; j < data.length; j++) {
      const t = j / ctx.sampleRate;
      const env = Math.sin(Math.PI * t / duration) * Math.exp(-t * 1.5);
      data[j] = (Math.random() * 2 - 1) * 0.3 * env;
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const gain = ctx.createGain();
    gain.gain.value = state.masterVolume;
    src.connect(gain);
    gain.connect(ctx.destination);
    src.start();
  }

  function playClickSound() {
    const ctx = getAudioCtx();
    for (let i = 0; i < 3; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.value = 800 + Math.random() * 400;
      gain.gain.setValueAtTime(state.masterVolume * 0.3, ctx.currentTime + i * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.15 + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.15);
      osc.stop(ctx.currentTime + i * 0.15 + 0.1);
    }
  }

  function playPhoneSound() {
    const ctx = getAudioCtx();
    const freqs = [440, 480];
    freqs.forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = f;
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(state.masterVolume * 0.4, ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(state.masterVolume * 0.4, ctx.currentTime + 0.8);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.9);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 1.0);
    });
  }

  function toggleSound(type) {
    state.soundStates[type] = !state.soundStates[type];
    const btn = document.getElementById('soundBtn-' + type);
    const card = document.getElementById('soundCard-' + type);
    const vis = document.getElementById('soundVis-' + type);

    if (state.soundStates[type]) {
      btn.textContent = '⏹ 停止';
      btn.style.background = 'linear-gradient(135deg,#c0392b,#8e1010)';
      card.style.borderColor = 'var(--red)';
      card.style.boxShadow = '0 0 12px rgba(231,76,60,0.4)';
      // animate bars
      vis.querySelectorAll('.sound-bar').forEach(b => {
        b.style.animationPlayState = 'running';
        b.style.animationDuration = (0.3 + Math.random() * 0.5) + 's';
      });
      // start interval
      const intervals = { typing: 800, sigh: 15000, click: 2000, phone: 8000 };
      const fns = { typing: playTypingSound, sigh: playSighSound, click: playClickSound, phone: playPhoneSound };
      fns[type]();
      state.soundIntervals[type] = setInterval(() => {
        if (state.soundStates[type]) fns[type]();
      }, intervals[type]);
    } else {
      btn.textContent = '▶ 再生';
      btn.style.background = '';
      card.style.borderColor = '';
      card.style.boxShadow = '';
      vis.querySelectorAll('.sound-bar').forEach(b => b.style.animationPlayState = 'paused');
      clearInterval(state.soundIntervals[type]);
    }
  }

  function updateMasterVolume(val) {
    state.masterVolume = val / 100;
    document.getElementById('masterVolumeVal').textContent = val + '%';
  }

  // ========== HACKER MODE ==========
  const hackerLines = [
    'INITIALIZING QUANTUM BYPASS PROTOCOL...',
    'INJECTING POLYMORPHIC SHELLCODE...',
    'BRUTE FORCING ENTROPY MATRIX [████████] 100%',
    'DECRYPTING RSA-4096 KEY... DONE (17ms)',
    'SSH TUNNEL ESTABLISHED: 192.168.{r}.{r}',
    'COMPILING CORE SYSTEM v{r}.{r}.{r}...',
    'ACCESS GRANTED — ROOT PRIVILEGES ACQUIRED',
    'DEPLOYING NEURAL INFERENCE ENGINE...',
    'git push origin main --force [OK]',
    'Refactoring quantum logic module...',
    'Fix: memory leak in async handler',
    'BLOCKCHAIN SYNC: block #{r} verified',
    'AI MODEL LOADED: accuracy 99.{r}%',
    'FIREWALL BYPASS: {r}.{r}.{r}.{r}:4444',
    '> sudo systemctl restart phantom-daemon',
    'WARNING: entropy pool depleted — regenerating',
    'KERNEL PANIC averted (patch applied)',
    '[TRACE] 0x{h} → 0x{h} → 0x{h}',
    'npm audit fix --force --legacy-peer-deps',
    'docker build -t airworker:{r} . [SUCCESS]',
    'EXECUTING: rm -rf /tmp/evidence/*',
    'TensorFlow training: epoch {r}/100 loss=0.0{r}',
    'Segfault recovered via zero-knowledge proof',
    'OVERFLOW DETECTED — patching with NOP sled',
    '✓ All {r} tests passed (0 failed)',
    'DEPLOYING TO PRODUCTION: [DO NOT INTERRUPT]',
    'DATABASE MIGRATION: {r} rows processed',
    'curl -X POST https://api.phantom.io/commit -d payload',
    'ZLIB COMPRESSION: {r}MB → {r}KB (ratio: 98%)',
    '> whoami : airworker-elite',
  ];

  function hackerLine() {
    let l = hackerLines[Math.floor(Math.random() * hackerLines.length)];
    l = l.replace(/{r}/g, () => Math.floor(Math.random() * 99) + 1);
    l = l.replace(/{h}/g, () => Math.floor(Math.random() * 0xFFFF).toString(16).padStart(4,'0').toUpperCase());
    return l;
  }

  let hackerInterval = null;
  function startHacker() {
    if (state.hackerRunning) return;
    state.hackerRunning = true;
    const output = document.getElementById('hackerOutput');
    const statusDot = document.getElementById('hackerStatusDot');
    const statusText = document.getElementById('hackerStatusText');
    statusDot.style.background = 'var(--green)';
    statusText.textContent = 'RUNNING';

    hackerInterval = setInterval(() => {
      const line = document.createElement('div');
      line.textContent = '> ' + hackerLine();
      line.style.color = Math.random() > 0.85 ? 'var(--yellow)' :
                          Math.random() > 0.7 ? 'var(--cyan)' : 'var(--green)';
      output.appendChild(line);
      // keep max lines
      while (output.children.length > 200) output.removeChild(output.firstChild);
      output.scrollTop = output.scrollHeight;

      // update counters
      const lps = document.getElementById('linesPerSec');
      lps.textContent = (9000 + Math.floor(Math.random() * 2000)).toLocaleString();
      document.getElementById('hackerUptime').textContent = formatUptime(Date.now() - state.startTime);
      document.getElementById('hackerProgress').textContent = Math.floor(Math.random() * 5 + 95) + '%';
    }, 80);
  }

  function stopHacker() {
    state.hackerRunning = false;
    clearInterval(hackerInterval);
    const statusDot = document.getElementById('hackerStatusDot');
    const statusText = document.getElementById('hackerStatusText');
    statusDot.style.background = 'var(--red)';
    statusText.textContent = 'IDLE';
  }

  function toggleHacker() {
    if (state.hackerRunning) {
      stopHacker();
      document.getElementById('hackerToggleBtn').textContent = '▶ START';
    } else {
      startHacker();
      document.getElementById('hackerToggleBtn').textContent = '⏹ STOP';
    }
  }

  function clearHacker() {
    document.getElementById('hackerOutput').innerHTML = '';
  }

  // "F" and "J" key easter egg
  document.addEventListener('keydown', (e) => {
    if ((e.key === 'f' || e.key === 'F' || e.key === 'j' || e.key === 'J') && state.activePanel === 'hacker') {
      const output = document.getElementById('hackerOutput');
      const special = ['ACCESS GRANTED ✓', 'COMPILING CORE SYSTEM... DONE', 'HACK SUCCESSFUL — TARGET COMPROMISED', 'UPLOADING EXPLOIT PAYLOAD...', 'VULNERABILITY PATCHED (CVE-202X-XXXX)'];
      const line = document.createElement('div');
      line.textContent = '>>> ' + special[Math.floor(Math.random() * special.length)];
      line.style.color = 'var(--yellow)';
      line.style.fontWeight = 'bold';
      output.appendChild(line);
      output.scrollTop = output.scrollHeight;
    }
    // Panic ESC handler
    if (e.key === 'Escape') {
      state.escPressCount++;
      clearTimeout(state.escTimer);
      state.escTimer = setTimeout(() => { state.escPressCount = 0; }, 800);
      if (state.escPressCount >= 3 && document.getElementById('panicEnabled').checked) {
        triggerPanic();
        state.escPressCount = 0;
      }
    }
  });

  // ========== SPREADSHEET MODE ==========
  const formulaBank = [
    '=IFERROR(INDEX($A$1:$ZZ$99999,MATCH(1,(B2=$C$1:$C$9999)*(C2=$D$1:$D$9999),0),3),"")',
    '=SUMPRODUCT((VLOOKUP(A2:A999,$KPI!$A:$Z,7,0)*INDEX(Pivot_666!$B:$B,MATCH(B2,Pivot_666!$A:$A,0))))',
    '=IF(AND(D2>AVERAGE($D:$D),RANK(D2,$D:$D)<10),VLOOKUP(A2,Master!$A:$F,6,FALSE),"要確認")',
    '=OFFSET($A$1,MATCH(MAX(IF($B$2:$B$9999=Sheet2!$A2,$C$2:$C$9999)),INDIRECT("C2:C"&COUNTA($C:$C)),0)-1,5)',
    '=AGGREGATE(14,6,$F$2:$F$50000/($E$2:$E$50000=H2),ROW(INDIRECT("1:"&COUNTIF($E:$E,H2))))',
    '=TEXTJOIN("／",TRUE,IF(ISNUMBER(SEARCH(A2,$Z$1:$Z$999)),$Z$1:$Z$999,""))',
    '=LET(x,FILTER(A2:G9999,ISNUMBER(MATCH(A2:A9999,UNIQUE($KPI.$A:$A),0))),SORT(x,3,-1))',
  ];

  const colHeaders = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T'];
  const rowData = [
    ['部門','Q1実績','Q2実績','Q3実績','Q4予測','達成率','偏差','リスク','係数','調整値','最終KPI'],
    ['営業本部','¥142,800','¥156,200','¥138,900','=FORECAST...','98.3%','▲1.7%','Low','1.05','¥12,450','A'],
    ['開発部','¥89,400','¥91,200','¥95,800','=INDEX...','101.2%','+1.2%','Mid','0.98','¥8,200','A+'],
    ['マーケ','¥234,100','¥198,700','¥267,300','=VLOOKUP...','103.4%<overlap>
    ['マーケ','¥234,100','¥198,700','¥267,300','=VLOOKUP...','103.4%
</overlap>

<continue>
','▲2.1%','High','1.12','¥31,600','S'],
    ['HR部門','¥45,200','¥47,800','¥44,100','=SUMPRODUCT...','97.8%','▲2.2%','Low','1.00','¥4,100','B'],
    ['財務部','¥312,400','¥289,100','¥334,500','=AGGREGATE...','105.1%','+5.1%','Low','1.08','¥28,900','S+'],
    ['IT戦略室','¥67,300','¥72,100','¥68,900','=LET(x,FILTER...','99.1%','▲0.9%','Mid','1.02','¥6,700','A'],
    ['経営企画','¥189,600','¥201,400','¥195,200','=OFFSET...','102.3%','+2.3%','Low','1.06','¥18,400','A+'],
    ['法務部','¥38,100','¥41,200','¥39,800','=TEXTJOIN...','100.0%','±0.0%','Low','1.00','¥3,900','A'],
    ['購買部','¥156,700','¥148,300','¥162,100','=IFERROR...','104.2%','+4.2%','Mid','1.04','¥15,800','A'],
    ['総務部','¥52,300','¥55,100','¥51,800','=IF(AND...','98.7%','▲1.3%','Low','1.01','¥5,200','B+'],
  ];

  function buildSpreadsheet() {
    const table = document.getElementById('spreadsheetTable');
    table.innerHTML = '';
    // header row with col letters
    const headerRow = document.createElement('tr');
    const cornerTh = document.createElement('th');
    cornerTh.style.cssText = 'background:#1a1a2e;width:40px;';
    cornerTh.textContent = '';
    headerRow.appendChild(cornerTh);
    colHeaders.forEach(c => {
      const th = document.createElement('th');
      th.textContent = c;
      th.style.cssText = 'background:#1a1a2e;color:#8888aa;text-align:center;min-width:120px;';
      headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    // data rows
    rowData.forEach((row, ri) => {
      const tr = document.createElement('tr');
      // row number cell
      const rowNumTd = document.createElement('td');
      rowNumTd.textContent = ri + 1;
      rowNumTd.style.cssText = 'background:#1a1a2e;color:#8888aa;text-align:center;font-size:11px;';
      tr.appendChild(rowNumTd);
      colHeaders.forEach((_, ci) => {
        const td = document.createElement('td');
        const val = row[ci] !== undefined ? row[ci] : (Math.random() < 0.3 ? formulaBank[Math.floor(Math.random() * formulaBank.length)] : (Math.random() < 0.5 ? '¥' + (Math.floor(Math.random() * 900000) + 100000).toLocaleString() : (Math.random() < 0.5 ? (Math.random() * 200 - 100).toFixed(1) + '%' : '')));
        td.textContent = val;
        if (typeof val === 'string' && val.startsWith('=')) {
          td.style.color = '#4ecdc4';
          td.style.fontSize = '10px';
        } else if (typeof val === 'string' && val.includes('▲')) {
          td.style.color = '#ff6b6b';
        } else if (typeof val === 'string' && val.includes('+')) {
          td.style.color = '#51cf66';
        } else if (ri === 0) {
          td.style.cssText = 'background:#1a1a2e;color:#ffd43b;font-weight:bold;';
        }
        td.style.padding = '4px 8px';
        td.style.fontSize = '12px';
        tr.appendChild(td);
      });
      table.appendChild(tr);
    });

    // Add extra random rows to look massive
    for (let i = rowData.length; i < 50; i++) {
      const tr = document.createElement('tr');
      const rowNumTd = document.createElement('td');
      rowNumTd.textContent = i + 1;
      rowNumTd.style.cssText = 'background:#1a1a2e;color:#8888aa;text-align:center;font-size:11px;';
      tr.appendChild(rowNumTd);
      colHeaders.forEach(() => {
        const td = document.createElement('td');
        const r = Math.random();
        if (r < 0.2) {
          td.textContent = formulaBank[Math.floor(Math.random() * formulaBank.length)];
          td.style.color = '#4ecdc4';
          td.style.fontSize = '10px';
        } else if (r < 0.5) {
          td.textContent = '¥' + (Math.floor(Math.random() * 900000) + 10000).toLocaleString();
        } else if (r < 0.7) {
          const v = (Math.random() * 20 - 10).toFixed(1);
          td.textContent = (v > 0 ? '+' : '') + v + '%';
          td.style.color = v > 0 ? '#51cf66' : '#ff6b6b';
        } else {
          td.textContent = '';
        }
        td.style.padding = '4px 8px';
        td.style.fontSize = '12px';
        tr.appendChild(td);
      });
      table.appendChild(tr);
    }
  }

  // ========== GIT ZOMBIE ==========
  const commitMessages = [
    'Refactor quantum logic for improved coherence',
    'Fix minor typo in memory leak handler',
    'Optimize neural pathway traversal algorithm',
    'Remove deprecated blockchain scaffolding',
    'Patch edge case in recursive fibonacci cache',
    'Update README with architectural decisions',
    'Improve async handling in distributed queue',
    'Hotfix: prevent null pointer in core engine',
    'Migrate legacy codebase to microservice paradigm',
    'Add unit tests for entropy reduction module',
    'Bump dependency versions (security patch)',
    'Resolve merge conflict in production branch',
    'Implement lazy evaluation for performance gains',
    'Document undocumented dark magic in utils.js',
    'Cleanup: remove TODO comments (they were lies)',
    'Fix race condition in parallel job scheduler',
    'Refactor god object into composable modules',
    'Add circuit breaker pattern to API layer',
    'Implement exponential backoff for retry logic',
    'Optimize SQL query (was O(n²), now O(log n))',
  ];

  const gitLog = [];
  let gitZombieInterval = null;

  function formatGitTime(date) {
    return date.toLocaleString('ja-JP', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  }

  function generateCommitHash() {
    return Math.random().toString(16).substr(2, 7);
  }

  function addGitCommit(isAuto = false) {
    const now = new Date();
    // If auto, pick a time between 2am-4am today
    let commitTime = new Date(now);
    if (isAuto) {
      commitTime.setHours(2 + Math.floor(Math.random() * 2));
      commitTime.setMinutes(Math.floor(Math.random() * 60));
    }
    const msg = commitMessages[Math.floor(Math.random() * commitMessages.length)];
    const hash = generateCommitHash();
    const entry = {
      hash,
      msg,
      time: formatGitTime(commitTime),
      isAuto,
      additions: Math.floor(Math.random() * 200) + 1,
      deletions: Math.floor(Math.random() * 80),
    };
    gitLog.unshift(entry);
    if (gitLog.length > 20) gitLog.pop();
    renderGitLog();
    state.totalCommits++;
    document.getElementById('totalCommits').textContent = state.totalCommits;
  }

  function renderGitLog() {
    const container = document.getElementById('gitLogContainer');
    if (!gitLog.length) {
      container.innerHTML = '<div style="color:#666;text-align:center;padding:40px;">コミット履歴なし（まだ何もしていない）</div>';
      return;
    }
    container.innerHTML = gitLog.map(e => `
      <div class="git-entry ${e.isAuto ? 'git-auto' : ''}">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;">
          <span style="color:#f8c537;font-family:monospace;font-size:13px;">${e.hash}</span>
          <span style="color:#aaa;font-size:11px;">${e.time}</span>
          ${e.isAuto ? '<span style="background:var(--purple);color:#fff;font-size:10px;padding:2px 6px;border-radius:4px;">🧟 AUTO</span>' : '<span style="background:#2a5a2a;color:#51cf66;font-size:10px;padding:2px 6px;border-radius:4px;">👤 manual</span>'}
        </div>
        <div style="color:#e2e8f0;margin:4px 0 4px 0;font-size:13px;">${e.msg}</div>
        <div style="font-size:11px;color:#888;"><span style="color:#51cf66;">+${e.additions}</span> / <span style="color:#ff6b6b;">-${e.deletions}</span></div>
      </div>
    `).join('');
  }

  function toggleGitZombie() {
    if (state.gitZombieRunning) {
      state.gitZombieRunning = false;
      clearInterval(gitZombieInterval);
      document.getElementById('gitZombieBtn').textContent = '🧟 Git-Zombie 起動';
      document.getElementById('gitZombieBtn').style.background = 'var(--purple)';
      document.getElementById('gitZombieStatus').textContent = 'IDLE';
      document.getElementById('gitZombieStatus').style.color = 'var(--red)';
    } else {
      state.gitZombieRunning = true;
      document.getElementById('gitZombieBtn').textContent = '⏹ Git-Zombie 停止';
      document.getElementById('gitZombieBtn').style.background = 'var(--red)';
      document.getElementById('gitZombieStatus').textContent = 'ACTIVE (深夜コミット中...)';
      document.getElementById('gitZombieStatus').style.color = 'var(--green)';
      // Auto commit every 8-15 seconds for demo
      const scheduleNext = () => {
        if (!state.gitZombieRunning) return;
        const delay = (8 + Math.random() * 7) * 1000;
        gitZombieInterval = setTimeout(() => {
          if (state.gitZombieRunning) {
            addGitCommit(true);
            scheduleNext();
          }
        }, delay);
      };
      scheduleNext();
    }
  }

  // ========== BOSS DETECTOR ==========
  let bossDetectorStream = null;
  let bossDetectorAnimFrame = null;
  let bossAlertTimeout = null;
  let bossDetectorInterval = null;

  async function startBossDetector() {
    const video = document.getElementById('bossVideo');
    const canvas = document.getElementById('bossCanvas');
    const statusEl = document.getElementById('bossDetectorStatus');
    const threatEl = document.getElementById('bossThreatLevel');

    try {
      bossDetectorStream = await navigator.mediaDevices.getUserMedia({ video: true });
      video.srcObject = bossDetectorStream;
      video.play();
      statusEl.textContent = '監視中 👁';
      statusEl.style.color = 'var(--green)';
      state.bossDetectorRunning = true;
      document.getElementById('bossStartBtn').textContent = '⏹ 停止';

      // Simulate random "boss detected" events
      const simulateScan = () => {
        if (!state.bossDetectorRunning) return;
        const threat = Math.random();
        if (threat > 0.85) {
          triggerBossAlert();
        } else {
          threatEl.textContent = 'SAFE ✓';
          threatEl.style.color = 'var(--green)';
        }
        bossDetectorInterval = setTimeout(simulateScan, 2000 + Math.random() * 3000);
      };
      simulateScan();
    } catch (err) {
      statusEl.textContent = 'カメラアクセス拒否 (権限なし)';
      statusEl.style.color = 'var(--red)';
      // Still simulate without real camera
      state.bossDetectorRunning = true;
      document.getElementById('bossStartBtn').textContent = '⏹ 停止';
      const simulateScan = () => {
        if (!state.bossDetectorRunning) return;
        const threat = Math.random();
        const threatEl2 = document.getElementById('bossThreatLevel');
        if (threat > 0.85) {
          triggerBossAlert();
        } else {
          threatEl2.textContent = 'SAFE ✓ (シミュレーション)';
          threatEl2.style.color = 'var(--green)';
        }
        bossDetectorInterval = setTimeout(simulateScan, 2000 + Math.random() * 3000);
      };
      simulateScan();
    }
  }

  function stopBossDetector() {
    state.bossDetectorRunning = false;
    if (bossDetectorStream) {
      bossDetectorStream.getTracks().forEach(t => t.stop());
      bossDetectorStream = null;
    }
    clearTimeout(bossDetectorInterval);
    document.getElementById('bossStartBtn').textContent = '▶ 起動';
    document.getElementById('bossDetectorStatus').textContent = 'IDLE';
    document.getElementById('bossDetectorStatus').style.color = '#aaa';
    document.getElementById('bossThreatLevel').textContent = '---';
  }

  function triggerBossAlert() {
    const threatEl = document.getElementById('bossThreatLevel');
    const alertBox = document.getElementById('bossAlertBox');
    state.bossDetections++;
    document.getElementById('bossDetectionCount').textContent = state.bossDetections;
    threatEl.textContent = '⚠ BOSS DETECTED !!!';
    threatEl.style.color = 'var(--red)';
    alertBox.style.display = 'block';
    alertBox.style.animation = 'pulse 0.3s ease-in-out 3';
    // Auto-trigger panic visual on hacker panel
    clearTimeout(bossAlertTimeout);
    bossAlertTimeout = setTimeout(() => {
      threatEl.textContent = 'SAFE ✓';
      threatEl.style.color = 'var(--green)';
      alertBox.style.display = 'none';
    }, 3000);
  }

  function toggleBossDetector() {
    if (state.bossDetectorRunning) {
      stopBossDetector();
    } else {
      startBossDetector();
    }
  }

  // ========== SOUNDBOARD ==========
  let typingAudioCtx = null;
  let typingInterval = null;
  let sighInterval = null;

  function getAudioCtx() {
    if (!typingAudioCtx) {
      typingAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return typingAudioCtx;
  }

  function playKeystroke() {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 1200 + Math.random() * 800;
    osc.type = 'square';
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.04);
  }

  function playEnterKey() {
    const ctx = getAudioCtx();
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 800 + i * 200;
        osc.type = 'square';
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.08);
      }, i * 20);
    }
  }

  function playSigh() {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(300, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 1.5);
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 1.5);
  }

  function playTssk() {
    const ctx = getAudioCtx();
    const bufferSize = ctx.sampleRate * 0.1;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize) * 0.15;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 4000;
    source.connect(filter);
    filter.connect(ctx.destination);
    source.start();
  }

  function startTypingSound() {
    if (state.typingRunning) return;
    state.typingRunning = true;
    document.getElementById('typingBtn').textContent = '⏹ 停止';
    document.getElementById('typingBtn').style.background = 'var(--red)';
    document.getElementById('typingStatus').textContent = '🎵 猛打中...';
    document.getElementById('typingStatus').style.color = 'var(--green)';

    const scheduleKeystroke = () => {
      if (!state.typingRunning) return;
      playKeystroke();
      // Random burst typing
      const burstLen = Math.floor(Math.random() * 15) + 3;
      let count = 0;
      const burst = setInterval(() => {
        if (!state.typingRunning || count >= burstLen) { clearInterval(burst); return; }
        playKeystroke();
        count++;
      }, 60 + Math.random() * 80);
      // Enter key occasionally
      if (Math.random() < 0.3) {
        setTimeout(playEnterKey, burstLen * 80 + 100);
      }
      typingInterval = setTimeout(scheduleKeystroke, 500 + Math.random() * 2000);
    };
    scheduleKeystroke();

    // Sigh every 15 min (demo: every 45 sec)
    sighInterval = setInterval(() => {
      if (!state.typingRunning) { clearInterval(sighInterval); return; }
      if (Math.random() < 0.5) {
        playSigh();
        document.getElementById('typingStatus').textContent = '😮‍💨 ため息中...';
        setTimeout(() => {
          document.getElementById('typingStatus').textContent = '🎵 猛打中...';
        }, 2000);
      } else {
        playTssk();
        document.getElementById('typingStatus').textContent = '😤 舌打ち中...';
        setTimeout(() => {
          document.getElementById('typingStatus').textContent = '🎵 猛打中...';
        }, 500);
      }
    }, 45000);
  }

  function stopTypingSound() {
    state.typingRunning = false;
    clearTimeout(typingInterval);
    clearInterval(sighInterval);
    document.getElementById('typingBtn').textContent = '▶ 起動';
    document.getElementById('typingBtn').style.background = 'var(--green)';
    document.getElementById('typingStatus').textContent = 'IDLE';
    document.getElementById('typingStatus').style.color = '#aaa';
  }

  function toggleTyping() {
    if (state.typingRunning) stopTypingSound();
    else startTypingSound();
  }

  // ========== NODDING CAM ==========
  let noddingStream = null;
  let noddingRecording = false;
  let noddingLooping = false;
  let noddingChunks = [];
  let noddingMediaRecorder = null;
  let recordedBlob = null;
  let loopVideoEl = null;

  async function startNoddingCam() {
    const video = document.getElementById('noddingPreview');
    const statusEl = document.getElementById('noddingStatus');
    try {
      noddingStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      video.srcObject = noddingStream;
      video.play();
      statusEl.textContent = 'カメラ起動中 📷';
      statusEl.style.color = 'var(--green)';
      document.getElementById('noddingRecordBtn').disabled = false;
      document.getElementById('noddingLoopBtn').disabled = true;
    } catch (err) {
      statusEl.textContent = 'カメラ使用不可 (シミュレーションモード)';
      statusEl.style.color = 'var(--yellow)';
      document.getElementById('noddingRecordBtn').disabled = false;
    }
  }

  function startRecording() {
    if (!noddingStream) {
      // Simulation mode
      document.getElementById('noddingStatus').textContent = '📹 録画中 (3秒) — シミュレーション';
      document.getElementById('noddingStatus').style.color = 'var(--red)';
      document.getElementById('noddingRecordBtn').disabled = true;
      setTimeout(() => {
        document.getElementById('noddingStatus').textContent = '✅ 録画完了 (シミュレーション) — ループ可能';
        document.getElementById('noddingStatus').style.color = 'var(--green)';
        document.getElementById('noddingLoopBtn').disabled = false;
        document.getElementById('noddingRecordBtn').disabled = false;
        recordedBlob = 'simulation';
      }, 3000);
      return;
    }
    noddingChunks = [];
    noddingMediaRecorder = new MediaRecorder(noddingStream);
    noddingMediaRecorder.ondataavailable = e => noddingChunks.push(e.data);
    noddingMediaRecorder.onstop = () => {
      recordedBlob = new Blob(noddingChunks, { type: 'video/webm' });
      document.getElementById('noddingStatus').textContent = '✅ 録画完了 — ループ可能';
      document.getElementById('noddingStatus').style.color = 'var(--green)';
      document.getElementById('noddingLoopBtn').disabled = false;
    };
    noddingMediaRecorder.start();
    document.getElementById('noddingStatus').textContent = '📹 録画中 (3秒)...';
    document.getElementById('noddingStatus').style.color = 'var(--red)';
    document.getElementById('noddingRecordBtn').disabled = true;
    setTimeout(() => {
      if (noddingMediaRecorder && noddingMediaRecorder.state !== 'inactive') {
        noddingMediaRecorder.stop();
        document.getElementById('noddingRecordBtn').disabled = false;
      }
    }, 3000);
  }

  function toggleNoddingLoop() {
    if (noddingLooping) {
      noddingLooping = false;
      document.getElementById('noddingLoopBtn').textContent = '🔁 ループ開始';
      document.getElementById('noddingLoopBtn').style.background = 'var(--purple)';
      document.getElementById('noddingStatus').textContent = 'ループ停止';
      document.getElementById('noddingStatus').style.color = '#aaa';
      if (loopVideoEl) {
        loopVideoEl.pause();
        loopVideoEl.style.display = 'none';
      }
      document.getElementById('noddingPreview').style.display = 'block';
    } else {
      if (!recordedBlob) { alert('先に3秒録画してください'); return; }
      noddingLooping = true;
      document.getElementById('noddingLoopBtn').textContent = '⏹ ループ停止';
      document.getElementById('noddingLoopBtn').style.background = 'var(--red)';
      document.getElementById('noddingStatus').textContent = '🔁 会議偽装ループ中... 相手には固まっているように見えます';
      document.getElementById('noddingStatus').style.color = 'var(--green)';
      if (recordedBlob === 'simulation') {
        document.getElementById('noddingPreview').style.display = 'block';
        // Draw animated nodding placeholder on canvas-like div
      } else {
        const url = URL.createObjectURL(recordedBlob);
        loopVideoEl = document.createElement('video');
        loopVideoEl.src = url;
        loopVideoEl.loop = true;
        loopVideoEl.autoplay = true;
        loopVideoEl.muted = true;
        loopVideoEl.style.cssText = 'width:100%;border-radius:8px;';
        const container = document.getElementById('noddingPreview').parentNode;
        document.getElementById('noddingPreview').style.display = 'none';
        container.insertBefore(loopVideoEl, document.getElementById('noddingPreview'));
      }
    }
  }

  // ========== PANIC BUTTON ==========
  function triggerPanic() {
    state.panicCount++;
    document.getElementById('panicCount').textContent = state.panicCount;
    // Flash red overlay
    const overlay = document.getElementById('panicOverlay');
    overlay.style.display = 'flex';
    // Stop all running features
    if (state.hackerRunning) stopHacker();
    if (state.bossDetectorRunning) stopBossDetector();
    if (state.typingRunning) stopTypingSound();
    if (state.gitZombieRunning) toggleGitZombie();
    // Switch to TOEIC panel
    setTimeout(() => {
      overlay.style.display = 'none';
      showPanel('toeic');
    }, 600);
  }

  function showPanel(id) {
    state.activePanel = id;
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    const panel = document.getElementById(id + 'Panel');
    if (panel) panel.classList.add('active');
    document.querySelectorAll('.nav-btn').forEach(b => {
      if (b.dataset.panel === id) b.classList.add('active');
    });
    if (id === 'spreadsheet') buildSpreadsheet();
    if (id === 'git') renderGitLog();
  }

  // ========== STATS ==========
  function updateStats() {
    const now = Date.now();
    const elapsed = Math.floor((now - state.sessionStart) / 1000);
    const h = String(Math.floor(elapsed / 3600)).padStart(2, '0');
    const m = String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0');
    const s = String(elapsed % 60).padStart(2, '0');
    document.getElementById('sessionTimer').textContent = `${h}:${m}:${s}`;

    const savedMinutes = Math.floor(elapsed / 60) * 8; // 8x productivity multiplier lol
    document.getElementById('savedMinutes').textContent = savedMinutes;
  }
  setInterval(updateStats, 1000);

  // ========== INIT ==========
  // Nav buttons
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => showPanel(btn.dataset.panel));
  });

  // Initial panel
  showPanel('dashboard');

  // Render initial git log placeholder
  renderGitLog();

  // Dashboard quick-start buttons
  document.getElementById('quickHackerBtn').addEventListener('click', () => {
    showPanel('hacker');
    if (!state.hackerRunning) toggleHacker();
  });
  document.getElementById('quickSpreadsheetBtn').addEventListener('click', () => showPanel('spreadsheet'));
  document.getElementById('quickGitBtn').addEventListener('click', () => {
    showPanel('git');
    if (!state.gitZombieRunning) toggleGitZombie();
  });
  document.getElementById('quickTypingBtn').addEventListener('click', () => {
    showPanel('sound');
    if (!state.typingRunning) toggleTyping();
  });

  // Panic button
  document.getElementById('panicBtn').addEventListener('click', triggerPanic);
  document.getElementById('panicBtnDash').addEventListener('click', triggerPanic);

  // Hacker panel
  document.getElementById('hackerToggleBtn').addEventListener('click', toggleHacker);
document.getElementById('hackerSpeed').addEventListener('change', function() {
    state.hackerSpeed = parseInt(this.value);
    if (state.hackerRunning) {
      stopHacker();
      startHacker();
    }
  });

  // Spreadsheet panel
  document.getElementById('spreadsheetToggleBtn').addEventListener('click', () => {
    state.spreadsheetFullscreen = !state.spreadsheetFullscreen;
    const panel = document.getElementById('spreadsheetPanel');
    if (state.spreadsheetFullscreen) {
      panel.classList.add('fullscreen');
      document.getElementById('spreadsheetToggleBtn').textContent = '🗗 通常表示';
    } else {
      panel.classList.remove('fullscreen');
      document.getElementById('spreadsheetToggleBtn').textContent = '⛶ フルスクリーン';
    }
  });
  document.getElementById('spreadsheetRegenBtn').addEventListener('click', buildSpreadsheet);

  // Git panel
  document.getElementById('gitZombieToggleBtn').addEventListener('click', toggleGitZombie);
  document.getElementById('gitManualCommitBtn').addEventListener('click', () => {
    addCommit();
    renderGitLog();
  });

  // Sound panel
  document.getElementById('typingToggleBtn').addEventListener('click', toggleTyping);
  document.getElementById('typingVolume').addEventListener('input', function() {
    state.typingVolume = parseFloat(this.value);
    document.getElementById('typingVolumeVal').textContent = Math.round(this.value * 100) + '%';
  });

  // Meeting panel
  document.getElementById('meetingToggleBtn').addEventListener('click', toggleMeeting);

  // Boss panel
  document.getElementById('bossToggleBtn').addEventListener('click', toggleBossDetector);

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      state.escCount++;
      clearTimeout(state.escTimer);
      state.escTimer = setTimeout(() => { state.escCount = 0; }, 1500);
      if (state.escCount >= 3) {
        state.escCount = 0;
        triggerPanic();
      }
    }
    // F & J hacker keys
    if ((e.key === 'f' || e.key === 'j' || e.key === 'F' || e.key === 'J') && state.hackerRunning) {
      const msgs = ['ACCESS GRANTED', 'COMPILING CORE SYSTEM...', 'QUANTUM ENTANGLEMENT OK', 'BYPASSING FIREWALL...', 'SUDO ACCESS ACQUIRED', 'ROOT ESCALATION COMPLETE'];
      const msg = msgs[Math.floor(Math.random() * msgs.length)];
      const line = document.createElement('div');
      line.style.color = '#ff0';
      line.style.fontWeight = 'bold';
      line.style.fontSize = '1.1em';
      line.textContent = '>>> ' + msg + ' <<<';
      const console_ = document.getElementById('hackerConsole');
      if (console_) {
        console_.appendChild(line);
        console_.scrollTop = console_.scrollHeight;
      }
    }
  });

  // Continuous productivity score updater
  setInterval(() => {
    state.productivityScore = Math.min(9999, state.productivityScore + Math.floor(Math.random() * 47 + 3));
    const el = document.getElementById('productivityScore');
    if (el) el.textContent = state.productivityScore.toLocaleString();

    // Update feature status badges on dashboard
    const features = [
      { id: 'statusHacker', running: state.hackerRunning },
      { id: 'statusGit', running: state.gitZombieRunning },
      { id: 'statusTyping', running: state.typingRunning },
      { id: 'statusMeeting', running: state.meetingRunning },
      { id: 'statusBoss', running: state.bossDetectorRunning },
    ];
    features.forEach(f => {
      const el = document.getElementById(f.id);
      if (el) {
        el.textContent = f.running ? '稼働中' : '停止中';
        el.className = 'feature-status ' + (f.running ? 'running' : 'stopped');
      }
    });
  }, 2000);