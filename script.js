"use strict";

/* =========================================================
   BAYAN CONTROL CENTER SCRIPT
========================================================= */

const API = "/api";

const state = {
  user: null,

  guilds: [],

  guildId: "",

  roles: [],

  channels: [],

  settings: {},

  commands: [],

  health: null,

  creatorAlerts: {}
};

/* =========================================================
   API
========================================================= */

async function api(
  endpoint,
  options = {}
) {
  const response =
    await fetch(
      `${API}${endpoint}`,
      {
        ...options,

        credentials:
          "same-origin",

        headers: {
          "Content-Type":
            "application/json",

          ...(options.headers ||
            {})
        }
      }
    );

  let data;

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

/* =========================================================
   TOAST
========================================================= */

function toast(
  message,
  type = "success"
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

        maxWidth: "420px",

        padding:
          "14px 17px",

        borderRadius:
          "14px",

        background:
          "rgba(12,14,22,.97)",

        color:
          "#fff",

        fontSize:
          "13px",

        fontWeight:
          "700",

        boxShadow:
          "0 20px 60px rgba(0,0,0,.4)",

        border:
          "1px solid rgba(87,219,151,.3)"
      }
    );

    document.body.appendChild(
      element
    );
  }

  element.textContent =
    message;

  element.style.borderColor =
    type === "error"
      ? "rgba(255,95,115,.45)"
      : "rgba(87,219,151,.35)";

  clearTimeout(
    element.__timer
  );

  element.__timer =
    setTimeout(() => {
      element.remove();
    }, 2800);
}

/* =========================================================
   CSS
========================================================= */

function injectCSS() {
  if (
    document.getElementById(
      "bayan-live-control-css"
    )
  ) {
    return;
  }

  const style =
    document.createElement(
      "style"
    );

  style.id =
    "bayan-live-control-css";

  style.textContent = `
    #bayan-live-area {
      width:100%;
      margin:20px 0;
    }

    .bayan-panel {
      border:1px solid rgba(255,255,255,.08);
      background:rgba(255,255,255,.025);
      border-radius:20px;
      padding:20px;
      margin-bottom:16px;
    }

    .bayan-panel-header {
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap:15px;
      margin-bottom:16px;
    }

    .bayan-panel-header h2,
    .bayan-panel-header h3 {
      margin:0;
      font-size:17px;
    }

    .bayan-panel-header p {
      margin:5px 0 0;
      color:rgba(255,255,255,.48);
      font-size:11px;
    }

    .bayan-grid {
      display:grid;
      grid-template-columns:repeat(4,minmax(0,1fr));
      gap:10px;
    }

    .bayan-sensor {
      min-height:108px;
      padding:15px;
      border-radius:15px;
      background:rgba(255,255,255,.025);
      border:1px solid rgba(255,255,255,.07);
    }

    .bayan-sensor-top {
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap:8px;
    }

    .bayan-sensor-title {
      color:rgba(255,255,255,.52);
      font-size:10px;
      text-transform:uppercase;
      letter-spacing:.10em;
    }

    .bayan-sensor-dot {
      width:8px;
      height:8px;
      border-radius:50%;
      background:#57db97;
      box-shadow:0 0 13px rgba(87,219,151,.45);
    }

    .bayan-sensor-dot.warning {
      background:#f3c969;
      box-shadow:0 0 13px rgba(243,201,105,.40);
    }

    .bayan-sensor-dot.error {
      background:#ff5f73;
      box-shadow:0 0 13px rgba(255,95,115,.40);
    }

    .bayan-sensor-value {
      margin-top:14px;
      font-size:24px;
      font-weight:900;
      letter-spacing:-.6px;
    }

    .bayan-sensor-meta {
      margin-top:4px;
      color:rgba(255,255,255,.40);
      font-size:10px;
    }

    .bayan-two-col {
      display:grid;
      grid-template-columns:1fr 1fr;
      gap:16px;
    }

    .bayan-config-grid {
      display:grid;
      grid-template-columns:repeat(2,minmax(0,1fr));
      gap:12px;
    }

    .bayan-field label {
      display:block;
      margin-bottom:7px;
      color:rgba(255,255,255,.68);
      font-size:11px;
      font-weight:700;
    }

    .bayan-picker {
      position:relative;
      width:100%;
    }

    .bayan-picker-button {
      width:100%;
      min-height:45px;
      padding:0 12px;
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap:10px;
      border:1px solid rgba(255,255,255,.08);
      border-radius:11px;
      background:rgba(255,255,255,.035);
      color:inherit;
      cursor:pointer;
    }

    .bayan-picker-button:hover {
      border-color:rgba(124,92,255,.30);
      background:rgba(255,255,255,.055);
    }

    .bayan-picker-value {
      overflow:hidden;
      text-overflow:ellipsis;
      white-space:nowrap;
    }

    .bayan-picker-menu {
      position:absolute;
      left:0;
      right:0;
      top:calc(100% + 7px);
      z-index:999999;
      display:none;
      padding:8px;
      border:1px solid rgba(255,255,255,.10);
      border-radius:14px;
      background:rgba(12,14,22,.99);
      box-shadow:0 28px 65px rgba(0,0,0,.46);
      backdrop-filter:blur(18px);
    }

    .bayan-picker.open .bayan-picker-menu {
      display:block;
    }

    .bayan-picker-search {
      width:100%;
      height:39px;
      padding:0 10px;
      margin-bottom:7px;
      border:1px solid rgba(255,255,255,.08);
      border-radius:9px;
      background:rgba(255,255,255,.035);
      color:inherit;
      outline:none;
    }

    .bayan-picker-list {
      max-height:245px;
      overflow-y:auto;
    }

    .bayan-picker-list::-webkit-scrollbar {
      width:7px;
    }

    .bayan-picker-list::-webkit-scrollbar-thumb {
      background:rgba(255,255,255,.13);
      border-radius:99px;
    }

    .bayan-option {
      width:100%;
      min-height:40px;
      display:flex;
      align-items:center;
      gap:9px;
      padding:8px 9px;
      margin-bottom:2px;
      border:0;
      border-radius:9px;
      background:transparent;
      color:inherit;
      text-align:left;
      cursor:pointer;
    }

    .bayan-option:hover {
      background:rgba(255,255,255,.055);
    }

    .bayan-option-check {
      margin-left:auto;
      color:#57db97;
    }

    .bayan-health-badge {
      display:inline-flex;
      align-items:center;
      gap:7px;
      padding:8px 11px;
      border-radius:999px;
      font-size:10px;
      font-weight:800;
      background:rgba(87,219,151,.07);
      border:1px solid rgba(87,219,151,.16);
      color:#8ae8b2;
    }

    .bayan-health-badge.warning {
      background:rgba(243,201,105,.07);
      border-color:rgba(243,201,105,.16);
      color:#f3d885;
    }

    .bayan-health-badge.error {
      background:rgba(255,95,115,.07);
      border-color:rgba(255,95,115,.16);
      color:#ff9aaa;
    }

    .bayan-command-toolbar {
      display:flex;
      gap:9px;
      flex-wrap:wrap;
      margin-bottom:13px;
    }

    .bayan-command-search {
      flex:1;
      min-width:220px;
      height:42px;
      padding:0 12px;
      border:1px solid rgba(255,255,255,.08);
      border-radius:11px;
      background:rgba(255,255,255,.035);
      color:inherit;
      outline:none;
    }

    .bayan-command-filter {
      height:42px;
      min-width:150px;
      padding:0 10px;
      border:1px solid rgba(255,255,255,.08);
      border-radius:11px;
      background:rgba(255,255,255,.035);
      color:inherit;
      outline:none;
    }

    .bayan-command-list {
      display:grid;
      grid-template-columns:repeat(2,minmax(0,1fr));
      gap:9px;
    }

    .bayan-command {
      padding:14px;
      border-radius:13px;
      border:1px solid rgba(255,255,255,.07);
      background:rgba(255,255,255,.02);
    }

    .bayan-command-top {
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap:10px;
    }

    .bayan-command-name {
      color:#c1b6ff;
      font:700 12px ui-monospace,SFMono-Regular,Menlo,monospace;
    }

    .bayan-command-tag {
      color:rgba(255,255,255,.35);
      font-size:9px;
      text-transform:uppercase;
      letter-spacing:.08em;
    }

    .bayan-command p {
      margin:7px 0 0;
      color:rgba(255,255,255,.52);
      font-size:11px;
      line-height:1.5;
    }

    .bayan-status-table {
      display:grid;
      gap:7px;
    }

    .bayan-status-row {
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap:15px;
      padding:10px 12px;
      border-radius:10px;
      background:rgba(255,255,255,.025);
    }

    .bayan-status-name {
      font-size:11px;
      color:rgba(255,255,255,.62);
    }

    .bayan-status-value {
      font-size:11px;
      font-weight:800;
    }

    .bayan-actions {
      display:flex;
      justify-content:flex-end;
      gap:8px;
      margin-top:17px;
      flex-wrap:wrap;
    }

    .bayan-btn {
      min-height:41px;
      padding:0 14px;
      border-radius:10px;
      border:1px solid rgba(255,255,255,.08);
      background:rgba(255,255,255,.035);
      color:inherit;
      cursor:pointer;
      font-size:11px;
      font-weight:800;
    }

    .bayan-btn.primary {
      border:0;
      color:#fff;
      background:linear-gradient(135deg,#7c5cff,#5ea7ff);
    }

    .bayan-btn:hover {
      transform:translateY(-1px);
    }

    .bayan-empty {
      padding:16px;
      text-align:center;
      color:rgba(255,255,255,.38);
      font-size:11px;
    }

    @media(max-width:1000px) {
      .bayan-grid {
        grid-template-columns:repeat(2,minmax(0,1fr));
      }

      .bayan-two-col {
        grid-template-columns:1fr;
      }
    }

    @media(max-width:700px) {
      .bayan-grid,
      .bayan-config-grid,
      .bayan-command-list {
        grid-template-columns:1fr;
      }

      .bayan-panel {
        padding:15px;
      }
    }

    body.light .bayan-picker-menu {
      background:rgba(255,255,255,.99);
      border-color:rgba(20,25,40,.10);
      box-shadow:0 25px 60px rgba(20,25,40,.15);
    }

    body.light .bayan-picker-search,
    body.light .bayan-command-search,
    body.light .bayan-command-filter {
      color:#111522;
      background:rgba(20,25,40,.035);
      border-color:rgba(20,25,40,.08);
    }

    body.light .bayan-option:hover {
      background:rgba(20,25,40,.045);
    }
  `;

  document.head.appendChild(
    style
  );
}

/* =========================================================
   LOAD USER
========================================================= */

async function loadUser() {
  const data =
    await api(
      "/me"
    );

  if (
    !data.loggedIn
  ) {
    return null;
  }

  state.user =
    data.user;

  return state.user;
}

/* =========================================================
   LOAD SERVERS
========================================================= */

async function loadGuilds() {
  const data =
    await api(
      "/guilds"
    );

  state.guilds =
    Array.isArray(
      data.guilds
    )
      ? data.guilds
      : [];

  return state.guilds;
}

/* =========================================================
   GET CURRENT SERVER
========================================================= */

function getRequestedGuildId() {
  const params =
    new URLSearchParams(
      window.location.search
    );

  return (
    params.get(
      "guild"
    ) ||
    localStorage.getItem(
      "bayan_guild_id"
    ) ||
    ""
  );
}

/* =========================================================
   LOAD SERVER
========================================================= */

async function loadServer(
  guildId
) {
  const data =
    await api(
      `/guilds/${encodeURIComponent(
        guildId
      )}/selectors`
    );

  state.guildId =
    guildId;

  state.roles =
    data.roles || [];

  state.channels =
    data.channels || [];

  state.settings =
    data.settings || {};

  state.creatorAlerts =
    state.settings
      .creatorAlerts ||
    {};

  localStorage.setItem(
    "bayan_guild_id",
    guildId
  );

  await Promise.all([
    loadHealth(),
    loadCommands()
  ]);
}

/* =========================================================
   HEALTH
========================================================= */

async function loadHealth() {
  if (
    !state.guildId
  ) {
    return;
  }

  const data =
    await api(
      `/guilds/${encodeURIComponent(
        state.guildId
      )}/health`
    );

  state.health =
    data.health;

  renderHealth();
}

/* =========================================================
   COMMANDS
========================================================= */

async function loadCommands() {
  if (
    !state.guildId
  ) {
    return;
  }

  const data =
    await api(
      `/guilds/${encodeURIComponent(
        state.guildId
      )}/commands`
    );

  state.commands =
    data.commands || [];

  renderCommands();
}

/* =========================================================
   FIND HOST
========================================================= */

function findHost() {
  return (
    document.querySelector(
      ".main-content"
    ) ||
    document.querySelector(
      ".dashboard-content"
    ) ||
    document.querySelector(
      "main"
    ) ||
    document.body
  );
}

/* =========================================================
   BUILD MAIN
========================================================= */

function buildMainArea() {
  let area =
    document.getElementById(
      "bayan-live-area"
    );

  if (area) {
    return area;
  }

  area =
    document.createElement(
      "div"
    );

  area.id =
    "bayan-live-area";

  const host =
    findHost();

  host.prepend(
    area
  );

  return area;
}

/* =========================================================
   BUILD HEALTH PANELS
========================================================= */

function renderHealth() {
  const area =
    document.getElementById(
      "bayan-live-area"
    );

  if (!area) {
    return;
  }

  let panel =
    document.getElementById(
      "bayan-health-panel"
    );

  if (!panel) {
    panel =
      document.createElement(
        "section"
      );

    panel.id =
      "bayan-health-panel";

    panel.className =
      "bayan-panel";

    area.appendChild(
      panel
    );
  }

  const health =
    state.health;

  if (!health) {
    return;
  }

  const overall =
    health.overall;

  const statusText =
    overall ===
    "healthy"
      ? "Healthy"
      : overall ===
        "degraded"
      ? "Degraded"
      : "Critical";

  panel.innerHTML = `
    <div class="bayan-panel-header">
      <div>
        <h2>Server Health</h2>
        <p>Live checks from Bayan and Discord.</p>
      </div>

      <div class="bayan-health-badge ${overall === "healthy"
        ? ""
        : overall === "degraded"
        ? "warning"
        : "error"}">
        <span class="bayan-sensor-dot ${overall === "healthy"
          ? ""
          : overall === "degraded"
          ? "warning"
          : "error"}"></span>

        ${statusText}
      </div>
    </div>

    <div class="bayan-grid">

      ${sensor(
        "Bayan",
        health.bot.online
          ? "ONLINE"
          : "OFFLINE",
        health.bot.online
          ? "Online"
          : "Bot unavailable",
        health.bot.online
          ? "good"
          : "error"
      )}

      ${sensor(
        "Gateway",
        health.gateway.ping ===
        null
          ? "—"
          : `${health.gateway.ping} ms`,
        "Discord connection",
        health.gateway.status ===
          "online"
          ? "good"
          : "error"
      )}

      ${sensor(
        "Members",
        formatNumber(
          health.server.members
        ),
        "Server members",
        "good"
      )}

      ${sensor(
        "Channels",
        formatNumber(
          health.server.channels
        ),
        `${health.server.textChannels} text • ${health.server.voiceChannels} voice`,
        "good"
      )}

      ${sensor(
        "Roles",
        formatNumber(
          health.server.roles
        ),
        "Server roles",
        "good"
      )}

      ${sensor(
        "Commands",
        formatNumber(
          health.server.commands
        ),
        "Registered commands",
        "good"
      )}

      ${sensor(
        "Tickets",
        ticketSensorValue(
          health.tickets
        ),
        `${health.tickets.valid}/${health.tickets.configured} configured`,
        health.tickets.status ===
          "online"
          ? "good"
          : health.tickets.status ===
            "warning"
          ? "warning"
          : "good"
      )}

      ${sensor(
        "Auto Role",
        health.hierarchy.valid
          ? "READY"
          : "CHECK",
        health.hierarchy.selectedAutoRole
          ? health.hierarchy.selectedAutoRole
          : "No role selected",
        health.hierarchy.valid
          ? "good"
          : "warning"
      )}

    </div>

    <div class="bayan-two-col" style="margin-top:14px">

      <div>
        <div class="bayan-panel-header">
          <div>
            <h3>Feature Sensors</h3>
            <p>Permission and configuration checks.</p>
          </div>
        </div>

        <div class="bayan-status-table">

          ${statusRow(
            "View Channel",
            health.permissions.viewChannel
          )}

          ${statusRow(
            "Send Messages",
            health.permissions.sendMessages
          )}

          ${statusRow(
            "Embed Links",
            health.permissions.embedLinks
          )}

          ${statusRow(
            "Manage Channels",
            health.permissions.manageChannels
          )}

          ${statusRow(
            "Manage Roles",
            health.permissions.manageRoles
          )}

          ${statusRow(
            "Manage Messages",
            health.permissions.manageMessages
          )}

        </div>
      </div>

      <div>
        <div class="bayan-panel-header">
          <div>
            <h3>Runtime</h3>
            <p>Live Bayan process information.</p>
          </div>
        </div>

        <div class="bayan-status-table">

          ${statusRowText(
            "Bot Role",
            escapeHTML(
              health.hierarchy.botRole
            )
          )}

          ${statusRowText(
            "Uptime",
            formatUptime(
              health.bot.uptimeSeconds
            )
          )}

          ${statusRowText(
            "Memory",
            `${health.runtime.memoryMb} MB`
          )}

          ${statusRowText(
            "Node",
            escapeHTML(
              health.runtime.node
            )
          )}

          ${statusRowText(
            "Storage",
            escapeHTML(
              health.storage.status
            )
          )}

          ${statusRowText(
            "Creator Alerts",
            String(
              health.creatorAlerts.configured
            )
          )}

        </div>
      </div>

    </div>

    <div class="bayan-actions">
      <button
        type="button"
        class="bayan-btn"
        id="bayan-refresh-health"
      >
        Refresh Sensors
      </button>
    </div>
  `;

  document
    .getElementById(
      "bayan-refresh-health"
    )
    ?.addEventListener(
      "click",
      async () => {
        try {
          await loadHealth();

          toast(
            "Server sensors refreshed."
          );
        } catch (error) {
          toast(
            error.message,
            "error"
          );
        }
      }
    );
}

/* =========================================================
   SENSOR HELPERS
========================================================= */

function sensor(
  title,
  value,
  meta,
  status
) {
  return `
    <div class="bayan-sensor">

      <div class="bayan-sensor-top">

        <span class="bayan-sensor-title">
          ${escapeHTML(title)}
        </span>

        <span class="bayan-sensor-dot ${
          status === "warning"
            ? "warning"
            : status === "error"
            ? "error"
            : ""
        }"></span>

      </div>

      <div class="bayan-sensor-value">
        ${escapeHTML(value)}
      </div>

      <div class="bayan-sensor-meta">
        ${escapeHTML(meta)}
      </div>

    </div>
  `;
}

function statusRow(
  label,
  good
) {
  return `
    <div class="bayan-status-row">

      <span class="bayan-status-name">
        ${escapeHTML(label)}
      </span>

      <span
        class="bayan-status-value"
        style="color:${
          good
            ? "#57db97"
            : "#ff7e90"
        }"
      >
        ${good ? "OK" : "CHECK"}
      </span>

    </div>
  `;
}

function statusRowText(
  label,
  value
) {
  return `
    <div class="bayan-status-row">

      <span class="bayan-status-name">
        ${escapeHTML(label)}
      </span>

      <span class="bayan-status-value">
        ${value}
      </span>

    </div>
  `;
}

function ticketSensorValue(
  tickets
) {
  if (
    tickets.status ===
    "not-configured"
  ) {
    return "SETUP";
  }

  if (
    tickets.status ===
    "online"
  ) {
    return "READY";
  }

  return "CHECK";
}

/* =========================================================
   CONFIGURATION
========================================================= */

function buildConfiguration() {
  const area =
    document.getElementById(
      "bayan-live-area"
    );

  if (!area) {
    return;
  }

  let panel =
    document.getElementById(
      "bayan-config-panel"
    );

  if (panel) {
    renderConfiguration();
    return;
  }

  panel =
    document.createElement(
      "section"
    );

  panel.id =
    "bayan-config-panel";

  panel.className =
    "bayan-panel";

  area.appendChild(
    panel
  );

  panel.innerHTML = `
    <div class="bayan-panel-header">
      <div>
        <h2>Server Configuration</h2>
        <p>
          Choose real Discord roles and channels by name.
          IDs are hidden.
        </p>
      </div>
    </div>

    <div class="bayan-field">
      <label>Server</label>

      <select
        id="bayan-server-select"
        style="
          width:100%;
          min-height:45px;
          padding:0 11px;
          border-radius:11px;
          border:1px solid rgba(255,255,255,.08);
          background:rgba(255,255,255,.035);
          color:inherit;
        "
      ></select>
    </div>

    <div style="margin-top:20px">

      <div class="bayan-panel-header">
        <div>
          <h3>Roles</h3>
          <p>Real server roles.</p>
        </div>
      </div>

      <div class="bayan-config-grid">
        <div
          class="bayan-field"
          id="bayan-auto-role-field"
        ></div>
      </div>

    </div>

    <div style="margin-top:22px">

      <div class="bayan-panel-header">
        <div>
          <h3>Channels</h3>
          <p>Search and scroll through your real channels.</p>
        </div>
      </div>

      <div
        class="bayan-config-grid"
        id="bayan-channel-grid"
      ></div>

    </div>

    <div style="margin-top:22px">

      <div class="bayan-panel-header">
        <div>
          <h3>Ticket System</h3>
          <p>Ticket panel and routing channels.</p>
        </div>
      </div>

      <div
        class="bayan-config-grid"
        id="bayan-ticket-grid"
      ></div>

    </div>

    <div class="bayan-actions">

      <button
        type="button"
        class="bayan-btn"
        id="bayan-reset-settings"
      >
        Reset
      </button>

      <button
        type="button"
        class="bayan-btn primary"
        id="bayan-save-settings"
      >
        Save Settings
      </button>

    </div>
  `;

  document
    .getElementById(
      "bayan-server-select"
    )
    .addEventListener(
      "change",
      async (
        event
      ) => {
        try {
          await loadServer(
            event.target.value
          );

          renderConfiguration();
        } catch (error) {
          toast(
            error.message,
            "error"
          );
        }
      }
    );

  document
    .getElementById(
      "bayan-save-settings"
    )
    .addEventListener(
      "click",
      saveSettings
    );

  document
    .getElementById(
      "bayan-reset-settings"
    )
    .addEventListener(
      "click",
      resetSettings
    );

  renderConfiguration();
}

/* =========================================================
   RENDER SERVER OPTIONS
========================================================= */

function renderServerOptions() {
  const select =
    document.getElementById(
      "bayan-server-select"
    );

  if (!select) {
    return;
  }

  select.innerHTML =
    "";

  state.guilds.forEach(
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

  if (
    state.guildId
  ) {
    select.value =
      state.guildId;
  }
}

/* =========================================================
   RENDER CONFIGURATION
========================================================= */

function renderConfiguration() {
  renderServerOptions();

  const roleField =
    document.getElementById(
      "bayan-auto-role-field"
    );

  const channelGrid =
    document.getElementById(
      "bayan-channel-grid"
    );

  const ticketGrid =
    document.getElementById(
      "bayan-ticket-grid"
    );

  if (
    !roleField ||
    !channelGrid ||
    !ticketGrid
  ) {
    return;
  }

  roleField.innerHTML =
    "";

  channelGrid.innerHTML =
    "";

  ticketGrid.innerHTML =
    "";

  roleField.innerHTML = `
    <label>Auto Role</label>
  `;

  roleField.appendChild(
    createRolePicker(
      state.roles,
      state.settings.autoRole ||
        "",
      (id) => {
        state.settings.autoRole =
          id;
      }
    )
  );

  const textChannels =
    state.channels.filter(
      (channel) =>
        channel.type ===
        "text"
    );

  const voiceChannels =
    state.channels.filter(
      (channel) =>
        channel.type ===
        "voice"
    );

  addChannelField(
    channelGrid,
    "Welcome Channel",
    "welcomeChannel",
    textChannels
  );

  addChannelField(
    channelGrid,
    "Log Channel",
    "logChannel",
    textChannels
  );

  addChannelField(
    channelGrid,
    "Message Log Channel",
    "messageLogChannel",
    textChannels
  );

  addChannelField(
    channelGrid,
    "Voice Log Channel",
    "voiceLogChannel",
    voiceChannels
  );

  addChannelField(
    channelGrid,
    "Giveaway Channel",
    "giveawayChannel",
    textChannels
  );

  addChannelField(
    channelGrid,
    "Tournament Channel",
    "tournamentChannel",
    textChannels
  );

  addChannelField(
    ticketGrid,
    "Ticket Channel",
    "ticketChannel",
    textChannels
  );

  addChannelField(
    ticketGrid,
    "Support Channel",
    "ticketSupportChannel",
    textChannels
  );

  addChannelField(
    ticketGrid,
    "Report Channel",
    "ticketReportChannel",
    textChannels
  );

  addChannelField(
    ticketGrid,
    "Appeal Channel",
    "ticketAppealChannel",
    textChannels
  );
}

/* =========================================================
   ADD CHANNEL FIELD
========================================================= */

function addChannelField(
  parent,
  label,
  key,
  items
) {
  const field =
    document.createElement(
      "div"
    );

  field.className =
    "bayan-field";

  field.innerHTML = `
    <label>
      ${escapeHTML(label)}
    </label>
  `;

  const picker =
    createChannelPicker(
      items,
      state.settings[key] ||
        "",
      (id) => {
        state.settings[key] =
          id;
      }
    );

  field.appendChild(
    picker
  );

  parent.appendChild(
    field
  );
}

/* =========================================================
   ROLE PICKER
========================================================= */

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

  const button =
    document.createElement(
      "button"
    );

  button.type =
    "button";

  button.className =
    "bayan-picker-button";

  const value =
    document.createElement(
      "span"
    );

  value.className =
    "bayan-picker-value";

  const arrow =
    document.createElement(
      "span"
    );

  arrow.textContent =
    "⌄";

  button.append(
    value,
    arrow
  );

  const menu =
    document.createElement(
      "div"
    );

  menu.className =
    "bayan-picker-menu";

  const search =
    document.createElement(
      "input"
    );

  search.type =
    "search";

  search.className =
    "bayan-picker-search";

  search.placeholder =
    "Search roles...";

  const list =
    document.createElement(
      "div"
    );

  list.className =
    "bayan-picker-list";

  menu.append(
    search,
    list
  );

  root.append(
    button,
    menu
  );

  function render(
    selected
  ) {
    const current =
      roles.find(
        (role) =>
          role.id ===
          selected
      );

    value.textContent =
      current
        ? current.name
        : "Choose a role";

    list.innerHTML =
      "";

    roles.forEach(
      (role) => {
        const option =
          document.createElement(
            "button"
          );

        option.type =
          "button";

        option.className =
          "bayan-option";

        option.dataset.search =
          role.name.toLowerCase();

        const name =
          document.createElement(
            "span"
          );

        name.textContent =
          role.name;

        name.style.color =
          role.color ||
          "inherit";

        const check =
          document.createElement(
            "span"
          );

        check.className =
          "bayan-option-check";

        check.textContent =
          role.id ===
          selected
            ? "✓"
            : "";

        option.append(
          name,
          check
        );

        option.addEventListener(
          "click",
          () => {
            onSelect(
              role.id
            );

            render(
              role.id
            );

            menu.classList.remove(
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

  render(
    selectedId
  );

  button.addEventListener(
    "click",
    (
      event
    ) => {
      event.stopPropagation();

      closePickers(
        root
      );

      root.classList.toggle(
        "open"
      );
    }
  );

  search.addEventListener(
    "input",
    () => {
      const query =
        search.value
          .trim()
          .toLowerCase();

      list
        .querySelectorAll(
          ".bayan-option"
        )
        .forEach(
          (option) => {
            option.style.display =
              !query ||
              option.dataset.search.includes(
                query
              )
                ? "flex"
                : "none";
          }
        );
    }
  );

  return root;
}

/* =========================================================
   CHANNEL PICKER
========================================================= */

function createChannelPicker(
  channels,
  selectedId,
  onSelect
) {
  const root =
    document.createElement(
      "div"
    );

  root.className =
    "bayan-picker";

  const button =
    document.createElement(
      "button"
    );

  button.type =
    "button";

  button.className =
    "bayan-picker-button";

  const value =
    document.createElement(
      "span"
    );

  value.className =
    "bayan-picker-value";

  const arrow =
    document.createElement(
      "span"
    );

  arrow.textContent =
    "⌄";

  button.append(
    value,
    arrow
  );

  const menu =
    document.createElement(
      "div"
    );

  menu.className =
    "bayan-picker-menu";

  const search =
    document.createElement(
      "input"
    );

  search.type =
    "search";

  search.className =
    "bayan-picker-search";

  search.placeholder =
    "Search channels...";

  const list =
    document.createElement(
      "div"
    );

  list.className =
    "bayan-picker-list";

  menu.append(
    search,
    list
  );

  root.append(
    button,
    menu
  );

  function render(
    selected
  ) {
    const current =
      channels.find(
        (channel) =>
          channel.id ===
          selected
      );

    value.textContent =
      current
        ? current.type ===
          "voice"
          ? `🔊 ${current.name}`
          : `# ${current.name}`
        : "Choose a channel";

    list.innerHTML =
      "";

    if (
      !channels.length
    ) {
      const empty =
        document.createElement(
          "div"
        );

      empty.className =
        "bayan-empty";

      empty.textContent =
        "No channels found.";

      list.appendChild(
        empty
      );

      return;
    }

    channels.forEach(
      (channel) => {
        const option =
          document.createElement(
            "button"
          );

        option.type =
          "button";

        option.className =
          "bayan-option";

        const name =
          document.createElement(
            "span"
          );

        name.textContent =
          channel.type ===
          "voice"
            ? `🔊 ${channel.name}`
            : `# ${channel.name}`;

        const check =
          document.createElement(
            "span"
          );

        check.className =
          "bayan-option-check";

        check.textContent =
          channel.id ===
          selected
            ? "✓"
            : "";

        option.append(
          name,
          check
        );

        option.dataset.search =
          channel.name.toLowerCase();

        option.addEventListener(
          "click",
          () => {
            onSelect(
              channel.id
            );

            render(
              channel.id
            );

            menu.classList.remove(
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

  render(
    selectedId
  );

  button.addEventListener(
    "click",
    (
      event
    ) => {
      event.stopPropagation();

      closePickers(
        root
      );

      root.classList.toggle(
        "open"
      );
    }
  );

  search.addEventListener(
    "input",
    () => {
      const query =
        search.value
          .trim()
          .toLowerCase();

      list
        .querySelectorAll(
          ".bayan-option"
        )
        .forEach(
          (option) => {
            option.style.display =
              !query ||
              option.dataset.search.includes(
                query
              )
                ? "flex"
                : "none";
          }
        );
    }
  );

  return root;
}

/* =========================================================
   CLOSE PICKERS
========================================================= */

function closePickers(
  except = null
) {
  document
    .querySelectorAll(
      ".bayan-picker.open"
    )
    .forEach(
      (picker) => {
        if (
          picker ===
          except
        ) {
          return;
        }

        picker.classList.remove(
          "open"
        );
      }
    );
}

document.addEventListener(
  "click",
  () => {
    closePickers();
  }
);

/* =========================================================
   SAVE SETTINGS
========================================================= */

async function saveSettings() {
  if (
    !state.guildId
  ) {
    toast(
      "Choose a server first.",
      "error"
    );

    return;
  }

  try {
    const result =
      await api(
        `/guilds/${encodeURIComponent(
          state.guildId
        )}/settings`,
        {
          method:
            "PUT",

          body:
            JSON.stringify(
              state.settings
            )
        }
      );

    state.settings =
      result.settings ||
      state.settings;

    toast(
      "Settings saved successfully."
    );

    await loadHealth();
  } catch (error) {
    toast(
      error.message,
      "error"
    );
  }
}

/* =========================================================
   RESET
========================================================= */

function resetSettings() {
  state.settings = {
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
    ticketAppealChannel: "",

    creatorAlerts:
      state.settings.creatorAlerts ||
      {}
  };

  renderConfiguration();

  toast(
    "Selections reset."
  );
}

/* =========================================================
   COMMANDS
========================================================= */

function renderCommands() {
  const area =
    document.getElementById(
      "bayan-live-area"
    );

  if (!area) {
    return;
  }

  let panel =
    document.getElementById(
      "bayan-command-panel"
    );

  if (!panel) {
    panel =
      document.createElement(
        "section"
      );

    panel.id =
      "bayan-command-panel";

    panel.className =
      "bayan-panel";

    area.appendChild(
      panel
    );
  }

  panel.innerHTML = `
    <div class="bayan-panel-header">
      <div>
        <h2>Commands</h2>
        <p>
          Registered Discord commands and Bayan command catalog.
        </p>
      </div>

      <button
        type="button"
        class="bayan-btn"
        id="bayan-refresh-commands"
      >
        Refresh
      </button>
    </div>

    <div class="bayan-command-toolbar">

      <input
        id="bayan-command-search"
        class="bayan-command-search"
        type="search"
        placeholder="Search commands..."
      />

      <select
        id="bayan-command-filter"
        class="bayan-command-filter"
      >
        <option value="all">
          All categories
        </option>
      </select>

    </div>

    <div
      id="bayan-command-list"
      class="bayan-command-list"
    ></div>
  `;

  const filter =
    document.getElementById(
      "bayan-command-filter"
    );

  const categories =
    [
      ...new Set(
        state.commands.map(
          (command) =>
            command.category ||
            "Other"
        )
      )
    ].sort();

  categories.forEach(
    (category) => {
      const option =
        document.createElement(
          "option"
        );

      option.value =
        category;

      option.textContent =
        category;

      filter.appendChild(
        option
      );
    }
  );

  document
    .getElementById(
      "bayan-command-search"
    )
    .addEventListener(
      "input",
      renderCommandList
    );

  filter.addEventListener(
    "change",
    renderCommandList
  );

  document
    .getElementById(
      "bayan-refresh-commands"
    )
    .addEventListener(
      "click",
      async () => {
        try {
          await loadCommands();

          toast(
            "Commands refreshed."
          );
        } catch (error) {
          toast(
            error.message,
            "error"
          );
        }
      }
    );

  renderCommandList();
}

function renderCommandList() {
  const list =
    document.getElementById(
      "bayan-command-list"
    );

  const search =
    document.getElementById(
      "bayan-command-search"
    );

  const filter =
    document.getElementById(
      "bayan-command-filter"
    );

  if (
    !list ||
    !search ||
    !filter
  ) {
    return;
  }

  const query =
    search.value
      .trim()
      .toLowerCase();

  const selectedCategory =
    filter.value;

  const results =
    state.commands.filter(
      (command) => {
        const name =
          String(
            command.name ||
              ""
          ).toLowerCase();

        const description =
          String(
            command.description ||
              ""
          ).toLowerCase();

        const category =
          command.category ||
          "Other";

        const matchesText =
          !query ||
          name.includes(
            query
          ) ||
          description.includes(
            query
          );

        const matchesCategory =
          selectedCategory ===
            "all" ||
          category ===
            selectedCategory;

        return (
          matchesText &&
          matchesCategory
        );
      }
    );

  list.innerHTML =
    "";

  if (
    !results.length
  ) {
    list.innerHTML = `
      <div class="bayan-empty">
        No commands found.
      </div>
    `;

    return;
  }

  results.forEach(
    (command) => {
      const card =
        document.createElement(
          "article"
        );

      card.className =
        "bayan-command";

      const registered =
        command.registered !==
        false;

      card.innerHTML = `
        <div class="bayan-command-top">

          <span class="bayan-command-name">
            /${escapeHTML(
              command.name
            )}
          </span>

          <span class="bayan-command-tag">
            ${escapeHTML(
              command.category ||
                "Other"
            )}
          </span>

        </div>

        <p>
          ${escapeHTML(
            command.description ||
              "Bayan command"
          )}
        </p>

        <div
          style="
            margin-top:9px;
            color:${
              registered
                ? "#57db97"
                : "#f3d885"
            };
            font-size:9px;
            font-weight:800;
          "
        >
          ${
            registered
              ? "REGISTERED"
              : "CATALOG"
          }
        </div>
      `;

      list.appendChild(
        card
      );
    }
  );
}

/* =========================================================
   SERVER SELECTOR
========================================================= */

function setupExistingServerSelector() {
  const existing =
    document.getElementById(
      "serverSelect"
    );

  if (!existing) {
    return;
  }

  existing.innerHTML =
    "";

  state.guilds.forEach(
    (guild) => {
      const option =
        document.createElement(
          "option"
        );

      option.value =
        guild.id;

      option.textContent =
        guild.name;

      existing.appendChild(
        option
      );
    }
  );

  existing.value =
    state.guildId;

  existing.addEventListener(
    "change",
    async () => {
      try {
        await loadServer(
          existing.value
        );

        renderConfiguration();
        renderHealth();
        renderCommands();
      } catch (error) {
        toast(
          error.message,
          "error"
        );
      }
    }
  );
}

/* =========================================================
   LOGIN CARD
========================================================= */

function showLogin() {
  const host =
    findHost();

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

  card.className =
    "bayan-panel";

  card.style.maxWidth =
    "700px";

  card.style.margin =
    "60px auto";

  card.innerHTML = `
    <div class="bayan-panel-header">
      <div>
        <h2>Login to Bayan</h2>

        <p>
          Sign in with Discord to access your servers,
          roles, channels and commands.
        </p>
      </div>
    </div>

    <a
      href="/auth/discord/install"
      class="bayan-btn primary"
      style="
        display:inline-flex;
        align-items:center;
        text-decoration:none;
      "
    >
      Continue with Discord
    </a>
  `;

  host.prepend(
    card
  );
}

/* =========================================================
   SERVER LIST EMPTY
========================================================= */

function showNoServers() {
  const host =
    findHost();

  const card =
    document.createElement(
      "section"
    );

  card.className =
    "bayan-panel";

  card.innerHTML = `
    <div class="bayan-panel-header">
      <div>
        <h2>No Bayan servers found</h2>

        <p>
          Add Bayan to a server you can manage, then return here.
        </p>
      </div>
    </div>

    <a
      href="/auth/discord/install"
      class="bayan-btn primary"
      style="
        display:inline-flex;
        align-items:center;
        text-decoration:none;
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
   CREATOR ALERT PANEL
========================================================= */

function buildCreatorPanel() {
  const area =
    document.getElementById(
      "bayan-live-area"
    );

  if (!area) {
    return;
  }

  let panel =
    document.getElementById(
      "bayan-creator-panel"
    );

  if (!panel) {
    panel =
      document.createElement(
        "section"
      );

    panel.id =
      "bayan-creator-panel";

    panel.className =
      "bayan-panel";

    area.appendChild(
      panel
    );
  }

  const channels =
    state.channels.filter(
      (channel) =>
        channel.type ===
        "text"
    );

  const platforms = [
    [
      "youtube",
      "YouTube",
      "https://youtube.com/@yourchannel"
    ],
    [
      "tiktok",
      "TikTok",
      "https://tiktok.com/@youraccount"
    ],
    [
      "twitch",
      "Twitch",
      "https://twitch.tv/yourchannel"
    ],
    [
      "kick",
      "Kick",
      "https://kick.com/yourchannel"
    ]
  ];

  panel.innerHTML = `
    <div class="bayan-panel-header">
      <div>
        <h2>Creator Alerts</h2>
        <p>
          Store creator URLs and choose where notifications go.
        </p>
      </div>
    </div>

    <div
      class="bayan-config-grid"
      id="bayan-creators-grid"
    ></div>

    <div class="bayan-actions">
      <button
        type="button"
        class="bayan-btn primary"
        id="bayan-save-creators"
      >
        Save Creator Alerts
      </button>
    </div>
  `;

  const grid =
    document.getElementById(
      "bayan-creators-grid"
    );

  platforms.forEach(
    ([
      key,
      name,
      placeholder
    ]) => {
      const config =
        state.creatorAlerts[
          key
        ] ||
        {
          url: "",
          enabled: false,
          sendLive: true,
          sendVideos: false,
          channelId: ""
        };

      const field =
        document.createElement(
          "div"
        );

      field.className =
        "bayan-field";

      field.innerHTML = `
        <div
          style="
            display:flex;
            align-items:center;
            justify-content:space-between;
            gap:8px;
            margin-bottom:8px;
          "
        >
          <label style="margin:0">
            ${escapeHTML(
              name
            )}
          </label>

          <label
            style="
              font-size:10px;
              display:flex;
              align-items:center;
              gap:5px;
            "
          >
            <input
              type="checkbox"
              data-creator="${key}"
              data-field="enabled"
              ${config.enabled ? "checked" : ""}
            >
            Enabled
          </label>
        </div>

        <input
          type="url"
          data-creator="${key}"
          data-field="url"
          value="${escapeHTML(
            config.url || ""
          )}"
          placeholder="${escapeHTML(
            placeholder
          )}"
          style="
            width:100%;
            min-height:44px;
            padding:0 11px;
            border:1px solid rgba(255,255,255,.08);
            border-radius:11px;
            background:rgba(255,255,255,.035);
            color:inherit;
            outline:none;
          "
        >

        <div
          style="
            display:flex;
            gap:12px;
            flex-wrap:wrap;
            margin-top:9px;
          "
        >
          <label style="font-size:10px">
            <input
              type="checkbox"
              data-creator="${key}"
              data-field="sendLive"
              ${config.sendLive !== false ? "checked" : ""}
            >
            Live alerts
          </label>

          <label style="font-size:10px">
            <input
              type="checkbox"
              data-creator="${key}"
              data-field="sendVideos"
              ${config.sendVideos ? "checked" : ""}
            >
            Video alerts
          </label>
        </div>

        <div
          id="creator-picker-${key}"
          style="margin-top:10px"
        ></div>

        <button
          type="button"
          class="bayan-btn"
          data-creator-test="${key}"
          style="
            margin-top:9px;
            width:100%;
          "
        >
          Send Test
        </button>
      `;

      grid.appendChild(
        field
      );

      const picker =
        createChannelPicker(
          channels,
          config.channelId ||
            "",
          (id) => {
            if (
              !state.creatorAlerts[
                key
              ]
            ) {
              state.creatorAlerts[
                key
              ] = {};
            }

            state.creatorAlerts[
              key
            ].channelId =
              id;
          }
        );

      document
        .getElementById(
          `creator-picker-${key}`
        )
        .appendChild(
          picker
        );
    }
  );

  document
    .getElementById(
      "bayan-save-creators"
    )
    .addEventListener(
      "click",
      saveCreatorAlerts
    );

  grid
    .querySelectorAll(
      "[data-creator-test]"
    )
    .forEach(
      (button) => {
        button.addEventListener(
          "click",
          async () => {
            const platform =
              button.dataset
                .creatorTest;

            const channelId =
              state.creatorAlerts[
                platform
              ]?.channelId ||
              "";

            try {
              await api(
                `/guilds/${encodeURIComponent(
                  state.guildId
                )}/creator-alerts/test`,
                {
                  method:
                    "POST",

                  body:
                    JSON.stringify({
                      platform,
                      channelId
                    })
                }
              );

              toast(
                "Test notification sent."
              );
            } catch (error) {
              toast(
                error.message,
                "error"
              );
            }
          }
        );
      }
    );
}

/* =========================================================
   CREATOR SAVE
========================================================= */

async function saveCreatorAlerts() {
  document
    .querySelectorAll(
      "#bayan-creators-grid [data-creator]"
    )
    .forEach(
      (element) => {
        const platform =
          element.dataset
            .creator;

        const field =
          element.dataset
            .field;

        if (
          !state.creatorAlerts[
            platform
          ]
        ) {
          state.creatorAlerts[
            platform
          ] = {};
        }

        state.creatorAlerts[
          platform
        ][field] =
          element.type ===
          "checkbox"
            ? element.checked
            : element.value.trim();
      }
    );

  try {
    const result =
      await api(
        `/guilds/${encodeURIComponent(
          state.guildId
        )}/creator-alerts`,
        {
          method:
            "PUT",

          body:
            JSON.stringify({
              creatorAlerts:
                state.creatorAlerts
            })
        }
      );

    state.creatorAlerts =
      result.creatorAlerts;

    toast(
      "Creator alerts saved."
    );
  } catch (error) {
    toast(
      error.message,
      "error"
    );
  }
}

/* =========================================================
   FORMATTERS
========================================================= */

function formatNumber(
  value
) {
  return Number(
    value || 0
  ).toLocaleString();
}

function formatUptime(
  seconds
) {
  let total =
    Number(
      seconds || 0
    );

  const days =
    Math.floor(
      total / 86400
    );

  total %= 86400;

  const hours =
    Math.floor(
      total / 3600
    );

  total %= 3600;

  const minutes =
    Math.floor(
      total / 60
    );

  const secs =
    Math.floor(
      total % 60
    );

  if (days) {
    return `${days}d ${hours}h`;
  }

  if (hours) {
    return `${hours}h ${minutes}m`;
  }

  if (minutes) {
    return `${minutes}m ${secs}s`;
  }

  return `${secs}s`;
}

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
   LANGUAGE
========================================================= */

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

      window.location.reload();
    }
  );
}

/* =========================================================
   THEME
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
      const next =
        document.body.classList.contains(
          "light"
        )
          ? "dark"
          : "light";

      document.body.classList.toggle(
        "light",
        next === "light"
      );

      localStorage.setItem(
        "bayan_theme",
        next
      );
    }
  );
}

/* =========================================================
   REPLACE ADD BAYAN LINKS
========================================================= */

function setupAddBayanLinks() {
  document
    .querySelectorAll(
      'a[href*="discord.com/oauth2/authorize"]'
    )
    .forEach(
      (link) => {
        link.href =
          "/auth/discord/install";

        link.removeAttribute(
          "target"
        );

        link.removeAttribute(
          "rel"
        );
      }
    );
}

/* =========================================================
   DASHBOARD START
========================================================= */

async function initDashboard() {
  if (
    !window.location.pathname.includes(
      "dashboard"
    )
  ) {
    return;
  }

  injectCSS();

  const user =
    await loadUser();

  if (!user) {
    showLogin();
    return;
  }

  const guilds =
    await loadGuilds();

  if (
    !guilds.length
  ) {
    showNoServers();
    return;
  }

  const requested =
    getRequestedGuildId();

  const selected =
    guilds.find(
      (guild) =>
        guild.id ===
        requested
    ) ||
    guilds[0];

  await loadServer(
    selected.id
  );

  const area =
    buildMainArea();

  /*
    Existing dashboard server selector
  */
  setupExistingServerSelector();

  /*
    Dynamic live controls
  */
  buildConfiguration();

  /*
    Real server health
  */
  renderHealth();

  /*
    Real commands
  */
  renderCommands();

  /*
    Creator links
  */
  buildCreatorPanel();

  /*
    Keep server selector synced
  */
  const existing =
    document.getElementById(
      "serverSelect"
    );

  if (existing) {
    existing.value =
      selected.id;
  }

  /*
    Prevent unused variable warning
  */
  void area;
}

/* =========================================================
   NORMAL WEBSITE
========================================================= */

function initWebsite() {
  setupAddBayanLinks();
  setupLanguage();
  setupTheme();
}

/* =========================================================
   START
========================================================= */

async function startBayan() {
  try {
    initWebsite();

    await initDashboard();

    console.log(
      "%cBayan Control Center loaded.",
      "color:#7c5cff;font-weight:800"
    );
  } catch (error) {
    console.error(
      "Bayan frontend error:",
      error
    );

    toast(
      error.message ||
        "Bayan frontend error.",
      "error"
    );
  }
}

if (
  document.readyState ===
  "loading"
) {
  document.addEventListener(
    "DOMContentLoaded",
    startBayan,
    {
      once: true
    }
  );
} else {
  startBayan();
}