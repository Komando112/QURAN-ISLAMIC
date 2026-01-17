let currentReciter = 'minshawi';
let currentSurah = null;
let currentAyah = 1;
let currentAyahData = null;
let audioElement = null;
let surahsList = [];
let currentGlobalAyah = null;

document.addEventListener('DOMContentLoaded', async function() {
    console.log('📱 تهيئة تطبيق القرآن الكريم...');
    
    currentReciter = 'minshawi';
    
    await loadSurahs();
    
    loadReciters();
    
    setupEventListeners();
    
    setTimeout(() => {
        loadQuickAyah(1, 1);
    }, 1000);
    
    console.log('✅ التطبيق جاهز للاستخدام');
});

async function loadSurahs() {
    showToast('جاري تحميل قائمة السور...', 'info');
    
    try {
        const response = await fetch(QuranConfig.apis.surahs());
        const data = await response.json();
        
        if (data.data) {
            surahsList = data.data;
            populateSurahSelect();
            showToast('تم تحميل قائمة السور', 'success');
        }
    } catch (error) {
        console.error('خطأ في تحميل السور:', error);
        showToast('تعذر تحميل السور، يرجى التحقق من الاتصال بالإنترنت', 'error');
        surahsList = [];
    }
}

function populateSurahSelect() {
    const surahSelect = document.getElementById('surahSelect');
    surahSelect.innerHTML = '<option value="">-- اختر السورة --</option>';
    
    if (surahsList.length === 0) {
        const option = document.createElement('option');
        option.value = "";
        option.textContent = "تعذر تحميل السور - تحقق من الاتصال بالإنترنت";
        option.disabled = true;
        surahSelect.appendChild(option);
        return;
    }
    
    surahsList.forEach(surah => {
        const option = document.createElement('option');
        option.value = surah.number;
        option.textContent = `${surah.number}. ${surah.name} (${surah.englishName}) - ${surah.numberOfAyahs} آية`;
        surahSelect.appendChild(option);
    });
    
    surahSelect.addEventListener('change', function() {
        const surahNumber = parseInt(this.value);
        if (surahNumber) {
            updateSurahInfo(surahNumber);
            document.getElementById('ayahInSurah').max = getSurahAyahCount(surahNumber);
            document.getElementById('ayahInSurah').value = 1;
            updateAyahRange(surahNumber);
        } else {
            hideSurahInfo();
        }
    });
}

function updateSurahInfo(surahNumber) {
    const surah = surahsList.find(s => s.number === surahNumber);
    if (!surah) return;
    
    const surahInfo = document.getElementById('surahInfo');
    surahInfo.innerHTML = `
        <div class="flex items-center gap-2 text-quran-primary">
            <i class="fas fa-info-circle"></i>
            <span>${surah.englishName} - ${surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}</span>
            <span class="text-gray-400">|</span>
            <span>عدد الآيات: ${surah.numberOfAyahs}</span>
        </div>
    `;
    surahInfo.classList.remove('hidden');
    
    updateAyahRange(surahNumber);
}

function updateAyahRange(surahNumber) {
    const surah = surahsList.find(s => s.number === surahNumber);
    if (!surah) return;
    
    const ayahRange = document.getElementById('ayahRange');
    const maxAyah = document.getElementById('maxAyah');
    
    maxAyah.textContent = surah.numberOfAyahs;
    ayahRange.classList.remove('hidden');
}

function hideSurahInfo() {
    document.getElementById('surahInfo').classList.add('hidden');
    document.getElementById('ayahRange').classList.add('hidden');
}

function loadReciters() {
    const reciterSelect = document.getElementById('reciterSelect');
    reciterSelect.innerHTML = '';
    
    Object.values(QuranConfig.reciters).forEach(reciter => {
        const option = document.createElement('option');
        option.value = reciter.id;
        option.textContent = `${reciter.name} - ${reciter.style}`;
        reciterSelect.appendChild(option);
    });
    
    reciterSelect.value = currentReciter;
    
    reciterSelect.addEventListener('change', function() {
        currentReciter = this.value;
        
        if (currentAyahData) {
            loadAudio(currentAyahData);
        }
    });
}

function setupEventListeners() {
    document.getElementById('ayahInSurah').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            fetchAyahBySurah();
        }
    });
    
    document.getElementById('globalAyah').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchByGlobalAyah();
        }
    });
    
    document.getElementById('ayahInSurah').addEventListener('input', hideError);
    document.getElementById('globalAyah').addEventListener('input', hideError);
    
    const style = document.createElement('style');
    style.textContent = `
        #donationModal .sm\\:align-middle {
            transition: all 0.3s ease-out;
            transform: scale(0.95);
            opacity: 0;
        }
        
        #donationModal .sm\\:align-middle.scale-100 {
            transform: scale(1);
            opacity: 1;
        }
        
        .donation-btn:hover {
            animation: pulseGlow 1.5s ease-in-out infinite;
        }
        
        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
        }
        
        .floating-icon {
            animation: float 3s ease-in-out infinite;
        }
    `;
    document.head.appendChild(style);
    
    const donationModalStyle = document.createElement('style');
    donationModalStyle.textContent = `
        .donation-info-item {
            transition: all 0.3s ease;
        }
        
        .donation-info-item:hover {
            transform: translateX(-5px);
            box-shadow: 0 4px 12px rgba(5, 150, 105, 0.15);
        }
        
        .payment-number {
            font-family: 'Courier New', monospace;
            letter-spacing: 1px;
            direction: ltr;
            text-align: left;
            display: inline-block;
            min-width: 150px;
        }
        
        .donation-btn {
            position: relative;
            overflow: hidden;
        }
        
        .donation-btn::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 5px;
            height: 5px;
            background: rgba(255, 255, 255, 0.5);
            opacity: 0;
            border-radius: 100%;
            transform: scale(1, 1) translate(-50%);
            transform-origin: 50% 50%;
        }
        
        .donation-btn:focus:not(:active)::after {
            animation: ripple 1s ease-out;
        }
        
        @keyframes ripple {
            0% {
                transform: scale(0, 0);
                opacity: 0.5;
            }
            20% {
                transform: scale(25, 25);
                opacity: 0.3;
            }
            100% {
                transform: scale(40, 40);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(donationModalStyle);
}

function formatSurahAyahNumbers(surahNumber, ayahNumber) {
    const surah = surahNumber.toString().padStart(3, '0');
    const ayah = ayahNumber.toString().padStart(3, '0');
    return { surah, ayah };
}

function loadQuickAyah(surah, ayah) {
    document.getElementById('surahSelect').value = surah;
    document.getElementById('ayahInSurah').value = ayah;
    
    updateSurahInfo(surah);
    updateAyahRange(surah);
    
    setTimeout(() => {
        fetchAyahBySurah();
    }, 300);
}

async function fetchAyahBySurah() {
    const surahSelect = document.getElementById('surahSelect');
    const ayahInput = document.getElementById('ayahInSurah');
    
    const surahNumber = parseInt(surahSelect.value);
    const ayahNumber = parseInt(ayahInput.value);
    
    if (!surahNumber) {
        showError(QuranConfig.messages.selectSurah);
        return;
    }
    
    const surah = surahsList.find(s => s.number === surahNumber);
    if (!surah) {
        showError('السورة غير موجودة');
        return;
    }
    
    if (!ayahNumber || ayahNumber < 1 || ayahNumber > surah.numberOfAyahs) {
        showError(QuranConfig.messages.ayahOutOfRange, `يجب أن يكون بين 1 و ${surah.numberOfAyahs}`);
        return;
    }
    
    currentSurah = surahNumber;
    currentAyah = ayahNumber;
    
    showLoading(true);
    
    try {
        const ayahData = await getAyahBySurahNumber(surahNumber, ayahNumber);
        
        displayAyah(ayahData);
        await loadAudio(ayahData);
        await loadTranslation(ayahData.number);
        await loadTafseer(ayahData.number);
        
        showAdditionalSections();
        
        currentAyahData = ayahData;
        currentGlobalAyah = ayahData.number;
        
    } catch (error) {
        console.error('❌ خطأ:', error);
        showError(QuranConfig.messages.error, error.message);
    } finally {
        showLoading(false);
    }
}

async function searchByGlobalAyah() {
    const globalAyahInput = document.getElementById('globalAyah');
    const ayahNumber = parseInt(globalAyahInput.value.trim());
    
    if (!ayahNumber || ayahNumber < 1 || ayahNumber > QuranConfig.totalAyahs) {
        showError(QuranConfig.messages.invalidAyah, `يجب أن يكون بين 1 و ${QuranConfig.totalAyahs}`);
        return;
    }
    
    showLoading(true);
    
    try {
        const ayahData = await getAyahData(ayahNumber);
        
        document.getElementById('surahSelect').value = ayahData.surah.number;
        document.getElementById('ayahInSurah').value = ayahData.numberInSurah;
        
        updateSurahInfo(ayahData.surah.number);
        updateAyahRange(ayahData.surah.number);
        
        displayAyah(ayahData);
        await loadAudio(ayahData);
        await loadTranslation(ayahNumber);
        await loadTafseer(ayahNumber);
        
        showAdditionalSections();
        
        currentAyahData = ayahData;
        currentSurah = ayahData.surah.number;
        currentAyah = ayahData.numberInSurah;
        currentGlobalAyah = ayahNumber;
        
    } catch (error) {
        console.error('❌ خطأ:', error);
        showError(QuranConfig.messages.error, error.message);
    } finally {
        showLoading(false);
    }
}

async function getAyahData(ayahNumber) {
    try {
        const response = await fetch(QuranConfig.apis.ayah(ayahNumber));
        
        if (!response.ok) {
            throw new Error('فشل في جلب البيانات');
        }
        
        const data = await response.json();
        
        if (!data.data) {
            throw new Error('الآية غير موجودة');
        }
        
        return data.data;
        
    } catch (error) {
        throw new Error('تعذر الاتصال بالخادم');
    }
}

async function getAyahBySurahNumber(surahNumber, ayahNumber) {
    try {
        const response = await fetch(QuranConfig.apis.ayahBySurah(surahNumber, ayahNumber));
        
        if (!response.ok) {
            throw new Error('فشل في جلب البيانات');
        }
        
        const data = await response.json();
        
        if (!data.data) {
            throw new Error('الآية غير موجودة');
        }
        
        return data.data;
        
    } catch (error) {
        throw new Error('تعذر الاتصال بالخادم');
    }
}

function displayAyah(ayahData) {
    const display = document.getElementById('ayahDisplay');
    const surah = surahsList.find(s => s.number === ayahData.surah.number);
    
    display.innerHTML = `
        <div class="text-center">
            <!-- معلومات السورة -->
            <div class="flex flex-wrap justify-center items-center gap-3 mb-6">
                <span class="bg-quran-primary text-white px-5 py-2 rounded-full font-bold text-lg">
                    <i class="fas fa-book-open ml-2"></i>
                    ${ayahData.surah.name} (${surah ? surah.englishName : ''})
                </span>
                <span class="text-gray-400 text-xl">•</span>
                <span class="text-gray-700 text-lg">
                    الآية ${ayahData.numberInSurah} من ${ayahData.surah.numberOfAyahs}
                </span>
                <span class="text-gray-400 text-xl">•</span>
                <span class="text-gray-600">
                    الجزء ${ayahData.juz}
                </span>
            </div>
            
            <!-- نص الآية -->
            <div class="bg-gradient-to-br from-gray-50 to-white p-6 md:p-8 rounded-2xl border border-gray-200 mb-8 shadow-inner">
                <p class="ayah-text text-gray-800 mb-10 leading-relaxed">
                    ${ayahData.text}
                </p>
                <div class="text-4xl text-quran-primary font-bold animate-pulse">
                    ﴿${ayahData.numberInSurah}﴾
                </div>
            </div>
            
            <!-- الإحصائيات -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="text-center p-4 bg-gray-100 rounded-xl">
                    <div class="text-sm text-gray-600 mb-2">رقم الآية العام</div>
                    <div class="text-2xl font-bold text-quran-primary">${ayahData.number}</div>
                </div>
                <div class="text-center p-4 bg-gray-100 rounded-xl">
                    <div class="text-sm text-gray-600 mb-2">رقم السورة</div>
                    <div class="text-2xl font-bold text-quran-primary">${ayahData.surah.number}</div>
                </div>
                <div class="text-center p-4 bg-gray-100 rounded-xl">
                    <div class="text-sm text-gray-600 mb-2">الصفحة</div>
                    <div class="text-2xl font-bold text-quran-primary">${ayahData.page}</div>
                </div>
                <div class="text-center p-4 bg-gray-100 rounded-xl">
                    <div class="text-sm text-gray-600 mb-2">رقم الآية في السورة</div>
                    <div class="text-2xl font-bold text-quran-primary">${ayahData.numberInSurah}</div>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('ayahCard').classList.add('slide-up');
}

async function loadAudio(ayahData) {
    const audioDisplay = document.getElementById('audioDisplay');
    const reciter = QuranConfig.reciters[currentReciter];
    
    document.getElementById('reciterName').textContent = `تلاوة ${reciter.name}`;
    
    const { surah, ayah } = formatSurahAyahNumbers(ayahData.surah.number, ayahData.numberInSurah);
    
    let audioUrl = null;
    
    for (const sourceFunc of reciter.sources) {
        const url = sourceFunc(surah, ayah);
        
        try {
            console.log(`🔍 جاري اختبار: ${url}`);
            const response = await fetch(url, { method: 'HEAD' });
            
            if (response.ok) {
                audioUrl = url;
                console.log(`✅ تم العثور على الصوت: ${url}`);
                break;
            }
        } catch (error) {
            console.log(`❌ فشل تحميل: ${url}`, error);
            continue;
        }
    }
    
    if (audioUrl) {
        audioDisplay.innerHTML = `
            <audio 
                id="ayahAudio" 
                controls 
                class="w-full rounded-xl shadow-md"
                preload="metadata"
            >
                <source src="${audioUrl}" type="audio/mpeg">
                متصفحك لا يدعم تشغيل الصوت
            </audio>
            <div class="mt-4 text-center">
                <p class="text-gray-600 text-sm">
                    <i class="fas fa-volume-up ml-1"></i>
                    ${reciter.name} - ${reciter.style}
                </p>
                <p class="text-gray-500 text-xs mt-1">
                    اضغط للاستماع إلى التلاوة
                </p>
            </div>
        `;
        
        document.getElementById('audioCard').classList.remove('hidden');
        
        audioElement = document.getElementById('ayahAudio');
        
        audioElement.addEventListener('error', function() {
            showToast('تعذر تحميل التلاوة، جاري البحث عن مصدر بديل', 'warning');
            setTimeout(() => tryAlternativeAudio(surah, ayah), 1000);
        });
        
    } else {
        audioDisplay.innerHTML = `
            <div class="text-center p-6 bg-amber-50 border border-amber-200 rounded-xl">
                <i class="fas fa-volume-mute text-amber-500 text-3xl mb-4"></i>
                <p class="text-amber-700 font-bold text-lg mb-2">التلاوة غير متوفرة</p>
                <p class="text-amber-600 mb-4">
                    تلاوة ${reciter.name} غير متاحة لهذه الآية حالياً.
                </p>
                <button onclick="tryAlternativeAudio('${surah}', '${ayah}')" 
                        class="px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-lg transition">
                    <i class="fas fa-sync-alt ml-1"></i>
                    جرب قارئاً آخر
                </button>
            </div>
        `;
        
        document.getElementById('audioCard').classList.remove('hidden');
    }
}

async function tryAlternativeAudio(surah, ayah) {
    const reciters = Object.values(QuranConfig.reciters);
    let success = false;
    
    for (const reciter of reciters) {
        if (reciter.id === currentReciter) continue;
        
        for (const sourceFunc of reciter.sources) {
            const url = sourceFunc(surah, ayah);
            
            try {
                const response = await fetch(url, { method: 'HEAD' });
                if (response.ok) {
                    currentReciter = reciter.id;
                    document.getElementById('reciterSelect').value = currentReciter;

                    if (currentAyahData) {
                        loadAudio(currentAyahData);
                    }
                    
                    showToast(`تم التبديل إلى ${reciter.name}`, 'success');
                    success = true;
                    return;
                }
            } catch (error) {
                continue;
            }
        }
    }
    
    if (!success) {
        showToast('لم يتم العثور على تلاوة بديلة', 'error');
    }
}

async function loadTranslation(ayahNumber) {
    try {
        const response = await fetch(QuranConfig.apis.translation(ayahNumber, 'en.asad'));
        const data = await response.json();
        
        const display = document.getElementById('translationDisplay');
        
        if (data.data && data.data.text) {
            display.innerHTML = `
                <div class="bg-white/90 p-5 rounded-xl border border-blue-300">
                    <p class="text-gray-700 leading-relaxed text-left" dir="ltr" style="line-height: 1.8;">
                        ${data.data.text}
                    </p>
                    <div class="mt-4 pt-4 border-t border-blue-200 text-sm text-blue-600">
                        <i class="fas fa-user ml-1"></i> Translation by Muhammad Asad
                    </div>
                </div>
            `;
            document.getElementById('translationCard').classList.remove('hidden');
        }
    } catch (error) {
        console.error('Translation error:', error);
        document.getElementById('translationCard').classList.add('hidden');
    }
}

async function loadTafseer(ayahNumber) {
    try {
        const response = await fetch(QuranConfig.apis.tafseer(ayahNumber, 'ar.muyassar'));
        const data = await response.json();
        
        const display = document.getElementById('tafseerDisplay');
        
        if (data.data && data.data.text) {
            display.innerHTML = `
                <div class="bg-white/90 p-5 rounded-xl border border-purple-300">
                    <p class="text-gray-700 leading-relaxed" style="line-height: 1.8;">
                        ${data.data.text}
                    </p>
                    <div class="mt-4 pt-4 border-t border-purple-200 text-sm text-purple-600">
                        <i class="fas fa-book ml-1"></i> التفسير الميسر
                    </div>
                </div>
            `;
            document.getElementById('tafseerCard').classList.remove('hidden');
        }
    } catch (error) {
        console.error('Tafseer error:', error);
        document.getElementById('tafseerCard').classList.add('hidden');
    }
}

function showAdditionalSections() {
    document.getElementById('resultsSection').classList.remove('hidden');
    document.getElementById('shareCard').classList.remove('hidden');
    document.getElementById('navigationCard').classList.remove('hidden');
}

function previousAyah() {
    if (!currentSurah || !currentAyah) return;
    
    if (currentAyah > 1) {
        loadQuickAyah(currentSurah, currentAyah - 1);
    } else if (currentSurah > 1) {
        const prevSurah = currentSurah - 1;
        const surah = surahsList.find(s => s.number === prevSurah);
        if (surah) {
            loadQuickAyah(prevSurah, surah.numberOfAyahs);
        }
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
    }
}

function playAudio() {
    if (audioElement) {
        audioElement.play().catch(error => {
            console.error('Audio play error:', error);
            showError('تعذر تشغيل الصوت');
        });
    }
}

function pauseAudio() {
    if (audioElement) {
        audioElement.pause();
    }
}

function downloadAudio() {
    if (audioElement && audioElement.src) {
        const link = document.createElement('a');
        link.href = audioElement.src;
        link.download = `quran_${currentSurah}_${currentAyah}_${currentReciter}.mp3`;
        link.click();
        showToast('جاري تحميل التلاوة...', 'info');
    }
}

async function shareAyah() {
    if (!currentAyahData) return;
    
    const ayahText = currentAyahData.text;
    const surahName = currentAyahData.surah.name;
    const ayahNumber = currentAyahData.numberInSurah;
    
    const shareText = `${ayahText}\n\n${surahName} - الآية ${ayahNumber}\n\nمن تطبيق قرآن كريم`;
    
    if (navigator.share) {
        try {
            await navigator.share({
                title: 'آية قرآنية',
                text: shareText,
                url: window.location.href,
            });
            showToast('تمت المشاركة بنجاح', 'success');
        } catch (error) {
            if (error.name !== 'AbortError') {
                copyAyah();
            }
        }
    } else {
        copyAyah();
    }
}

function copyAyah() {
    if (!currentAyahData) return;
    
    const ayahText = currentAyahData.text;
    const surahName = currentAyahData.surah.name;
    const ayahNumber = currentAyahData.numberInSurah;
    
    const textToCopy = `${ayahText}\n\n${surahName} - الآية ${ayahNumber}`;
    
    navigator.clipboard.writeText(textToCopy)
        .then(() => {
            showToast('تم نسخ الآية إلى الحافظة', 'success');
        })
        .catch(error => {
            console.error('Copy error:', error);
            showToast('تعذر نسخ النص', 'error');
        });
}

function showDonationModal() {
    const modal = document.getElementById('donationModal');
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
        modal.querySelector('.sm\\:align-middle').classList.add('scale-100', 'opacity-100');
    }, 10);
}

function hideDonationModal() {
    const modal = document.getElementById('donationModal');
    const content = modal.querySelector('.sm\\:align-middle');
    
    content.classList.remove('scale-100', 'opacity-100');
    
    setTimeout(() => {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }, 300);
}

function copyDonationInfo() {
    const donationInfo = `تبرع ودعم موقع قرآن كريم

معلومات الدفع:
• فودافون كاش: 01116648302
• PayPal: darkelmasry@instapay.com

"من ذا الذي يقرض الله قرضاً حسناً فيضاعفه له أضعافاً كثيرة"
البقرة (245)

كل التبرعات مخصصة لخدمة كتاب الله فقط.
نسأل الله أن يجعلها في ميزان حسناتكم.`.trim();
    
    navigator.clipboard.writeText(donationInfo)
        .then(() => {
            showToast('تم نسخ معلومات التبرع إلى الحافظة ✅', 'success');
            
            const copyBtn = document.querySelector('button[onclick="copyDonationInfo()"]');
            const originalText = copyBtn.innerHTML;
            copyBtn.innerHTML = '<i class="fas fa-check"></i> تم النسخ بنجاح!';
            copyBtn.classList.remove('bg-emerald-500', 'hover:bg-emerald-600');
            copyBtn.classList.add('bg-green-500', 'hover:bg-green-600');
            copyBtn.disabled = true;
            
            setTimeout(() => {
                copyBtn.innerHTML = originalText;
                copyBtn.classList.remove('bg-green-500', 'hover:bg-green-600');
                copyBtn.classList.add('bg-emerald-500', 'hover:bg-emerald-600');
                copyBtn.disabled = false;
            }, 2000);
        })
        .catch(err => {
            console.error('فشل النسخ:', err);
            showToast('تعذر نسخ المعلومات ❌', 'error');
        });
}

function showLoading(show) {
    const loadingState = document.getElementById('loadingState');
    const resultsSection = document.getElementById('resultsSection');
    const searchBtn = document.getElementById('searchBtn');
    const searchSpinner = document.getElementById('searchSpinner');
    
    if (show) {
        loadingState.classList.remove('hidden');
        resultsSection.classList.add('hidden');
        searchSpinner.classList.remove('hidden');
        searchBtn.disabled = true;
    } else {
        loadingState.classList.add('hidden');
        searchSpinner.classList.add('hidden');
        searchBtn.disabled = false;
    }
}

function showError(message, details = '') {
    const errorMsg = document.getElementById('errorMsg');
    const errorText = document.getElementById('errorText');
    const errorDetails = document.getElementById('errorDetails');
    
    errorText.textContent = message;
    errorDetails.textContent = details;
    errorMsg.classList.remove('hidden');
    
    setTimeout(() => {
        hideError();
    }, 5000);
}

function hideError() {
    document.getElementById('errorMsg').classList.add('hidden');
}

function showToast(message, type = 'info') {
    const existingToast = document.querySelector('.toast-message');
    if (existingToast) {
        existingToast.remove();
    }
    
    const toast = document.createElement('div');
    toast.className = `toast-message fixed top-6 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-xl shadow-lg text-white z-50 transition-all duration-300 flex items-center gap-3 ${
        type === 'success' ? 'bg-emerald-500' : 
        type === 'error' ? 'bg-red-500' : 
        type === 'warning' ? 'bg-amber-500' : 
        'bg-blue-500'
    }`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translate(-50%, -20px)';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

function getSurahAyahCount(surahNumber) {
    const surah = surahsList.find(s => s.number === surahNumber);
    return surah ? surah.numberOfAyahs : 0;
}

window.loadQuickAyah = loadQuickAyah;
window.playAudio = playAudio;
window.pauseAudio = pauseAudio;
window.downloadAudio = downloadAudio;
window.shareAyah = shareAyah;
window.copyAyah = copyAyah;
window.fetchAyahBySurah = fetchAyahBySurah;
window.searchByGlobalAyah = searchByGlobalAyah;
window.previousAyah = previousAyah;
window.nextAyah = nextAyah;
window.tryAlternativeAudio = tryAlternativeAudio;
window.showDonationModal = showDonationModal;
window.hideDonationModal = hideDonationModal;
window.copyDonationInfo = copyDonationInfo;