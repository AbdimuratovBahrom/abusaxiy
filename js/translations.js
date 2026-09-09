// ── Единый файл переводов (ru / uz латиница / uz кириллица) ───────────────
const translations = {
  ru: {
    appName: "Abusaxiy",
    title: "Поиск линий электроснабжения магазинов",
    intro: "Найдите линию питания любого магазина за 3 шага",
    selectBlock: "Выберите блок",
    selectRow: "Выберите ряд",
    selectStore: "Выберите магазин",
    pathNotFound: "Путь не найден",
    showBlocks: "Показать блоки",
    hideBlocks: "Скрыть блоки",
    inputPlaceholder: "Например: путь питания магазина 47, 1-блок ряд E",
    sendBtn: "Отправить",
    aiTitle: "ИИ-Помощник",
    aiSubtitle: "Задавайте вопросы на русском или узбекском языке",
    noAnswer: "ИИ не смог ответить.",
    shopsLabel: "Магазины",
    serverDown: "Сервер не запущен.",
    serverDownHint: "Дважды кликните <b>start.bat</b> для запуска.",
    aiOffline: "ИИ-помощник доступен только при подключении к интернету.",
    aiUnavailable: "ИИ недоступен",
    dbResults: "Результаты из базы данных",
    timeout: "Таймаут запроса (30 сек)",
    serverError: "Ошибка сервера",

    quickSearchPlaceholder: "Быстрый поиск: номер или название магазина",
    quickSearchShopsLabel: "магазины",
    recentLabel: "Недавние запросы",
    stepBlockLabel: "1. Блок",
    stepBlockHint: "Выберите блок торгового центра",
    stepRowLabel: "2. Ряд",
    stepRowHint: "Выберите ряд внутри блока",
    stepStoreLabel: "3. Магазин",
    stepStoreHint: "Выберите магазин, чтобы увидеть линию питания",
    resultShopPrefix: "Магазин",
    copyBtn: "Скопировать",
    copiedMsg: "Скопировано!",
    shareBtn: "Поделиться",
    emptyTitle: "Ничего не найдено",
    emptyHint: "Проверьте номер магазина или попробуйте выбрать блок и ряд вручную",
    themeToLight: "Переключить на светлую тему",
    themeToDark: "Переключить на тёмную тему",

    quickActions: {
      terms:     { label: "📖 Термины", q: "Что такое ВРУ, ЩР, ЯРВ и ШО?" },
      block1:    { label: "🏢 1-блок",  q: "Как устроено электроснабжение 1-блока?" },
      emergency: { label: "🔧 Авария",  q: "Что делать если отключился магазин?" }
    },
    welcomeMsg: `**Привет!** Я ИИ-помощник по электроснабжению ТЦ Abusaxiy.\n` +
      `Я знаю все пути питания магазинов и помогу найти нужную линию.\n\n` +
      `Примеры запросов:\n` +
      `- Путь питания магазина 47, 1-блок ряд E\n` +
      `- Что такое ЩР и ВРУ?\n` +
      `- Какие магазины подключены к ШО-E47?`
  },
  uz_latn: {
    appName: "Abusaxiy",
    title: "Do'konlar elektr ta'minoti liniyalarini qidirish",
    intro: "Har qanday do'konning ta'minot liniyasini 3 qadamda toping",
    selectBlock: "Blokni tanlang",
    selectRow: "Qatorni tanlang",
    selectStore: "Do'konni tanlang",
    pathNotFound: "Yo'l topilmadi",
    showBlocks: "Bloklarni ko'rsatish",
    hideBlocks: "Bloklarni yashirish",
    inputPlaceholder: "Masalan: 47-do'kon, 1-blok E qator",
    sendBtn: "Yuborish",
    aiTitle: "AI-Yordamchi",
    aiSubtitle: "Savollaringizni rus yoki o'zbek tilida bering",
    noAnswer: "AI javob bera olmadi.",
    shopsLabel: "Do'konlar",
    serverDown: "Server ishga tushirilmagan.",
    serverDownHint: "Ishga tushirish uchun <b>start.bat</b> ustiga ikki marta bosing.",
    aiOffline: "AI-yordamchi faqat internetga ulanganda mavjud.",
    aiUnavailable: "AI mavjud emas",
    dbResults: "Ma'lumotlar bazasidan natijalar",
    timeout: "So'rov vaqti tugadi (30 soniya)",
    serverError: "Server xatosi",

    quickSearchPlaceholder: "Tezkor qidiruv: do'kon raqami yoki nomi",
    quickSearchShopsLabel: "do'konlar",
    recentLabel: "So'nggi so'rovlar",
    stepBlockLabel: "1. Blok",
    stepBlockHint: "Savdo markazi blokini tanlang",
    stepRowLabel: "2. Qator",
    stepRowHint: "Blok ichidagi qatorni tanlang",
    stepStoreLabel: "3. Do'kon",
    stepStoreHint: "Ta'minot liniyasini ko'rish uchun do'konni tanlang",
    resultShopPrefix: "Do'kon",
    copyBtn: "Nusxa olish",
    copiedMsg: "Nusxa olindi!",
    shareBtn: "Ulashish",
    emptyTitle: "Hech narsa topilmadi",
    emptyHint: "Do'kon raqamini tekshiring yoki blok va qatorni qo'lda tanlab ko'ring",
    themeToLight: "Yorug' mavzuga o'tish",
    themeToDark: "Qorong'i mavzuga o'tish",

    quickActions: {
      terms:     { label: "📖 Atamalar", q: "VRU, SHR, YARV va SHO nima?" },
      block1:    { label: "🏢 1-blok",   q: "1-blokning elektr ta'minoti qanday tuzilgan?" },
      emergency: { label: "🔧 Avariya",  q: "Do'kon o'chib qolsa nima qilish kerak?" }
    },
    welcomeMsg: `**Salom!** Men Abusaxiy SB elektr ta'minoti bo'yicha AI-yordamchiman.\n` +
      `Men barcha do'konlarning ta'minot yo'llarini bilaman va kerakli liniyani topishga yordam beraman.\n\n` +
      `So'rov namunalari:\n` +
      `- 47-do'kon ta'minot yo'li, 1-blok E qator\n` +
      `- SHR va VRU nima?\n` +
      `- ШО-E47 ga qaysi do'konlar ulangan?`
  },
  uz_cyrl: {
    appName: "Абусахий",
    title: "Дўконлар электр таъминоти линияларини қидириш",
    intro: "Исталган дўконнинг таъминот линиясини 3 қадамда топинг",
    selectBlock: "Блокни танланг",
    selectRow: "Қаторни танланг",
    selectStore: "Дўконни танланг",
    pathNotFound: "Йўл топилмади",
    showBlocks: "Блокларни кўрсатиш",
    hideBlocks: "Блокларни яшириш",
    inputPlaceholder: "Масалан: 47-дўкон, 1-блок E қатор",
    sendBtn: "Юбориш",
    aiTitle: "АИ-Ёрдамчи",
    aiSubtitle: "Саволларингизни рус ёки ўзбек тилида беринг",
    noAnswer: "АИ жавоб бера олмади.",
    shopsLabel: "Дўконлар",
    serverDown: "Сервер ишга туширилмаган.",
    serverDownHint: "Ишга тушириш учун <b>start.bat</b> устига икки марта босинг.",
    aiOffline: "АИ-ёрдамчи фақат интернетга уланганда мавжуд.",
    aiUnavailable: "АИ мавжуд эмас",
    dbResults: "Маълумотлар базасидан натижалар",
    timeout: "Сўров вақти тугади (30 сония)",
    serverError: "Сервер хатоси",

    quickSearchPlaceholder: "Тезкор қидирув: дўкон рақами ёки номи",
    quickSearchShopsLabel: "дўконлар",
    recentLabel: "Сўнгги сўровлар",
    stepBlockLabel: "1. Блок",
    stepBlockHint: "Савдо марказининг блокини танланг",
    stepRowLabel: "2. Қатор",
    stepRowHint: "Блок ичидаги қаторни танланг",
    stepStoreLabel: "3. Дўкон",
    stepStoreHint: "Таъминот линиясини кўриш учун дўконни танланг",
    resultShopPrefix: "Дўкон",
    copyBtn: "Нусха олиш",
    copiedMsg: "Нусха олинди!",
    shareBtn: "Улашиш",
    emptyTitle: "Ҳеч нарса топилмади",
    emptyHint: "Дўкон рақамини текширинг ёки блок ва қаторни қўлда танлаб кўринг",
    themeToLight: "Ёруғ мавзуга ўтиш",
    themeToDark: "Қоронғи мавзуга ўтиш",

    quickActions: {
      terms:     { label: "📖 Атамалар", q: "ВРУ, ШР, ЯРВ ва ШО нима?" },
      block1:    { label: "🏢 1-блок",   q: "1-блокнинг электр таъминоти қандай тузилган?" },
      emergency: { label: "🔧 Авария",   q: "Дўкон ўчиб қолса нима қилиш керак?" }
    },
    welcomeMsg: `**Салом!** Мен Абусахий СБ электр таъминоти бўйича АИ-ёрдамчиман.\n` +
      `Мен барча дўконларнинг таъминот йўлларини биламан ва керакли линияни топишга ёрдам бераман.\n\n` +
      `Сўров намуналари:\n` +
      `- 47-дўкон таъминот йўли, 1-блок E қатор\n` +
      `- ШР ва ВРУ нима?\n` +
      `- ШО-E47 га қайси дўконлар уланган?`
  }
};
