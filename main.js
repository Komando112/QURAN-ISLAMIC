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
    // ربط loadQuickAyah بعد تحميل السور
    window.__loadQuickAyah = loadQuickAyah;
});

async function loadSurahs() {
    try {
        const response = await fetch(QuranConfig.apis.surahs());
        const data = await response.json();
        if (data.data) {
            surahsList = data.data;
            window.surahsList = surahsList; // expose globally for pages panel
            populateSurahSelect();
        }
    } catch (error) {
        surahsList = [];
        window.surahsList = [];
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

// ══════════════════════════════════════
//  loadQuickAyah - مُصلَح: ينتظر تحميل السور أولاً
// ══════════════════════════════════════
function loadQuickAyah(surah, ayah) {
    // إذا لم تتحمل السور بعد، ننتظر
    if (!surahsList || surahsList.length === 0) {
        const wait = setInterval(() => {
            if (surahsList && surahsList.length > 0) {
                clearInterval(wait);
                _doLoadQuickAyah(surah, ayah);
            }
        }, 200);
        return;
    }
    _doLoadQuickAyah(surah, ayah);
}

function _doLoadQuickAyah(surah, ayah) {
    showTab('search');
    const ss = document.getElementById('surahSelect');
    const ai = document.getElementById('ayahInSurah');
    if (ss) ss.value = surah;
    if (ai) ai.value = ayah;
    updateSurahInfo(surah);
    updateAyahRange(surah);
    // تأخير بسيط لضمان تحديث الـ DOM
    setTimeout(() => fetchAyahBySurah(), 150);
}

async function fetchAyahBySurah() {
    const sn = parseInt(document.getElementById('surahSelect')?.value);
    const an = parseInt(document.getElementById('ayahInSurah')?.value);
    if (!sn) { showError(QuranConfig.messages.selectSurah); return; }
    const surah = surahsList.find(s => s.number === sn);
    if (!surah) { showError('السورة غير موجودة'); return; }
    if (!an || an < 1 || an > surah.numberOfAyahs) { showError(QuranConfig.messages.ayahOutOfRange, `يجب أن يكون بين 1 و ${surah.numberOfAyahs}`); return; }
    currentSurah = sn; currentAyah = an;
    hideError();
    showLoading(true);
    try {
        const d = await getAyahBySurahNumber(sn, an);
        displayAyah(d);
        await Promise.all([
            loadAudio(d),
            loadTranslation(d.number),
            loadTafseer(d.number),
            loadTajweed(d.number)
        ]);
        showAdditionalSections();
        currentAyahData = d;
        currentGlobalAyah = d.number;
    } catch(e) { showError(QuranConfig.messages.error, e.message); }
    finally { showLoading(false); }
}

async function searchByGlobalAyah() {
    const n = parseInt(document.getElementById('globalAyah')?.value?.trim());
    if (!n || n < 1 || n > QuranConfig.totalAyahs) { showError(QuranConfig.messages.invalidAyah, `يجب أن يكون بين 1 و ${QuranConfig.totalAyahs}`); return; }
    hideError();
    showLoading(true);
    try {
        const d = await getAyahData(n);
        const ss = document.getElementById('surahSelect'); const ai = document.getElementById('ayahInSurah');
        if (ss) ss.value = d.surah.number;
        if (ai) ai.value = d.numberInSurah;
        updateSurahInfo(d.surah.number); updateAyahRange(d.surah.number);
        displayAyah(d);
        await Promise.all([
            loadAudio(d),
            loadTranslation(n),
            loadTafseer(n),
            loadTajweed(n)
        ]);
        showAdditionalSections();
        currentAyahData = d; currentSurah = d.surah.number; currentAyah = d.numberInSurah; currentGlobalAyah = n;
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
                <span style="background:linear-gradient(135deg,#2d6a4f,#1a472a);color:white;padding:8px 20px;border-radius:20px;font-weight:700;font-family:'Tajawal',sans-serif;">
                    ${d.surah.name} ${surah ? '(' + surah.englishName + ')' : ''}
                </span>
                <span style="color:var(--muted);font-size:.85rem;">الآية ${d.numberInSurah} من ${d.surah.numberOfAyahs}</span>
                <span style="color:var(--muted);font-size:.85rem;">الجزء ${d.juz}</span>
            </div>
            <div style="background:var(--mushaf);padding:28px;border-radius:16px;border:1px solid var(--border);margin-bottom:20px;">
                <p style="font-family:'Amiri Quran','Amiri',serif;font-size:2rem;line-height:2.8;color:var(--txt);margin-bottom:16px;">${d.text}</p>
                <div style="font-family:'Amiri',serif;font-size:2rem;color:var(--gold-d);">﴿${d.numberInSurah}﴾</div>
            </div>
            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;">
                ${[['رقم الآية العام',d.number],['رقم السورة',d.surah.number],['الصفحة',d.page],['رقم الآية',d.numberInSurah]].map(([l,v])=>`
                    <div style="padding:12px;background:var(--surface2);border-radius:12px;text-align:center;border:1px solid var(--border);">
                        <div style="font-size:0.75rem;color:var(--muted);margin-bottom:6px;">${l}</div>
                        <div style="font-size:1.4rem;font-weight:700;color:var(--heading);">${v}</div>
                    </div>`).join('')}
            </div>
        </div>`;
    document.getElementById('resultsSection').style.display = 'block';
}

// ══════════════════════════════════════
//  أحكام التجويد - Tajweed Coloring
// ══════════════════════════════════════
const TAJWEED_COLORS = {
    'ghunnah':           '#FF7E1E',
    'idghaam':           '#169200',
    'idghaam_no_ghunnah':'#026112',
    'iqlab':             '#26BFFD',
    'ikhfa':             '#81B622',
    'ikhfa_shafawi':     '#D2691E',
    'idghaam_shafawi':   '#A0522D',
    'qalqalah':          '#DD0008',
    'madd_normal':       '#337FFF',
    'madd_munfasil':     '#4B0082',
    'madd_muttasil':     '#990099',
    'madd_lazim':        '#8B0000',
    'madd_lin':          '#006400',
    'hamzat_wasl':       '#AAAAAA',
    'lam_shamsiyya':     '#AAAAAA',
    'silent':            '#AAAAAA',
    'tafkheem':          '#FF4500',
    'idhar':             '#00CED1',
    'idhar_shafawi':     '#20B2AA',
};

// تحويل نص التجويد المُرمَّز إلى HTML ملوَّن
function parseTajweedText(tajweedText) {
    if (!tajweedText) return '';
    // الـ API يُرجع نصاً بتنسيق: <tajweed class="rule">text</tajweed>
    // نحوّله إلى HTML ملوَّن
    let html = tajweedText;
    // استبدل وسوم tajweed بـ span ملوَّن
    html = html.replace(/<tajweed class="([^"]+)">/g, (match, cls) => {
        const rules = cls.split(' ');
        const color = rules.reduce((c, r) => TAJWEED_COLORS[r] || c, null);
        if (color) {
            const ruleName = getRuleName(rules[0]);
            return `<span class="tj-word" style="color:${color};" title="${ruleName}">`;
        }
        return '<span>';
    });
    html = html.replace(/<\/tajweed>/g, '</span>');
    // إزالة الوسوم الأخرى
    html = html.replace(/<[^>]+>/g, '');
    // إعادة إضافة الـ spans
    html = tajweedText.replace(/<tajweed class="([^"]+)">([\s\S]*?)<\/tajweed>/g, (match, cls, text) => {
        const rules = cls.split(' ');
        const color = rules.reduce((c, r) => TAJWEED_COLORS[r] || c, null);
        const ruleName = getRuleName(rules[0]);
        if (color) {
            return `<span class="tj-word" style="color:${color};font-weight:500;" title="${ruleName}">${text}</span>`;
        }
        return text;
    });
    // إزالة الوسوم المتبقية (non-tajweed)
    html = html.replace(/<(?!span|\/span)[^>]+>/g, '');
    return html;
}

function getRuleName(ruleId) {
    const rule = QuranConfig.tajweedRules.find(r => r.id === ruleId);
    return rule ? rule.name : ruleId;
}

// جدول أحكام التجويد
function renderTajweedLegend() {
    const rules = QuranConfig.tajweedRules;
    return `
    <div id="tajweedLegend" style="margin-top:16px;background:var(--surface2);border-radius:13px;border:1px solid var(--border);overflow:hidden;">
        <div style="padding:12px 16px;background:linear-gradient(135deg,rgba(201,168,76,.12),rgba(201,168,76,.04));border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;cursor:pointer;" onclick="toggleLegend()">
            <div style="display:flex;align-items:center;gap:8px;font-weight:700;color:var(--heading);font-size:.9rem;">
                <i class="fas fa-palette" style="color:var(--gold);"></i>
                دليل ألوان أحكام التجويد
            </div>
            <i class="fas fa-chevron-down" id="legendIcon" style="color:var(--muted);font-size:.8rem;transition:transform .28s;"></i>
        </div>
        <div id="legendBody" style="display:none;padding:14px 16px;">
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:7px;">
                ${rules.map(r => `
                <div style="display:flex;align-items:center;gap:8px;padding:7px 10px;background:var(--surface);border-radius:8px;border:1px solid var(--border);">
                    <div style="width:14px;height:14px;border-radius:50%;background:${r.color};flex-shrink:0;box-shadow:0 0 4px ${r.color}55;"></div>
                    <div>
                        <div style="font-size:.8rem;font-weight:700;color:var(--txt);font-family:'Tajawal',sans-serif;">${r.name}</div>
                        <div style="font-size:.68rem;color:var(--muted);line-height:1.3;">${r.desc}</div>
                    </div>
                </div>`).join('')}
            </div>
        </div>
    </div>`;
}

function toggleLegend() {
    const body = document.getElementById('legendBody');
    const icon = document.getElementById('legendIcon');
    if (!body) return;
    const open = body.style.display === 'none';
    body.style.display = open ? 'block' : 'none';
    if (icon) icon.style.transform = open ? 'rotate(180deg)' : '';
}

async function loadTajweed(globalN) {
    const container = document.getElementById('tajweedCard');
    if (!container) return;
    container.innerHTML = `
        <div style="display:flex;align-items:center;gap:9px;margin-bottom:12px;">
            <div style="width:36px;height:36px;background:rgba(201,168,76,.12);border-radius:8px;display:flex;align-items:center;justify-content:center;color:var(--gold-d);font-size:14px;"><i class="fas fa-palette"></i></div>
            <div><div style="font-weight:700;color:var(--txt);font-size:.92rem;">تلاوة مُلوَّنة بأحكام التجويد</div></div>
        </div>
        <div style="text-align:center;padding:20px;color:var(--muted);"><i class="fas fa-spinner fa-spin"></i> جاري تحميل التجويد...</div>`;
    container.style.display = 'block';

    try {
        const res = await fetch(`https://api.alquran.cloud/v1/ayah/${globalN}/quran-tajweed`);
        const data = await res.json();
        if (data.data && data.data.text) {
            const coloredHtml = parseTajweedText(data.data.text);
            container.innerHTML = `
                <div style="display:flex;align-items:center;gap:9px;margin-bottom:12px;">
                    <div style="width:36px;height:36px;background:rgba(201,168,76,.12);border-radius:8px;display:flex;align-items:center;justify-content:center;color:var(--gold-d);font-size:14px;"><i class="fas fa-palette"></i></div>
                    <div><div style="font-weight:700;color:var(--txt);font-size:.92rem;">تلاوة مُلوَّنة بأحكام التجويد</div><div style="font-size:.72rem;color:var(--muted);">مرّ على الحرف لمعرفة الحكم</div></div>
                </div>
                <div style="font-family:'Amiri Quran','Amiri',serif;font-size:1.6rem;line-height:2.8;text-align:center;padding:16px;background:var(--mushaf);border-radius:12px;border:1px solid var(--border);">
                    ${coloredHtml || data.data.text}
                </div>
                ${renderTajweedLegend()}`;
        }
    } catch(e) {
        container.innerHTML = `
            <div style="display:flex;align-items:center;gap:9px;margin-bottom:12px;">
                <div style="width:36px;height:36px;background:rgba(201,168,76,.12);border-radius:8px;display:flex;align-items:center;justify-content:center;color:var(--gold-d);font-size:14px;"><i class="fas fa-palette"></i></div>
                <div><div style="font-weight:700;color:var(--txt);font-size:.92rem;">التجويد الملوَّن</div></div>
            </div>
            <p style="color:var(--muted);font-size:.84rem;text-align:center;">تعذّر تحميل التجويد الملوَّن.</p>
            ${renderTajweedLegend()}`;
    }
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
        display.innerHTML = `<audio id="ayahAudio" controls style="width:100%;border-radius:12px;" preload="metadata"><source src="${url}" type="audio/mpeg"></audio><p style="text-align:center;color:var(--muted);font-size:0.85rem;margin-top:8px;">${reciter.name} - ${reciter.style}</p>`;
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
            display.innerHTML = `<div style="background:var(--surface);padding:16px;border-radius:12px;border:1px solid #bfdbfe;"><p style="color:var(--txt);line-height:1.8;text-align:left;" dir="ltr">${data.data.text}</p><p style="font-size:0.8rem;color:#60a5fa;margin-top:10px;border-top:1px solid #dbeafe;padding-top:8px;">By Muhammad Asad</p></div>`;
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
            display.innerHTML = `<div style="background:var(--surface);padding:16px;border-radius:12px;border:1px solid #ddd6fe;"><p style="color:var(--txt);line-height:1.8;">${data.data.text}</p><p style="font-size:0.8rem;color:#a78bfa;margin-top:10px;border-top:1px solid #ede9fe;padding-top:8px;">التفسير الميسر</p></div>`;
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

function playAudio() { if (audioElement) audioElement.play().catch(() => showError('تعذر تشغيل الصوت')); }
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
window.__loadQuickAyah = loadQuickAyah;
window.playAudio = playAudio; window.pauseAudio = pauseAudio; window.downloadAudio = downloadAudio;
window.shareAyah = shareAyah; window.copyAyah = copyAyah;
window.fetchAyahBySurah = fetchAyahBySurah; window.searchByGlobalAyah = searchByGlobalAyah;
window.previousAyah = previousAyah; window.nextAyah = nextAyah;
window.toggleLegend = toggleLegend;
