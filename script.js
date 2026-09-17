"use strict";

/*
  BAYAN WEBSITE / DASHBOARD SCRIPT
  ---------------------------------
  Works with:
  - English / Arabic
  - Dark / Light mode
  - Mobile navigation
  - FAQ
  - Scroll reveal
  - Animated counters
  - Searchable role selector
  - Searchable channel selector
  - Ticket channel selectors
  - Saved settings
  - Safe event binding
  - No external libraries
*/

const BAYAN_STORAGE_KEY = "bayan_settings_v3";
const BAYAN_LANGUAGE_KEY = "bayan_language";
const BAYAN_THEME_KEY = "bayan_theme";

/*
  If you later have a real secure backend, set:

  window.BAYAN_API_BASE_URL = "https://your-api.example.com";

  The browser will then try to load real server roles/channels.
  Without it, the selectors use safe local/demo data.
*/

const API_BASE =
  typeof window.BAYAN_API_BASE_URL === "string"
    ? window.BAYAN_API_BASE_URL.replace(/\/+$/, "")
    : "";

/* =========================================================
   DISCORD INVITE
========================================================= */

const DISCORD_BOT_INVITE =
  "https://discord.com/oauth2/authorize?client_id=1548309026280964106&scope=bot%20applications.commands&permissions=8";

/* =========================================================
   TRANSLATIONS
========================================================= */

const translations = {
  en: {
    brandSub: "Discord Bot",
    navFeatures: "Features",
    navCommands: "Commands",
    navHow: "How it works",
    navFaq: "FAQ",
    addBayan: "Add Bayan",

    eyebrow: "Built for modern Discord servers",
    heroTitle1: "Your server.",
    heroTitle2: "Smarter with Bayan.",
    heroSubtitle:
      "Bayan brings moderation, tickets, giveaways, tournaments, logging and server management together in one powerful Discord bot.",
    addServer: "Add to Server →",
    explore: "Explore Features",

    statCommands: "Commands",
    statReady: "Ready",
    statControl: "Control Center",

    serverPreview: "Server preview",
    botOnline: "Bayan ready",
    botDescription: "Server management bot",
    verified: "BOT",

    modCard: "Moderation",
    modCardText: "Keep your server controlled",
    ticketCard: "Tickets",
    ticketCardText: "Organize member support",
    giveawayCard: "Giveaways",
    giveawayCardText: "Run community events",
    logsCard: "Logs",
    logsCardText: "Track important activity",
    channelName: "general",
    channelPeople: "128 members",

    trust1: "Useful commands",
    trust2: "Core systems",
    trust3: "Discord focused",
    trust4: "Room to grow",

    featuresLabel: "Powerful systems",
    featuresTitle: "Everything your community needs.",
    featuresSubtitle:
      "Bayan is designed around the features Discord communities actually use every day.",

    feature1Title: "Moderation",
    feature1Text:
      "Manage members with moderation commands, warnings, bans, kicks, timeouts and cleanup tools.",

    feature2Title: "Tickets",
    feature2Text:
      "Give members an organized way to ask for help, report issues or submit appeals.",

    feature3Title: "Giveaways",
    feature3Text:
      "Create community giveaways and manage winners directly from Discord.",

    feature4Title: "Logging",
    feature4Text:
      "Keep important server activity visible with message, voice and moderation logs.",

    feature5Title: "Auto Role",
    feature5Text:
      "Automatically assign a role to new members when they join your server.",

    feature6Title: "Tournaments",
    feature6Text:
      "Organize matches and tournament brackets for competitive communities.",

    commandsLabel: "Commands",
    commandsTitle: "Fast when you need it.",
    commandsSubtitle:
      "Clean slash commands built around real server management workflows.",

    commandIntroTitle: "Your tools, one bot.",
    commandIntroText:
      "Bayan keeps server management simple with commands that are easy for staff to understand and use.",

    cmdBan: "Ban a member from the server.",
    cmdKick: "Remove a member from the server.",
    cmdWarn: "Issue a server warning.",
    cmdClear: "Quickly remove messages from a channel.",
    cmdTicket: "Set up the support ticket system.",
    cmdRole: "Configure the automatic member role.",
    cmdGiveaway: "Start and manage community giveaways.",
    cmdTournament: "Create and manage tournament matches.",

    howLabel: "Getting started",
    howTitle: "Three steps. One better server.",
    howSubtitle:
      "Add Bayan, configure the systems you need and let your staff work.",

    step1Title: "Add Bayan",
    step1Text:
      "Invite Bayan to your Discord server with one click.",

    step2Title: "Configure",
    step2Text:
      "Set up tickets, roles, logs, moderation and your community tools.",

    step3Title: "Run your server",
    step3Text:
      "Let Bayan handle repetitive work while your team focuses on the community.",

    statsLabel: "At a glance",
    statsTitle: "Built to scale with your community.",
    statsCommands: "Commands",
    statsSystems: "Core systems",
    statsReady: "Designed for uptime",
    statsBot: "Bayan bot",

    faqLabel: "FAQ",
    faqTitle: "Questions, answered.",
    faqSubtitle:
      "A few things to know before adding Bayan.",

    faq1Question: "What is Bayan?",
    faq1Answer:
      "Bayan is a Discord bot focused on moderation, server management, tickets and community systems.",

    faq2Question: "Can I add Bayan to my server?",
    faq2Answer:
      "Yes. Use the Add Bayan button to open Discord's authorization page.",

    faq3Question: "Does the website support Arabic?",
    faq3Answer:
      "Yes. Switch between English and Arabic from the language selector.",

    faq4Question: "Does this page replace the dashboard?",
    faq4Answer:
      "No. This is the public Bayan website. Your dashboard remains separate.",

    ctaTitle: "Ready to upgrade your server?",
    ctaSubtitle:
      "Bring moderation, tickets, events and server tools together with Bayan.",
    ctaButton: "Add Bayan to Discord →",
    backTop: "Back to top",

    footerText: "Built for Discord communities.",
    footerFeatures: "Features",
    footerCommands: "Commands",
    footerFaq: "FAQ",
    footerAdd: "Add Bayan",

    selectorSearch: "Search...",
    selectorChooseRole: "Choose a role",
    selectorChooseChannel: "Choose a channel",
    selectorNoResults: "No results found",
    selectorSaved: "Saved",
    selectorSave: "Save",
    selectorReset: "Reset",
    selectorTicketChannel: "Ticket channel",
    selectorSupportChannel: "Support channel",
    selectorReportChannel: "Report channel",
    selectorAppealChannel: "Appeal channel",
    selectorLogChannel: "Log channel",
    selectorWelcomeChannel: "Welcome channel",
    selectorGiveawayChannel: "Giveaway channel",
    selectorTournamentChannel: "Tournament channel",
    selectorAutoRole: "Auto Role",
    selectorLoading: "Loading...",
    selectorUnavailable: "Server data unavailable",
    selectorLocal: "Local selection",
    settingsSaved: "Settings saved successfully.",
    settingsReset: "Settings reset.",
    apiError: "Could not load live Discord data."
  },

  ar: {
    brandSub: "بوت ديسكورد",
    navFeatures: "المميزات",
    navCommands: "الأوامر",
    navHow: "طريقة الاستخدام",
    navFaq: "الأسئلة",
    addBayan: "إضافة Bayan",

    eyebrow: "مصمم لسيرفرات ديسكورد الحديثة",
    heroTitle1: "سيرفرك.",
    heroTitle2: "أذكى مع Bayan.",
    heroSubtitle:
      "يجمع Bayan بين الإشراف والتذاكر والهدايا والبطولات والسجلات وإدارة السيرفر في بوت ديسكورد واحد.",
    addServer: "إضافة للسيرفر →",
    explore: "استكشف المميزات",

    statCommands: "أمر",
    statReady: "جاهز",
    statControl: "مركز تحكم",

    serverPreview: "معاينة السيرفر",
    botOnline: "Bayan جاهز",
    botDescription: "بوت إدارة السيرفر",
    verified: "BOT",

    modCard: "الإشراف",
    modCardText: "تحكم أفضل بالسيرفر",
    ticketCard: "التذاكر",
    ticketCardText: "تنظيم دعم الأعضاء",
    giveawayCard: "الهدايا",
    giveawayCardText: "إدارة فعاليات المجتمع",
    logsCard: "السجلات",
    logsCardText: "تتبع الأنشطة المهمة",
    channelName: "general",
    channelPeople: "128 عضو",

    trust1: "أوامر مفيدة",
    trust2: "أنظمة أساسية",
    trust3: "مصمم لديسكورد",
    trust4: "قابل للتوسع",

    featuresLabel: "أنظمة قوية",
    featuresTitle: "كل ما يحتاجه مجتمعك.",
    featuresSubtitle:
      "تم تصميم Bayan حول الأدوات التي تستخدمها مجتمعات ديسكورد يومياً.",

    feature1Title: "الإشراف",
    feature1Text:
      "إدارة الأعضاء باستخدام التحذيرات والحظر والطرد والمهل وتنظيف الرسائل.",

    feature2Title: "التذاكر",
    feature2Text:
      "طريقة منظمة للأعضاء لطلب المساعدة أو الإبلاغ عن المشاكل أو تقديم الاستئنافات.",

    feature3Title: "الهدايا",
    feature3Text:
      "إنشاء هدايا للمجتمع وإدارة الفائزين مباشرة من ديسكورد.",

    feature4Title: "السجلات",
    feature4Text:
      "عرض نشاط السيرفر المهم عبر سجلات الرسائل والصوت والإشراف.",

    feature5Title: "الرتبة التلقائية",
    feature5Text:
      "إعطاء رتبة تلقائياً للأعضاء الجدد عند دخولهم للسيرفر.",

    feature6Title: "البطولات",
    feature6Text:
      "تنظيم المباريات وإنشاء بطولات للمجتمعات التنافسية.",

    commandsLabel: "الأوامر",
    commandsTitle: "سريع عندما تحتاجه.",
    commandsSubtitle:
      "أوامر Slash بسيطة مبنية حول إدارة السيرفر بشكل عملي.",

    commandIntroTitle: "أدواتك في بوت واحد.",
    commandIntroText:
      "يحافظ Bayan على بساطة إدارة السيرفر بأوامر واضحة وسهلة لفريق الإدارة.",

    cmdBan: "حظر عضو من السيرفر.",
    cmdKick: "طرد عضو من السيرفر.",
    cmdWarn: "إعطاء تحذير لعضو.",
    cmdClear: "حذف الرسائل بسرعة من القناة.",
    cmdTicket: "إعداد نظام تذاكر الدعم.",
    cmdRole: "إعداد الرتبة التلقائية.",
    cmdGiveaway: "بدء وإدارة الهدايا.",
    cmdTournament: "إنشاء وإدارة مباريات البطولات.",

    howLabel: "البدء",
    howTitle: "ثلاث خطوات. سيرفر أفضل.",
    howSubtitle:
      "أضف Bayan، اضبط الأنظمة التي تحتاجها واترك الإدارة تعمل.",

    step1Title: "أضف Bayan",
    step1Text:
      "قم بدعوة Bayan إلى سيرفر ديسكورد بضغطة واحدة.",

    step2Title: "الإعداد",
    step2Text:
      "اضبط التذاكر والرتب والسجلات والإشراف وباقي أدوات المجتمع.",

    step3Title: "أدر سيرفرك",
    step3Text:
      "دع Bayan يتعامل مع المهام المتكررة بينما يركز فريقك على المجتمع.",

    statsLabel: "نظرة سريعة",
    statsTitle: "مصمم لينمو مع مجتمعك.",
    statsCommands: "أمر",
    statsSystems: "نظام أساسي",
    statsReady: "مصمم للاستمرارية",
    statsBot: "بوت Bayan",

    faqLabel: "الأسئلة",
    faqTitle: "الإجابات هنا.",
    faqSubtitle:
      "بعض المعلومات المهمة قبل إضافة Bayan.",

    faq1Question: "ما هو Bayan؟",
    faq1Answer:
      "Bayan هو بوت ديسكورد يركز على الإشراف وإدارة السيرفر والتذاكر وأنظمة المجتمع.",

    faq2Question: "هل أستطيع إضافة Bayan إلى سيرفري؟",
    faq2Answer:
      "نعم. استخدم زر إضافة Bayan لفتح صفحة التفويض الرسمية في ديسكورد.",

    faq3Question: "هل الموقع يدعم العربية؟",
    faq3Answer:
      "نعم. يمكنك التبديل بين العربية والإنجليزية من محدد اللغة.",

    faq4Question: "هل هذه الصفحة تستبدل لوحة التحكم؟",
    faq4Answer:
      "لا. هذه هي واجهة موقع Bayan العامة، ولوحة التحكم منفصلة عنها.",

    ctaTitle: "جاهز لتطوير سيرفرك؟",
    ctaSubtitle:
      "اجمع الإشراف والتذاكر والفعاليات وأدوات إدارة السيرفر مع Bayan.",
    ctaButton: "إضافة Bayan إلى ديسكورد →",
    backTop: "العودة للأعلى",

    footerText: "مصمم لمجتمعات ديسكورد.",
    footerFeatures: "المميزات",
    footerCommands: "الأوامر",
    footerFaq: "الأسئلة",
    footerAdd: "إضافة Bayan",

    selectorSearch: "بحث...",
    selectorChooseRole: "اختر رتبة",
    selectorChooseChannel: "اختر قناة",
    selectorNoResults: "لا توجد نتائج",
    selectorSaved: "تم الحفظ",
    selectorSave: "حفظ",
    selectorReset: "إعادة ضبط",
    selectorTicketChannel: "قناة التذاكر",
    selectorSupportChannel: "قناة الدعم",
    selectorReportChannel: "قناة البلاغات",
    selectorAppealChannel: "قناة الاستئناف",
    selectorLogChannel: "قناة السجلات",
    selectorWelcomeChannel: "قناة الترحيب",
    selectorGiveawayChannel: "قناة الهدايا",
    selectorTournamentChannel: "قناة البطولات",
    selectorAutoRole: "الرتبة التلقائية",
    selectorLoading: "جاري التحميل...",
    selectorUnavailable: "بيانات السيرفر غير متوفرة",
    selectorLocal: "اختيار محلي",
    settingsSaved: "تم حفظ الإعدادات بنجاح.",
    settingsReset: "تمت إعادة ضبط الإعدادات.",
    apiError: "تعذر تحميل بيانات ديسكورد الحية."
  }
};

/* =========================================================
   LOCAL DATA
   ========================================================= */

const defaultRoles = [
  {
    id: "role-owner",
    name: "Owner",
    color: "#7c5cff"
  },
  {
    id: "role-admin",
    name: "Administrator",
    color: "#9d7cff"
  },
  {
    id: "role-mod",
    name: "Moderator",
    color: "#5ea7ff"
  },
  {
    id: "role-support",
    name: "Support",
    color: "#57db97"
  },
  {
    id: "role-member",
    name: "Member",
    color: "#8b93a8"
  }
];

const defaultChannels = [
  {
    id: "channel-general",
    name: "general",
    type: "text"
  },
  {
    id: "channel-announcements",
    name: "announcements",
    type: "text"
  },
  {
    id: "channel-support",
    name: "support",
    type: "text"
  },
  {
    id: "channel-reports",
    name: "reports",
    type: "text"
  },
  {
    id: "channel-appeals",
    name: "appeals",
    type: "text"
  },
  {
    id: "channel-tickets",
    name: "tickets",
    type: "text"
  },
  {
    id: "channel-logs",
    name: "logs",
    type: "text"
  },
  {
    id: "channel-moderation",
    name: "mod-logs",
    type: "text"
  },
  {
    id: "channel-voice",
    name: "General Voice",
    type: "voice"
  },
  {
    id: "channel-events",
    name: "events",
    type: "text"
  }
];

/* =========================================================
   SETTINGS
========================================================= */

function loadSettings() {
  try {
    const raw =
      localStorage.getItem(
        BAYAN_STORAGE_KEY
      );

    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw);

    if (
      !parsed ||
      typeof parsed !== "object" ||
      Array.isArray(parsed)
    ) {
      return {};
    }

    return parsed;
  } catch (error) {
    console.error(
      "Bayan settings read error:",
      error
    );

    return {};
  }
}

function saveSettings(settings) {
  try {
    localStorage.setItem(
      BAYAN_STORAGE_KEY,
      JSON.stringify(settings)
    );

    return true;
  } catch (error) {
    console.error(
      "Bayan settings save error:",
      error
    );

    return false;
  }
}

const settings = loadSettings();

/* =========================================================
   HELPERS
========================================================= */

function qs(selector, parent = document) {
  try {
    return parent.querySelector(selector);
  } catch {
    return null;
  }
}

function qsa(selector, parent = document) {
  try {
    return Array.from(
      parent.querySelectorAll(selector)
    );
  } catch {
    return [];
  }
}

function getText(key) {
  const language =
    localStorage.getItem(
      BAYAN_LANGUAGE_KEY
    ) || "en";

  return (
    translations[language]?.[key] ??
    translations.en[key] ??
    key
  );
}

function escapeHTML(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function showToast(message, type = "success") {
  let toast =
    document.getElementById(
      "bayan-toast"
    );

  if (!toast) {
    toast =
      document.createElement("div");

    toast.id = "bayan-toast";

    toast.style.position = "fixed";
    toast.style.right = "20px";
    toast.style.bottom = "20px";
    toast.style.zIndex = "99999";
    toast.style.maxWidth = "360px";
    toast.style.padding = "13px 16px";
    toast.style.borderRadius = "14px";
    toast.style.border =
      "1px solid rgba(255,255,255,.10)";
    toast.style.background =
      "rgba(15,17,25,.95)";
    toast.style.color = "#fff";
    toast.style.fontSize = "13px";
    toast.style.fontWeight = "700";
    toast.style.boxShadow =
      "0 18px 50px rgba(0,0,0,.35)";
    toast.style.backdropFilter =
      "blur(16px)";

    document.body.appendChild(toast);
  }

  if (type === "error") {
    toast.style.borderColor =
      "rgba(255,95,115,.35)";
  } else {
    toast.style.borderColor =
      "rgba(87,219,151,.25)";
  }

  toast.textContent = message;

  clearTimeout(
    toast.__hideTimer
  );

  toast.style.opacity = "1";
  toast.style.transform = "translateY(0)";

  toast.__hideTimer = setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform =
      "translateY(10px)";
  }, 2500);
}

/* =========================================================
   LANGUAGE
========================================================= */

function applyLanguage(language) {
  const safeLanguage =
    language === "ar" ? "ar" : "en";

  const dictionary =
    translations[safeLanguage];

  document.documentElement.lang =
    safeLanguage;

  document.body.classList.toggle(
    "rtl",
    safeLanguage === "ar"
  );

  qsa("[data-i18n]").forEach(
    (element) => {
      const key =
        element.dataset.i18n;

      if (
        key &&
        dictionary[key] !== undefined
      ) {
        element.textContent =
          dictionary[key];
      }
    }
  );

  const select =
    qs("#languageSelect");

  if (select) {
    select.value =
      safeLanguage;
  }

  localStorage.setItem(
    BAYAN_LANGUAGE_KEY,
    safeLanguage
  );

  updateSelectorTexts();
}

function setupLanguage() {
  const languageSelect =
    qs("#languageSelect");

  const currentLanguage =
    localStorage.getItem(
      BAYAN_LANGUAGE_KEY
    ) || "en";

  applyLanguage(
    currentLanguage
  );

  if (!languageSelect) {
    return;
  }

  languageSelect.addEventListener(
    "change",
    (event) => {
      applyLanguage(
        event.target.value
      );
    }
  );
}

/* =========================================================
   THEME
========================================================= */

function applyTheme(theme) {
  const safeTheme =
    theme === "light"
      ? "light"
      : "dark";

  document.body.classList.toggle(
    "light",
    safeTheme === "light"
  );

  localStorage.setItem(
    BAYAN_THEME_KEY,
    safeTheme
  );
}

function setupTheme() {
  const savedTheme =
    localStorage.getItem(
      BAYAN_THEME_KEY
    ) || "dark";

  applyTheme(savedTheme);

  const button =
    qs("#themeButton");

  if (!button) {
    return;
  }

  button.addEventListener(
    "click",
    () => {
      const next =
        document.body.classList.contains(
          "light"
        )
          ? "dark"
          : "light";

      applyTheme(next);
    }
  );
}

/* =========================================================
   NAVBAR
========================================================= */

function setupNavbar() {
  const navbar =
    qs("#navbar");

  if (!navbar) {
    return;
  }

  const update = () => {
    navbar.classList.toggle(
      "scrolled",
      window.scrollY > 18
    );
  };

  update();

  window.addEventListener(
    "scroll",
    update,
    {
      passive: true
    }
  );
}

/* =========================================================
   MOBILE MENU
========================================================= */

function setupMobileMenu() {
  const button =
    qs("#mobileMenu");

  const links =
    qs(".nav-links");

  if (!button || !links) {
    return;
  }

  button.addEventListener(
    "click",
    () => {
      const open =
        links.dataset.open === "true";

      if (open) {
        links.style.display = "";
        links.dataset.open =
          "false";
        return;
      }

      if (
        window.innerWidth > 760
      ) {
        return;
      }

      links.style.display = "flex";
      links.style.position =
        "absolute";
      links.style.left = "12px";
      links.style.right = "12px";
      links.style.top = "68px";
      links.style.flexDirection =
        "column";
      links.style.padding = "10px";
      links.style.border =
        "1px solid var(--border)";
      links.style.borderRadius =
        "16px";
      links.style.background =
        "var(--panel-solid)";
      links.style.backdropFilter =
        "blur(18px)";

      links.dataset.open =
        "true";
    }
  );

  qsa(
    ".nav-links a"
  ).forEach((link) => {
    link.addEventListener(
      "click",
      () => {
        if (
          window.innerWidth <=
          760
        ) {
          links.style.display =
            "";

          links.dataset.open =
            "false";
        }
      }
    );
  });

  window.addEventListener(
    "resize",
    () => {
      if (
        window.innerWidth >
        760
      ) {
        links.style.display = "";
        links.dataset.open =
          "false";
      }
    }
  );
}

/* =========================================================
   SCROLL REVEAL
========================================================= */

function setupReveal() {
  const elements =
    qsa(".reveal");

  if (!elements.length) {
    return;
  }

  if (
    !("IntersectionObserver" in window)
  ) {
    elements.forEach(
      (element) => {
        element.classList.add(
          "visible"
        );
      }
    );

    return;
  }

  const observer =
    new IntersectionObserver(
      (entries) => {
        entries.forEach(
          (entry) => {
            if (
              !entry.isIntersecting
            ) {
              return;
            }

            entry.target.classList.add(
              "visible"
            );

            observer.unobserve(
              entry.target
            );
          }
        );
      },
      {
        threshold: 0.08
      }
    );

  elements.forEach(
    (element) => {
      observer.observe(element);
    }
  );
}

/* =========================================================
   FAQ
========================================================= */

function setupFAQ() {
  qsa(
    ".faq-question"
  ).forEach((button) => {
    button.addEventListener(
      "click",
      () => {
        const item =
          button.closest(
            ".faq-item"
          );

        if (!item) {
          return;
        }

        qsa(
          ".faq-item"
        ).forEach(
          (other) => {
            if (
              other !== item
            ) {
              other.classList.remove(
                "open"
              );
            }
          }
        );

        item.classList.toggle(
          "open"
        );
      }
    );
  });
}

/* =========================================================
   COUNTERS
========================================================= */

function setupCounters() {
  const counters =
    qsa(".counter");

  if (!counters.length) {
    return;
  }

  if (
    !("IntersectionObserver" in window)
  ) {
    counters.forEach(
      (element) => {
        element.textContent =
          Number(
            element.dataset.target
          ) || 0;
      }
    );

    return;
  }

  const observer =
    new IntersectionObserver(
      (entries) => {
        entries.forEach(
          (entry) => {
            if (
              !entry.isIntersecting
            ) {
              return;
            }

            animateCounter(
              entry.target
            );

            observer.unobserve(
              entry.target
            );
          }
        );
      },
      {
        threshold: 0.7
      }
    );

  counters.forEach(
    (counter) => {
      observer.observe(counter);
    }
  );
}

function animateCounter(
  element
) {
  const target =
    Number(
      element.dataset.target
    ) || 0;

  let current = 0;

  const step = Math.max(
    1,
    Math.ceil(target / 35)
  );

  const timer =
    setInterval(() => {
      current += step;

      if (current >= target) {
        current = target;
        clearInterval(timer);
      }

      element.textContent =
        String(current);
    }, 28);
}

/* =========================================================
   RIPPLE
========================================================= */

function setupRipple() {
  qsa(
    ".button, .nav-cta"
  ).forEach((button) => {
    button.addEventListener(
      "click",
      (event) => {
        const rect =
          button.getBoundingClientRect();

        const size =
          Math.max(
            rect.width,
            rect.height
          );

        const ripple =
          document.createElement(
            "span"
          );

        ripple.style.position =
          "absolute";

        ripple.style.width =
          `${size}px`;

        ripple.style.height =
          `${size}px`;

        ripple.style.left =
          `${
            event.clientX -
            rect.left -
            size / 2
          }px`;

        ripple.style.top =
          `${
            event.clientY -
            rect.top -
            size / 2
          }px`;

        ripple.style.borderRadius =
          "50%";

        ripple.style.background =
          "rgba(255,255,255,.18)";

        ripple.style.pointerEvents =
          "none";

        ripple.style.transform =
          "scale(0)";

        ripple.style.opacity =
          "1";

        ripple.style.transition =
          "transform .5s ease, opacity .5s ease";

        if (
          getComputedStyle(
            button
          ).position ===
          "static"
        ) {
          button.style.position =
            "relative";
        }

        button.style.overflow =
          "hidden";

        button.appendChild(
          ripple
        );

        requestAnimationFrame(
          () => {
            ripple.style.transform =
              "scale(2.5)";

            ripple.style.opacity =
              "0";
          }
        );

        setTimeout(() => {
          ripple.remove();
        }, 550);
      }
    );
  });
}

/* =========================================================
   DISCORD LINKS
========================================================= */

function setupDiscordLinks() {
  qsa(
    'a[href*="discord.com/oauth2/authorize"]'
  ).forEach((link) => {
    link.href =
      DISCORD_BOT_INVITE;
    link.target = "_blank";
    link.rel =
      "noopener noreferrer";
  });
}

/* =========================================================
   INTERNAL LINKS
========================================================= */

function setupInternalLinks() {
  qsa(
    'a[href^="#"]'
  ).forEach((link) => {
    link.addEventListener(
      "click",
      (event) => {
        const id =
          link.getAttribute(
            "href"
          );

        if (
          !id ||
          id === "#"
        ) {
          return;
        }

        let target = null;

        try {
          target =
            document.querySelector(
              id
            );
        } catch {
          return;
        }

        if (!target) {
          return;
        }

        event.preventDefault();

        target.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }
    );
  });
}

/* =========================================================
   KEYBOARD
========================================================= */

function setupKeyboard() {
  document.addEventListener(
    "keydown",
    (event) => {
      if (
        (event.ctrlKey ||
          event.metaKey) &&
        event.key.toLowerCase() ===
          "k"
      ) {
        event.preventDefault();

        const commands =
          qs("#commands");

        if (commands) {
          commands.scrollIntoView({
            behavior:
              "smooth"
          });
        }
      }

      if (
        event.key === "Escape"
      ) {
        closeAllSelectorMenus();
      }
    }
  );
}

/* =========================================================
   YEAR
========================================================= */

function setupYear() {
  const year =
    qs("#year");

  if (year) {
    year.textContent =
      new Date().getFullYear();
  }
}

/* =========================================================
   SELECTOR DATA
========================================================= */

let liveRoles = [...defaultRoles];
let liveChannels = [
  ...defaultChannels
];

function normalizeRole(role) {
  if (!role) {
    return null;
  }

  return {
    id: String(
      role.id ?? ""
    ),
    name: String(
      role.name ?? "Unknown Role"
    ),
    color:
      typeof role.color ===
      "string"
        ? role.color
        : "#8b93a8"
  };
}

function normalizeChannel(channel) {
  if (!channel) {
    return null;
  }

  return {
    id: String(
      channel.id ?? ""
    ),
    name: String(
      channel.name ??
        "Unknown Channel"
    ),
    type:
      channel.type === "voice"
        ? "voice"
        : "text"
  };
}

/* =========================================================
   LIVE DATA
========================================================= */

async function fetchJSON(
  path
) {
  if (!API_BASE) {
    return null;
  }

  const response =
    await fetch(
      `${API_BASE}${path}`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          Accept:
            "application/json"
        }
      }
    );

  if (!response.ok) {
    throw new Error(
      `HTTP ${response.status}`
    );
  }

  return response.json();
}

async function loadLiveGuildData() {
  if (!API_BASE) {
    return false;
  }

  try {
    const guildId =
      getCurrentGuildId();

    if (!guildId) {
      return false;
    }

    const data =
      await fetchJSON(
        `/api/guilds/${encodeURIComponent(
          guildId
        )}/selectors`
      );

    if (!data) {
      return false;
    }

    if (
      Array.isArray(
        data.roles
      )
    ) {
      liveRoles =
        data.roles
          .map(normalizeRole)
          .filter(Boolean);
    }

    if (
      Array.isArray(
        data.channels
      )
    ) {
      liveChannels =
        data.channels
          .map(
            normalizeChannel
          )
          .filter(Boolean);
    }

    rebuildAllSelectors();

    return true;
  } catch (error) {
    console.error(
      "Bayan live guild data error:",
      error
    );

    showToast(
      getText("apiError"),
      "error"
    );

    return false;
  }
}

function getCurrentGuildId() {
  const candidates = [
    document.body.dataset.guildId,
    document.body.dataset.serverId,
    qs(
      "#guildId"
    )?.value,
    qs(
      "#serverSelect"
    )?.value,
    localStorage.getItem(
      "bayan_guild_id"
    )
  ];

  for (const value of candidates) {
    if (
      value &&
      String(value).trim()
    ) {
      return String(value).trim();
    }
  }

  return "";
}

/* =========================================================
   SELECTOR FIELD DISCOVERY
========================================================= */

const ROLE_SELECTOR_IDS = [
  "roleSelector",
  "autoRole",
  "autoRoleSelect",
  "giveRole",
  "giveRoleSelect",
  "roleSelect"
];

const CHANNEL_SELECTOR_IDS = [
  "channelSelector",
  "channelSelect",
  "welcomeChannel",
  "welcomeChannelSelect",
  "logChannel",
  "logChannelSelect",
  "logsChannel",
  "logsChannelSelect",
  "messageLogChannel",
  "messageLogChannelSelect",
  "voiceLogChannel",
  "voiceLogChannelSelect",
  "giveawayChannel",
  "giveawayChannelSelect",
  "tournamentChannel",
  "tournamentChannelSelect",
  "modLogChannel",
  "modLogChannelSelect"
];

const TICKET_SELECTOR_IDS = [
  "ticketChannel",
  "ticketChannelSelect",
  "ticketSupportChannel",
  "ticketSupportChannelSelect",
  "ticketReportChannel",
  "ticketReportChannelSelect",
  "ticketAppealChannel",
  "ticketAppealChannelSelect",
  "ticketCategory",
  "ticketCategorySelect"
];

function findElementByIds(ids) {
  for (const id of ids) {
    const element =
      document.getElementById(
        id
      );

    if (element) {
      return element;
    }
  }

  return null;
}

/* =========================================================
   CREATE SEARCHABLE SELECTOR
========================================================= */

function createSelector(
  original,
  type,
  items
) {
  if (!original) {
    return null;
  }

  if (
    original.dataset.bayanSelectorReady ===
    "true"
  ) {
    return original.closest(
      ".bayan-selector"
    );
  }

  const wrapper =
    document.createElement(
      "div"
    );

  wrapper.className =
    "bayan-selector";

  wrapper.dataset.type =
    type;

  wrapper.style.position =
    "relative";

  wrapper.style.width =
    "100%";

  wrapper.style.zIndex =
    "20";

  const button =
    document.createElement(
      "button"
    );

  button.type = "button";
  button.className =
    "bayan-selector-button";

  button.style.width = "100%";
  button.style.minHeight =
    "46px";
  button.style.padding =
    "0 13px";
  button.style.display =
    "flex";
  button.style.alignItems =
    "center";
  button.style.justifyContent =
    "space-between";
  button.style.gap = "12px";
  button.style.border =
    "1px solid rgba(255,255,255,.09)";
  button.style.borderRadius =
    "13px";
  button.style.background =
    "rgba(255,255,255,.035)";
  button.style.color =
    "inherit";
  button.style.cursor =
    "pointer";

  const buttonText =
    document.createElement(
      "span"
    );

  buttonText.className =
    "bayan-selector-text";

  buttonText.textContent =
    getText(
      type === "role"
        ? "selectorChooseRole"
        : "selectorChooseChannel"
    );

  const arrow =
    document.createElement(
      "span"
    );

  arrow.className =
    "bayan-selector-arrow";

  arrow.textContent = "⌄";

  button.appendChild(
    buttonText
  );

  button.appendChild(
    arrow
  );

  const menu =
    document.createElement(
      "div"
    );

  menu.className =
    "bayan-selector-menu";

  menu.style.position =
    "absolute";

  menu.style.left = "0";
  menu.style.right = "0";
  menu.style.top =
    "calc(100% + 8px)";

  menu.style.padding =
    "8px";

  menu.style.border =
    "1px solid rgba(255,255,255,.10)";

  menu.style.borderRadius =
    "15px";

  menu.style.background =
    "rgba(14,16,24,.98)";

  menu.style.backdropFilter =
    "blur(18px)";

  menu.style.boxShadow =
    "0 25px 60px rgba(0,0,0,.45)";

  menu.style.display = "none";
  menu.style.maxHeight =
    "310px";

  menu.style.overflow =
    "hidden";

  const search =
    document.createElement(
      "input"
    );

  search.type = "search";
  search.className =
    "bayan-selector-search";

  search.placeholder =
    getText(
      "selectorSearch"
    );

  search.autocomplete = "off";

  search.style.width =
    "100%";

  search.style.height =
    "40px";

  search.style.padding =
    "0 11px";

  search.style.marginBottom =
    "7px";

  search.style.border =
    "1px solid rgba(255,255,255,.08)";

  search.style.borderRadius =
    "10px";

  search.style.background =
    "rgba(255,255,255,.035)";

  search.style.color =
    "inherit";

  search.style.outline =
    "none";

  const list =
    document.createElement(
      "div"
    );

  list.className =
    "bayan-selector-list";

  list.style.maxHeight =
    "245px";

  list.style.overflowY =
    "auto";

  list.style.overscrollBehavior =
    "contain";

  menu.appendChild(
    search
  );

  menu.appendChild(
    list
  );

  wrapper.appendChild(
    button
  );

  wrapper.appendChild(
    menu
  );

  const oldValue =
    original.value ||
    original.dataset.value ||
    settings[
      original.id
    ] ||
    "";

  original.style.display =
    "none";

  original.dataset.bayanSelectorReady =
    "true";

  original.parentNode.insertBefore(
    wrapper,
    original
  );

  renderSelectorItems(
    wrapper,
    type,
    items,
    oldValue
  );

  button.addEventListener(
    "click",
    (event) => {
      event.stopPropagation();

      closeAllSelectorMenus(
        wrapper
      );

      const open =
        menu.style.display ===
        "block";

      menu.style.display =
        open
          ? "none"
          : "block";

      if (!open) {
        search.focus();
      }
    }
  );

  search.addEventListener(
    "input",
    () => {
      filterSelector(
        wrapper,
        search.value
      );
    }
  );

  search.addEventListener(
    "click",
    (event) => {
      event.stopPropagation();
    }
  );

  document.addEventListener(
    "click",
    () => {
      menu.style.display =
        "none";
    }
  );

  return wrapper;
}

/* =========================================================
   RENDER SELECTOR
========================================================= */

function renderSelectorItems(
  wrapper,
  type,
  items,
  selectedId = ""
) {
  if (!wrapper) {
    return;
  }

  const list =
    qs(
      ".bayan-selector-list",
      wrapper
    );

  const original =
    findOriginalSelect(
      wrapper
    );

  const buttonText =
    qs(
      ".bayan-selector-text",
      wrapper
    );

  if (!list || !buttonText) {
    return;
  }

  list.innerHTML = "";

  const safeItems =
    Array.isArray(items)
      ? items.filter(Boolean)
      : [];

  if (!safeItems.length) {
    const empty =
      document.createElement(
        "div"
      );

    empty.className =
      "bayan-selector-empty";

    empty.textContent =
      getText(
        "selectorNoResults"
      );

    empty.style.padding =
      "16px";

    empty.style.textAlign =
      "center";

    empty.style.color =
      "rgba(255,255,255,.45)";

    list.appendChild(
      empty
    );

    buttonText.textContent =
      getText(
        type === "role"
          ? "selectorChooseRole"
          : "selectorChooseChannel"
      );

    return;
  }

  const selected =
    safeItems.find(
      (item) =>
        String(
          item.id
        ) ===
        String(
          selectedId
        )
    );

  if (selected) {
    buttonText.textContent =
      type === "role"
        ? selected.name
        : `# ${selected.name}`;
  } else {
    buttonText.textContent =
      getText(
        type === "role"
          ? "selectorChooseRole"
          : "selectorChooseChannel"
      );
  }

  safeItems.forEach(
    (item) => {
      const option =
        document.createElement(
          "button"
        );

      option.type =
        "button";

      option.className =
        "bayan-selector-option";

      option.dataset.search =
        `${item.name} ${item.id}`
          .toLowerCase();

      option.dataset.id =
        item.id;

      option.style.width =
        "100%";

      option.style.border =
        "0";

      option.style.background =
        "transparent";

      option.style.color =
        "inherit";

      option.style.padding =
        "10px";

      option.style.borderRadius =
        "10px";

      option.style.display =
        "flex";

      option.style.alignItems =
        "center";

      option.style.gap =
        "10px";

      option.style.textAlign =
        "left";

      option.style.cursor =
        "pointer";

      const icon =
        document.createElement(
          "span"
        );

      icon.style.width =
        "28px";

      icon.style.height =
        "28px";

      icon.style.borderRadius =
        "9px";

      icon.style.display =
        "grid";

      icon.style.placeItems =
        "center";

      icon.style.background =
        type === "role"
          ? `${item.color || "#7c5cff"}22`
          : "rgba(124,92,255,.10)";

      icon.style.color =
        type === "role"
          ? item.color ||
            "#b7abff"
          : "#b7abff";

      if (type === "role") {
        icon.textContent =
          "◆";
      } else {
        icon.textContent =
          item.type ===
          "voice"
            ? "◉"
            : "#";
      }

      const text =
        document.createElement(
          "span"
        );

      text.textContent =
        type === "role"
          ? item.name
          : `# ${item.name}`;

      text.style.flex = "1";
      text.style.fontSize =
        "12px";

      const selectedMark =
        document.createElement(
          "span"
        );

      if (
        String(item.id) ===
        String(selectedId)
      ) {
        selectedMark.textContent =
          "✓";

        selectedMark.style.color =
          "#57db97";
      }

      option.appendChild(
        icon
      );

      option.appendChild(
        text
      );

      option.appendChild(
        selectedMark
      );

      option.addEventListener(
        "mouseenter",
        () => {
          option.style.background =
            "rgba(255,255,255,.055)";
        }
      );

      option.addEventListener(
        "mouseleave",
        () => {
          option.style.background =
            "transparent";
        }
      );

      option.addEventListener(
        "click",
        () => {
          selectSelectorValue(
            wrapper,
            item,
            type
          );
        }
      );

      list.appendChild(
        option
      );
    }
  );

  if (original) {
    original.value =
      selectedId || "";
  }
}

/* =========================================================
   SELECT VALUE
========================================================= */

function selectSelectorValue(
  wrapper,
  item,
  type
) {
  const original =
    findOriginalSelect(
      wrapper
    );

  if (original) {
    original.value =
      item.id;

    original.dispatchEvent(
      new Event(
        "change",
        {
          bubbles: true
        }
      )
    );
  }

  const key =
    original?.id ||
    wrapper.dataset.key ||
    `selector_${type}`;

  settings[key] =
    item.id;

  saveSettings(
    settings
  );

  const items =
    type === "role"
      ? liveRoles
      : liveChannels;

  renderSelectorItems(
    wrapper,
    type,
    items,
    item.id
  );

  closeAllSelectorMenus();

  showToast(
    `${item.name} — ${getText(
      "selectorSaved"
    )}`
  );
}

/* =========================================================
   ORIGINAL ELEMENT
========================================================= */

function findOriginalSelect(
  wrapper
) {
  const previous =
    wrapper.previousElementSibling;

  if (
    previous &&
    previous.dataset &&
    previous.dataset.bayanSelectorReady ===
      "true"
  ) {
    return previous;
  }

  return null;
}

/* =========================================================
   FILTER
========================================================= */

function filterSelector(
  wrapper,
  searchValue
) {
  const query =
    String(
      searchValue || ""
    )
      .trim()
      .toLowerCase();

  const options =
    qsa(
      ".bayan-selector-option",
      wrapper
    );

  let visible = 0;

  options.forEach(
    (option) => {
      const haystack =
        option.dataset
          .search || "";

      const show =
        !query ||
        haystack.includes(
          query
        );

      option.style.display =
        show
          ? "flex"
          : "none";

      if (show) {
        visible++;
      }
    }
  );

  const empty =
    qs(
      ".bayan-selector-empty",
      wrapper
    );

  if (
    empty &&
    options.length
  ) {
    empty.style.display =
      visible === 0
        ? "block"
        : "none";
  }
}

/* =========================================================
   CLOSE MENUS
========================================================= */

function closeAllSelectorMenus(
  except = null
) {
  qsa(
    ".bayan-selector-menu"
  ).forEach((menu) => {
    const wrapper =
      menu.closest(
        ".bayan-selector"
      );

    if (
      except &&
      wrapper === except
    ) {
      return;
    }

    menu.style.display =
      "none";
  });
}

/* =========================================================
   ADD CSS FOR SELECTORS
========================================================= */

function injectSelectorCSS() {
  if (
    document.getElementById(
      "bayan-selector-css"
    )
  ) {
    return;
  }

  const style =
    document.createElement(
      "style"
    );

  style.id =
    "bayan-selector-css";

  style.textContent = `
    .bayan-selector {
      position: relative;
      width: 100%;
    }

    .bayan-selector-button:hover {
      border-color: rgba(124,92,255,.28) !important;
      background: rgba(255,255,255,.055) !important;
    }

    .bayan-selector-search::placeholder {
      color: rgba(255,255,255,.38);
    }

    .bayan-selector-search:focus {
      border-color: rgba(124,92,255,.40) !important;
      box-shadow: 0 0 0 3px rgba(124,92,255,.08);
    }

    .bayan-selector-list::-webkit-scrollbar {
      width: 7px;
    }

    .bayan-selector-list::-webkit-scrollbar-track {
      background: transparent;
    }

    .bayan-selector-list::-webkit-scrollbar-thumb {
      background: rgba(255,255,255,.12);
      border-radius: 99px;
    }

    .bayan-selector-option:hover {
      background: rgba(255,255,255,.055) !important;
    }

    body.light .bayan-selector-menu {
      background: rgba(255,255,255,.98) !important;
      border-color: rgba(20,25,40,.10) !important;
      box-shadow: 0 25px 60px rgba(20,25,40,.14) !important;
    }

    body.light .bayan-selector-search {
      background: rgba(20,25,40,.035) !important;
      border-color: rgba(20,25,40,.08) !important;
      color: #111522 !important;
    }
  `;

  document.head.appendChild(
    style
  );
}

/* =========================================================
   BUILD ALL SELECTORS
========================================================= */

function setupSelectors() {
  injectSelectorCSS();

  const used =
    new Set();

  ROLE_SELECTOR_IDS.forEach(
    (id) => {
      const original =
        document.getElementById(
          id
        );

      if (!original) {
        return;
      }

      if (used.has(id)) {
        return;
      }

      used.add(id);

      const wrapper =
        createSelector(
          original,
          "role",
          liveRoles
        );

      if (wrapper) {
        wrapper.dataset.key =
          id;
      }
    }
  );

  CHANNEL_SELECTOR_IDS.forEach(
    (id) => {
      const original =
        document.getElementById(
          id
        );

      if (!original) {
        return;
      }

      if (
        used.has(id)
      ) {
        return;
      }

      used.add(id);

      const wrapper =
        createSelector(
          original,
          "channel",
          liveChannels
        );

      if (wrapper) {
        wrapper.dataset.key =
          id;
      }
    }
  );

  TICKET_SELECTOR_IDS.forEach(
    (id) => {
      const original =
        document.getElementById(
          id
        );

      if (!original) {
        return;
      }

      if (
        used.has(id)
      ) {
        return;
      }

      used.add(id);

      const wrapper =
        createSelector(
          original,
          "channel",
          liveChannels.filter(
            (channel) =>
              channel.type ===
              "text"
          )
        );

      if (wrapper) {
        wrapper.dataset.key =
          id;
        wrapper.dataset.ticket =
          "true";
      }
    }
  );

  /*
    Also supports native <select> elements
    using:
      data-bayan-role-selector
      data-bayan-channel-selector
      data-bayan-ticket-channel
  */

  qsa(
    "[data-bayan-role-selector]"
  ).forEach((element) => {
    const wrapper =
      createSelector(
        element,
        "role",
        liveRoles
      );

    if (wrapper) {
      wrapper.dataset.key =
        element.id ||
        "data_role_selector";
    }
  });

  qsa(
    "[data-bayan-channel-selector]"
  ).forEach((element) => {
    const wrapper =
      createSelector(
        element,
        "channel",
        liveChannels
      );

    if (wrapper) {
      wrapper.dataset.key =
        element.id ||
        "data_channel_selector";
    }
  });

  qsa(
    "[data-bayan-ticket-channel]"
  ).forEach((element) => {
    const wrapper =
      createSelector(
        element,
        "channel",
        liveChannels.filter(
          (channel) =>
            channel.type ===
            "text"
        )
      );

    if (wrapper) {
      wrapper.dataset.key =
        element.id ||
        "data_ticket_channel";
      wrapper.dataset.ticket =
        "true";
    }
  });
}

/* =========================================================
   REBUILD
========================================================= */

function rebuildAllSelectors() {
  qsa(
    ".bayan-selector"
  ).forEach((wrapper) => {
    const original =
      findOriginalSelect(
        wrapper
      );

    if (!original) {
      return;
    }

    const type =
      wrapper.dataset.type ||
      "channel";

    const items =
      type === "role"
        ? liveRoles
        : liveChannels;

    const saved =
      settings[
        original.id
      ] ||
      original.value ||
      "";

    renderSelectorItems(
      wrapper,
      type,
      items,
      saved
    );
  });
}

/* =========================================================
   UPDATE SELECTOR TEXT
========================================================= */

function updateSelectorTexts() {
  qsa(
    ".bayan-selector"
  ).forEach((wrapper) => {
    const type =
      wrapper.dataset.type ||
      "channel";

    const search =
      qs(
        ".bayan-selector-search",
        wrapper
      );

    if (search) {
      search.placeholder =
        getText(
          "selectorSearch"
        );
    }

    const original =
      findOriginalSelect(
        wrapper
      );

    if (!original) {
      return;
    }

    const current =
      original.value;

    const items =
      type === "role"
        ? liveRoles
        : liveChannels;

    renderSelectorItems(
      wrapper,
      type,
      items,
      current
    );
  });
}

/* =========================================================
   SETUP BUTTONS
========================================================= */

function setupSettingsButtons() {
  const saveButtons =
    qsa(
      [
        "#saveSettings",
        "#saveSettingsButton",
        "[data-save-settings]"
      ].join(",")
    );

  saveButtons.forEach(
    (button) => {
      button.addEventListener(
        "click",
        () => {
          collectAllSelectorValues();

          if (
            saveSettings(
              settings
            )
          ) {
            showToast(
              getText(
                "settingsSaved"
              )
            );
          }
        }
      );
    }
  );

  const resetButtons =
    qsa(
      [
        "#resetSettings",
        "#resetSettingsButton",
        "[data-reset-settings]"
      ].join(",")
    );

  resetButtons.forEach(
    (button) => {
      button.addEventListener(
        "click",
        () => {
          Object.keys(
            settings
          ).forEach((key) => {
            delete settings[key];
          });

          saveSettings(
            settings
          );

          qsa(
            ".bayan-selector"
          ).forEach(
            (wrapper) => {
              const original =
                findOriginalSelect(
                  wrapper
                );

              if (original) {
                original.value =
                  "";
              }

              const type =
                wrapper.dataset.type ||
                "channel";

              renderSelectorItems(
                wrapper,
                type,
                type === "role"
                  ? liveRoles
                  : liveChannels,
                ""
              );
            }
          );

          showToast(
            getText(
              "settingsReset"
            )
          );
        }
      );
    }
  );
}

/* =========================================================
   COLLECT VALUES
========================================================= */

function collectAllSelectorValues() {
  qsa(
    ".bayan-selector"
  ).forEach((wrapper) => {
    const original =
      findOriginalSelect(
        wrapper
      );

    if (
      !original ||
      !original.id
    ) {
      return;
    }

    settings[
      original.id
    ] =
      original.value || "";
  });

  saveSettings(
    settings
  );
}

/* =========================================================
   SERVER SELECTOR
========================================================= */

function setupServerSelector() {
  const select =
    qs(
      "#serverSelect"
    );

  if (!select) {
    return;
  }

  const current =
    localStorage.getItem(
      "bayan_guild_id"
    );

  if (
    current &&
    Array.from(
      select.options
    ).some(
      (option) =>
        option.value ===
        current
    )
  ) {
    select.value =
      current;
  }

  select.addEventListener(
    "change",
    async () => {
      const guildId =
        select.value;

      localStorage.setItem(
        "bayan_guild_id",
        guildId
      );

      await loadLiveGuildData();
    }
  );
}

/* =========================================================
   REFRESH
========================================================= */

function setupRefreshButton() {
  const buttons =
    qsa(
      [
        "#refreshButton",
        "#refreshData",
        "[data-refresh]"
      ].join(",")
    );

  buttons.forEach(
    (button) => {
      button.addEventListener(
        "click",
        async () => {
          button.disabled =
            true;

          try {
            await loadLiveGuildData();
          } finally {
            setTimeout(
              () => {
                button.disabled =
                  false;
              },
              250
            );
          }
        }
      );
    }
  );
}

/* =========================================================
   SELECTOR API
========================================================= */

window.BayanSelectors = {
  getRoles() {
    return [...liveRoles];
  },

  getChannels() {
    return [...liveChannels];
  },

  getSettings() {
    return {
      ...settings
    };
  },

  getRoleValue(id) {
    return (
      settings[id] || ""
    );
  },

  getChannelValue(id) {
    return (
      settings[id] || ""
    );
  },

  setValue(id, value) {
    if (!id) {
      return false;
    }

    settings[id] =
      String(value);

    saveSettings(
      settings
    );

    const original =
      document.getElementById(
        id
      );

    if (original) {
      original.value =
        String(value);

      original.dispatchEvent(
        new Event(
          "change",
          {
            bubbles: true
          }
        )
      );
    }

    rebuildAllSelectors();

    return true;
  },

  refresh: loadLiveGuildData,

  rebuild: rebuildAllSelectors
};

/* =========================================================
   PROTECTION
========================================================= */

function setupErrorProtection() {
  window.addEventListener(
    "error",
    (event) => {
      console.error(
        "Bayan runtime error:",
        event.error ||
          event.message
      );
    }
  );

  window.addEventListener(
    "unhandledrejection",
    (event) => {
      console.error(
        "Bayan promise error:",
        event.reason
      );
    }
  );
}

/* =========================================================
   INIT
========================================================= */

async function initBayan() {
  try {
    setupErrorProtection();

    setupLanguage();
    setupTheme();
    setupNavbar();
    setupMobileMenu();
    setupReveal();
    setupFAQ();
    setupCounters();
    setupRipple();
    setupDiscordLinks();
    setupInternalLinks();
    setupKeyboard();
    setupYear();

    /*
      Build all role/channel/ticket
      scrollers after the page exists.
    */
    setupSelectors();

    setupSettingsButtons();
    setupServerSelector();
    setupRefreshButton();

    /*
      Restore saved selector values.
    */
    rebuildAllSelectors();

    /*
      Try real data only when
      a secure API base has been configured.
    */
    if (API_BASE) {
      await loadLiveGuildData();
    }

    collectAllSelectorValues();

    console.log(
      "%cBayan loaded successfully.",
      "font-weight:700;color:#7c5cff"
    );
  } catch (error) {
    console.error(
      "Bayan initialization failed:",
      error
    );
  }
}

/* =========================================================
   START
========================================================= */

if (
  document.readyState ===
  "loading"
) {
  document.addEventListener(
    "DOMContentLoaded",
    initBayan,
    {
      once: true
    }
  );
} else {
  initBayan();
}