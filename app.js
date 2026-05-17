// ══════════════════════════════════════
//  TRANSLATIONS
// ══════════════════════════════════════
const T = {
  fr: {
    tab_train:        "Entraînement",
    tab_words:        "Mots",
    tab_stats:        "Stats",
    score_correct:    "Corrects",
    score_wrong:      "Erreurs",
    score_total:      "Total",
    score_streak:     "Série",
    score_pct:        "Score",
    btn_speak:        "Écouter",
    btn_hint:         "Indice",
    btn_check:        "Vérifier",
    btn_start:        "Commencer",
    btn_next:         "Suivant",
    btn_reset_session:"Réinitialiser",
    btn_clear_saved:  "Effacer sauvegarde",
    btn_add:          "Ajouter",
    btn_add_all:      "Tout ajouter",
    btn_clear:        "Effacer",
    btn_clear_all:    "Tout effacer",
    btn_export:       "⬆ Exporter",
    select_list_placeholder: "📂 Charger une liste…",
    btn_retry:        "J'ai compris → Mot suivant",
    add_words:        "Ajouter des mots",
    bulk_add:         "Ajouter plusieurs mots (un par ligne) :",
    word_list:        "Liste des mots",
    pool_status:      "État de la liste",
    session_stats:    "Statistiques de session",
    correct_words:    "Mots réussis",
    wrong_words:      "Mots à retravailler",
    status_ready:     "Prêt ?",
    status_listen:    "Écoute bien !",
    result_correct:   "🎉 Bravo, c'est correct !",
    result_wrong:     "😕 Pas tout à fait...",
    correct_answer:   "Le mot était : ",
    attempts:         "essai(s)",
    no_words:         "Aucun mot dans la liste. Va dans l'onglet Mots pour en ajouter !",
    list_done:        "🏅 Liste terminée ! Recommence ?",
    loaded:           "📂 Chargé !",
    exported:         "⬆ Copié dans le presse-papier !",
    confirm_clear:    "Effacer tous les mots ?",
    words_left:       "mots restants",
    input_placeholder:"Tape le mot ici",
    add_placeholder:  "nouveau mot",
    mode_label:       "Mode",
    mode_typing:      "Clavier",
    mode_paper:       "Papier",
    mode_typing_desc: "Tape le mot au clavier",
    mode_paper_desc:  "Écris le mot sur papier",
    paper_prompt:     "As-tu bien écrit le mot sur ton papier ?",
    paper_correct:    "Correct !",
    paper_wrong:      "Erreur",
    voice_lang_label: "Langue des mots",
    ui_lang_label:    "Interface",
  },
  en: {
    tab_train:        "Training",
    tab_words:        "Words",
    tab_stats:        "Stats",
    score_correct:    "Correct",
    score_wrong:      "Errors",
    score_total:      "Total",
    score_streak:     "Streak",
    score_pct:        "Score",
    btn_speak:        "Listen",
    btn_hint:         "Hint",
    btn_check:        "Check",
    btn_start:        "Start",
    btn_next:         "Next",
    btn_reset_session:"Reset",
    btn_clear_saved:  "Clear save",
    btn_add:          "Add",
    btn_add_all:      "Add all",
    btn_clear:        "Clear",
    btn_clear_all:    "Clear all",
    btn_export:       "⬆ Export",
    select_list_placeholder: "📂 Load a list…",
    btn_retry:        "Got it → Next word",
    add_words:        "Add words",
    bulk_add:         "Add multiple words (one per line):",
    word_list:        "Word list",
    pool_status:      "List status",
    session_stats:    "Session statistics",
    correct_words:    "Correct words",
    wrong_words:      "Words to practice",
    status_ready:     "Ready?",
    status_listen:    "Listen carefully!",
    result_correct:   "🎉 Correct, well done!",
    result_wrong:     "😕 Not quite right...",
    correct_answer:   "The word was: ",
    attempts:         "attempt(s)",
    no_words:         "No words in the list. Go to the Words tab to add some!",
    list_done:        "🏅 List complete! Start again?",
    loaded:           "📂 Loaded!",
    exported:         "⬆ Copied to clipboard!",
    confirm_clear:    "Clear all words?",
    words_left:       "words left",
    input_placeholder:"Type the word here",
    add_placeholder:  "new word",
    mode_label:       "Mode",
    mode_typing:      "Keyboard",
    mode_paper:       "Paper",
    mode_typing_desc: "Type the word on keyboard",
    mode_paper_desc:  "Write the word on paper",
    paper_prompt:     "Did you write the word correctly on your paper?",
    paper_correct:    "Correct!",
    paper_wrong:      "Wrong",
    voice_lang_label: "Word language",
    ui_lang_label:    "Interface",
  }
};

// ══════════════════════════════════════
//  STATE
// ══════════════════════════════════════
let lang         = 'fr';
let voiceLang    = 'fr';
let trainingMode = 'typing';
let words        = [];
let pool         = [];
let currentWord  = null;
let currentState = 'idle';
let session      = { ok: 0, fail: 0, streak: 0, history: [] };
let hintLevel    = 0;
let nextWordTimer = null;
let notifTimer   = null;
const speechSynth = window.speechSynthesis;

// ── Add more lists here: { label, file } ──────────────────────────────────────
const PREDEFINED_LISTS = [
  { label: 'FR - Liste générale',  file: 'words-FR.txt' },
];
// ──────────────────────────────────────────────────────────────────────────────

const STORAGE_WORDS      = 'ortho_words';
const STORAGE_SESSION    = 'ortho_session';
const STORAGE_LANG       = 'ortho_lang';
const STORAGE_VOICE_LANG = 'ortho_voice_lang';
const STORAGE_MODE       = 'ortho_mode';
const STORAGE_VOICE_FR   = 'ortho_voice_name_fr';
const STORAGE_VOICE_EN   = 'ortho_voice_name_en';

let manualVoiceName = { fr: null, en: null };

// ══════════════════════════════════════
//  INIT
// ══════════════════════════════════════
function init() {
  lang         = localStorage.getItem(STORAGE_LANG)       || 'fr';
  voiceLang    = localStorage.getItem(STORAGE_VOICE_LANG) || 'fr';
  trainingMode = localStorage.getItem(STORAGE_MODE)       || 'typing';
  loadManualVoices();
  populateListSelector();
  applyLang();
  applyVoiceLang();

  const savedWords = localStorage.getItem(STORAGE_WORDS);
  if (savedWords) {
    words = JSON.parse(savedWords);
  } else {
    loadPredefinedList(PREDEFINED_LISTS[0].file);
  }

  const savedSession = localStorage.getItem(STORAGE_SESSION);
  if (savedSession) {
    session = JSON.parse(savedSession).session || session;
    pool = words.filter(w => !w.correct).map(w => w.word);
  } else {
    buildPool();
  }

  renderWords();
  updateScoreUI();
  updateStats();
  setTrainStatus(t('status_ready'));
  updateMiniStatus();
}

function buildPool() {
  pool = words.filter(w => !w.correct).map(w => w.word);
}

// ══════════════════════════════════════
//  WORD PARSER
// ══════════════════════════════════════
function parseWord(raw) {
  const s = raw.trim();
  const preMatch = s.match(/^(\([^)]+\)\s*)/);
  const prefix   = preMatch ? preMatch[1].trim() : '';
  const rest     = s.slice(preMatch ? preMatch[1].length : 0);
  const sufMatch = rest.match(/(\s*\([^)]+\))$/);
  const suffix   = sufMatch ? sufMatch[1].trim() : '';
  const toSpell  = rest.slice(0, rest.length - (sufMatch ? sufMatch[1].length : 0)).trim();
  const spoken   = s.replace(/[()]/g, '').replace(/\s+/g, ' ').trim();
  return { toSpell, prefix, suffix, spoken };
}

function showWordContext(parsed) {
  const display = document.getElementById('wordDisplay');
  display.innerHTML = '';
  if (!parsed.prefix && !parsed.suffix) {
    display.classList.add('word-hidden');
    return;
  }
  if (parsed.prefix) {
    const s = document.createElement('span');
    s.style.color = 'var(--text-muted)';
    s.textContent = parsed.prefix + ' ';
    display.appendChild(s);
  }
  const blanks = document.createElement('span');
  blanks.textContent = Array(parsed.toSpell.length).fill('_').join(' ');
  display.appendChild(blanks);
  if (parsed.suffix) {
    const s = document.createElement('span');
    s.style.color = 'var(--text-muted)';
    s.textContent = ' ' + parsed.suffix;
    display.appendChild(s);
  }
  display.classList.remove('word-hidden');
}

// ══════════════════════════════════════
//  LANGUAGE
// ══════════════════════════════════════
function t(key) { return T[lang][key] || key; }

function setLang(l) {
  lang = l;
  localStorage.setItem(STORAGE_LANG, l);
  applyLang();
}

function applyLang() {
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-lang]').forEach(el => {
    el.classList.toggle('active', el.dataset.lang === lang);
  });
  document.querySelectorAll('[data-t]').forEach(el => {
    el.textContent = t(el.dataset.t);
  });
  applyVoiceLang();
  applyMode();
  document.getElementById('spellingInput').placeholder = t('input_placeholder');
}

function setVoiceLang(l) {
  voiceLang = l;
  localStorage.setItem(STORAGE_VOICE_LANG, l);
  applyVoiceLang();
}

function applyVoiceLang() {
  document.querySelectorAll('[data-vlang]').forEach(el => {
    el.classList.toggle('active', el.dataset.vlang === voiceLang);
  });
  document.getElementById('voiceLangLabel').textContent = t('voice_lang_label');
}

// ══════════════════════════════════════
//  TRAINING MODE
// ══════════════════════════════════════
function setMode(mode) {
  trainingMode = mode;
  localStorage.setItem(STORAGE_MODE, mode);
  applyMode();
  if (currentWord) {
    document.getElementById('spellingInput').value     = '';
    document.getElementById('spellingInput').className = 'spelling-input';
    document.getElementById('paperPrompt').style.display  = 'none';
    document.getElementById('resultBanner').className  = 'result-banner';
    showWordContext(parseWord(currentWord));
    document.getElementById('btnCheck').disabled       = false;
    document.getElementById('btnRetry').style.display  = 'none';
    currentState = 'spoken';
  }
}

function applyMode() {
  const isTyping = trainingMode === 'typing';
  document.getElementById('modeTyping').classList.toggle('active', isTyping);
  document.getElementById('modePaper').classList.toggle('active', !isTyping);
  document.getElementById('spellingInput').style.display = isTyping ? 'block' : 'none';
  document.getElementById('btnCheck').style.display      = 'inline-flex';
  document.getElementById('btnHint').style.display       = isTyping ? 'inline-flex' : 'none';
  document.getElementById('modeDesc').textContent        = t(isTyping ? 'mode_typing_desc' : 'mode_paper_desc');
  if (!currentWord) document.getElementById('paperPrompt').style.display = 'none';
}

// ══════════════════════════════════════
//  SPEECH
// ══════════════════════════════════════
function speakWord(word) {
  speechSynth.cancel();
  const langKey  = voiceLang;
  const langCode = langKey === 'fr' ? 'fr-FR' : 'en-GB';

  const doSpeak = () => {
    const voices = speechSynth.getVoices();
    const utt    = new SpeechSynthesisUtterance(word);
    utt.rate = 0.82;

    const savedName = manualVoiceName[langKey];
    if (savedName) {
      const v = voices.find(v => v.name === savedName);
      if (v) { utt.voice = v; utt.lang = v.lang; speechSynth.speak(utt); return; }
    }

    const candidates = voices.filter(v => v.lang.startsWith(langKey === 'fr' ? 'fr' : 'en'));
    const pick = candidates.find(v => v.localService) || candidates[0] || null;
    if (pick) { utt.voice = pick; utt.lang = pick.lang; }
    else      { utt.lang = langCode; }

    speechSynth.speak(utt);
  };

  if (speechSynth.getVoices().length > 0) {
    doSpeak();
  } else {
    speechSynth.onvoiceschanged = () => { speechSynth.onvoiceschanged = null; doSpeak(); };
  }
}

function speakCurrent() {
  if (currentWord) speakWord(parseWord(currentWord).spoken);
}

// ══════════════════════════════════════
//  TABS
// ══════════════════════════════════════
function switchTab(tab) {
  document.querySelectorAll('.tab-panel').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
  document.getElementById('tab-' + tab).classList.add('active');
  document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
  if (tab === 'stats') { updateStats(); renderVoiceList(); }
}

// ══════════════════════════════════════
//  WORD MANAGEMENT
// ══════════════════════════════════════
function addWord(raw) {
  const w = raw.trim().toLowerCase();
  if (!w) return false;
  if (words.find(x => x.word === w)) return false;
  words.push({ word: w, attempts: 0, correct: false });
  pool.push(w);
  saveWords();
  renderWords();
  return true;
}

function addBulk() {
  const lines = document.getElementById('bulkInput').value.split('\n');
  let count = 0;
  lines.forEach(l => { if (addWord(l)) count++; });
  document.getElementById('bulkInput').value = '';
  updateMiniStatus();
  showNotif(`+${count} ${lang === 'fr' ? 'mots ajoutés' : 'words added'}`);
}

function deleteWord(word) {
  words = words.filter(w => w.word !== word);
  pool  = pool.filter(w => w !== word);
  if (currentWord === word) { currentWord = null; resetTrainUI(); }
  saveWords();
  renderWords();
  updateMiniStatus();
}

function clearAllWords() {
  if (!confirm(t('confirm_clear'))) return;
  words = []; pool = [];
  currentWord = null;
  resetTrainUI();
  saveWords();
  renderWords();
  updateMiniStatus();
}

function saveWords() {
  localStorage.setItem(STORAGE_WORDS, JSON.stringify(words));
}

function populateListSelector() {
  const sel = document.getElementById('predefinedListSelect');
  PREDEFINED_LISTS.forEach(lst => {
    const opt = document.createElement('option');
    opt.value = lst.file;
    opt.textContent = lst.label;
    sel.appendChild(opt);
  });
}

async function loadPredefinedList(file) {
  if (!file) return;
  document.getElementById('predefinedListSelect').value = '';
  try {
    const res = await fetch(file);
    if (!res.ok) throw new Error();
    const text = await res.text();
    words = []; pool = [];
    text.split('\n').forEach(l => addWord(l.trim()));
    buildPool();
    renderWords();
    updateMiniStatus();
    showNotif(t('loaded'));
  } catch (e) {
    showNotif('⚠️ ' + file + ' introuvable');
  }
}

function exportWords() {
  navigator.clipboard.writeText(words.map(w => w.word).join('\n'))
    .then(() => showNotif(t('exported')));
}

function renderWords() {
  const container = document.getElementById('wordChips');
  document.getElementById('wordCount').textContent =
    `${words.length} ${lang === 'fr' ? 'mots' : 'words'}`;

  if (words.length === 0) {
    container.innerHTML = `<div class="empty-state"><div class="emoji">📝</div>
      <p>${lang === 'fr' ? 'Aucun mot pour l\'instant.' : 'No words yet.'}</p></div>`;
    return;
  }
  container.innerHTML = '';
  words.forEach(w => {
    const cls  = w.correct ? 'chip chip-ok'
               : w.attempts > 0 ? 'chip chip-fail'
               : 'chip chip-default';
    const icon = w.correct ? '✅' : w.attempts > 0 ? '❌' : '';
    const chip = document.createElement('div');
    chip.className = cls;
    chip.innerHTML = `${icon ? icon + ' ' : ''}${w.word}
      <button class="chip-delete" onclick="deleteWord('${w.word.replace(/'/g, "\\'")}')">✕</button>`;
    container.appendChild(chip);
  });
}

// ══════════════════════════════════════
//  TRAINING
// ══════════════════════════════════════
function nextWord() {
  clearTimeout(nextWordTimer);
  nextWordTimer = null;
  if (words.length === 0) { showNotif(t('no_words')); return; }

  if (pool.length === 0) {
    if (words.every(w => w.correct)) {
      setTrainStatus(t('list_done'));
      document.getElementById('btnNext').textContent = '🔄 ' + t('btn_start');
      words.forEach(w => { w.correct = false; w.attempts = 0; });
      saveWords();
      buildPool();
      return;
    }
    buildPool();
  }

  currentWord  = pool[Math.floor(Math.random() * pool.length)];
  hintLevel    = 0;
  currentState = 'spoken';

  const parsed = parseWord(currentWord);
  showWordContext(parsed);
  document.getElementById('hintRow').textContent          = '';
  document.getElementById('spellingInput').value          = '';
  document.getElementById('spellingInput').className      = 'spelling-input';
  document.getElementById('spellingInput').disabled       = false;
  document.getElementById('resultBanner').className       = 'result-banner';
  document.getElementById('btnSpeak').disabled            = false;
  document.getElementById('btnHint').disabled             = false;
  document.getElementById('btnCheck').disabled            = false;
  document.getElementById('btnRetry').style.display       = 'none';
  document.getElementById('btnNextLabel').textContent     = t('btn_next');

  setTrainStatus(t('status_listen'));
  speakWord(parsed.spoken);
  if (trainingMode === 'typing') document.getElementById('spellingInput').focus();
  updateMiniStatus();
}

function showHint() {
  if (!currentWord) return;
  const { toSpell } = parseWord(currentWord);
  hintLevel = Math.min(hintLevel + 1, toSpell.length);
  document.getElementById('hintRow').textContent =
    toSpell.slice(0, hintLevel).split('').join(' ') +
    ' ' + '_ '.repeat(toSpell.length - hintLevel).trim();
}

function retryWord() {
  document.getElementById('btnRetry').style.display = 'none';
  nextWord();
}

function checkSpelling() {
  if (!currentWord || currentState !== 'spoken') return;

  if (trainingMode === 'paper') {
    revealWord(currentWord);
    document.getElementById('paperPrompt').style.display = 'block';
    document.getElementById('btnCheck').disabled = true;
    return;
  }

  const { toSpell } = parseWord(currentWord);
  const input       = document.getElementById('spellingInput').value.trim().toLowerCase();
  const isCorrect   = input === toSpell;

  const rec = words.find(w => w.word === currentWord);
  if (rec) { rec.attempts++; if (isCorrect) rec.correct = true; }
  saveWords();

  if (isCorrect) {
    session.ok++;
    session.streak++;
    pool = pool.filter(w => w !== currentWord);
    showResult(true);
    updateScoreUI();
    launchConfetti();
    nextWordTimer = setTimeout(() => nextWord(), 1600);
  } else {
    session.fail++;
    session.streak = 0;
    showResult(false);
    updateScoreUI();
    revealWord(currentWord);
    document.getElementById('btnRetry').style.display = 'inline-flex';
  }

  session.history.push({ word: currentWord, correct: isCorrect });
  saveSession();
  currentState = 'answered';
  document.getElementById('btnCheck').disabled = true;
  renderWords();
  updateStats();
}

function paperResult(isCorrect) {
  if (!currentWord || currentState !== 'spoken') return;
  document.getElementById('paperPrompt').style.display = 'none';

  const rec = words.find(w => w.word === currentWord);
  if (rec) { rec.attempts++; if (isCorrect) rec.correct = true; }
  saveWords();

  if (isCorrect) {
    session.ok++;
    session.streak++;
    pool = pool.filter(w => w !== currentWord);
    revealWord(currentWord);
    showResult(true);
    updateScoreUI();
    launchConfetti();
    nextWordTimer = setTimeout(() => nextWord(), 1800);
  } else {
    session.fail++;
    session.streak = 0;
    updateScoreUI();
    nextWordTimer = setTimeout(() => nextWord(), 1800);
  }

  session.history.push({ word: currentWord, correct: isCorrect });
  saveSession();
  currentState = 'answered';
  renderWords();
  updateStats();
}

function showResult(correct) {
  const inp    = document.getElementById('spellingInput');
  const banner = document.getElementById('resultBanner');
  if (trainingMode === 'typing') inp.className = 'spelling-input ' + (correct ? 'correct' : 'wrong');
  banner.className = 'result-banner ' + (correct ? 'correct' : 'wrong');
  banner.textContent = correct
    ? t('result_correct')
    : t('result_wrong') + ' ' + t('correct_answer') + '"' + parseWord(currentWord).toSpell + '"';
  setTrainStatus(correct ? '✅' : '❌');
}

function revealWord(word) {
  const { toSpell, prefix, suffix } = parseWord(word);
  const display = document.getElementById('wordDisplay');
  display.innerHTML = '';
  if (prefix) {
    const s = document.createElement('span');
    s.style.color = 'var(--text-muted)';
    s.textContent = prefix + ' ';
    display.appendChild(s);
  }
  toSpell.split('').forEach((ch, i) => {
    const span = document.createElement('span');
    span.className = 'word-char';
    span.style.animationDelay = (i * 60) + 'ms';
    span.textContent = ch;
    display.appendChild(span);
  });
  if (suffix) {
    const s = document.createElement('span');
    s.style.color = 'var(--text-muted)';
    s.textContent = ' ' + suffix;
    display.appendChild(s);
  }
  display.classList.remove('word-hidden');
}

function resetTrainUI() {
  currentState = 'idle';
  document.getElementById('wordDisplay').innerHTML         = '';
  document.getElementById('wordDisplay').classList.add('word-hidden');
  document.getElementById('spellingInput').value           = '';
  document.getElementById('spellingInput').className       = 'spelling-input';
  document.getElementById('resultBanner').className        = 'result-banner';
  document.getElementById('hintRow').textContent           = '';
  document.getElementById('btnSpeak').disabled             = true;
  document.getElementById('btnHint').disabled              = true;
  document.getElementById('btnCheck').disabled             = true;
  document.getElementById('btnRetry').style.display        = 'none';
  document.getElementById('paperPrompt').style.display     = 'none';
  document.getElementById('btnNextLabel').textContent      = t('btn_start');
  setTrainStatus(t('status_ready'));
}

function setTrainStatus(msg) {
  document.getElementById('trainStatus').textContent = msg;
}

// ══════════════════════════════════════
//  SESSION / SCORE
// ══════════════════════════════════════
function updateScoreUI() {
  document.getElementById('scoreOk').textContent     = session.ok;
  document.getElementById('scoreFail').textContent   = session.fail;
  document.getElementById('scoreTotal').textContent  = session.ok + session.fail;
  document.getElementById('scoreStreak').textContent = session.streak;
  const done = words.filter(w => w.correct).length;
  const pct  = words.length > 0 ? Math.round(done / words.length * 100) : 0;
  document.getElementById('progressBar').style.width = pct + '%';
}

function saveSession() {
  localStorage.setItem(STORAGE_SESSION, JSON.stringify({ session, pool }));
}

function resetSession() {
  clearTimeout(nextWordTimer);
  nextWordTimer = null;
  session = { ok: 0, fail: 0, streak: 0, history: [] };
  words.forEach(w => { w.correct = false; w.attempts = 0; });
  saveWords();
  buildPool();
  currentWord = null;
  resetTrainUI();
  updateScoreUI();
  updateStats();
  renderWords();
  updateMiniStatus();
  localStorage.removeItem(STORAGE_SESSION);
}

function clearSavedSession() {
  localStorage.removeItem(STORAGE_SESSION);
  showNotif(lang === 'fr' ? 'Sauvegarde effacée' : 'Save cleared');
}

// ══════════════════════════════════════
//  STATS
// ══════════════════════════════════════
function updateStats() {
  document.getElementById('statOk').textContent   = session.ok;
  document.getElementById('statFail').textContent = session.fail;
  const tot = session.ok + session.fail;
  document.getElementById('statPct').textContent  = tot > 0 ? Math.round(session.ok / tot * 100) + '%' : '—';

  const correct = words.filter(w => w.correct);
  const wrong   = words.filter(w => !w.correct && w.attempts > 0);
  const none    = `<div style="color:var(--text-muted);font-size:0.9rem;padding:6px;">${lang === 'fr' ? 'Aucun encore' : 'None yet'}</div>`;

  document.getElementById('correctList').innerHTML = correct.length === 0 ? none :
    correct.map(w => `<div class="stat-row">
      <span class="stat-word">${w.word}</span>
      <span class="stat-badge badge-attempt">${w.attempts} ${t('attempts')}</span>
      <span class="stat-badge badge-ok">✅</span></div>`).join('');

  document.getElementById('wrongList').innerHTML = wrong.length === 0 ? none :
    wrong.map(w => `<div class="stat-row">
      <span class="stat-word">${w.word}</span>
      <span class="stat-badge badge-attempt">${w.attempts} ${t('attempts')}</span>
      <span class="stat-badge badge-fail">❌</span></div>`).join('');
}

function updateMiniStatus() {
  const card = document.getElementById('miniStatusCard');
  if (words.length === 0) { card.style.display = 'none'; return; }
  card.style.display = '';
  const done = words.filter(w => w.correct).length;
  document.getElementById('miniStatusContent').innerHTML = `
    <div style="display:flex;gap:10px;flex-wrap:wrap;font-size:0.9rem;font-weight:700;">
      <span style="color:var(--primary)">📚 ${words.length} ${lang === 'fr' ? 'mots' : 'words'}</span>
      <span style="color:var(--success)">✅ ${done} ${lang === 'fr' ? 'maîtrisés' : 'mastered'}</span>
      <span style="color:var(--secondary-dark)">🎯 ${pool.length} ${t('words_left')}</span>
    </div>`;
}

// ══════════════════════════════════════
//  CONFETTI
// ══════════════════════════════════════
const COLORS = ['#ff6b35','#4ecdc4','#ffe066','#a78bfa','#51cf66','#ff6b6b','#74b9ff'];
function launchConfetti() {
  const wrap = document.getElementById('confettiWrap');
  for (let i = 0; i < 30; i++) {
    const el = document.createElement('div');
    el.className = 'confetti-piece';
    el.style.left            = Math.random() * 100 + 'vw';
    el.style.background      = COLORS[Math.floor(Math.random() * COLORS.length)];
    el.style.width           = (8 + Math.random() * 8) + 'px';
    el.style.height          = (8 + Math.random() * 8) + 'px';
    el.style.borderRadius    = Math.random() > 0.5 ? '50%' : '2px';
    el.style.animationDuration = (1 + Math.random() * 1.2) + 's';
    el.style.animationDelay  = (Math.random() * 0.4) + 's';
    wrap.appendChild(el);
    setTimeout(() => el.remove(), 2000);
  }
}

// ══════════════════════════════════════
//  NOTIFICATION
// ══════════════════════════════════════
function showNotif(msg) {
  const el = document.getElementById('notif');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(notifTimer);
  notifTimer = setTimeout(() => el.classList.remove('show'), 2000);
}

// ══════════════════════════════════════
//  VOICE DIAGNOSTICS
// ══════════════════════════════════════
function loadManualVoices() {
  manualVoiceName.fr = localStorage.getItem(STORAGE_VOICE_FR) || null;
  manualVoiceName.en = localStorage.getItem(STORAGE_VOICE_EN) || null;
}

function renderVoiceList() {
  const container = document.getElementById('voiceList');
  if (!container) return;
  const voices = speechSynth.getVoices();
  if (!voices.length) {
    container.innerHTML = '<div style="color:var(--text-muted);font-size:0.85rem;">Aucune voix trouvée. Essayez de recharger la page.</div>';
    return;
  }
  manualVoiceName.fr = localStorage.getItem(STORAGE_VOICE_FR) || null;
  manualVoiceName.en = localStorage.getItem(STORAGE_VOICE_EN) || null;

  container.innerHTML = '';
  voices.forEach(v => {
    const isFr = v.lang.startsWith('fr');
    const isEn = v.lang.startsWith('en');
    const tag  = isFr ? '🇫🇷' : isEn ? '🇬🇧' : '🌐';
    const isSelectedFr = v.name === manualVoiceName.fr;
    const isSelectedEn = v.name === manualVoiceName.en;

    const row = document.createElement('div');
    row.style.cssText = 'display:flex;align-items:center;gap:8px;flex-wrap:wrap;';
    row.innerHTML = `
      <div style="flex:1;padding:6px 10px;border-radius:8px;border:1.5px solid var(--border);font-size:0.8rem;font-weight:700;
        ${isFr ? 'background:#e6faf0;border-color:#51cf66;' : isEn ? 'background:#e8f4ff;border-color:#74b9ff;' : ''}">
        ${tag} <span style="color:var(--text)">${v.name}</span>
        <span style="color:var(--text-muted);font-weight:400;margin-left:4px;">${v.lang}${v.localService ? ' · local' : ' · réseau'}</span>
        ${isSelectedFr ? ' <span style="color:#1a7a36;font-size:0.75rem;">✅ voix FR choisie</span>' : ''}
        ${isSelectedEn ? ' <span style="color:#1a55a0;font-size:0.75rem;">✅ voix EN choisie</span>' : ''}
      </div>
      <button class="btn btn-ghost btn-sm" style="font-size:0.75rem;padding:4px 10px;"
        onclick="testVoice('${v.name.replace(/'/g, "\\'")}')">▶ Tester</button>
      ${isFr ? `<button class="btn btn-sm" style="font-size:0.75rem;padding:4px 10px;background:var(--success);color:white;"
        onclick="selectVoice('${v.name.replace(/'/g, "\\'")}','fr')">✓ Utiliser FR</button>` : ''}
      ${isEn ? `<button class="btn btn-sm" style="font-size:0.75rem;padding:4px 10px;background:#4a90e2;color:white;"
        onclick="selectVoice('${v.name.replace(/'/g, "\\'")}','en')">✓ Utiliser EN</button>` : ''}`;
    container.appendChild(row);
  });
  updateSelectedVoiceInfo();
}

function testVoice(name) {
  const voice = speechSynth.getVoices().find(v => v.name === name);
  if (!voice) return;
  speechSynth.cancel();
  const utt = new SpeechSynthesisUtterance('porte');
  utt.voice = voice; utt.lang = voice.lang; utt.rate = 0.82;
  speechSynth.speak(utt);
}

function selectVoice(name, langKey) {
  manualVoiceName[langKey] = name;
  localStorage.setItem(langKey === 'fr' ? STORAGE_VOICE_FR : STORAGE_VOICE_EN, name);
  renderVoiceList();
  showNotif('✅ Voix ' + langKey.toUpperCase() + ' : ' + name);
}

function updateSelectedVoiceInfo() {
  const el = document.getElementById('selectedVoiceInfo');
  if (!el) return;
  el.innerHTML = `🇫🇷 Voix FR : <strong>${manualVoiceName.fr || '(auto)'}</strong>
    &nbsp;|&nbsp; 🇬🇧 Voix EN : <strong>${manualVoiceName.en || '(auto)'}</strong>`;
}

// ══════════════════════════════════════
//  KEYBOARD
// ══════════════════════════════════════
document.getElementById('spellingInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    if (!document.getElementById('btnCheck').disabled) checkSpelling();
    else if (currentState === 'answered') nextWord();
  }
});

// ══════════════════════════════════════
//  START
// ══════════════════════════════════════
init();
