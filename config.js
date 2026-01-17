// إعدادات مشروع القرآن الكريم - النسخة المحسنة

const QuranConfig = {
  // إصدار التطبيق
  version: "3.0.0",

  // معلومات الموقع
  siteName: "قرآن كريم",
  siteDescription: "تلاوات قرآنية متنوعة مع التفسير والترجمة",

  // عدد الآيات الكلي
  totalAyahs: 6236,

  // مصدر السور
  surahsSource: "https://api.alquran.cloud/v1/surah",

  // القارئون المتاحون مع مصادرهم - معدل ليعمل مع everyayah.com
  reciters: {
minshawi: {
  id: "minshawi",
  name: "محمد صديق المنشاوي",
  style: "مرتل",
  type: "murattal",
  color: "bg-gradient-to-r from-purple-500 to-purple-600",
  sources: [
    (surah, ayah) =>
      `https://everyayah.com/data/Minshawy_Murattal_128kbps/${String(surah).padStart(3, '0')}${String(ayah).padStart(3, '0')}.mp3`,
    (surah, ayah) =>
      `https://everyayah.com/data/Minshawy_Murattal_64kbps/${String(surah).padStart(3, '0')}${String(ayah).padStart(3, '0')}.mp3`,
    (surah, ayah) =>
      `https://everyayah.com/data/Minshawy_Murattal_32kbps/${String(surah).padStart(3, '0')}${String(ayah).padStart(3, '0')}.mp3`,
    (surah, ayah) =>
      `https://everyayah.com/data/Minshawy_Murattal_16kbps/${String(surah).padStart(3, '0')}${String(ayah).padStart(3, '0')}.mp3`,
  ],
},

abdul_basit: {
  id: "abdul_basit",
  name: "عبد الباسط عبد الصمد",
  style: "مرتل",
  type: "murattal",
  color: "bg-gradient-to-r from-red-500 to-red-600",
  sources: [
    (surah, ayah) =>
      `https://everyayah.com/data/Abdul_Basit_Murattal_192kbps/${String(surah).padStart(3, '0')}${String(ayah).padStart(3, '0')}.mp3`,
    (surah, ayah) =>
      `https://everyayah.com/data/Abdul_Basit_Murattal_64kbps/${String(surah).padStart(3, '0')}${String(ayah).padStart(3, '0')}.mp3`,
  ],
},

muaiqly: {
  id: "muaiqly",
  name: "ماهر المعيقلي",
  style: "مجود",
  type: "tajweed",
  color: "bg-gradient-to-r from-orange-500 to-orange-600",
  sources: [
    (surah, ayah) =>
      `https://everyayah.com/data/MaherAlMuaiqly_128kbps/${String(surah).padStart(3, '0')}${String(ayah).padStart(3, '0')}.mp3`,
    (surah, ayah) =>
      `https://everyayah.com/data/MaherAlMuaiqly_64kbps/${String(surah).padStart(3, '0')}${String(ayah).padStart(3, '0')}.mp3`,
  ],
},

alafasy: {
  id: "alafasy",
  name: "مشاري العفاسي",
  style: "مجود",
  type: "tajweed",
  color: "bg-gradient-to-r from-emerald-500 to-emerald-600",
  sources: [
    (surah, ayah) =>
      `https://everyayah.com/data/Alafasy_128kbps/${String(surah).padStart(3, '0')}${String(ayah).padStart(3, '0')}.mp3`,
    (surah, ayah) =>
      `https://everyayah.com/data/Alafasy_64kbps/${String(surah).padStart(3, '0')}${String(ayah).padStart(3, '0')}.mp3`,
    (surah, ayah) =>
      `https://everyayah.com/data/Alafasy_32kbps/${String(surah).padStart(3, '0')}${String(ayah).padStart(3, '0')}.mp3`,
  ],
},

albanna: {
  id: "albanna",
  name: "محمود علي البنا",
  style: "مجود",
  type: "tajweed",
  color: "bg-gradient-to-r from-green-500 to-green-600",
  sources: [
    (surah, ayah) =>
      `https://everyayah.com/data/mahmoud_ali_al_banna_128kbps/${String(surah).padStart(3, '0')}${String(ayah).padStart(3, '0')}.mp3`,
    (surah, ayah) =>
      `https://everyayah.com/data/mahmoud_ali_al_banna_64kbps/${String(surah).padStart(3, '0')}${String(ayah).padStart(3, '0')}.mp3`,
    (surah, ayah) =>
      `https://everyayah.com/data/mahmoud_ali_al_banna_32kbps/${String(surah).padStart(3, '0')}${String(ayah).padStart(3, '0')}.mp3`,
  ],
},

husary: {
  id: "husary",
  name: "محمود خليل الحصري",
  style: "متقن",
  type: "tajweed",
  color: "bg-gradient-to-r from-blue-500 to-blue-600",
  sources: [
    (surah, ayah) =>
      `https://everyayah.com/data/Husary_128kbps/${String(surah).padStart(3, '0')}${String(ayah).padStart(3, '0')}.mp3`,
    (surah, ayah) =>
      `https://everyayah.com/data/Husary_64kbps/${String(surah).padStart(3, '0')}${String(ayah).padStart(3, '0')}.mp3`,
    (surah, ayah) =>
      `https://everyayah.com/data/Husary_32kbps/${String(surah).padStart(3, '0')}${String(ayah).padStart(3, '0')}.mp3`,
    (surah, ayah) =>
      `https://everyayah.com/data/Husary_16kbps/${String(surah).padStart(3, '0')}${String(ayah).padStart(3, '0')}.mp3`,
  ],
},

sudais: {
  id: "sudais",
  name: "عبدالرحمن السديس",
  style: "مجود",
  type: "tajweed",
  color: "bg-gradient-to-r from-cyan-500 to-cyan-600",
  sources: [
    (surah, ayah) =>
      `https://everyayah.com/data/Abdurrahmaan_As-Sudais_192kbps/${String(surah).padStart(3, '0')}${String(ayah).padStart(3, '0')}.mp3`,
    (surah, ayah) =>
      `https://everyayah.com/data/Abdurrahmaan_As-Sudais_64kbps/${String(surah).padStart(3, '0')}${String(ayah).padStart(3, '0')}.mp3`,
  ],
},
  },

  // الواجهات البرمجية للبيانات
  apis: {
    // آية واحدة برقمها العام
    ayah: (number) => `https://api.alquran.cloud/v1/ayah/${number}`,

    // آية من سورة معينة
    ayahBySurah: (surah, ayah) =>
      `https://api.alquran.cloud/v1/ayah/${surah}:${ayah}`,

    // آية برقمها في السورة
    ayahBySurahNumber: (surah, ayah) =>
      `https://api.alquran.cloud/v1/ayah/${surah}:${ayah}`,

    // جميع السور
    surahs: () => `https://api.alquran.cloud/v1/surah`,

    // سورة كاملة
    surah: (number) => `https://api.alquran.cloud/v1/surah/${number}`,

    // ترجمة إنجليزية
    translation: (ayah, translator = "en.asad") =>
      `https://api.alquran.cloud/v1/ayah/${ayah}/${translator}`,

    // تفسير عربي
    tafseer: (ayah, tafsir = "ar.muyassar") =>
      `https://api.alquran.cloud/v1/ayah/${ayah}/${tafsir}`,

    // البحث في القرآن
    search: (query) => `https://api.alquran.cloud/v1/search/${query}/all/ar`,
  },

  // الألوان
  colors: {
    primary: "#059669",
    secondary: "#0ea5e9",
    accent: "#8b5cf6",
    success: "#10b981",
    warning: "#f59e0b",
    danger: "#ef4444",
    info: "#3b82f6",
  },

  // رسائل النظام
  messages: {
    loading: "جاري تحميل الآية...",
    loadingSurahs: "جاري تحميل قائمة السور...",
    error: "حدث خطأ في تحميل البيانات",
    noAudio: "التلاوة غير متوفرة لهذه الآية",
    invalidSurah: "رقم السورة غير صحيح",
    invalidAyah: "رقم الآية غير صحيح",
    networkError: "خطأ في الاتصال بالإنترنت",
    selectSurah: "يرجى اختيار سورة أولاً",
    ayahOutOfRange: "رقم الآية خارج نطاق السورة",
  },

  // تهيئة التطبيق
  init: function () {
    console.log(`📖 ${this.siteName} v${this.version}`);
    console.log(`🎯 ${this.siteDescription}`);
  },
};

// جعل الكائن متاحاً بشكل عام
window.QuranConfig = QuranConfig;
