const QuranConfig = {
  version: "3.0.0",

  siteName: "قرآن كريم",
  siteDescription: "تلاوات قرآنية متنوعة مع التفسير والترجمة",

  totalAyahs: 6236,

  surahsSource: "https://api.alquran.cloud/v1/surah",

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
  style: "مرتل",
  type: "murattal",
  color: "bg-gradient-to-r from-orange-500 to-orange-600",
  sources: [
    (surah, ayah) =>
      `https://everyayah.com/data/MaherAlMuaiqly128kbps/${String(surah).padStart(3, '0')}${String(ayah).padStart(3, '0')}.mp3`,
    (surah, ayah) =>
      `https://everyayah.com/data/MaherAlMuaiqly128kbps/${String(surah).padStart(3, '0')}${String(ayah).padStart(3, '0')}.mp3`,
  ],
},

alafasy: {
  id: "alafasy",
  name: "مشاري العفاسي",
  style: "مرتل",
  type: "murattal",
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
  style: "مرتل",
  type: "murattal",
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
  style: "مرتل",
  type: "murattal",
  color: "bg-gradient-to-r from-blue-500 to-blue-600",
  sources: [
    (surah, ayah) =>
      `https://everyayah.com/data/Husary_128kbps_Mujawwad/${String(surah).padStart(3, '0')}${String(ayah).padStart(3, '0')}.mp3`,
    (surah, ayah) =>
      `https://everyayah.com/data/Husary_64kbps_Mujawwad/${String(surah).padStart(3, '0')}${String(ayah).padStart(3, '0')}.mp3`,
    (surah, ayah) =>
      `https://everyayah.com/data/Husary_32kbps_Mujawwad/${String(surah).padStart(3, '0')}${String(ayah).padStart(3, '0')}.mp3`,
    (surah, ayah) =>
      `https://everyayah.com/data/Husary_16kbps_Mujawwad/${String(surah).padStart(3, '0')}${String(ayah).padStart(3, '0')}.mp3`,
  ],
},

sudais: {
  id: "sudais",
  name: "عبدالرحمن السديس",
  style: "مرتل",
  type: "murattal",
  color: "bg-gradient-to-r from-cyan-500 to-cyan-600",
  sources: [
    (surah, ayah) =>
      `https://everyayah.com/data/Abdurrahmaan_As-Sudais_192kbps/${String(surah).padStart(3, '0')}${String(ayah).padStart(3, '0')}.mp3`,
    (surah, ayah) =>
      `https://everyayah.com/data/Abdurrahmaan_As-Sudais_64kbps/${String(surah).padStart(3, '0')}${String(ayah).padStart(3, '0')}.mp3`,
  ],
},
  },

  apis: {
    ayah: (number) => `https://api.alquran.cloud/v1/ayah/${number}`,

    ayahBySurah: (surah, ayah) =>
      `https://api.alquran.cloud/v1/ayah/${surah}:${ayah}`,

    ayahBySurahNumber: (surah, ayah) =>
      `https://api.alquran.cloud/v1/ayah/${surah}:${ayah}`,

    surahs: () => `https://api.alquran.cloud/v1/surah`,

    surah: (number) => `https://api.alquran.cloud/v1/surah/${number}`,

    translation: (ayah, translator = "en.asad") =>
      `https://api.alquran.cloud/v1/ayah/${ayah}/${translator}`,

    tafseer: (ayah, tafsir = "ar.muyassar") =>
      `https://api.alquran.cloud/v1/ayah/${ayah}/${tafsir}`,

    search: (query) => `https://api.alquran.cloud/v1/search/${query}/all/ar`,
  },

  colors: {
    primary: "#059669",
    secondary: "#0ea5e9",
    accent: "#8b5cf6",
    success: "#10b981",
    warning: "#f59e0b",
    danger: "#ef4444",
    info: "#3b82f6",
  },

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

  init: function () {
    console.log(`📖 ${this.siteName} v${this.version}`);
    console.log(`🎯 ${this.siteDescription}`);
  },
};

window.QuranConfig = QuranConfig;
