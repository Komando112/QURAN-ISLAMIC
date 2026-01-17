/**
 * القرآن الكريم - النسخة المحسنة
 * مع اختيار السورة والآية
 * إصدار 3.0.0
 */

// تهيئة المتغيرات العالمية
let currentReciter = 'minshawi';
let currentSurah = null;
let currentAyah = 1;
let currentAyahData = null;
let audioElement = null;
let surahsList = [];
let currentGlobalAyah = null;

// تهيئة التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', async function() {
    console.log('📱 تهيئة تطبيق القرآن الكريم...');
    
    // تعيين القارئ الافتراضي
    currentReciter = 'minshawi';
    
    // تحميل السور
    await loadSurahs();
    
    // تحميل القراء
    loadReciters();
    
    // إعداد مستمعي الأحداث
    setupEventListeners();
    
    // تحميل الفاتحة افتراضياً
    setTimeout(() => {
        loadQuickAyah(1, 1);
    }, 1000);
    
    console.log('✅ التطبيق جاهز للاستخدام');
});

// تحميل قائمة السور
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
        // لا نستخدم بيانات افتراضية
        surahsList = [];
    }
}

// ملء قائمة اختيار السور
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
    
    // إضافة حدث التغيير
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

// تحديث معلومات السورة
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
    
    // تحديث المدى
    updateAyahRange(surahNumber);
}

// تحديث مدى الآيات
function updateAyahRange(surahNumber) {
    const surah = surahsList.find(s => s.number === surahNumber);
    if (!surah) return;
    
    const ayahRange = document.getElementById('ayahRange');
    const maxAyah = document.getElementById('maxAyah');
    
    maxAyah.textContent = surah.numberOfAyahs;
    ayahRange.classList.remove('hidden');
}

// إخفاء معلومات السورة
function hideSurahInfo() {
    document.getElementById('surahInfo').classList.add('hidden');
    document.getElementById('ayahRange').classList.add('hidden');
}

// تحميل القراء في القائمة
function loadReciters() {
    const reciterSelect = document.getElementById('reciterSelect');
    reciterSelect.innerHTML = '';
    
    Object.values(QuranConfig.reciters).forEach(reciter => {
        const option = document.createElement('option');
        option.value = reciter.id;
        option.textContent = `${reciter.name} - ${reciter.style}`;
        reciterSelect.appendChild(option);
    });
    
    // تعيين القارئ الافتراضي
    reciterSelect.value = currentReciter;
    
    // إضافة حدث التغيير
    reciterSelect.addEventListener('change', function() {
        currentReciter = this.value;
        
        // إذا كانت هناك آية معروضة، أعد تحميل الصوت
        if (currentAyahData) {
            loadAudio(currentAyahData);
        }
    });
}

// إعداد مستمعي الأحداث
function setupEventListeners() {
    // البحث عند الضغط على Enter في حقل الآية في السورة
    document.getElementById('ayahInSurah').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            fetchAyahBySurah();
        }
    });
    
    // البحث عند الضغط على Enter في حقل الآية العام
    document.getElementById('globalAyah').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchByGlobalAyah();
        }
    });
    
    // إخفاء رسالة الخطأ عند الكتابة
    document.getElementById('ayahInSurah').addEventListener('input', hideError);
    document.getElementById('globalAyah').addEventListener('input', hideError);
}

// تنسيق أرقام السورة والآية إلى 3 خانات
function formatSurahAyahNumbers(surahNumber, ayahNumber) {
    // تنسيق الأرقام إلى 3 خانات مع صفر في البداية
    const surah = surahNumber.toString().padStart(3, '0');
    const ayah = ayahNumber.toString().padStart(3, '0');
    return { surah, ayah };
}

// تحميل آية سريعة
function loadQuickAyah(surah, ayah) {
    document.getElementById('surahSelect').value = surah;
    document.getElementById('ayahInSurah').value = ayah;
    
    // تحديث معلومات السورة
    updateSurahInfo(surah);
    updateAyahRange(surah);
    
    // البحث بعد تأخير بسيط
    setTimeout(() => {
        fetchAyahBySurah();
    }, 300);
}

// البحث بالسورة والآية
async function fetchAyahBySurah() {
    const surahSelect = document.getElementById('surahSelect');
    const ayahInput = document.getElementById('ayahInSurah');
    
    const surahNumber = parseInt(surahSelect.value);
    const ayahNumber = parseInt(ayahInput.value);
    
    // التحقق من صحة المدخلات
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
    
    // إظهار حالة التحميل
    showLoading(true);
    
    try {
        // جلب بيانات الآية
        const ayahData = await getAyahBySurahNumber(surahNumber, ayahNumber);
        
        // عرض البيانات
        displayAyah(ayahData);
        await loadAudio(ayahData);
        await loadTranslation(ayahData.number);
        await loadTafseer(ayahData.number);
        
        // إظهار الأقسام الإضافية
        showAdditionalSections();
        
        // حفظ البيانات الحالية
        currentAyahData = ayahData;
        currentGlobalAyah = ayahData.number;
        
    } catch (error) {
        console.error('❌ خطأ:', error);
        showError(QuranConfig.messages.error, error.message);
    } finally {
        showLoading(false);
    }
}

// البحث بالرقم العام للآية
async function searchByGlobalAyah() {
    const globalAyahInput = document.getElementById('globalAyah');
    const ayahNumber = parseInt(globalAyahInput.value.trim());
    
    // التحقق من صحة الرقم
    if (!ayahNumber || ayahNumber < 1 || ayahNumber > QuranConfig.totalAyahs) {
        showError(QuranConfig.messages.invalidAyah, `يجب أن يكون بين 1 و ${QuranConfig.totalAyahs}`);
        return;
    }
    
    // إظهار حالة التحميل
    showLoading(true);
    
    try {
        // جلب بيانات الآية
        const ayahData = await getAyahData(ayahNumber);
        
        // تحديث حقول السورة والآية
        document.getElementById('surahSelect').value = ayahData.surah.number;
        document.getElementById('ayahInSurah').value = ayahData.numberInSurah;
        
        // تحديث معلومات السورة
        updateSurahInfo(ayahData.surah.number);
        updateAyahRange(ayahData.surah.number);
        
        // عرض البيانات
        displayAyah(ayahData);
        await loadAudio(ayahData);
        await loadTranslation(ayahNumber);
        await loadTafseer(ayahNumber);
        
        // إظهار الأقسام الإضافية
        showAdditionalSections();
        
        // حفظ البيانات الحالية
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

// جلب بيانات الآية برقمها العام
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

// جلب بيانات الآية من سورة معينة
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

// عرض بيانات الآية
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

// تحميل التلاوة الصوتية
async function loadAudio(ayahData) {
    const audioDisplay = document.getElementById('audioDisplay');
    const reciter = QuranConfig.reciters[currentReciter];
    
    // تحديث اسم القارئ
    document.getElementById('reciterName').textContent = `تلاوة ${reciter.name}`;
    
    // تنسيق أرقام السورة والآية باستخدام الدالة المساعدة
    const { surah, ayah } = formatSurahAyahNumbers(ayahData.surah.number, ayahData.numberInSurah);
    
    let audioUrl = null;
    
    // تجربة كل مصدر حتى نجاح واحد
    for (const sourceFunc of reciter.sources) {
        const url = sourceFunc(surah, ayah);
        
        try {
            // اختبار إذا كان الملف موجوداً
            console.log(`🔍 جاري اختبار: ${url}`);
            const response = await fetch(url, { method: 'HEAD' });
            
            if (response.ok) {
                audioUrl = url;
                console.log(`✅ تم العثور على الصوت: ${url}`);
                break;
            }
        } catch (error) {
            console.log(`❌ فشل تحميل: ${url}`, error);
            // تجربة المصدر التالي
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
        
        // حفظ المرجع للعنصر الصوتي
        audioElement = document.getElementById('ayahAudio');
        
        // إضافة مستمع للأخطاء
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

// تجربة قارئ بديل
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
                    // تغيير القارئ الحالي
                    currentReciter = reciter.id;
                    document.getElementById('reciterSelect').value = currentReciter;
                    
                    // إعادة تحميل الصوت
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

// جلب الترجمة
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

// جلب التفسير
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

// إظهار الأقسام الإضافية
function showAdditionalSections() {
    document.getElementById('resultsSection').classList.remove('hidden');
    document.getElementById('shareCard').classList.remove('hidden');
    document.getElementById('navigationCard').classList.remove('hidden');
}

// التنقل بين الآيات
function previousAyah() {
    if (!currentSurah || !currentAyah) return;
    
    if (currentAyah > 1) {
        loadQuickAyah(currentSurah, currentAyah - 1);
    } else if (currentSurah > 1) {
        // الانتقال إلى السورة السابقة
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
        // الانتقال إلى السورة التالية
        loadQuickAyah(currentSurah + 1, 1);
    }
}

// التحكم بالصوت
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

// مشاركة الآية
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

// وظائف مساعدة
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
    
    // إخفاء الرسالة تلقائياً بعد 5 ثوان
    setTimeout(() => {
        hideError();
    }, 5000);
}

function hideError() {
    document.getElementById('errorMsg').classList.add('hidden');
}

function showToast(message, type = 'info') {
    // إزالة أي toast موجود
    const existingToast = document.querySelector('.toast-message');
    if (existingToast) {
        existingToast.remove();
    }
    
    // إنشاء toast جديد
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
    
    // إزالة toast بعد 3 ثوان
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

// الحصول على عدد آيات السورة
function getSurahAyahCount(surahNumber) {
    const surah = surahsList.find(s => s.number === surahNumber);
    return surah ? surah.numberOfAyahs : 0;
}

// جعل الدوال متاحة عالمياً
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