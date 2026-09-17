"use strict";

/* =========================================================
   BAYAN WEBSITE SCRIPT
========================================================= */

const API = "/api";

const STORAGE_KEY =
  "bayan_dashboard_settings";

/* =========================================================
   TRANSLATIONS
========================================================= */

const translations = {
  en: {
    chooseRole: "Choose a role",
    chooseChannel: "Choose a channel",
    search: "Search...",
    noResults: "No results found",
    loading: "Loading...",
    save: "Save Settings",
    reset: "Reset",
    saved: "Settings saved successfully.",
    loadingServer: "Loading server data...",
    botOnline: "Bayan Online",
    botOffline: "Bayan Offline"
  },

  ar: {
    chooseRole: "اختر رتبة",
    chooseChannel: "اختر قناة",
    search: "بحث...",
    noResults: "لا توجد نتائج",
    loading: "جاري التحميل...",
    save: "حفظ الإعدادات",
    reset: "إعادة ضبط",
    saved: "تم حفظ الإعدادات بنجاح.",
    loadingServer: "جاري تحميل بيانات السيرفر...",
    botOnline: "Bayan متصل",
    botOffline: "Bayan غير متصل"
  }
};

/* =========================================================
   LANGUAGE
========================================================= */

function currentLanguage() {
  return (
    localStorage.getItem(
      "bayan_language"
    ) || "en"
  );
}

function text(key) {
  const language =
    currentLanguage();

  return (
    translations[language]?.[key] ||
    translations.en[key] ||
    key
  );
}

/* =========================================================
   STORAGE
========================================================= */

function readLocalSettings() {
  try {
    const raw =
      localStorage.getItem(
        STORAGE_KEY
      );

    if (!raw) {
      return {};
    }

    const parsed =
      JSON.parse(raw);

    return parsed &&
      typeof parsed ===
        "object"
      ? parsed
      : {};
  } catch {
    return {};
  }
}

function writeLocalSettings(
  settings
) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        settings
      )
    );
  } catch {}
}

/* =========================================================
   API
========================================================= */

async function apiFetch(
  url,
  options = {}
) {
  const response =
    await fetch(
      `${API}${url}`,
      {
        ...options,

        headers: {
          "Content-Type":
            "application/json",
          ...(options.headers ||
            {})
        },

        credentials:
          "same-origin"
      }
    );

  let data = null;

  try {
    data =
      await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(
      data?.error ||
        `Request failed: ${response.status}`
    );
  }

  return data;
}

/* =========================================================
   TOAST
========================================================= */

function toast(
  message,
  error = false
) {
  let element =
    document.getElementById(
      "bayan-toast"
    );

  if (!element) {
    element =
      document.createElement(
        "div"
      );

    element.id =
      "bayan-toast";

    Object.assign(
      element.style,
      {
        position: "fixed",
        right: "20px",
        bottom: "20px",
        zIndex: "999999",
        padding:
          "13px 16px",
        borderRadius:
          "14px",
        background:
          "rgba(15,17,25,.96)",
        color: "#fff",
        border:
          "1px solid rgba(124,92,255,.25)",
        boxShadow:
          "0 20px 60px rgba(0,0,0,.4)",
        fontSize: "13px",
        fontWeight: "700",
        transition:
          "opacity .2s ease, transform .2s ease"
      }
    );

    document.body.appendChild(
      element
    );
  }

  element.textContent =
    message;

  element.style.borderColor =
    error
      ? "rgba(255,95,115,.45)"
      : "rgba(87,219,151,.35)";

  element.style.opacity = "1";
  element.style.transform =
    "translateY(0)";

  clearTimeout(
    element.__timer
  );

  element.__timer =
    setTimeout(() => {
      element.style.opacity =
        "0";

      element.style.transform =
        "translateY(8px)";
    }, 2600);
}

/* =========================================================
   SELECTOR CSS
========================================================= */

function injectSelectorStyles() {
  if (
    document.getElementById(
      "bayan-selector-styles"
    )
  ) {
    return;
  }

  const style =
    document.createElement(
      "style"
    );

  style.id =
    "bayan-selector-styles";

  style.textContent = `
    .bayan-selector {
      position: relative;
      width: 100%;
      min-width: 220px;
    }

    .bayan-selector-trigger {
      width: 100%;
      min-height: 46px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      padding: 0 13px;
      border-radius: 12px;
      border: 1px solid rgba(255,255,255,.09);
      background: rgba(255,255,255,.035);
      color: inherit;
      cursor: pointer;
      text-align: left;
      transition: .18s ease;
    }

    .bayan-selector-trigger:hover {
      border-color: rgba(124,92,255,.30);
      background: rgba(255,255,255,.055);
    }

    .bayan-selector-value {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .bayan-selector-menu {
      position: absolute;
      left: 0;
      right: 0;
      top: calc(100% + 8px);
      z-index: 99999;
      padding: 8px;
      border-radius: 15px;
      border: 1px solid rgba(255,255,255,.10);
      background: rgba(14,16,24,.98);
      box-shadow: 0 25px 65px rgba(0,0,0,.48);
      backdrop-filter: blur(18px);
      display: none;
    }

    .bayan-selector.open .bayan-selector-menu {
      display: block;
    }

    .bayan-selector-search {
      width: 100%;
      height: 40px;
      margin-bottom: 8px;
      padding: 0 11px;
      border-radius: 10px;
      outline: none;
      border: 1px solid rgba(255,255,255,.08);
      background: rgba(255,255,255,.035);
      color: inherit;
    }

    .bayan-selector-search:focus {
      border-color: rgba(124,92,255,.38);
      box-shadow: 0 0 0 3px rgba(124,92,255,.08);
    }

    .bayan-selector-list {
      max-height: 260px;
      overflow-y: auto;
      overscroll-behavior: contain;
    }

    .bayan-selector-list::-webkit-scrollbar {
      width: 7px;
    }

    .bayan-selector-list::-webkit-scrollbar-thumb {
      background: rgba(255,255,255,.14);
      border-radius: 99px;
    }

    .bayan-option {
      width: 100%;
      min-height: 42px;
      display: flex;
      align-items: center;
      gap: 10px;
      border: 0;
      border-radius: 10px;
      padding: 8px 9px;
      background: transparent;
      color: inherit;
      cursor: pointer;
      text-align: left;
    }

    .bayan-option:hover {
      background: rgba(255,255,255,.06);
    }

    .bayan-option-icon {
      width: 28px;
      height: 28px;
      flex: 0 0 28px;
      display: grid;
      place-items: center;
      border-radius: 8px;
      background: rgba(124,92,255,.11);
      color: #b9adff;
      font-size: 12px;
    }

    .bayan-option-text {
      flex: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 12px;
    }

    .bayan-option-check {
      color: #57db97;
      font-weight: 900;
    }

    .bayan-empty {
      padding: 16px;
      text-align: center;
      color: rgba(255,255,255,.42);
      font-size: 12px;
    }

    .bayan-setup-card {
      margin: 20px 0;
      padding: 20px;
      border-radius: 20px;
      border: 1px solid rgba(255,255,255,.08);
      background:
        linear-gradient(
          145deg,
          rgba(124,92,255,.08),
          rgba(255,255,255,.025)
        );
    }

    .bayan-setup-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 14px;
      margin-bottom: 18px;
    }

    .bayan-setup-title h3 {
      margin: 0;
      font-size: 18px;
    }

    .bayan-setup-title p {
      margin: 5px 0 0;
      color: rgba(255,255,255,.52);
      font-size: 12px;
    }

    .bayan-server-status {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      padding: 8px 10px;
      border-radius: 999px;
      background: rgba(87,219,151,.07);
      border: 1px solid rgba(87,219,151,.16);
      color: #88e8b2;
      font-size: 11px;
      font-weight: 800;
    }

    .bayan-server-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #57db97;
      box-shadow: 0 0 12px rgba(87,219,151,.55);
    }

    .bayan-config-group {
      margin-top: 18px;
    }

    .bayan-config-group h4 {
      margin: 0 0 10px;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: .12em;
      color: #a99cff;
    }

    .bayan-config-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0,1fr));
      gap: 12px;
    }

    .bayan-config-field {
      min-width: 0;
    }

    .bayan-config-field label {
      display: block;
      margin-bottom: 7px;
      color: rgba(255,255,255,.68);
      font-size: 11px;
      font-weight: 700;
    }

    .bayan-config-actions {
      display: flex;
      justify-content: flex-end;
      gap: 9px;
      margin-top: 18px;
    }

    .bayan-config-button {
      min-height: 42px;
      padding: 0 15px;
      border-radius: 11px;
      border: 1px solid rgba(255,255,255,.09);
      color: inherit;
      cursor: pointer;
      font-weight: 800;
      font-size: 12px;
      background: rgba(255,255,255,.035);
    }

    .bayan-config-button.primary {
      border: 0;
      color: white;
      background: linear-gradient(135deg,#7c5cff,#5ea7ff);
    }

    .bayan-config-button:hover {
      transform: translateY(-1px);
    }

    @media (max-width: 760px) {
      .bayan-config-grid {
        grid-template-columns: 1fr;
      }

      .bayan-setup-header {
        align-items: flex-start;
        flex-direction: column;
      }
    }

    body.light .bayan-selector-menu {
      background: rgba(255,255,255,.98);
      border-color: rgba(20,25,40,.10);
      box-shadow: 0 25px 60px rgba(20,25,40,.15);
    }

    body.light .bayan-selector-search {
      color: #111522;
      background: rgba(20,25,40,.035);
      border-color: rgba(20,25,40,.08);
    }

    body.light .bayan-option:hover {
      background: rgba(20,25,40,.045);
    }
  `;

  document.head.appendChild(
    style
  );
}

/* =========================================================
   CLOSE SELECTORS
========================================================= */

function closeSelectors(
  except = null
) {
  document
    .querySelectorAll(
      ".bayan-selector.open"
    )
    .forEach((element) => {
      if (
        except &&
        element === except
      ) {
        return;
      }

      element.classList.remove(
        "open"
      );
    });
}

/* =========================================================
   CREATE SELECTOR
========================================================= */

function createSelector({
  id,
  type,
  items,
  selectedId = "",
  textPrefix = ""
}) {
  const wrapper =
    document.createElement(
      "div"
    );

  wrapper.className =
    "bayan-selector";

  wrapper.dataset.id =
    id;

  wrapper.dataset.type =
    type;

  const trigger =
    document.createElement(
      "button"
    );

  trigger.type =
    "button";

  trigger.className =
    "bayan-selector-trigger";

  const value =
    document.createElement(
      "span"
    );

  value.className =
    "bayan-selector-value";

  const arrow =
    document.createElement(
      "span"
    );

  arrow.textContent = "⌄";

  trigger.append(
    value,
    arrow
  );

  const menu =
    document.createElement(
      "div"
    );

  menu.className =
    "bayan-selector-menu";

  const search =
    document.createElement(
      "input"
    );

  search.type = "search";
  search.className =
    "bayan-selector-search";

  search.placeholder =
    text("search");

  search.autocomplete =
    "off";

  const list =
    document.createElement(
      "div"
    );

  list.className =
    "bayan-selector-list";

  menu.append(
    search,
    list
  );

  wrapper.append(
    trigger,
    menu
  );

  renderSelector(
    wrapper,
    items,
    selectedId,
    textPrefix
  );

  trigger.addEventListener(
    "click",
    (event) => {
      event.stopPropagation();

      const open =
        wrapper.classList.contains(
          "open"
        );

      closeSelectors(
        wrapper
      );

      wrapper.classList.toggle(
        "open",
        !open
      );

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

  return wrapper;
}

/* =========================================================
   RENDER
========================================================= */

function renderSelector(
  wrapper,
  items,
  selectedId,
  prefix = ""
) {
  const value =
    wrapper.querySelector(
      ".bayan-selector-value"
    );

  const list =
    wrapper.querySelector(
      ".bayan-selector-list"
    );

  if (!value || !list) {
    return;
  }

  list.innerHTML = "";

  const safeItems =
    Array.isArray(items)
      ? items
      : [];

  const selected =
    safeItems.find(
      (item) =>
        String(item.id) ===
        String(selectedId)
    );

  value.textContent =
    selected
      ? `${prefix}${selected.name}`
      : text(
          wrapper.dataset.type ===
            "role"
            ? "chooseRole"
            : "chooseChannel"
        );

  if (!safeItems.length) {
    const empty =
      document.createElement(
        "div"
      );

    empty.className =
      "bayan-empty";

    empty.textContent =
      text("noResults");

    list.appendChild(
      empty
    );

    return;
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
        "bayan-option";

      option.dataset.search =
        String(
          item.name || ""
        ).toLowerCase();

      const icon =
        document.createElement(
          "span"
        );

      icon.className =
        "bayan-option-icon";

      if (
        wrapper.dataset.type ===
        "role"
      ) {
        icon.textContent =
          "◆";

        icon.style.color =
          item.color ||
          "#b9adff";
      } else {
        icon.textContent =
          item.type ===
          "voice"
            ? "◉"
            : "#";
      }

      const label =
        document.createElement(
          "span"
        );

      label.className =
        "bayan-option-text";

      label.textContent =
        wrapper.dataset.type ===
        "role"
          ? item.name
          : `# ${item.name}`;

      const check =
        document.createElement(
          "span"
        );

      check.className =
        "bayan-option-check";

      if (
        String(item.id) ===
        String(selectedId)
      ) {
        check.textContent =
          "✓";
      }

      option.append(
        icon,
        label,
        check
      );

      option.addEventListener(
        "click",
        () => {
          const original =
            wrapper.__original;

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

          wrapper.dataset.value =
            item.id;

          renderSelector(
            wrapper,
            safeItems,
            item.id,
            prefix
          );

          wrapper.classList.remove(
            "open"
          );
        }
      );

      list.appendChild(
        option
      );
    }
  );
}

/* =========================================================
   FILTER
========================================================= */

function filterSelector(
  wrapper,
  query
) {
  const search =
    String(
      query || ""
    )
      .trim()
      .toLowerCase();

  const options =
    wrapper.querySelectorAll(
      ".bayan-option"
    );

  let visible = 0;

  options.forEach(
    (option) => {
      const matches =
        !search ||
        option.dataset.search.includes(
          search
        );

      option.style.display =
        matches
          ? "flex"
          : "none";

      if (matches) {
        visible++;
      }
    }
  );

  let empty =
    wrapper.querySelector(
      ".bayan-filter-empty"
    );

  if (
    visible === 0 &&
    options.length > 0
  ) {
    if (!empty) {
      empty =
        document.createElement(
          "div"
        );

      empty.className =
        "bayan-empty bayan-filter-empty";

      wrapper
        .querySelector(
          ".bayan-selector-list"
        )
        .appendChild(
          empty
        );
    }

    empty.textContent =
      text("noResults");

    empty.style.display =
      "block";
  } else if (empty) {
    empty.style.display =
      "none";
  }
}

/* =========================================================
   SELECTOR REGISTRY
========================================================= */

const selectorRegistry =
  new Map();

function addSelector(
  id,
  type,
  items,
  selectedId,
  prefix = ""
) {
  const old =
    selectorRegistry.get(
      id
    );

  if (old) {
    old.remove();
  }

  const selector =
    createSelector({
      id,
      type,
      items,
      selectedId,
      textPrefix:
        prefix
    });

  selector.dataset.value =
    selectedId || "";

  selectorRegistry.set(
    id,
    selector
  );

  return selector;
}

/* =========================================================
   FIND DASHBOARD PLACE
========================================================= */

function findDashboardHost() {
  return (
    document.querySelector(
      "#dashboardContent"
    ) ||
    document.querySelector(
      ".dashboard-content"
    ) ||
    document.querySelector(
      ".main-content"
    ) ||
    document.querySelector(
      "main"
    ) ||
    document.body
  );
}

/* =========================================================
   BUILD SERVER SETUP
========================================================= */

function buildServerSetup() {
  if (
    !document.body ||
    !/dashboard/i.test(
      location.pathname
    )
  ) {
    return null;
  }

  if (
    document.getElementById(
      "bayan-server-setup"
    )
  ) {
    return document.getElementById(
      "bayan-server-setup"
    );
  }

  injectSelectorStyles();

  const card =
    document.createElement(
      "section"
    );

  card.id =
    "bayan-server-setup";

  card.className =
    "bayan-setup-card";

  card.innerHTML = `
    <div class="bayan-setup-header">
      <div class="bayan-setup-title">
        <h3>Bayan Server Setup</h3>
        <p>
          Select roles and channels by name. IDs stay hidden.
        </p>
      </div>

      <div class="bayan-server-status">
        <span class="bayan-server-dot"></span>
        <span id="bayanServerStatus">
          Loading...
        </span>
      </div>
    </div>

    <div class="bayan-config-group">
      <h4>Server</h4>

      <div class="bayan-config-field">
        <label>Server</label>

        <select
          id="bayanServerSelect"
          style="
            width:100%;
            min-height:46px;
            border-radius:12px;
            border:1px solid rgba(255,255,255,.09);
            background:rgba(255,255,255,.035);
            color:inherit;
            padding:0 12px;
          "
        >
          <option value="">
            Loading servers...
          </option>
        </select>
      </div>
    </div>

    <div class="bayan-config-group">
      <h4>Roles</h4>

      <div class="bayan-config-grid">

        <div class="bayan-config-field">
          <label>Auto Role</label>
          <div id="bayanAutoRole"></div>
        </div>

      </div>
    </div>

    <div class="bayan-config-group">
      <h4>Channels</h4>

      <div class="bayan-config-grid">

        <div class="bayan-config-field">
          <label>Welcome Channel</label>
          <div id="bayanWelcomeChannel"></div>
        </div>

        <div class="bayan-config-field">
          <label>Log Channel</label>
          <div id="bayanLogChannel"></div>
        </div>

        <div class="bayan-config-field">
          <label>Message Log Channel</label>
          <div id="bayanMessageLogChannel"></div>
        </div>

        <div class="bayan-config-field">
          <label>Voice Log Channel</label>
          <div id="bayanVoiceLogChannel"></div>
        </div>

        <div class="bayan-config-field">
          <label>Giveaway Channel</label>
          <div id="bayanGiveawayChannel"></div>
        </div>

        <div class="bayan-config-field">
          <label>Tournament Channel</label>
          <div id="bayanTournamentChannel"></div>
        </div>

      </div>
    </div>

    <div class="bayan-config-group">
      <h4>Tickets</h4>

      <div class="bayan-config-grid">

        <div class="bayan-config-field">
          <label>Ticket Channel</label>
          <div id="bayanTicketChannel"></div>
        </div>

        <div class="bayan-config-field">
          <label>Support Channel</label>
          <div id="bayanTicketSupportChannel"></div>
        </div>

        <div class="bayan-config-field">
          <label>Report Channel</label>
          <div id="bayanTicketReportChannel"></div>
        </div>

        <div class="bayan-config-field">
          <label>Appeal Channel</label>
          <div id="bayanTicketAppealChannel"></div>
        </div>

      </div>
    </div>

    <div class="bayan-config-actions">

      <button
        id="bayanResetSettings"
        type="button"
        class="bayan-config-button"
      >
        Reset
      </button>

      <button
        id="bayanSaveSettings"
        type="button"
        class="bayan-config-button primary"
      >
        Save Settings
      </button>

    </div>
  `;

  const host =
    findDashboardHost();

  host.prepend(card);

  return card;
}

/* =========================================================
   DASHBOARD STATE
========================================================= */

let dashboardData = {
  guilds: [],
  guildId: "",
  roles: [],
  channels: [],
  settings: {}
};

/* =========================================================
   LOAD SERVERS
========================================================= */

async function loadGuilds() {
  const select =
    document.getElementById(
      "bayanServerSelect"
    );

  if (!select) {
    return;
  }

  const data =
    await apiFetch(
      "/guilds"
    );

  dashboardData.guilds =
    Array.isArray(
      data.guilds
    )
      ? data.guilds
      : [];

  select.innerHTML =
    "";

  dashboardData.guilds.forEach(
    (guild) => {
      const option =
        document.createElement(
          "option"
        );

      option.value =
        guild.id;

      option.textContent =
        guild.name;

      select.appendChild(
        option
      );
    }
  );

  const saved =
    localStorage.getItem(
      "bayan_guild_id"
    );

  const selected =
    dashboardData.guilds.some(
      (guild) =>
        guild.id === saved
    )
      ? saved
      : dashboardData.guilds[0]?.id ||
        "";

  if (!selected) {
    select.innerHTML =
      '<option value="">No server found</option>';

    dashboardData.guildId =
      "";

    return;
  }

  select.value =
    selected;

  dashboardData.guildId =
    selected;

  localStorage.setItem(
    "bayan_guild_id",
    selected
  );

  await loadServerData(
    selected
  );
}

/* =========================================================
   LOAD SERVER
========================================================= */

async function loadServerData(
  guildId
) {
  if (!guildId) {
    return;
  }

  const status =
    document.getElementById(
      "bayanServerStatus"
    );

  if (status) {
    status.textContent =
      text("loadingServer");
  }

  try {
    const data =
      await apiFetch(
        `/guilds/${encodeURIComponent(
          guildId
        )}/selectors`
      );

    dashboardData.guildId =
      guildId;

    dashboardData.roles =
      Array.isArray(
        data.roles
      )
        ? data.roles
        : [];

    dashboardData.channels =
      Array.isArray(
        data.channels
      )
        ? data.channels
        : [];

    dashboardData.settings =
      data.settings &&
      typeof data.settings ===
        "object"
        ? data.settings
        : {};

    localStorage.setItem(
      "bayan_guild_id",
      guildId
    );

    renderDashboardSelectors();

    const guildName =
      data.guild?.name ||
      "Bayan";

    if (status) {
      status.textContent =
        `${guildName} • Bayan Online`;
    }
  } catch (error) {
    console.error(
      "Server load error:",
      error
    );

    if (status) {
      status.textContent =
        "Could not load server";
    }

    toast(
      error.message,
      true
    );
  }
}

/* =========================================================
   RENDER ALL
========================================================= */

function mountSelector(
  containerId,
  selector
) {
  const container =
    document.getElementById(
      containerId
    );

  if (!container) {
    return;
  }

  container.innerHTML =
    "";

  if (selector) {
    container.appendChild(
      selector
    );
  }
}

function renderDashboardSelectors() {
  const roles =
    dashboardData.roles;

  const textChannels =
    dashboardData.channels.filter(
      (channel) =>
        channel.type ===
        "text"
    );

  const voiceChannels =
    dashboardData.channels.filter(
      (channel) =>
        channel.type ===
        "voice"
    );

  const settings =
    dashboardData.settings ||
    {};

  mountSelector(
    "bayanAutoRole",
    addSelector(
      "autoRole",
      "role",
      roles,
      settings.autoRole ||
        ""
    )
  );

  mountSelector(
    "bayanWelcomeChannel",
    addSelector(
      "welcomeChannel",
      "channel",
      textChannels,
      settings.welcomeChannel ||
        "",
      "# "
    )
  );

  mountSelector(
    "bayanLogChannel",
    addSelector(
      "logChannel",
      "channel",
      textChannels,
      settings.logChannel ||
        "",
      "# "
    )
  );

  mountSelector(
    "bayanMessageLogChannel",
    addSelector(
      "messageLogChannel",
      "channel",
      textChannels,
      settings.messageLogChannel ||
        "",
      "# "
    )
  );

  mountSelector(
    "bayanVoiceLogChannel",
    addSelector(
      "voiceLogChannel",
      "channel",
      voiceChannels,
      settings.voiceLogChannel ||
        ""
    )
  );

  mountSelector(
    "bayanGiveawayChannel",
    addSelector(
      "giveawayChannel",
      "channel",
      textChannels,
      settings.giveawayChannel ||
        "",
      "# "
    )
  );

  mountSelector(
    "bayanTournamentChannel",
    addSelector(
      "tournamentChannel",
      "channel",
      textChannels,
      settings.tournamentChannel ||
        "",
      "# "
    )
  );

  mountSelector(
    "bayanTicketChannel",
    addSelector(
      "ticketChannel",
      "channel",
      textChannels,
      settings.ticketChannel ||
        "",
      "# "
    )
  );

  mountSelector(
    "bayanTicketSupportChannel",
    addSelector(
      "ticketSupportChannel",
      "channel",
      textChannels,
      settings.ticketSupportChannel ||
        "",
      "# "
    )
  );

  mountSelector(
    "bayanTicketReportChannel",
    addSelector(
      "ticketReportChannel",
      "channel",
      textChannels,
      settings.ticketReportChannel ||
        "",
      "# "
    )
  );

  mountSelector(
    "bayanTicketAppealChannel",
    addSelector(
      "ticketAppealChannel",
      "channel",
      textChannels,
      settings.ticketAppealChannel ||
        "",
      "# "
    )
  );
}

/* =========================================================
   COLLECT
========================================================= */

function getSelectorValue(
  id
) {
  const selector =
    selectorRegistry.get(
      id
    );

  return (
    selector?.dataset.value ||
    ""
  );
}

function collectDashboardSettings() {
  return {
    autoRole:
      getSelectorValue(
        "autoRole"
      ),

    welcomeChannel:
      getSelectorValue(
        "welcomeChannel"
      ),

    logChannel:
      getSelectorValue(
        "logChannel"
      ),

    messageLogChannel:
      getSelectorValue(
        "messageLogChannel"
      ),

    voiceLogChannel:
      getSelectorValue(
        "voiceLogChannel"
      ),

    giveawayChannel:
      getSelectorValue(
        "giveawayChannel"
      ),

    tournamentChannel:
      getSelectorValue(
        "tournamentChannel"
      ),

    ticketChannel:
      getSelectorValue(
        "ticketChannel"
      ),

    ticketSupportChannel:
      getSelectorValue(
        "ticketSupportChannel"
      ),

    ticketReportChannel:
      getSelectorValue(
        "ticketReportChannel"
      ),

    ticketAppealChannel:
      getSelectorValue(
        "ticketAppealChannel"
      )
  };
}

/* =========================================================
   SAVE
========================================================= */

async function saveDashboardSettings() {
  const guildId =
    dashboardData.guildId;

  if (!guildId) {
    toast(
      "Choose a server first.",
      true
    );

    return;
  }

  const settings =
    collectDashboardSettings();

  writeLocalSettings(
    settings
  );

  try {
    const result =
      await apiFetch(
        `/guilds/${encodeURIComponent(
          guildId
        )}/settings`,
        {
          method: "PUT",

          body:
            JSON.stringify(
              settings
            )
        }
      );

    dashboardData.settings =
      result.settings ||
      settings;

    renderDashboardSelectors();

    toast(
      text("saved")
    );
  } catch (error) {
    console.error(
      "Save error:",
      error
    );

    toast(
      error.message,
      true
    );
  }
}

/* =========================================================
   RESET
========================================================= */

function resetDashboardSettings() {
  const empty = {
    autoRole: "",
    welcomeChannel: "",
    logChannel: "",
    messageLogChannel: "",
    voiceLogChannel: "",
    giveawayChannel: "",
    tournamentChannel: "",
    ticketChannel: "",
    ticketSupportChannel: "",
    ticketReportChannel: "",
    ticketAppealChannel: ""
  };

  dashboardData.settings =
    empty;

  writeLocalSettings(
    empty
  );

  renderDashboardSelectors();

  toast(
    "Selections reset."
  );
}

/* =========================================================
   EVENTS
========================================================= */

function setupDashboardEvents() {
  const serverSelect =
    document.getElementById(
      "bayanServerSelect"
    );

  if (serverSelect) {
    serverSelect.addEventListener(
      "change",
      async () => {
        dashboardData.guildId =
          serverSelect.value;

        localStorage.setItem(
          "bayan_guild_id",
          serverSelect.value
        );

        await loadServerData(
          serverSelect.value
        );
      }
    );
  }

  const save =
    document.getElementById(
      "bayanSaveSettings"
    );

  if (save) {
    save.addEventListener(
      "click",
      saveDashboardSettings
    );
  }

  const reset =
    document.getElementById(
      "bayanResetSettings"
    );

  if (reset) {
    reset.addEventListener(
      "click",
      resetDashboardSettings
    );
  }

  document.addEventListener(
    "click",
    () => {
      closeSelectors();
    }
  );
}

/* =========================================================
   NORMAL WEBSITE FUNCTIONS
========================================================= */

function setupTheme() {
  const button =
    document.getElementById(
      "themeButton"
    );

  if (!button) {
    return;
  }

  const saved =
    localStorage.getItem(
      "bayan_theme"
    ) || "dark";

  document.body.classList.toggle(
    "light",
    saved === "light"
  );

  button.addEventListener(
    "click",
    () => {
      const light =
        document.body.classList.contains(
          "light"
        );

      document.body.classList.toggle(
        "light",
        !light
      );

      localStorage.setItem(
        "bayan_theme",
        !light
          ? "light"
          : "dark"
      );
    }
  );
}

function setupLanguage() {
  const select =
    document.getElementById(
      "languageSelect"
    );

  if (!select) {
    return;
  }

  const saved =
    localStorage.getItem(
      "bayan_language"
    ) || "en";

  select.value =
    saved;

  select.addEventListener(
    "change",
    () => {
      localStorage.setItem(
        "bayan_language",
        select.value
      );

      location.reload();
    }
  );
}

/* =========================================================
   INIT
========================================================= */

async function initBayan() {
  try {
    setupTheme();
    setupLanguage();

    if (
      /dashboard/i.test(
        location.pathname
      )
    ) {
      buildServerSetup();
      setupDashboardEvents();

      await loadGuilds();
    }
  } catch (error) {
    console.error(
      "Bayan initialization error:",
      error
    );
  }
}

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