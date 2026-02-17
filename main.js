let currentReciter = 'minshawi';
let currentSurah = null;
let currentAyah = 1;
let currentAyahData = null;
let audioElement = null;
let surahsList = [];
let currentGlobalAyah = null;

document.addEventListener('DOMContentLoaded', async function() {
    currentReciter = 'minshawi';
    await loadSurahs();
    loadReciters();
    setupEventListeners();
});

async function loadSurahs() {
    try {
        const response = await fetch(QuranConfig.apis.surahs());
        const data = await response.json();
        if (data.data) {
            surahsList = data.data;
            populateSurahSelect();
        }
    } catch (error) {
        surahsList = [];
    }
}

function populateSurahSelect() {
    const surahSelect = document.getElementById('surahSelect');
    if (!surahSelect) return;
    surahSelect.innerHTML = '<option value="">-- اختر السورة --</option>';
    surahsList.forEach(surah => {
        const option = document.createElement('option');
        option.value = surah.number;
        option.textContent = `${surah.number}. ${surah.name} (${surah.englishName}) - ${surah.numberOfAyahs} آية`;
        surahSelect.appendChild(option);
    });
    surahSelect.addEventListener('change', function() {
        const n = parseInt(this.value);
        if (n) { updateSurahInfo(n); document.getElementById('ayahInSurah').max = getSurahAyahCount(n); document.getElementById('ayahInSurah').value = 1; updateAyahRange(n); }
        else hideSurahInfo();
    });
}

function updateSurahInfo(n) {
    const surah = surahsList.find(s => s.number === n);
    if (!surah) return;
    const el = document.getElementById('surahInfo');
    el.innerHTML = `${surah.englishName} - ${surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'} | آيات: ${surah.numberOfAyahs}`;
    el.style.display = 'block';
    updateAyahRange(n);
}

function updateAyahRange(n) {
    const surah = surahsList.find(s => s.number === n);
    if (!surah) return;
    document.getElementById('maxAyah').textContent = surah.numberOfAyahs;
    document.getElementById('ayahRange').style.display = 'block';
}

function hideSurahInfo() {
    document.getElementById('surahInfo').style.display = 'none';
    document.getElementById('ayahRange').style.display = 'none';
}

function loadReciters() {
    const sel = document.getElementById('reciterSelect');
    if (!sel) return;
    sel.innerHTML = '';
    Object.values(QuranConfig.reciters).forEach(r => {
        const opt = document.createElement('option');
        opt.value = r.id;
        opt.textContent = `${r.name} - ${r.style}`;
        sel.appendChild(opt);
    });
    sel.value = currentReciter;
    sel.addEventListener('change', function() {
        currentReciter = this.value;
        if (currentAyahData) loadAudio(currentAyahData);
    });
}

function setupEventListeners() {
    const a = document.getElementById('ayahInSurah');
    const g = document.getElementById('globalAyah');
    if (a) a.addEventListener('keypress', e => { if (e.key==='Enter') fetchAyahBySurah(); });
    if (g) g.addEventListener('keypress', e => { if (e.key==='Enter') searchByGlobalAyah(); });
}

function loadQuickAyah(surah, ayah) {
    const ss = document.getElementById('surahSelect');
    const ai = document.getElementById('ayahInSurah');
    if (ss) ss.value = surah;
    if (ai) ai.value = ayah;
    updateSurahInfo(surah);
    updateAyahRange(surah);
    showTab('search');
    setTimeout(fetchAyahBySurah, 300);
}

async function fetchAyahBySurah() {
    const sn = parseInt(document.getElementById('surahSelect')?.value);
    const an = parseInt(document.getElementById('ayahInSurah')?.value);
    if (!sn) { showError(QuranConfig.messages.selectSurah); return; }
    const surah = surahsList.find(s => s.number === sn);
    if (!surah) { showError('السورة غير موجودة'); return; }
    if (!an || an < 1 || an > surah.numberOfAyahs) { showError(QuranConfig.messages.ayahOutOfRange, `يجب أن يكون بين 1 و ${surah.numberOfAyahs}`); return; }
    currentSurah = sn; currentAyah = an;
    showLoading(true);
    try {
        const d = await getAyahBySurahNumber(sn, an);
        displayAyah(d); await loadAudio(d); await loadTranslation(d.number); await loadTafseer(d.number);
        showAdditionalSections(); currentAyahData = d; currentGlobalAyah = d.number;
    } catch(e) { showError(QuranConfig.messages.error, e.message); }
    finally { showLoading(false); }
}

async function searchByGlobalAyah() {
    const n = parseInt(document.getElementById('globalAyah')?.value?.trim());
    if (!n || n < 1 || n > QuranConfig.totalAyahs) { showError(QuranConfig.messages.invalidAyah, `يجب أن يكون بين 1 و ${QuranConfig.totalAyahs}`); return; }
    showLoading(true);
    try {
        const d = await getAyahData(n);
        const ss = document.getElementById('surahSelect'); const ai = document.getElementById('ayahInSurah');
        if (ss) ss.value = d.surah.number;
        if (ai) ai.value = d.numberInSurah;
        updateSurahInfo(d.surah.number); updateAyahRange(d.surah.number);
        displayAyah(d); await loadAudio(d); await loadTranslation(n); await loadTafseer(n);
        showAdditionalSections(); currentAyahData = d; currentSurah = d.surah.number; currentAyah = d.numberInSurah; currentGlobalAyah = n;
    } catch(e) { showError(QuranConfig.messages.error, e.message); }
    finally { showLoading(false); }
}

async function getAyahData(n) {
    const res = await fetch(QuranConfig.apis.ayah(n));
    const data = await res.json();
    if (!data.data) throw new Error('الآية غير موجودة');
    return data.data;
}

async function getAyahBySurahNumber(s, a) {
    const res = await fetch(QuranConfig.apis.ayahBySurah(s, a));
    const data = await res.json();
    if (!data.data) throw new Error('الآية غير موجودة');
    return data.data;
}

function displayAyah(d) {
    const surah = surahsList.find(s => s.number === d.surah.number);
    const display = document.getElementById('ayahDisplay');
    if (!display) return;
    display.innerHTML = `
        <div style="text-align:center;">
            <div style="display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:12px;margin-bottom:20px;">
                <span style="background:var(--green-mid);color:white;padding:8px 20px;border-radius:20px;font-weight:700;">
                    ${d.surah.name} ${surah ? '(' + surah.englishName + ')' : ''}
                </span>
                <span style="color:#6b7280;">الآية ${d.numberInSurah} من ${d.surah.numberOfAyahs}</span>
                <span style="color:#6b7280;">الجزء ${d.juz}</span>
            </div>
            <div style="background:linear-gradient(135deg,#fafdf7,#f0f9f3);padding:28px;border-radius:16px;border:1px solid rgba(45,106,79,0.15);margin-bottom:20px;">
                <p style="font-family:'Amiri Quran','Amiri',serif;font-size:2rem;line-height:2.8;color:#1c1208;margin-bottom:16px;">${d.text}</p>
                <div style="font-family:'Amiri',serif;font-size:2rem;color:var(--green-mid);">﴿${d.numberInSurah}﴾</div>
            </div>
            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;">
                ${[['رقم الآية العام',d.number],['رقم السورة',d.surah.number],['الصفحة',d.page],['رقم الآية',d.numberInSurah]].map(([l,v])=>`
                    <div style="padding:12px;background:#f3f4f6;border-radius:12px;text-align:center;">
                        <div style="font-size:0.75rem;color:#6b7280;margin-bottom:6px;">${l}</div>
                        <div style="font-size:1.4rem;font-weight:700;color:var(--green-mid);">${v}</div>
                    </div>`).join('')}
            </div>
        </div>`;
    document.getElementById('resultsSection').style.display = 'block';
}

async function loadAudio(d) {
    const reciter = QuranConfig.reciters[currentReciter];
    document.getElementById('reciterName').textContent = `تلاوة ${reciter.name}`;
    const surah = String(d.surah.number).padStart(3,'0');
    const ayah = String(d.numberInSurah).padStart(3,'0');
    let url = null;
    for (const fn of reciter.sources) {
        const u = fn(surah, ayah);
        try { const r = await fetch(u,{method:'HEAD'}); if(r.ok){url=u;break;} } catch(e){continue;}
    }
    const display = document.getElementById('audioDisplay');
    if (!display) return;
    if (url) {
        display.innerHTML = `<audio id="ayahAudio" controls style="width:100%;border-radius:12px;" preload="metadata"><source src="${url}" type="audio/mpeg"></audio><p style="text-align:center;color:#6b7280;font-size:0.85rem;margin-top:8px;">${reciter.name} - ${reciter.style}</p>`;
        audioElement = document.getElementById('ayahAudio');
    } else {
        display.innerHTML = `<p style="text-align:center;color:#92400e;padding:16px;">التلاوة غير متوفرة لهذه الآية</p>`;
    }
}

async function loadTranslation(n) {
    try {
        const res = await fetch(QuranConfig.apis.translation(n,'en.asad'));
        const data = await res.json();
        const display = document.getElementById('translationDisplay');
        if (!display) return;
        if (data.data && data.data.text) {
            display.innerHTML = `<div style="background:white;padding:16px;border-radius:12px;border:1px solid #bfdbfe;"><p style="color:#1e3a8a;line-height:1.8;text-align:left;" dir="ltr">${data.data.text}</p><p style="font-size:0.8rem;color:#60a5fa;margin-top:10px;border-top:1px solid #dbeafe;padding-top:8px;">By Muhammad Asad</p></div>`;
        }
    } catch(e) {}
}

async function loadTafseer(n) {
    try {
        const res = await fetch(QuranConfig.apis.tafseer(n,'ar.muyassar'));
        const data = await res.json();
        const display = document.getElementById('tafseerDisplay');
        if (!display) return;
        if (data.data && data.data.text) {
            display.innerHTML = `<div style="background:white;padding:16px;border-radius:12px;border:1px solid #ddd6fe;"><p style="color:#3730a3;line-height:1.8;">${data.data.text}</p><p style="font-size:0.8rem;color:#a78bfa;margin-top:10px;border-top:1px solid #ede9fe;padding-top:8px;">التفسير الميسر</p></div>`;
        }
    } catch(e) {}
}

function showAdditionalSections() {
    const shareCard = document.getElementById('shareCard');
    const navCard = document.getElementById('navigationCard');
    if (shareCard) shareCard.style.display = 'block';
    if (navCard) navCard.style.display = 'block';
}

function previousAyah() {
    if (!currentSurah || !currentAyah) return;
    if (currentAyah > 1) loadQuickAyah(currentSurah, currentAyah - 1);
    else if (currentSurah > 1) {
        const prev = surahsList.find(s => s.number === currentSurah - 1);
        if (prev) loadQuickAyah(currentSurah - 1, prev.numberOfAyahs);
    }
}

function nextAyah() {
    if (!currentSurah || !currentAyah) return;
    const surah = surahsList.find(s => s.number === currentSurah);
    if (!surah) return;
    if (currentAyah < surah.numberOfAyahs) loadQuickAyah(currentSurah, currentAyah + 1);
    else if (currentSurah < 114) loadQuickAyah(currentSurah + 1, 1);
}

function playAudio() { if (audioElement) audioElement.play().catch(e => showError('تعذر تشغيل الصوت')); }
function pauseAudio() { if (audioElement) audioElement.pause(); }
function downloadAudio() {
    if (audioElement && audioElement.src) {
        const a = document.createElement('a'); a.href = audioElement.src;
        a.download = `quran_${currentSurah}_${currentAyah}.mp3`; a.click();
    }
}

async function shareAyah() {
    if (!currentAyahData) return;
    const text = `${currentAyahData.text}\n\n${currentAyahData.surah.name} - الآية ${currentAyahData.numberInSurah}\n\nمن تطبيق قرآن كريم`;
    if (navigator.share) {
        try { await navigator.share({title:'آية قرآنية',text,url:location.href}); }
        catch(e) { if (e.name !== 'AbortError') copyAyah(); }
    } else copyAyah();
}

function copyAyah() {
    if (!currentAyahData) return;
    navigator.clipboard.writeText(`${currentAyahData.text}\n\n${currentAyahData.surah.name} - الآية ${currentAyahData.numberInSurah}`)
        .then(() => showToast('تم نسخ الآية','success'));
}

function showLoading(show) {
    const ls = document.getElementById('loadingState');
    const rs = document.getElementById('resultsSection');
    const btn = document.getElementById('searchBtn');
    const sp = document.getElementById('searchSpinner');
    if (show) {
        if(ls) ls.style.display='block'; if(rs) rs.style.display='none';
        if(sp) sp.style.display=''; if(btn) btn.disabled=true;
    } else {
        if(ls) ls.style.display='none'; if(sp) sp.style.display='none'; if(btn) btn.disabled=false;
    }
}

function showError(msg, details='') {
    const el = document.getElementById('errorMsg'); const et = document.getElementById('errorText'); const ed = document.getElementById('errorDetails');
    if (!el) return;
    if(et) et.textContent = msg; if(ed) ed.textContent = details; el.style.display='block';
    setTimeout(() => hideError(), 5000);
}

function hideError() { const el = document.getElementById('errorMsg'); if(el) el.style.display='none'; }

function getSurahAyahCount(n) { const s = surahsList.find(s => s.number === n); return s ? s.numberOfAyahs : 0; }

// Expose globally
window.loadQuickAyah = loadQuickAyah;
window.playAudio = playAudio; window.pauseAudio = pauseAudio; window.downloadAudio = downloadAudio;
window.shareAyah = shareAyah; window.copyAyah = copyAyah;
window.fetchAyahBySurah = fetchAyahBySurah; window.searchByGlobalAyah = searchByGlobalAyah;
window.previousAyah = previousAyah; window.nextAyah = nextAyah;
