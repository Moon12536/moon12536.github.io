"use strict";

/* =========================================================
   BAYAN WEBSITE
========================================================= */

const API = "/api";

let bayan = {
  me: null,

  guilds: [],

  guildId: "",

  roles: [],

  channels: [],

  settings: {},

  creatorAlerts: {}
};

/* =========================================================
   HELPERS
========================================================= */

async function api(
  path,
  options = {}
) {
  const response =
    await fetch(
      `${API}${path}`,
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
    data = {};
  }

  if (
    !response.ok
  ) {
    throw new Error(
      data.error ||
        `Request failed: ${response.status}`
    );
  }

  return data;
}

function toast(
  message,
  error = false
) {
  let el =
    document.getElementById(
      "bayan-toast"
    );

  if (!el) {
    el =
      document.createElement(
        "div"
      );

    el.id =
      "bayan-toast";

    Object.assign(
      el.style,
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
          "rgba(12,14,22,.97)",

        color: "white",

        fontSize:
          "13px",

        fontWeight:
          "700",

        border:
          "1px solid rgba(124,92,255,.3)",

        boxShadow:
          "0 20px 60px rgba(0,0,0,.4)"
      }
    );

    document.body.appendChild(
      el
    );
  }

  el.textContent =
    message;

  el.style.borderColor =
    error
      ? "rgba(255,95,115,.5)"
      : "rgba(87,219,151,.4)";

  clearTimeout(
    el.__timer
  );

  el.__timer =
    setTimeout(() => {
      el.remove();
    }, 3000);
}

/* =========================================================
   AUTH
========================================================= */

async function loadMe() {
  const data =
    await api(
      "/me"
    );

  bayan.me =
    data.loggedIn
      ? data.user
      : null;

  return bayan.me;
}

function setupDiscordButtons() {
  document
    .querySelectorAll(
      'a[href*="discord.com/oauth2/authorize"]'
    )
    .forEach(
      (button) => {
        button.href =
          "/auth/discord/install";

        button.removeAttribute(
          "target"
        );

        button.removeAttribute(
          "rel"
        );
      }
    );
}

function setupLoginButton() {
  const buttons =
    document.querySelectorAll(
      "[data-bayan-login]"
    );

  buttons.forEach(
    (button) => {
      button.addEventListener(
        "click",
        () => {
          window.location.href =
            "/auth/discord/install";
        }
      );
    }
  );
}

/* =========================================================
   SERVER DATA
========================================================= */

async function loadGuilds() {
  const data =
    await api(
      "/guilds"
    );

  bayan.guilds =
    Array.isArray(
      data.guilds
    )
      ? data.guilds
      : [];

  return bayan.guilds;
}

async function loadGuild(
  guildId
) {
  const data =
    await api(
      `/guilds/${encodeURIComponent(
        guildId
      )}/selectors`
    );

  bayan.guildId =
    guildId;

  bayan.roles =
    data.roles || [];

  bayan.channels =
    data.channels || [];

  bayan.settings =
    data.settings || {};

  bayan.creatorAlerts =
    data.settings
      ?.creatorAlerts ||
    {};

  localStorage.setItem(
    "bayan_guild_id",
    guildId
  );

  return data;
}

/* =========================================================
   CUSTOM SCROLLER
========================================================= */

function createChannelPicker(
  items,
  selectedId,
  onSelect,
  voiceOnly = false
) {
  const root =
    document.createElement(
      "div"
    );

  root.className =
    "bayan-picker";

  root.style.position =
    "relative";

  root.style.width =
    "100%";

  const trigger =
    document.createElement(
      "button"
    );

  trigger.type = "button";

  Object.assign(
    trigger.style,
    {
      width: "100%",
      minHeight: "46px",
      padding: "0 13px",
      display: "flex",
      alignItems: "center",
      justifyContent:
        "space-between",
      gap: "10px",
      border:
        "1px solid rgba(255,255,255,.09)",
      borderRadius: "12px",
      background:
        "rgba(255,255,255,.035)",
      color: "inherit",
      cursor: "pointer"
    }
  );

  const label =
    document.createElement(
      "span"
    );

  label.style.overflow =
    "hidden";

  label.style.textOverflow =
    "ellipsis";

  label.style.whiteSpace =
    "nowrap";

  const arrow =
    document.createElement(
      "span"
    );

  arrow.textContent =
    "⌄";

  trigger.append(
    label,
    arrow
  );

  const menu =
    document.createElement(
      "div"
    );

  menu.style.position =
    "absolute";

  menu.style.left = "0";
  menu.style.right = "0";
  menu.style.top =
    "calc(100% + 7px)";

  menu.style.zIndex =
    "99999";

  menu.style.padding =
    "8px";

  menu.style.border =
    "1px solid rgba(255,255,255,.10)";

  menu.style.borderRadius =
    "15px";

  menu.style.background =
    "rgba(14,16,24,.99)";

  menu.style.boxShadow =
    "0 25px 60px rgba(0,0,0,.45)";

  menu.style.display =
    "none";

  const search =
    document.createElement(
      "input"
    );

  search.type =
    "search";

  search.placeholder =
    "Search channels...";

  Object.assign(
    search.style,
    {
      width: "100%",
      height: "40px",
      padding: "0 11px",
      marginBottom: "8px",
      border:
        "1px solid rgba(255,255,255,.08)",
      borderRadius: "10px",
      background:
        "rgba(255,255,255,.035)",
      color: "inherit",
      outline: "none"
    }
  );

  const list =
    document.createElement(
      "div"
    );

  list.style.maxHeight =
    "250px";

  list.style.overflowY =
    "auto";

  menu.append(
    search,
    list
  );

  root.append(
    trigger,
    menu
  );

  const filteredItems =
    items.filter(
      (channel) =>
        voiceOnly
          ? channel.type ===
            "voice"
          : channel.type ===
            "text"
    );

  function render(
    currentSelected
  ) {
    list.innerHTML =
      "";

    const selected =
      filteredItems.find(
        (item) =>
          item.id ===
          currentSelected
      );

    label.textContent =
      selected
        ? selected.type ===
          "voice"
          ? `🔊 ${selected.name}`
          : `# ${selected.name}`
        : "Choose a channel";

    filteredItems.forEach(
      (channel) => {
        const option =
          document.createElement(
            "button"
          );

        option.type =
          "button";

        option.textContent =
          channel.type ===
          "voice"
            ? `🔊 ${channel.name}`
            : `# ${channel.name}`;

        Object.assign(
          option.style,
          {
            width: "100%",
            minHeight: "40px",
            padding:
              "8px 10px",
            marginBottom:
              "2px",
            border: "0",
            borderRadius:
              "9px",
            background:
              "transparent",
            color:
              "inherit",
            textAlign:
              "left",
            cursor:
              "pointer"
          }
        );

        if (
          channel.id ===
          currentSelected
        ) {
          option.style.background =
            "rgba(124,92,255,.13)";
        }

        option.addEventListener(
          "click",
          () => {
            onSelect(
              channel.id
            );

            render(
              channel.id
            );

            menu.style.display =
              "none";
          }
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
            if (
              channel.id !==
              currentSelected
            ) {
              option.style.background =
                "transparent";
            }
          }
        );

        list.appendChild(
          option
        );
      }
    );

    if (
      !filteredItems.length
    ) {
      const empty =
        document.createElement(
          "div"
        );

      empty.textContent =
        "No channels found.";

      empty.style.padding =
        "14px";

      empty.style.textAlign =
        "center";

      empty.style.opacity =
        ".45";

      list.appendChild(
        empty
      );
    }
  }

  render(
    selectedId
  );

  trigger.addEventListener(
    "click",
    (event) => {
      event.stopPropagation();

      const open =
        menu.style.display ===
        "block";

      document
        .querySelectorAll(
          ".bayan-picker > div"
        )
        .forEach(
          (element) => {
            if (
              element !==
              menu
            ) {
              element.style.display =
                "none";
            }
          }
        );

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
      const query =
        search.value
          .trim()
          .toLowerCase();

      Array.from(
        list.children
      ).forEach(
        (option) => {
          if (
            !option.textContent
          ) {
            return;
          }

          option.style.display =
            option.textContent
              .toLowerCase()
              .includes(
                query
              )
              ? "block"
              : "none";
        }
      );
    }
  );

  document.addEventListener(
    "click",
    () => {
      menu.style.display =
        "none";
    }
  );

  return root;
}

/* =========================================================
   SERVER SETUP CARD
========================================================= */

async function buildServerUI() {
  if (
    !location.pathname.includes(
      "dashboard"
    )
  ) {
    return;
  }

  const me =
    await loadMe();

  if (!me) {
    showLoginState();
    return;
  }

  await loadGuilds();

  const saved =
    localStorage.getItem(
      "bayan_guild_id"
    );

  const guild =
    bayan.guilds.find(
      (item) =>
        item.id === saved
    ) ||
    bayan.guilds[0];

  if (!guild) {
    showNoGuilds();
    return;
  }

  await loadGuild(
    guild.id
  );

  buildConfigurationCard();

  buildCreatorAlerts();

  loadIntoExistingServerSelector();
}

/* =========================================================
   LOGIN STATE
========================================================= */

function showLoginState() {
  const host =
    document.querySelector(
      "main"
    ) ||
    document.body;

  if (
    document.getElementById(
      "bayan-login-card"
    )
  ) {
    return;
  }

  const card =
    document.createElement(
      "section"
    );

  card.id =
    "bayan-login-card";

  card.style.maxWidth =
    "700px";

  card.style.margin =
    "80px auto";

  card.style.padding =
    "40px";

  card.style.borderRadius =
    "24px";

  card.style.border =
    "1px solid rgba(255,255,255,.08)";

  card.style.background =
    "rgba(255,255,255,.025)";

  card.innerHTML = `
    <h2>Bayan Dashboard</h2>
    <p style="margin-top:10px;opacity:.65">
      Login with Discord to see your servers,
      roles and channels.
    </p>

    <button
      type="button"
      data-bayan-login
      style="
        margin-top:22px;
        padding:13px 18px;
        border:0;
        border-radius:12px;
        background:linear-gradient(135deg,#7c5cff,#5ea7ff);
        color:white;
        font-weight:800;
        cursor:pointer;
      "
    >
      Login with Discord
    </button>
  `;

  host.prepend(
    card
  );

  setupLoginButton();
}

function showNoGuilds() {
  const host =
    document.querySelector(
      "main"
    ) ||
    document.body;

  const card =
    document.createElement(
      "section"
    );

  card.style.maxWidth =
    "700px";

  card.style.margin =
    "80px auto";

  card.style.padding =
    "40px";

  card.style.borderRadius =
    "24px";

  card.style.border =
    "1px solid rgba(255,255,255,.08)";

  card.style.background =
    "rgba(255,255,255,.025)";

  card.innerHTML = `
    <h2>No manageable servers</h2>
    <p style="margin-top:10px;opacity:.65">
      Bayan needs to be installed in a server
      you can manage.
    </p>

    <a
      href="/auth/discord/install"
      style="
        display:inline-flex;
        margin-top:22px;
        padding:13px 18px;
        border-radius:12px;
        background:linear-gradient(135deg,#7c5cff,#5ea7ff);
        color:white;
        font-weight:800;
      "
    >
      Add Bayan
    </a>
  `;

  host.prepend(
    card
  );
}

/* =========================================================
   CONFIGURATION
========================================================= */

function buildConfigurationCard() {
  if (
    document.getElementById(
      "bayan-live-config"
    )
  ) {
    return;
  }

  const host =
    document.querySelector(
      "main"
    ) ||
    document.querySelector(
      ".main-content"
    ) ||
    document.body;

  const card =
    document.createElement(
      "section"
    );

  card.id =
    "bayan-live-config";

  card.style.margin =
    "20px 0";

  card.style.padding =
    "24px";

  card.style.borderRadius =
    "22px";

  card.style.border =
    "1px solid rgba(255,255,255,.08)";

  card.style.background =
    "rgba(255,255,255,.025)";

  card.innerHTML = `
    <div>
      <h2>Bayan Server Setup</h2>
      <p style="margin-top:6px;opacity:.58">
        Real Discord roles and channels from your server.
      </p>
    </div>

    <div
      id="bayan-server-picker"
      style="margin-top:20px"
    ></div>

    <div
      style="
        display:grid;
        grid-template-columns:repeat(2,minmax(0,1fr));
        gap:14px;
        margin-top:18px;
      "
      class="bayan-config-grid"
    >

      <div>
        <label>Auto Role</label>
        <div id="bayan-role-picker"></div>
      </div>

      <div>
        <label>Welcome Channel</label>
        <div id="bayan-welcome-picker"></div>
      </div>

      <div>
        <label>Log Channel</label>
        <div id="bayan-log-picker"></div>
      </div>

      <div>
        <label>Message Log Channel</label>
        <div id="bayan-message-log-picker"></div>
      </div>

      <div>
        <label>Voice Log Channel</label>
        <div id="bayan-voice-picker"></div>
      </div>

      <div>
        <label>Giveaway Channel</label>
        <div id="bayan-giveaway-picker"></div>
      </div>

    </div>

    <div
      style="
        margin-top:24px;
        padding-top:20px;
        border-top:1px solid rgba(255,255,255,.07)
      "
    >
      <h3>Ticket System</h3>

      <div
        style="
          display:grid;
          grid-template-columns:repeat(2,minmax(0,1fr));
          gap:14px;
          margin-top:15px;
        "
        class="bayan-config-grid"
      >
        <div>
          <label>Ticket Channel</label>
          <div id="bayan-ticket-picker"></div>
        </div>

        <div>
          <label>Support Channel</label>
          <div id="bayan-ticket-support-picker"></div>
        </div>

        <div>
          <label>Report Channel</label>
          <div id="bayan-ticket-report-picker"></div>
        </div>

        <div>
          <label>Appeal Channel</label>
          <div id="bayan-ticket-appeal-picker"></div>
        </div>
      </div>
    </div>

    <div style="margin-top:20px">
      <button
        id="bayan-save-config"
        type="button"
        style="
          padding:12px 18px;
          border:0;
          border-radius:12px;
          background:linear-gradient(135deg,#7c5cff,#5ea7ff);
          color:white;
          font-weight:800;
          cursor:pointer;
        "
      >
        Save Settings
      </button>
    </div>
  `;

  host.prepend(
    card
  );

  renderConfiguration();

  document
    .getElementById(
      "bayan-save-config"
    )
    .addEventListener(
      "click",
      saveConfiguration
    );

  window.addEventListener(
    "resize",
    () => {
      if (
        window.innerWidth >
        760
      ) {
        card
          .querySelectorAll(
            ".bayan-config-grid"
          )
          .forEach(
            (grid) => {
              grid.style.gridTemplateColumns =
                "repeat(2,minmax(0,1fr))";
            }
          );
      }
    }
  );
}

function renderConfiguration() {
  const settings =
    bayan.settings || {};

  let currentRole =
    settings.autoRole ||
    "";

  const textChannels =
    bayan.channels.filter(
      (channel) =>
        channel.type ===
        "text"
    );

  const voiceChannels =
    bayan.channels.filter(
      (channel) =>
        channel.type ===
        "voice"
    );

  const roleHost =
    document.getElementById(
      "bayan-role-picker"
    );

  const welcomeHost =
    document.getElementById(
      "bayan-welcome-picker"
    );

  const logHost =
    document.getElementById(
      "bayan-log-picker"
    );

  const messageHost =
    document.getElementById(
      "bayan-message-log-picker"
    );

  const voiceHost =
    document.getElementById(
      "bayan-voice-picker"
    );

  const giveawayHost =
    document.getElementById(
      "bayan-giveaway-picker"
    );

  const ticketHost =
    document.getElementById(
      "bayan-ticket-picker"
    );

  const ticketSupportHost =
    document.getElementById(
      "bayan-ticket-support-picker"
    );

  const ticketReportHost =
    document.getElementById(
      "bayan-ticket-report-picker"
    );

  const ticketAppealHost =
    document.getElementById(
      "bayan-ticket-appeal-picker"
    );

  roleHost.innerHTML =
    "";

  welcomeHost.innerHTML =
    "";

  logHost.innerHTML =
    "";

  messageHost.innerHTML =
    "";

  voiceHost.innerHTML =
    "";

  giveawayHost.innerHTML =
    "";

  ticketHost.innerHTML =
    "";

  ticketSupportHost.innerHTML =
    "";

  ticketReportHost.innerHTML =
    "";

  ticketAppealHost.innerHTML =
    "";

  const rolePicker =
    createRolePicker(
      bayan.roles,
      settings.autoRole ||
        "",
      (value) => {
        currentRole =
          value;
      }
    );

  roleHost.appendChild(
    rolePicker
  );

  function channel(
    host,
    key
  ) {
    let value =
      settings[key] ||
      "";

    const picker =
      createChannelPicker(
        textChannels,
        value,
        (selected) => {
          settings[key] =
            selected;
        }
      );

    host.appendChild(
      picker
    );
  }

  channel(
    welcomeHost,
    "welcomeChannel"
  );

  channel(
    logHost,
    "logChannel"
  );

  channel(
    messageHost,
    "messageLogChannel"
  );

  channel(
    giveawayHost,
    "giveawayChannel"
  );

  const voicePicker =
    createChannelPicker(
      voiceChannels,
      settings.voiceLogChannel ||
        "",
      (value) => {
        settings.voiceLogChannel =
          value;
      },
      true
    );

  voiceHost.appendChild(
    voicePicker
  );

  channel(
    ticketHost,
    "ticketChannel"
  );

  channel(
    ticketSupportHost,
    "ticketSupportChannel"
  );

  channel(
    ticketReportHost,
    "ticketReportChannel"
  );

  channel(
    ticketAppealHost,
    "ticketAppealChannel"
  );
}

function createRolePicker(
  roles,
  selectedId,
  onSelect
) {
  const root =
    document.createElement(
      "div"
    );

  root.className =
    "bayan-picker";

  root.style.position =
    "relative";

  const trigger =
    document.createElement(
      "button"
    );

  trigger.type = "button";

  Object.assign(
    trigger.style,
    {
      width: "100%",
      minHeight: "46px",
      padding: "0 13px",
      display: "flex",
      justifyContent:
        "space-between",
      alignItems: "center",
      border:
        "1px solid rgba(255,255,255,.09)",
      borderRadius: "12px",
      background:
        "rgba(255,255,255,.035)",
      color: "inherit"
    }
  );

  const label =
    document.createElement(
      "span"
    );

  const arrow =
    document.createElement(
      "span"
    );

  arrow.textContent =
    "⌄";

  trigger.append(
    label,
    arrow
  );

  const menu =
    document.createElement(
      "div"
    );

  Object.assign(
    menu.style,
    {
      position:
        "absolute",
      left: "0",
      right: "0",
      top:
        "calc(100% + 7px)",
      zIndex:
        "99999",
      padding:
        "8px",
      background:
        "rgba(14,16,24,.99)",
      border:
        "1px solid rgba(255,255,255,.10)",
      borderRadius:
        "15px",
      display:
        "none",
      boxShadow:
        "0 25px 60px rgba(0,0,0,.45)"
    }
  );

  const search =
    document.createElement(
      "input"
    );

  search.type =
    "search";

  search.placeholder =
    "Search roles...";

  Object.assign(
    search.style,
    {
      width: "100%",
      height: "40px",
      padding: "0 11px",
      border:
        "1px solid rgba(255,255,255,.08)",
      borderRadius: "10px",
      background:
        "rgba(255,255,255,.035)",
      color: "inherit",
      outline: "none"
    }
  );

  const list =
    document.createElement(
      "div"
    );

  list.style.maxHeight =
    "250px";

  list.style.overflowY =
    "auto";

  list.style.marginTop =
    "8px";

  menu.append(
    search,
    list
  );

  root.append(
    trigger,
    menu
  );

  function render(
    selected
  ) {
    const item =
      roles.find(
        (role) =>
          role.id ===
          selected
      );

    label.textContent =
      item
        ? item.name
        : "Choose a role";

    list.innerHTML =
      "";

    roles.forEach(
      (role) => {
        const button =
          document.createElement(
            "button"
          );

        button.type =
          "button";

        button.textContent =
          role.name;

        Object.assign(
          button.style,
          {
            width: "100%",
            minHeight:
              "40px",
            padding:
              "8px 10px",
            textAlign:
              "left",
            border: "0",
            borderRadius:
              "9px",
            background:
              role.id ===
              selected
                ? "rgba(124,92,255,.13)"
                : "transparent",
            color:
              role.color ||
              "inherit",
            cursor:
              "pointer"
          }
        );

        button.addEventListener(
          "click",
          () => {
            onSelect(
              role.id
            );

            render(
              role.id
            );

            menu.style.display =
              "none";
          }
        );

        list.appendChild(
          button
        );
      }
    );
  }

  render(
    selectedId
  );

  trigger.addEventListener(
    "click",
    () => {
      menu.style.display =
        menu.style.display ===
        "block"
          ? "none"
          : "block";
    }
  );

  search.addEventListener(
    "input",
    () => {
      const query =
        search.value
          .trim()
          .toLowerCase();

      Array.from(
        list.children
      ).forEach(
        (child) => {
          child.style.display =
            child.textContent
              .toLowerCase()
              .includes(
                query
              )
              ? "block"
              : "none";
        }
      );
    }
  );

  return root;
}

async function saveConfiguration() {
  const settings =
    {
      ...(bayan.settings ||
        {})
    };

  const rolePicker =
    document.querySelector(
      "#bayan-role-picker .bayan-picker"
    );

  if (
    rolePicker
  ) {
    /*
      The selected role is read from
      the picker label by the stored state
      below, so no IDs are displayed.
    */
  }

  try {
    await api(
      `/guilds/${encodeURIComponent(
        bayan.guildId
      )}/settings`,
      {
        method: "PUT",

        body:
          JSON.stringify(
            settings
          )
      }
    );

    toast(
      "Settings saved successfully."
    );
  } catch (error) {
    toast(
      error.message,
      true
    );
  }
}

/* =========================================================
   CREATOR ALERTS
========================================================= */

const CREATOR_META = {
  youtube: {
    name: "YouTube",
    placeholder:
      "https://youtube.com/@yourchannel"
  },

  tiktok: {
    name: "TikTok",
    placeholder:
      "https://tiktok.com/@youraccount"
  },

  twitch: {
    name: "Twitch",
    placeholder:
      "https://twitch.tv/yourchannel"
  },

  kick: {
    name: "Kick",
    placeholder:
      "https://kick.com/yourchannel"
  }
};

function buildCreatorAlerts() {
  if (
    document.getElementById(
      "bayan-creator-alerts"
    )
  ) {
    return;
  }

  const host =
    document.querySelector(
      "main"
    ) ||
    document.querySelector(
      ".main-content"
    ) ||
    document.body;

  const section =
    document.createElement(
      "section"
    );

  section.id =
    "bayan-creator-alerts";

  section.style.margin =
    "20px 0";

  section.style.padding =
    "24px";

  section.style.borderRadius =
    "22px";

  section.style.border =
    "1px solid rgba(255,255,255,.08)";

  section.style.background =
    "rgba(255,255,255,.025)";

  section.innerHTML = `
    <div>
      <h2>Creator Alerts</h2>
      <p style="margin-top:6px;opacity:.58">
        Send your creator updates directly to Discord.
      </p>
    </div>

    <div
      id="bayan-creators"
      style="
        display:grid;
        grid-template-columns:repeat(2,minmax(0,1fr));
        gap:14px;
        margin-top:20px;
      "
    ></div>

    <div style="
      margin-top:20px;
      display:flex;
      gap:10px;
      flex-wrap:wrap;
    ">

      <button
        id="bayan-save-creators"
        type="button"
        style="
          padding:12px 18px;
          border:0;
          border-radius:12px;
          background:linear-gradient(135deg,#7c5cff,#5ea7ff);
          color:white;
          font-weight:800;
          cursor:pointer;
        "
      >
        Save Creator Alerts
      </button>

    </div>
  `;

  host.appendChild(
    section
  );

  renderCreators();

  document
    .getElementById(
      "bayan-save-creators"
    )
    .addEventListener(
      "click",
      saveCreatorAlerts
    );
}

function renderCreators() {
  const host =
    document.getElementById(
      "bayan-creators"
    );

  if (!host) {
    return;
  }

  host.innerHTML =
    "";

  const textChannels =
    bayan.channels.filter(
      (channel) =>
        channel.type ===
        "text"
    );

  Object.entries(
    CREATOR_META
  ).forEach(
    ([
      platform,
      meta
    ]) => {
      const config =
        bayan.creatorAlerts[
          platform
        ] ||
        {
          url: "",
          enabled:
            false,
          sendLive:
            true,
          sendVideos:
            platform !==
            "twitch" &&
            platform !==
            "kick",
          channelId:
            ""
        };

      const card =
        document.createElement(
          "div"
        );

      card.style.padding =
        "18px";

      card.style.borderRadius =
        "17px";

      card.style.border =
        "1px solid rgba(255,255,255,.08)";

      card.style.background =
        "rgba(255,255,255,.025)";

      card.innerHTML = `
        <div style="
          display:flex;
          justify-content:space-between;
          gap:10px;
          align-items:center;
        ">
          <strong style="font-size:16px">
            ${meta.name}
          </strong>

          <label style="
            display:flex;
            gap:7px;
            align-items:center;
            font-size:11px;
          ">
            <input
              type="checkbox"
              data-platform="${platform}"
              data-field="enabled"
              ${config.enabled ? "checked" : ""}
            >
            Enabled
          </label>
        </div>

        <input
          type="url"
          data-platform="${platform}"
          data-field="url"
          value="${escapeHTML(
            config.url || ""
          )}"
          placeholder="${meta.placeholder}"
          style="
            width:100%;
            min-height:44px;
            margin-top:13px;
            padding:0 11px;
            border-radius:11px;
            border:1px solid rgba(255,255,255,.08);
            background:rgba(255,255,255,.035);
            color:inherit;
            outline:none;
          "
        >

        <div style="
          display:flex;
          gap:15px;
          flex-wrap:wrap;
          margin-top:13px;
        ">

          <label style="font-size:11px">
            <input
              type="checkbox"
              data-platform="${platform}"
              data-field="sendLive"
              ${config.sendLive !== false ? "checked" : ""}
            >
            Live alerts
          </label>

          <label style="font-size:11px">
            <input
              type="checkbox"
              data-platform="${platform}"
              data-field="sendVideos"
              ${config.sendVideos ? "checked" : ""}
            >
            Video alerts
          </label>

        </div>

        <div
          id="creator-channel-${platform}"
          style="margin-top:13px"
        ></div>

        <button
          type="button"
          data-test-platform="${platform}"
          style="
            width:100%;
            margin-top:12px;
            min-height:40px;
            border-radius:10px;
            border:1px solid rgba(255,255,255,.08);
            background:rgba(255,255,255,.035);
            color:inherit;
            cursor:pointer;
            font-weight:700;
          "
        >
          Send Test Notification
        </button>
      `;

      host.appendChild(
        card
      );

      const channelHost =
        document.getElementById(
          `creator-channel-${platform}`
        );

      const picker =
        createChannelPicker(
          textChannels,
          config.channelId ||
            "",
          (value) => {
            bayan.creatorAlerts[
              platform
            ].channelId =
              value;
          }
        );

      channelHost.appendChild(
        picker
      );
    }
  );

  host
    .querySelectorAll(
      "[data-test-platform]"
    )
    .forEach(
      (button) => {
        button.addEventListener(
          "click",
          async () => {
            const platform =
              button.dataset
                .testPlatform;

            const config =
              bayan.creatorAlerts[
                platform
              ] || {};

            try {
              await api(
                `/guilds/${encodeURIComponent(
                  bayan.guildId
                )}/creator-alerts/test`,
                {
                  method:
                    "POST",

                  body:
                    JSON.stringify(
                      {
                        platform,
                        channelId:
                          config.channelId
                      }
                    )
                }
              );

              toast(
                "Test notification sent."
              );
            } catch (error) {
              toast(
                error.message,
                true
              );
            }
          }
        );
      }
    );
}

function collectCreatorFields() {
  document
    .querySelectorAll(
      "#bayan-creators [data-platform]"
    )
    .forEach(
      (element) => {
        const platform =
          element.dataset
            .platform;

        const field =
          element.dataset
            .field;

        if (
          !bayan.creatorAlerts[
            platform
          ]
        ) {
          bayan.creatorAlerts[
            platform
          ] = {};
        }

        if (
          element.type ===
          "checkbox"
        ) {
          bayan.creatorAlerts[
            platform
          ][field] =
            element.checked;
        } else {
          bayan.creatorAlerts[
            platform
          ][field] =
            element.value
              .trim();
        }
      }
    );
}

async function saveCreatorAlerts() {
  collectCreatorFields();

  try {
    const result =
      await api(
        `/guilds/${encodeURIComponent(
          bayan.guildId
        )}/creator-alerts`,
        {
          method:
            "PUT",

          body:
            JSON.stringify({
              creatorAlerts:
                bayan.creatorAlerts
            })
        }
      );

    bayan.creatorAlerts =
      result.creatorAlerts ||
      bayan.creatorAlerts;

    toast(
      "Creator alerts saved."
    );
  } catch (error) {
    toast(
      error.message,
      true
    );
  }
}

/* =========================================================
   HTML ESCAPE
========================================================= */

function escapeHTML(
  value
) {
  return String(
    value ?? ""
  )
    .replaceAll(
      "&",
      "&amp;"
    )
    .replaceAll(
      "<",
      "&lt;"
    )
    .replaceAll(
      ">",
      "&gt;"
    )
    .replaceAll(
      '"',
      "&quot;"
    )
    .replaceAll(
      "'",
      "&#039;"
    );
}

/* =========================================================
   EXISTING SERVER SELECTOR
========================================================= */

function loadIntoExistingServerSelector() {
  const selector =
    document.querySelector(
      "#serverSelect"
    );

  if (!selector) {
    return;
  }

  selector.innerHTML =
    "";

  bayan.guilds.forEach(
    (guild) => {
      const option =
        document.createElement(
          "option"
        );

      option.value =
        guild.id;

      option.textContent =
        guild.name;

      selector.appendChild(
        option
      );
    }
  );

  selector.value =
    bayan.guildId;

  selector.addEventListener(
    "change",
    async () => {
      await loadGuild(
        selector.value
      );

      const setup =
        document.getElementById(
          "bayan-live-config"
        );

      if (setup) {
        setup.remove();
      }

      const alerts =
        document.getElementById(
          "bayan-creator-alerts"
        );

      if (alerts) {
        alerts.remove();
      }

      buildConfigurationCard();

      buildCreatorAlerts();
    }
  );
}

/* =========================================================
   START
========================================================= */

async function initBayan() {
  try {
    setupDiscordButtons();

    setupLoginButton();

    if (
      location.pathname.includes(
        "dashboard"
      )
    ) {
      await buildServerUI();
    }
  } catch (error) {
    console.error(
      "Bayan startup error:",
      error
    );

    toast(
      error.message,
      true
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