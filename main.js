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
    window.__loadQuickAyah = loadQuickAyah;
});

async function loadSurahs() {
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);
        const response = await fetch(QuranConfig.apis.surahs(), { signal: controller.signal });
        clearTimeout(timeout);
        if (!response.ok) throw new Error('HTTP ' + response.status);
        const data = await response.json();
        if (data.data && data.data.length) {
            surahsList = data.data;
            window.surahsList = surahsList;
            populateSurahSelect();
        } else {
            throw new Error('بيانات السور فارغة');
        }
    } catch (error) {
        console.error('فشل تحميل السور:', error);
        surahsList = [];
        window.surahsList = [];
        // عرض رسالة خطأ في قائمة السور
        const sel = document.getElementById('surahSelect');
        if (sel) {
            sel.innerHTML = '<option value="">⚠️ تعذر تحميل السور — تحقق من الاتصال</option>';
        }
    }
}

function populateSurahSelect() {
    const surahSelect = document.getElementById('surahSelect');
    if (!surahSelect) return;
    surahSelect.innerHTML = '<option value="">-- اختر السورة --</option>';
    surahsList.forEach(surah => {
        const option = document.createElement('option');
        option.value = surah.number;
        option.textContent = surah.number + '. ' + surah.name + ' (' + surah.englishName + ') - ' + surah.numberOfAyahs + ' آية';
        surahSelect.appendChild(option);
    });
    surahSelect.addEventListener('change', function() {
        const n = parseInt(this.value);
        if (n) {
            updateSurahInfo(n);
            const ayahInput = document.getElementById('ayahInSurah');
            if (ayahInput) { ayahInput.max = getSurahAyahCount(n); ayahInput.value = 1; }
            updateAyahRange(n);
        } else {
            hideSurahInfo();
        }
    });
}

function updateSurahInfo(n) {
    const surah = surahsList.find(s => s.number === n);
    if (!surah) return;
    const el = document.getElementById('surahInfo');
    if (!el) return;
    el.innerHTML = surah.englishName + ' - ' + (surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية') + ' | آيات: ' + surah.numberOfAyahs;
    el.style.display = 'block';
    updateAyahRange(n);
}

function updateAyahRange(n) {
    const surah = surahsList.find(s => s.number === n);
    if (!surah) return;
    const maxEl = document.getElementById('maxAyah');
    const rangeEl = document.getElementById('ayahRange');
    if (maxEl) maxEl.textContent = surah.numberOfAyahs;
    if (rangeEl) rangeEl.style.display = 'block';
}

function hideSurahInfo() {
    const si = document.getElementById('surahInfo');
    const ar = document.getElementById('ayahRange');
    if (si) si.style.display = 'none';
    if (ar) ar.style.display = 'none';
}

function loadReciters() {
    const sel = document.getElementById('reciterSelect');
    if (!sel) return;
    sel.innerHTML = '';
    Object.values(QuranConfig.reciters).forEach(r => {
        const opt = document.createElement('option');
        opt.value = r.id;
        opt.textContent = r.name + ' - ' + r.style;
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
    if (a) a.addEventListener('keypress', e => { if (e.key === 'Enter') fetchAyahBySurah(); });
    if (g) g.addEventListener('keypress', e => { if (e.key === 'Enter') searchByGlobalAyah(); });
}

// ══════════════════════════════════════
//  loadQuickAyah
// ══════════════════════════════════════
function loadQuickAyah(surah, ayah) {
    if (!surahsList || surahsList.length === 0) {
        let attempts = 0;
        const wait = setInterval(() => {
            attempts++;
            if (surahsList && surahsList.length > 0) {
                clearInterval(wait);
                _doLoadQuickAyah(surah, ayah);
            } else if (attempts > 25) {
                clearInterval(wait);
                if (typeof showToast === 'function') showToast('تعذر تحميل بيانات السورة', 'error');
            }
        }, 200);
        return;
    }
    _doLoadQuickAyah(surah, ayah);
}

function _doLoadQuickAyah(surah, ayah) {
    if (typeof showTab === 'function') showTab('search');
    const ss = document.getElementById('surahSelect');
    const ai = document.getElementById('ayahInSurah');
    if (ss) ss.value = surah;
    if (ai) ai.value = ayah;
    updateSurahInfo(surah);
    updateAyahRange(surah);
    setTimeout(() => fetchAyahBySurah(), 150);
}

async function fetchAyahBySurah() {
    const sn = parseInt(document.getElementById('surahSelect')?.value);
    const an = parseInt(document.getElementById('ayahInSurah')?.value);
    if (!sn) { showError(QuranConfig.messages.selectSurah); return; }
    const surah = surahsList.find(s => s.number === sn);
    if (!surah) { showError('السورة غير موجودة'); return; }
    if (!an || an < 1 || an > surah.numberOfAyahs) {
        showError(QuranConfig.messages.ayahOutOfRange, 'يجب أن يكون بين 1 و ' + surah.numberOfAyahs);
        return;
    }
    currentSurah = sn; currentAyah = an;
    hideError();
    showLoading(true);
    try {
        const d = await getAyahBySurahNumber(sn, an);
        displayAyah(d);
        await Promise.allSettled([
            loadAudio(d),
            loadTranslation(d.number),
            loadTafseer(d.number),
            loadTajweed(d.number)
        ]);
        showAdditionalSections();
        currentAyahData = d;
        currentGlobalAyah = d.number;
    } catch (e) {
        console.error('fetchAyahBySurah error:', e);
        showError(QuranConfig.messages.error, e.message || 'تحقق من اتصالك بالإنترنت');
    } finally {
        showLoading(false);
    }
}

async function searchByGlobalAyah() {
    const val = document.getElementById('globalAyah')?.value?.trim();
    const n = parseInt(val);
    if (!n || n < 1 || n > QuranConfig.totalAyahs) {
        showError(QuranConfig.messages.invalidAyah, 'يجب أن يكون بين 1 و ' + QuranConfig.totalAyahs);
        return;
    }
    hideError();
    showLoading(true);
    try {
        const d = await getAyahData(n);
        const ss = document.getElementById('surahSelect');
        const ai = document.getElementById('ayahInSurah');
        if (ss) ss.value = d.surah.number;
        if (ai) ai.value = d.numberInSurah;
        updateSurahInfo(d.surah.number);
        updateAyahRange(d.surah.number);
        displayAyah(d);
        await Promise.allSettled([
            loadAudio(d),
            loadTranslation(n),
            loadTafseer(n),
            loadTajweed(n)
        ]);
        showAdditionalSections();
        currentAyahData = d;
        currentSurah = d.surah.number;
        currentAyah = d.numberInSurah;
        currentGlobalAyah = n;
    } catch (e) {
        console.error('searchByGlobalAyah error:', e);
        showError(QuranConfig.messages.error, e.message || 'تحقق من اتصالك بالإنترنت');
    } finally {
        showLoading(false);
    }
}

async function getAyahData(n) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
        const res = await fetch(QuranConfig.apis.ayah(n), { signal: controller.signal });
        clearTimeout(timeout);
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();
        if (!data.data) throw new Error('الآية غير موجودة');
        return data.data;
    } catch (e) {
        clearTimeout(timeout);
        throw e;
    }
}

async function getAyahBySurahNumber(s, a) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
        const res = await fetch(QuranConfig.apis.ayahBySurah(s, a), { signal: controller.signal });
        clearTimeout(timeout);
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();
        if (!data.data) throw new Error('الآية غير موجودة');
        return data.data;
    } catch (e) {
        clearTimeout(timeout);
        throw e;
    }
}

function displayAyah(d) {
    const surah = surahsList.find(s => s.number === d.surah.number);
    const display = document.getElementById('ayahDisplay');
    if (!display) return;
    display.innerHTML = `
        <div style="text-align:center;">
            <div style="display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:12px;margin-bottom:20px;">
                <span style="background:linear-gradient(135deg,#2d6a4f,#1a472a);color:white;padding:8px 20px;border-radius:20px;font-weight:700;">
                    ${d.surah.name} ${surah ? '(' + surah.englishName + ')' : ''}
                </span>
                <span style="color:var(--muted);font-size:.85rem;">الآية ${d.numberInSurah} من ${d.surah.numberOfAyahs}</span>
                <span style="color:var(--muted);font-size:.85rem;">الجزء ${d.juz}</span>
            </div>
            <div style="background:var(--mushaf);padding:28px;border-radius:16px;border:1px solid var(--border);margin-bottom:20px;">
                <p style="font-family:var(--font-quran, 'Noto Naskh Arabic', serif);font-size:2rem;line-height:2.8;color:var(--txt);margin-bottom:16px;">${d.text}</p>
                <div style="font-family:var(--font-quran, 'Noto Naskh Arabic', serif);font-size:2rem;color:var(--gold-d);">﴿${d.numberInSurah}﴾</div>
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
//  التجويد - تلوين محلي
// ══════════════════════════════════════
const QALQALAH_LETTERS = ['ق','ط','ب','ج','د'];
const MADD_LETTERS = ['ا','و','ي'];
const TAFKHEEM_LETTERS = ['ص','ض','ط','ظ'];
const GHUNNAH_LETTERS = ['ن','م'];

function colorAyahText(text) {
    if (!text) return text;
    let result = '';
    const chars = [...text];

    for (let i = 0; i < chars.length; i++) {
        const ch = chars[i];
        const prev = i > 0 ? chars[i - 1] : '';

        if (isHaraka(ch) || ch === 'ّ') { result += ch; continue; }

        let charWithDiacritics = ch;
        let j = i + 1;
        while (j < chars.length && (isHaraka(chars[j]) || chars[j] === 'ّ' || chars[j] === 'ْ')) {
            charWithDiacritics += chars[j];
            j++;
        }

        const hasSukun = charWithDiacritics.includes('ْ');
        const hasShaddah = charWithDiacritics.includes('ّ');

        let color = null;
        let title = '';

        if (QALQALAH_LETTERS.includes(ch) && (hasSukun || isEndOfWord(chars, j))) {
            color = '#DD0008'; title = 'قلقلة';
        } else if (TAFKHEEM_LETTERS.includes(ch)) {
            color = '#FF4500'; title = 'تفخيم';
        } else if (MADD_LETTERS.includes(ch) && isMaddContext(chars, i, prev)) {
            color = '#337FFF'; title = 'مد';
        } else if (GHUNNAH_LETTERS.includes(ch) && hasShaddah) {
            color = '#FF7E1E'; title = 'غنة';
        } else if (ch === 'ن' && hasSukun && isIkhfaaNext(chars[j])) {
            color = '#81B622'; title = 'إخفاء';
        } else if (ch === 'ن' && hasSukun && isIdghaamLetter(chars[j])) {
            color = '#169200'; title = 'إدغام';
        } else if (ch === 'ن' && hasSukun && chars[j] === 'ب') {
            color = '#26BFFD'; title = 'إقلاب';
        }

        if (color) {
            result += '<span class="tj-word" style="color:' + color + '" title="' + title + '">' + charWithDiacritics + '</span>';
        } else {
            result += charWithDiacritics;
        }

        i = j - 1;
    }
    return result;
}

function isHaraka(ch) { return /[\u064B-\u065F\u0670]/.test(ch); }
function isEndOfWord(chars, idx) { return !chars[idx] || chars[idx] === ' ' || chars[idx] === '\n'; }
function isMaddContext(chars, i, prev) {
    if (!prev) return false;
    const ch = chars[i];
    if (ch === 'ا') return /[\u064E]/.test(prev);
    if (ch === 'و') return /[\u064F]/.test(prev);
    if (ch === 'ي') return /[\u0650]/.test(prev);
    return false;
}
function isIkhfaaNext(ch) { return ch && 'صذثكجشقسدطزفتضظ'.includes(ch); }
function isIdghaamLetter(ch) { return ch && 'يرملون'.includes(ch); }

function renderTajweedLegend() {
    if (!QuranConfig || !QuranConfig.tajweedRules) return '';
    const rules = QuranConfig.tajweedRules;
    return '<div id="tajweedLegend" style="margin-top:16px;background:var(--surface2);border-radius:13px;border:1px solid var(--border);overflow:hidden;">' +
        '<div style="padding:12px 16px;background:linear-gradient(135deg,rgba(201,168,76,.12),rgba(201,168,76,.04));border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;cursor:pointer;" onclick="toggleLegend()">' +
        '<div style="display:flex;align-items:center;gap:8px;font-weight:700;color:var(--heading);font-size:.9rem;"><i class="fas fa-palette" style="color:var(--gold);"></i> دليل ألوان أحكام التجويد</div>' +
        '<i class="fas fa-chevron-down" id="legendIcon" style="color:var(--muted);font-size:.8rem;transition:transform .28s;"></i>' +
        '</div>' +
        '<div id="legendBody" style="display:none;padding:14px 16px;">' +
        '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:7px;">' +
        rules.map(r =>
            '<div style="display:flex;align-items:center;gap:8px;padding:7px 10px;background:var(--surface);border-radius:8px;border:1px solid var(--border);">' +
            '<div style="width:14px;height:14px;border-radius:50%;background:' + r.color + ';flex-shrink:0;box-shadow:0 0 4px ' + r.color + '55;"></div>' +
            '<div><div style="font-size:.8rem;font-weight:700;color:var(--txt);">' + r.name + '</div>' +
            '<div style="font-size:.68rem;color:var(--muted);line-height:1.3;">' + r.desc + '</div></div>' +
            '</div>'
        ).join('') +
        '</div></div></div>';
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
    container.style.display = 'block';
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 12000);
        const res = await fetch('https://api.alquran.cloud/v1/ayah/' + globalN, { signal: controller.signal });
        clearTimeout(timeout);
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();
        if (!data.data || !data.data.text) throw new Error('no text');

        const colored = colorAyahText(data.data.text);
        container.innerHTML =
            '<div style="display:flex;align-items:center;gap:9px;margin-bottom:12px;">' +
            '<div style="width:36px;height:36px;background:rgba(201,168,76,.12);border-radius:8px;display:flex;align-items:center;justify-content:center;color:var(--gold-d);font-size:14px;"><i class="fas fa-palette"></i></div>' +
            '<div><div style="font-weight:700;color:var(--txt);font-size:.92rem;">تلاوة مُلوَّنة بأحكام التجويد</div>' +
            '<div style="font-size:.72rem;color:var(--muted);">مرّ على الحرف لمعرفة الحكم</div></div></div>' +
            '<div style="font-family:var(--font-quran, \'Noto Naskh Arabic\', serif);font-size:1.6rem;line-height:2.8;text-align:center;padding:16px;background:var(--mushaf);border-radius:12px;border:1px solid var(--border);">' +
            colored + '</div>' + renderTajweedLegend();
    } catch (e) {
        console.warn('loadTajweed error:', e);
        container.innerHTML =
            '<div style="display:flex;align-items:center;gap:9px;margin-bottom:12px;">' +
            '<div style="width:36px;height:36px;background:rgba(201,168,76,.12);border-radius:8px;display:flex;align-items:center;justify-content:center;color:var(--gold-d);font-size:14px;"><i class="fas fa-palette"></i></div>' +
            '<div><div style="font-weight:700;color:var(--txt);font-size:.92rem;">دليل أحكام التجويد</div></div></div>' +
            renderTajweedLegend();
    }
}

async function loadAudio(d) {
    const reciter = QuranConfig.reciters[currentReciter];
    if (!reciter) { console.warn('القارئ غير موجود:', currentReciter); return; }
    const nameEl = document.getElementById('reciterName');
    if (nameEl) nameEl.textContent = 'تلاوة ' + reciter.name;
    const surah = String(d.surah.number).padStart(3, '0');
    const ayah = String(d.numberInSurah).padStart(3, '0');
    const display = document.getElementById('audioDisplay');
    if (!display) return;

    // عرض مؤشر تحميل أثناء البحث عن الرابط
    display.innerHTML = '<div style="text-align:center;padding:12px;color:var(--muted);font-size:.85rem;"><i class="fas fa-spinner fa-spin" style="margin-left:6px;"></i>جاري تحميل التلاوة...</div>';

    let url = null;
    for (const fn of reciter.sources) {
        const u = fn(surah, ayah);
        try {
            const ctrl = new AbortController();
            const t = setTimeout(() => ctrl.abort(), 5000);
            const r = await fetch(u, { method: 'HEAD', signal: ctrl.signal });
            clearTimeout(t);
            if (r.ok) { url = u; break; }
        } catch (e) { continue; }
    }

    if (url) {
        display.innerHTML = '<audio id="ayahAudio" controls style="width:100%;border-radius:12px;" preload="metadata"><source src="' + url + '" type="audio/mpeg"></audio>' +
            '<p style="text-align:center;color:var(--muted);font-size:0.85rem;margin-top:8px;">' + reciter.name + ' - ' + reciter.style + '</p>';
        audioElement = document.getElementById('ayahAudio');
        if (audioElement) {
            audioElement.addEventListener('error', () => {
                display.innerHTML = '<p style="text-align:center;color:#92400e;padding:16px;"><i class="fas fa-exclamation-triangle" style="margin-left:6px;"></i>تعذر تحميل هذا الملف الصوتي</p>';
            });
        }
    } else {
        // محاولة أخيرة بالرابط المباشر دون فحص HEAD
        const fallbackUrl = reciter.sources[0](surah, ayah);
        display.innerHTML = '<audio id="ayahAudio" controls style="width:100%;border-radius:12px;" preload="metadata"><source src="' + fallbackUrl + '" type="audio/mpeg"></audio>' +
            '<p style="text-align:center;color:var(--muted);font-size:0.85rem;margin-top:8px;">' + reciter.name + ' - ' + reciter.style + '</p>';
        audioElement = document.getElementById('ayahAudio');
    }
}

async function loadTranslation(n) {
    const display = document.getElementById('translationDisplay');
    if (!display) return;
    display.innerHTML = '<div style="text-align:center;padding:10px;color:var(--muted);font-size:.82rem;"><i class="fas fa-spinner fa-spin"></i></div>';
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 12000);
        const res = await fetch(QuranConfig.apis.translation(n, 'en.asad'), { signal: controller.signal });
        clearTimeout(timeout);
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();
        if (data.data && data.data.text) {
            display.innerHTML = '<div style="background:var(--surface);padding:16px;border-radius:12px;border:1px solid #bfdbfe;">' +
                '<p style="color:var(--txt);line-height:1.8;text-align:left;" dir="ltr">' + data.data.text + '</p>' +
                '<p style="font-size:0.8rem;color:#60a5fa;margin-top:10px;border-top:1px solid #dbeafe;padding-top:8px;">By Muhammad Asad</p></div>';
        } else {
            display.innerHTML = '<p style="color:var(--muted);font-size:.85rem;padding:10px;text-align:center;">الترجمة غير متوفرة</p>';
        }
    } catch (e) {
        display.innerHTML = '<p style="color:var(--muted);font-size:.82rem;padding:10px;text-align:center;"><i class="fas fa-wifi" style="margin-left:5px;"></i>تعذر تحميل الترجمة</p>';
    }
}

async function loadTafseer(n) {
    const display = document.getElementById('tafseerDisplay');
    if (!display) return;
    display.innerHTML = '<div style="text-align:center;padding:10px;color:var(--muted);font-size:.82rem;"><i class="fas fa-spinner fa-spin"></i></div>';
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 12000);
        const res = await fetch(QuranConfig.apis.tafseer(n, 'ar.muyassar'), { signal: controller.signal });
        clearTimeout(timeout);
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();
        if (data.data && data.data.text) {
            display.innerHTML = '<div style="background:var(--surface);padding:16px;border-radius:12px;border:1px solid #ddd6fe;">' +
                '<p style="color:var(--txt);line-height:1.8;">' + data.data.text + '</p>' +
                '<p style="font-size:0.8rem;color:#a78bfa;margin-top:10px;border-top:1px solid #ede9fe;padding-top:8px;">التفسير الميسر</p></div>';
        } else {
            display.innerHTML = '<p style="color:var(--muted);font-size:.85rem;padding:10px;text-align:center;">التفسير غير متوفر</p>';
        }
    } catch (e) {
        display.innerHTML = '<p style="color:var(--muted);font-size:.82rem;padding:10px;text-align:center;"><i class="fas fa-wifi" style="margin-left:5px;"></i>تعذر تحميل التفسير</p>';
    }
}

function showAdditionalSections() {
    const shareCard = document.getElementById('shareCard');
    const navCard = document.getElementById('navigationCard');
    if (shareCard) shareCard.style.display = 'block';
    if (navCard) navCard.style.display = 'block';
}

function previousAyah() {
    if (!currentSurah || !currentAyah) return;
    if (currentAyah > 1) {
        loadQuickAyah(currentSurah, currentAyah - 1);
    } else if (currentSurah > 1) {
        const prev = surahsList.find(s => s.number === currentSurah - 1);
        if (prev) loadQuickAyah(currentSurah - 1, prev.numberOfAyahs);
    } else {
        if (typeof showToast === 'function') showToast('هذه أول آية في القرآن الكريم', 'info');
    }
}

function nextAyah() {
    if (!currentSurah || !currentAyah) return;
    const surah = surahsList.find(s => s.number === currentSurah);
    if (!surah) return;
    if (currentAyah < surah.numberOfAyahs) {
        loadQuickAyah(currentSurah, currentAyah + 1);
    } else if (currentSurah < 114) {
        loadQuickAyah(currentSurah + 1, 1);
    } else {
        if (typeof showToast === 'function') showToast('هذه آخر آية في القرآن الكريم', 'info');
    }
}

function playAudio() {
    if (audioElement) {
        audioElement.play().catch(e => {
            console.warn('Play failed:', e);
            if (typeof showToast === 'function') showToast('تعذر تشغيل الصوت', 'error');
        });
    }
}

function pauseAudio() {
    if (audioElement) audioElement.pause();
}

function downloadAudio() {
    if (audioElement && audioElement.querySelector && audioElement.querySelector('source')) {
        const src = audioElement.querySelector('source').src;
        if (src) {
            const a = document.createElement('a');
            a.href = src;
            a.download = 'quran_' + currentSurah + '_' + currentAyah + '.mp3';
            a.click();
        }
    } else if (audioElement && audioElement.src) {
        const a = document.createElement('a');
        a.href = audioElement.src;
        a.download = 'quran_' + currentSurah + '_' + currentAyah + '.mp3';
        a.click();
    }
}

async function shareAyah() {
    if (!currentAyahData) return;
    const text = currentAyahData.text + '\n\n' + currentAyahData.surah.name + ' - الآية ' + currentAyahData.numberInSurah + '\n\nمن تطبيق قرآن كريم';
    if (navigator.share) {
        try {
            await navigator.share({ title: 'آية قرآنية', text, url: location.href });
        } catch (e) {
            if (e.name !== 'AbortError') copyAyah();
        }
    } else {
        copyAyah();
    }
}

function copyAyah() {
    if (!currentAyahData) return;
    const text = currentAyahData.text + '\n\n' + currentAyahData.surah.name + ' - الآية ' + currentAyahData.numberInSurah;
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text)
            .then(() => { if (typeof showToast === 'function') showToast('تم نسخ الآية', 'success'); })
            .catch(() => { if (typeof showToast === 'function') showToast('تعذر النسخ', 'error'); });
    } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); if (typeof showToast === 'function') showToast('تم نسخ الآية', 'success'); }
        catch (e) { if (typeof showToast === 'function') showToast('تعذر النسخ', 'error'); }
        document.body.removeChild(ta);
    }
}

function showLoading(show) {
    const ls = document.getElementById('loadingState');
    const rs = document.getElementById('resultsSection');
    const btn = document.getElementById('searchBtn');
    const sp = document.getElementById('searchSpinner');
    if (show) {
        if (ls) ls.style.display = 'block';
        if (rs) rs.style.display = 'none';
        if (sp) sp.style.display = '';
        if (btn) btn.disabled = true;
    } else {
        if (ls) ls.style.display = 'none';
        if (sp) sp.style.display = 'none';
        if (btn) btn.disabled = false;
    }
}

function showError(msg, details) {
    const el = document.getElementById('errorMsg');
    const et = document.getElementById('errorText');
    const ed = document.getElementById('errorDetails');
    if (!el) return;
    if (et) et.textContent = msg || 'حدث خطأ';
    if (ed) ed.textContent = details || '';
    el.style.display = 'block';
    setTimeout(() => hideError(), 6000);
}

function hideError() {
    const el = document.getElementById('errorMsg');
    if (el) el.style.display = 'none';
}

function getSurahAyahCount(n) {
    const s = surahsList.find(s => s.number === n);
    return s ? s.numberOfAyahs : 0;
}

// Expose globally
window.loadQuickAyah = loadQuickAyah;
window.__loadQuickAyah = loadQuickAyah;
window.playAudio = playAudio;
window.pauseAudio = pauseAudio;
window.downloadAudio = downloadAudio;
window.shareAyah = shareAyah;
window.copyAyah = copyAyah;
window.fetchAyahBySurah = fetchAyahBySurah;
window.searchByGlobalAyah = searchByGlobalAyah;
window.previousAyah = previousAyah;
window.nextAyah = nextAyah;
window.toggleLegend = toggleLegend;
