"use strict";

require("dotenv").config();

const express = require("express");
const session = require("express-session");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const {
  Client,
  GatewayIntentBits,
  PermissionsBitField
} = require("discord.js");

const app = express();

const PORT =
  Number(process.env.PORT) || 3000;

const ROOT = __dirname;

const SETTINGS_FILE = path.join(
  ROOT,
  "settings.json"
);

const CLIENT_ID =
  process.env.DISCORD_CLIENT_ID;

const CLIENT_SECRET =
  process.env.DISCORD_CLIENT_SECRET;

const BOT_TOKEN =
  process.env.DISCORD_BOT_TOKEN;

const REDIRECT_URI =
  process.env.DISCORD_REDIRECT_URI ||
  `http://localhost:${PORT}/auth/discord/callback`;

/* =========================================================
   DISCORD CLIENT
========================================================= */

const discord =
  new Client({
    intents: [
      GatewayIntentBits.Guilds
    ]
  });

let discordReady = false;

/* =========================================================
   COMMAND CATALOG
   This is used as a fallback if commands are not yet
   registered in Discord.
========================================================= */

const COMMAND_CATALOG = [
  {
    name: "help",
    category: "Utility",
    description: "Show Bayan commands and help.",
    permission: "Everyone"
  },
  {
    name: "ping",
    category: "Utility",
    description: "Check Bayan response latency.",
    permission: "Everyone"
  },
  {
    name: "afk",
    category: "Utility",
    description: "Set or remove your AFK status.",
    permission: "Everyone"
  },
  {
    name: "ban",
    category: "Moderation",
    description: "Ban a member from the server.",
    permission: "Ban Members"
  },
  {
    name: "kick",
    category: "Moderation",
    description: "Kick a member from the server.",
    permission: "Kick Members"
  },
  {
    name: "timeout",
    category: "Moderation",
    description: "Timeout a member.",
    permission: "Moderate Members"
  },
  {
    name: "warn",
    category: "Moderation",
    description: "Warn a member.",
    permission: "Moderate Members"
  },
  {
    name: "warnings",
    category: "Moderation",
    description: "View a member's warnings.",
    permission: "Moderate Members"
  },
  {
    name: "unwarn",
    category: "Moderation",
    description: "Remove a warning.",
    permission: "Moderate Members"
  },
  {
    name: "clear",
    category: "Moderation",
    description: "Delete messages from a channel.",
    permission: "Manage Messages"
  },
  {
    name: "slowmode",
    category: "Moderation",
    description: "Configure channel slowmode.",
    permission: "Manage Channels"
  },
  {
    name: "lock",
    category: "Moderation",
    description: "Lock a text channel.",
    permission: "Manage Channels"
  },
  {
    name: "unlock",
    category: "Moderation",
    description: "Unlock a text channel.",
    permission: "Manage Channels"
  },
  {
    name: "ticket-setup",
    category: "Tickets",
    description: "Set up the Bayan ticket panel.",
    permission: "Administrator"
  },
  {
    name: "ticket-permissions",
    category: "Tickets",
    description: "Configure ticket staff roles.",
    permission: "Manage Guild"
  },
  {
    name: "giveaway",
    category: "Community",
    description: "Create and manage giveaways.",
    permission: "Manage Guild"
  },
  {
    name: "autorole",
    category: "Server",
    description: "Configure the automatic member role.",
    permission: "Manage Guild"
  },
  {
    name: "tournament",
    category: "Events",
    description: "Create and manage tournament matches.",
    permission: "Manage Guild"
  },
  {
    name: "serverinfo",
    category: "Server",
    description: "Display server information.",
    permission: "Everyone"
  },
  {
    name: "userinfo",
    category: "Utility",
    description: "Display member information.",
    permission: "Everyone"
  },
  {
    name: "avatar",
    category: "Utility",
    description: "Show a member avatar.",
    permission: "Everyone"
  },
  {
    name: "announce",
    category: "Community",
    description: "Create a server announcement.",
    permission: "Manage Guild"
  },
  {
    name: "setup",
    category: "Server",
    description: "Open Bayan server setup.",
    permission: "Administrator"
  },
  {
    name: "health",
    category: "System",
    description: "Check Bayan server health.",
    permission: "Manage Guild"
  }
];

/* =========================================================
   EXPRESS
========================================================= */

app.use(
  express.json({
    limit: "2mb"
  })
);

app.use(
  express.urlencoded({
    extended: true
  })
);

app.use(
  session({
    secret:
      process.env.SESSION_SECRET ||
      crypto
        .randomBytes(32)
        .toString("hex"),

    resave: false,

    saveUninitialized: false,

    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge:
        1000 * 60 * 60 * 24 * 7
    }
  })
);

/*
  EVERYTHING IS DIRECTLY IN BayanWebsite.
*/
app.use(
  express.static(ROOT)
);

/* =========================================================
   SETTINGS STORAGE
========================================================= */

function createDefaultSettings() {
  return {
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

    creatorAlerts: {
      youtube: {
        url: "",
        enabled: false,
        sendLive: true,
        sendVideos: true,
        channelId: ""
      },

      tiktok: {
        url: "",
        enabled: false,
        sendLive: true,
        sendVideos: true,
        channelId: ""
      },

      twitch: {
        url: "",
        enabled: false,
        sendLive: true,
        sendVideos: false,
        channelId: ""
      },

      kick: {
        url: "",
        enabled: false,
        sendLive: true,
        sendVideos: false,
        channelId: ""
      }
    }
  };
}

function ensureSettingsFile() {
  if (
    fs.existsSync(
      SETTINGS_FILE
    )
  ) {
    return;
  }

  fs.writeFileSync(
    SETTINGS_FILE,
    JSON.stringify(
      {
        guilds: {},
        users: {}
      },
      null,
      2
    ),
    "utf8"
  );
}

function readSettings() {
  ensureSettingsFile();

  try {
    const result =
      JSON.parse(
        fs.readFileSync(
          SETTINGS_FILE,
          "utf8"
        )
      );

    if (
      !result ||
      typeof result !== "object"
    ) {
      throw new Error(
        "Invalid settings"
      );
    }

    if (
      !result.guilds ||
      typeof result.guilds !==
        "object"
    ) {
      result.guilds = {};
    }

    if (
      !result.users ||
      typeof result.users !==
        "object"
    ) {
      result.users = {};
    }

    return result;
  } catch (error) {
    console.error(
      "Settings read error:",
      error
    );

    return {
      guilds: {},
      users: {}
    };
  }
}

function writeSettings(
  data
) {
  try {
    fs.writeFileSync(
      SETTINGS_FILE,
      JSON.stringify(
        data,
        null,
        2
      ),
      "utf8"
    );

    return true;
  } catch (error) {
    console.error(
      "Settings write error:",
      error
    );

    return false;
  }
}

function getGuildSettings(
  guildId
) {
  const data =
    readSettings();

  if (
    !data.guilds[guildId]
  ) {
    data.guilds[guildId] =
      createDefaultSettings();

    writeSettings(data);
  }

  const current =
    data.guilds[guildId];

  const defaults =
    createDefaultSettings();

  if (
    !current.creatorAlerts
  ) {
    current.creatorAlerts =
      defaults.creatorAlerts;
  }

  for (
    const key of Object.keys(
      defaults
    )
  ) {
    if (
      current[key] ===
      undefined
    ) {
      current[key] =
        defaults[key];
    }
  }

  return current;
}

/* =========================================================
   DISCORD
========================================================= */

discord.once(
  "ready",
  async () => {
    discordReady = true;

    console.log("");
    console.log(
      "=========================================="
    );
    console.log(
      "              BAYAN WEBSITE"
    );
    console.log(
      "=========================================="
    );
    console.log(
      `Website  : http://localhost:${PORT}`
    );
    console.log(
      `Dashboard: http://localhost:${PORT}/dashboard`
    );
    console.log(
      `Bot      : ${discord.user.tag}`
    );
    console.log(
      `Servers  : ${discord.guilds.cache.size}`
    );
    console.log(
      "Discord  : ONLINE"
    );
    console.log(
      "=========================================="
    );
    console.log("");
  }
);

discord.on(
  "error",
  (error) => {
    console.error(
      "Discord error:",
      error
    );
  }
);

/* =========================================================
   AUTHORIZATION
========================================================= */

function requireLogin(
  req,
  res,
  next
) {
  if (
    req.session?.user?.id
  ) {
    return next();
  }

  return res.status(401).json({
    success: false,
    error:
      "Login with Discord first."
  });
}

function findUserGuild(
  req,
  guildId
) {
  return (
    req.session?.userGuilds?.find(
      (guild) =>
        guild.id ===
        guildId
    ) || null
  );
}

function hasGuildManagement(
  guildInfo
) {
  if (!guildInfo) {
    return false;
  }

  try {
    const permissions =
      BigInt(
        guildInfo.permissions ||
          "0"
      );

    const ADMINISTRATOR =
      8n;

    const MANAGE_GUILD =
      32n;

    return (
      (permissions &
        ADMINISTRATOR) !==
        0n ||
      (permissions &
        MANAGE_GUILD) !==
        0n
    );
  } catch {
    return false;
  }
}

function canManageGuild(
  req,
  guildId
) {
  return hasGuildManagement(
    findUserGuild(
      req,
      guildId
    )
  );
}

/* =========================================================
   DISCORD OAUTH INSTALL
========================================================= */

app.get(
  "/auth/discord/install",
  (req, res) => {
    if (
      !CLIENT_ID ||
      !CLIENT_SECRET
    ) {
      return res
        .status(500)
        .send(
          "Discord OAuth is not configured. Check .env."
        );
    }

    const state =
      crypto
        .randomBytes(32)
        .toString("hex");

    req.session.oauthState =
      state;

    const params =
      new URLSearchParams({
        response_type:
          "code",

        client_id:
          CLIENT_ID,

        scope:
          "identify guilds bot applications.commands",

        permissions:
          "8",

        redirect_uri:
          REDIRECT_URI,

        state
      });

    res.redirect(
      `https://discord.com/oauth2/authorize?${params.toString()}`
    );
  }
);

/* =========================================================
   OAUTH CALLBACK
========================================================= */

app.get(
  "/auth/discord/callback",
  async (req, res) => {
    try {
      const code =
        String(
          req.query.code ||
            ""
        );

      const state =
        String(
          req.query.state ||
            ""
        );

      if (
        !code ||
        !state
      ) {
        return res
          .status(400)
          .send(
            "Discord authorization was incomplete."
          );
      }

      if (
        state !==
        req.session.oauthState
      ) {
        return res
          .status(403)
          .send(
            "Discord authorization state is invalid."
          );
      }

      delete req.session.oauthState;

      const body =
        new URLSearchParams({
          grant_type:
            "authorization_code",

          code,

          redirect_uri:
            REDIRECT_URI
        });

      const basic =
        Buffer.from(
          `${CLIENT_ID}:${CLIENT_SECRET}`
        ).toString(
          "base64"
        );

      const tokenResponse =
        await fetch(
          "https://discord.com/api/v10/oauth2/token",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/x-www-form-urlencoded",

              Authorization:
                `Basic ${basic}`
            },

            body:
              body.toString()
          }
        );

      if (
        !tokenResponse.ok
      ) {
        throw new Error(
          `Token exchange failed (${tokenResponse.status})`
        );
      }

      const token =
        await tokenResponse.json();

      const userResponse =
        await fetch(
          "https://discord.com/api/v10/users/@me",
          {
            headers: {
              Authorization:
                `Bearer ${token.access_token}`
            }
          }
        );

      if (
        !userResponse.ok
      ) {
        throw new Error(
          "Could not load Discord user."
        );
      }

      const user =
        await userResponse.json();

      const guildResponse =
        await fetch(
          "https://discord.com/api/v10/users/@me/guilds",
          {
            headers: {
              Authorization:
                `Bearer ${token.access_token}`
            }
          }
        );

      const userGuilds =
        guildResponse.ok
          ? await guildResponse.json()
          : [];

      req.session.user =
        {
          id: user.id,

          username:
            user.username,

          globalName:
            user.global_name ||
            user.username,

          avatar:
            user.avatar ||
            null
        };

      req.session.userGuilds =
        Array.isArray(
          userGuilds
        )
          ? userGuilds
          : [];

      const data =
        readSettings();

      data.users[
        user.id
      ] = {
        id: user.id,

        username:
          user.username,

        globalName:
          user.global_name ||
          user.username,

        avatar:
          user.avatar ||
          null,

        updatedAt:
          new Date().toISOString()
      };

      writeSettings(data);

      req.session.save(
        () => {
          res.redirect(
            "/dashboard"
          );
        }
      );
    } catch (error) {
      console.error(
        "Discord OAuth error:",
        error
      );

      res
        .status(500)
        .send(
          "Discord login failed. Check your Discord application settings and .env."
        );
    }
  }
);

/* =========================================================
   USER
========================================================= */

app.get(
  "/api/me",
  (req, res) => {
    res.json({
      success: true,

      loggedIn:
        Boolean(
          req.session?.user
        ),

      user:
        req.session?.user ||
        null
    });
  }
);

/* =========================================================
   GUILDS
========================================================= */

app.get(
  "/api/guilds",
  requireLogin,
  (req, res) => {
    if (
      !discordReady
    ) {
      return res.status(503).json({
        success: false,
        error:
          "Bayan is still connecting to Discord."
      });
    }

    const guilds =
      (
        req.session.userGuilds ||
        []
      )
        .filter(
          hasGuildManagement
        )
        .filter(
          (guildInfo) =>
            discord.guilds.cache.has(
              guildInfo.id
            )
        )
        .map(
          (guildInfo) => {
            const guild =
              discord.guilds.cache.get(
                guildInfo.id
              );

            return {
              id: guild.id,

              name:
                guild.name,

              icon:
                guild.iconURL({
                  size: 128
                }),

              memberCount:
                guild.memberCount
            };
          }
        );

    res.json({
      success: true,
      guilds
    });
  }
);

/* =========================================================
   SERVER SELECTORS
========================================================= */

app.get(
  "/api/guilds/:guildId/selectors",
  requireLogin,
  async (req, res) => {
    try {
      const guildId =
        req.params.guildId;

      if (
        !canManageGuild(
          req,
          guildId
        )
      ) {
        return res.status(403).json({
          success: false,
          error:
            "You do not have permission to manage this server."
        });
      }

      const guild =
        discord.guilds.cache.get(
          guildId
        );

      if (!guild) {
        return res.status(404).json({
          success: false,
          error:
            "Bayan is not in this server."
        });
      }

      await guild.roles.fetch();

      const fetchedChannels =
        await guild.channels.fetch();

      const roles =
        Array.from(
          guild.roles.cache.values()
        )
          .filter(
            (role) =>
              role.id !==
                guild.id &&
              !role.managed
          )
          .sort(
            (a, b) =>
              b.position -
              a.position
          )
          .map(
            (role) => ({
              id:
                role.id,

              name:
                role.name,

              color:
                role.hexColor ||
                "#8b93a8",

              position:
                role.position
            })
          );

      const channels =
        Array.from(
          fetchedChannels.values()
        )
          .filter(Boolean)
          .filter(
            (channel) =>
              !channel.isThread()
          )
          .filter(
            (channel) =>
              channel.isTextBased() ||
              channel.isVoiceBased()
          )
          .sort(
            (a, b) => {
              const left =
                Number(
                  a.rawPosition ??
                    a.position ??
                    0
                );

              const right =
                Number(
                  b.rawPosition ??
                    b.position ??
                    0
                );

              return (
                left -
                right
              );
            }
          )
          .map(
            (channel) => ({
              id:
                channel.id,

              name:
                channel.name,

              type:
                channel.isVoiceBased()
                  ? "voice"
                  : "text",

              parentId:
                channel.parentId ||
                "",

              position:
                Number(
                  channel.rawPosition ??
                    channel.position ??
                    0
                )
            })
          );

      res.json({
        success: true,

        guild: {
          id:
            guild.id,

          name:
            guild.name,

          icon:
            guild.iconURL({
              size: 128
            }),

          memberCount:
            guild.memberCount
        },

        roles,

        channels,

        settings:
          getGuildSettings(
            guildId
          )
      });
    } catch (error) {
      console.error(
        "Selectors error:",
        error
      );

      res.status(500).json({
        success: false,
        error:
          "Could not load roles and channels."
      });
    }
  }
);

/* =========================================================
   REAL COMMANDS
========================================================= */

app.get(
  "/api/guilds/:guildId/commands",
  requireLogin,
  async (req, res) => {
    try {
      const guildId =
        req.params.guildId;

      if (
        !canManageGuild(
          req,
          guildId
        )
      ) {
        return res.status(403).json({
          success: false,
          error:
            "You cannot view this server."
        });
      }

      const guild =
        discord.guilds.cache.get(
          guildId
        );

      if (!guild) {
        return res.status(404).json({
          success: false,
          error:
            "Bayan is not in this server."
        });
      }

      const commands =
        new Map();

      /*
        Guild commands
      */
      try {
        const guildCommands =
          await guild.commands.fetch();

        guildCommands.forEach(
          (command) => {
            commands.set(
              command.name,
              {
                name:
                  command.name,

                description:
                  command.description ||
                  "Bayan command",

                category:
                  "Discord",

                permission:
                  "Configured in Discord"
              }
            );
          }
        );
      } catch (error) {
        console.warn(
          "Guild command fetch failed:",
          error.message
        );
      }

      /*
        Global commands
      */
      try {
        if (
          discord.application
            ?.commands
        ) {
          const globalCommands =
            await discord.application.commands.fetch();

          globalCommands.forEach(
            (command) => {
              if (
                !commands.has(
                  command.name
                )
              ) {
                commands.set(
                  command.name,
                  {
                    name:
                      command.name,

                    description:
                      command.description ||
                      "Bayan command",

                    category:
                      "Global",

                    permission:
                      "Configured in Discord"
                  }
                );
              }
            }
          );
        }
      } catch (error) {
        console.warn(
          "Global command fetch failed:",
          error.message
        );
      }

      /*
        Add local catalog items that
        haven't synced to Discord yet.
      */
      for (
        const command of
        COMMAND_CATALOG
      ) {
        if (
          !commands.has(
            command.name
          )
        ) {
          commands.set(
            command.name,
            {
              ...command,

              registered:
                false
            }
          );
        }
      }

      res.json({
        success: true,

        commands:
          Array.from(
            commands.values()
          ).sort(
            (a, b) =>
              a.name.localeCompare(
                b.name
              )
          )
      });
    } catch (error) {
      console.error(
        "Commands error:",
        error
      );

      res.status(500).json({
        success: false,
        error:
          "Could not load commands."
      });
    }
  }
);

/* =========================================================
   SERVER HEALTH / SENSORS
========================================================= */

app.get(
  "/api/guilds/:guildId/health",
  requireLogin,
  async (req, res) => {
    try {
      const guildId =
        req.params.guildId;

      if (
        !canManageGuild(
          req,
          guildId
        )
      ) {
        return res.status(403).json({
          success: false,
          error:
            "You cannot inspect this server."
        });
      }

      if (
        !discordReady
      ) {
        return res.status(503).json({
          success: false,
          error:
            "Bayan is not connected to Discord."
        });
      }

      const guild =
        discord.guilds.cache.get(
          guildId
        );

      if (!guild) {
        return res.status(404).json({
          success: false,
          error:
            "Bayan is not in this server."
        });
      }

      await guild.roles.fetch();

      const channels =
        await guild.channels.fetch();

      const botMember =
        guild.members.me;

      const permissions =
        botMember
          ? botMember.permissions
          : null;

      const highestRole =
        botMember
          ? botMember.roles.highest
          : null;

      const settings =
        getGuildSettings(
          guildId
        );

      const textChannels =
        Array.from(
          channels.values()
        ).filter(
          (channel) =>
            channel &&
            channel.isTextBased() &&
            !channel.isThread()
        );

      const voiceChannels =
        Array.from(
          channels.values()
        ).filter(
          (channel) =>
            channel &&
            channel.isVoiceBased()
        );

      const botPermissions = {
        viewChannel:
          Boolean(
            permissions?.has(
              PermissionsBitField.Flags.ViewChannel
            )
          ),

        sendMessages:
          Boolean(
            permissions?.has(
              PermissionsBitField.Flags.SendMessages
            )
          ),

        embedLinks:
          Boolean(
            permissions?.has(
              PermissionsBitField.Flags.EmbedLinks
            )
          ),

        manageChannels:
          Boolean(
            permissions?.has(
              PermissionsBitField.Flags.ManageChannels
            )
          ),

        manageRoles:
          Boolean(
            permissions?.has(
              PermissionsBitField.Flags.ManageRoles
            )
          ),

        manageMessages:
          Boolean(
            permissions?.has(
              PermissionsBitField.Flags.ManageMessages
            )
          )
      };

      const selectedRole =
        settings.autoRole
          ? guild.roles.cache.get(
              settings.autoRole
            )
          : null;

      const roleHierarchy =
        !selectedRole ||
        !highestRole
          ? true
          : selectedRole.position <
            highestRole.position;

      const ticketChannels = [
        settings.ticketChannel,
        settings.ticketSupportChannel,
        settings.ticketReportChannel,
        settings.ticketAppealChannel
      ].filter(Boolean);

      const validTicketChannels =
        ticketChannels.filter(
          (id) =>
            Boolean(
              channels.get(id)
            )
        ).length;

      const ticketHealth =
        ticketChannels.length ===
        0
          ? "not-configured"
          : validTicketChannels ===
            ticketChannels.length
          ? "online"
          : "warning";

      const data =
        readSettings();

      let databaseStatus =
        "online";

      try {
        JSON.stringify(data);
      } catch {
        databaseStatus =
          "error";
      }

      const configuredCreatorCount =
        Object.values(
          settings.creatorAlerts ||
            {}
        ).filter(
          (item) =>
            item &&
            item.enabled &&
            item.url
        ).length;

      let commandCount = 0;

      try {
        const guildCommands =
          await guild.commands.fetch();

        commandCount =
          guildCommands.size;
      } catch {}

      /*
        Health classification
      */

      let overall =
        "healthy";

      const critical =
        !botMember ||
        !botPermissions.viewChannel ||
        !botPermissions.sendMessages ||
        databaseStatus ===
          "error";

      const degraded =
        !botPermissions.manageChannels ||
        !botPermissions.manageRoles ||
        !roleHierarchy ||
        ticketHealth ===
          "warning";

      if (critical) {
        overall = "critical";
      } else if (degraded) {
        overall = "degraded";
      }

      const ping =
        Number(
          discord.ws.ping
        );

      res.json({
        success: true,

        health: {
          overall,

          bot: {
            online:
              discordReady &&
              Boolean(botMember),

            username:
              discord.user?.username ||
              "Bayan",

            tag:
              discord.user?.tag ||
              "Bayan",

            id:
              discord.user?.id ||
              "",

            ping:
              ping >= 0
                ? ping
                : null,

            uptimeSeconds:
              Math.floor(
                process.uptime()
              )
          },

          gateway: {
            status:
              discordReady
                ? "online"
                : "offline",

            ping:
              ping >= 0
                ? ping
                : null
          },

          server: {
            id:
              guild.id,

            name:
              guild.name,

            members:
              guild.memberCount,

            channels:
              channels.size,

            textChannels:
              textChannels.length,

            voiceChannels:
              voiceChannels.length,

            roles:
              guild.roles.cache.size,

            commands:
              commandCount
          },

          permissions:
            botPermissions,

          hierarchy: {
            botRole:
              highestRole?.name ||
              "Unavailable",

            botPosition:
              highestRole?.position ??
              -1,

            selectedAutoRole:
              selectedRole?.name ||
              "",

            valid:
              roleHierarchy
          },

          tickets: {
            status:
              ticketHealth,

            configured:
              ticketChannels.length,

            valid:
              validTicketChannels
          },

          creatorAlerts: {
            configured:
              configuredCreatorCount
          },

          storage: {
            status:
              databaseStatus
          },

          runtime: {
            node:
              process.version,

            platform:
              process.platform,

            memoryMb:
              Math.round(
                process.memoryUsage()
                  .rss /
                  1024 /
                  1024
              )
          },

          refreshedAt:
            new Date().toISOString()
        }
      });
    } catch (error) {
      console.error(
        "Health error:",
        error
      );

      res.status(500).json({
        success: false,
        error:
          "Could not calculate server health."
      });
    }
  }
);

/* =========================================================
   SAVE SETTINGS
========================================================= */

app.put(
  "/api/guilds/:guildId/settings",
  requireLogin,
  async (req, res) => {
    try {
      const guildId =
        req.params.guildId;

      if (
        !canManageGuild(
          req,
          guildId
        )
      ) {
        return res.status(403).json({
          success: false,
          error:
            "You cannot manage this server."
        });
      }

      const guild =
        discord.guilds.cache.get(
          guildId
        );

      if (!guild) {
        return res.status(404).json({
          success: false,
          error:
            "Bayan is not in this server."
        });
      }

      const body =
        req.body || {};

      const data =
        readSettings();

      const settings =
        getGuildSettings(
          guildId
        );

      const keys = [
        "autoRole",
        "welcomeChannel",
        "logChannel",
        "messageLogChannel",
        "voiceLogChannel",
        "giveawayChannel",
        "tournamentChannel",
        "ticketChannel",
        "ticketSupportChannel",
        "ticketReportChannel",
        "ticketAppealChannel"
      ];

      for (
        const key of keys
      ) {
        if (
          Object.prototype.hasOwnProperty.call(
            body,
            key
          )
        ) {
          settings[key] =
            String(
              body[key] || ""
            );
        }
      }

      /*
        Validate selected role
      */

      if (
        settings.autoRole
      ) {
        await guild.roles.fetch();

        const role =
          guild.roles.cache.get(
            settings.autoRole
          );

        if (
          !role ||
          role.managed
        ) {
          return res.status(400).json({
            success: false,
            error:
              "The selected Auto Role is no longer valid."
          });
        }
      }

      /*
        Validate all channel selections
      */

      const channelFields = [
        "welcomeChannel",
        "logChannel",
        "messageLogChannel",
        "voiceLogChannel",
        "giveawayChannel",
        "tournamentChannel",
        "ticketChannel",
        "ticketSupportChannel",
        "ticketReportChannel",
        "ticketAppealChannel"
      ];

      for (
        const key of channelFields
      ) {
        const channelId =
          settings[key];

        if (!channelId) {
          continue;
        }

        const channel =
          await guild.channels.fetch(
            channelId
          );

        if (
          !channel ||
          channel.isThread()
        ) {
          return res.status(400).json({
            success: false,
            error:
              `${key} is invalid.`
          });
        }

        if (
          key ===
            "voiceLogChannel" &&
          !channel.isVoiceBased()
        ) {
          return res.status(400).json({
            success: false,
            error:
              "Voice Log Channel must be a voice channel."
          });
        }

        if (
          key !==
            "voiceLogChannel" &&
          !channel.isTextBased()
        ) {
          return res.status(400).json({
            success: false,
            error:
              `${key} must be a text channel.`
          });
        }
      }

      data.guilds[
        guildId
      ] = settings;

      if (
        !writeSettings(data)
      ) {
        throw new Error(
          "Could not save settings."
        );
      }

      res.json({
        success: true,

        settings
      });
    } catch (error) {
      console.error(
        "Settings save error:",
        error
      );

      res.status(400).json({
        success: false,
        error:
          error.message ||
          "Could not save settings."
      });
    }
  }
);

/* =========================================================
   CREATOR ALERTS
========================================================= */

app.get(
  "/api/guilds/:guildId/creator-alerts",
  requireLogin,
  (req, res) => {
    const guildId =
      req.params.guildId;

    if (
      !canManageGuild(
        req,
        guildId
      )
    ) {
      return res.status(403).json({
        success: false,
        error:
          "You cannot manage this server."
      });
    }

    const settings =
      getGuildSettings(
        guildId
      );

    res.json({
      success: true,

      creatorAlerts:
        settings.creatorAlerts
    });
  }
);

app.put(
  "/api/guilds/:guildId/creator-alerts",
  requireLogin,
  async (req, res) => {
    try {
      const guildId =
        req.params.guildId;

      if (
        !canManageGuild(
          req,
          guildId
        )
      ) {
        return res.status(403).json({
          success: false,
          error:
            "You cannot manage this server."
        });
      }

      const guild =
        discord.guilds.cache.get(
          guildId
        );

      if (!guild) {
        return res.status(404).json({
          success: false,
          error:
            "Bayan is not in this server."
        });
      }

      const incoming =
        req.body?.creatorAlerts ||
        {};

      const settings =
        getGuildSettings(
          guildId
        );

      for (
        const platform of [
          "youtube",
          "tiktok",
          "twitch",
          "kick"
        ]
      ) {
        const current =
          settings.creatorAlerts[
            platform
          ];

        const next =
          incoming[platform] ||
          {};

        current.url =
          typeof next.url ===
          "string"
            ? next.url.trim()
            : current.url;

        current.enabled =
          Boolean(
            next.enabled
          );

        current.sendLive =
          next.sendLive !== false;

        current.sendVideos =
          Boolean(
            next.sendVideos
          );

        current.channelId =
          typeof next.channelId ===
          "string"
            ? next.channelId
            : current.channelId;

        if (
          current.channelId
        ) {
          const channel =
            await guild.channels.fetch(
              current.channelId
            );

          if (
            !channel ||
            !channel.isTextBased()
          ) {
            return res.status(400).json({
              success: false,
              error:
                `${platform}: selected Discord channel is invalid.`
            });
          }
        }
      }

      const data =
        readSettings();

      data.guilds[
        guildId
      ] = settings;

      writeSettings(data);

      res.json({
        success: true,

        creatorAlerts:
          settings.creatorAlerts
      });
    } catch (error) {
      console.error(
        "Creator alert save error:",
        error
      );

      res.status(400).json({
        success: false,
        error:
          error.message
      });
    }
  }
);

/* =========================================================
   TEST CREATOR NOTIFICATION
========================================================= */

app.post(
  "/api/guilds/:guildId/creator-alerts/test",
  requireLogin,
  async (req, res) => {
    try {
      const guildId =
        req.params.guildId;

      if (
        !canManageGuild(
          req,
          guildId
        )
      ) {
        return res.status(403).json({
          success: false,
          error:
            "You cannot manage this server."
        });
      }

      const guild =
        discord.guilds.cache.get(
          guildId
        );

      if (!guild) {
        return res.status(404).json({
          success: false,
          error:
            "Bayan is not in this server."
        });
      }

      const channelId =
        String(
          req.body?.channelId ||
            ""
        );

      const platform =
        String(
          req.body?.platform ||
            "youtube"
        );

      if (!channelId) {
        return res.status(400).json({
          success: false,
          error:
            "Choose a Discord channel first."
        });
      }

      const channel =
        await guild.channels.fetch(
          channelId
        );

      if (
        !channel ||
        !channel.isTextBased()
      ) {
        return res.status(400).json({
          success: false,
          error:
            "That Discord channel cannot receive messages."
        });
      }

      const names = {
        youtube:
          "YouTube",
        tiktok:
          "TikTok",
        twitch:
          "Twitch",
        kick:
          "Kick"
      };

      await channel.send({
        content:
          `**Bayan Creator Alert Test**\n\nPlatform: ${
            names[platform] ||
            "Creator"
          }\n\nYour Discord notification channel is working.`
      });

      res.json({
        success: true
      });
    } catch (error) {
      console.error(
        "Creator test error:",
        error
      );

      res.status(500).json({
        success: false,
        error:
          "Could not send the test message."
      });
    }
  }
);

/* =========================================================
   LOGOUT
========================================================= */

app.post(
  "/auth/logout",
  (req, res) => {
    req.session.destroy(
      () => {
        res.json({
          success: true
        });
      }
    );
  }
);

/* =========================================================
   HEALTH OF WEBSITE
========================================================= */

app.get(
  "/api/health",
  (req, res) => {
    res.json({
      success: true,

      website:
        "online",

      discord:
        discordReady
          ? "online"
          : "offline",

      bot:
        discord.user?.tag ||
        null,

      guilds:
        discord.guilds.cache.size,

      ping:
        discordReady &&
        discord.ws.ping >= 0
          ? discord.ws.ping
          : null,

      uptime:
        process.uptime()
    });
  }
);

/* =========================================================
   PAGES
========================================================= */

app.get(
  "/",
  (req, res) => {
    res.sendFile(
      path.join(
        ROOT,
        "index.html"
      )
    );
  }
);

app.get(
  "/dashboard",
  (req, res) => {
    res.sendFile(
      path.join(
        ROOT,
        "dashboard.html"
      )
    );
  }
);

/* =========================================================
   API 404
========================================================= */

app.use(
  "/api",
  (req, res) => {
    res.status(404).json({
      success: false,
      error:
        "Bayan API endpoint not found."
    });
  }
);

/* =========================================================
   ERROR
========================================================= */

app.use(
  (error, req, res, next) => {
    console.error(
      "Express error:",
      error
    );

    if (
      res.headersSent
    ) {
      return next(error);
    }

    res.status(500).json({
      success: false,
      error:
        "Internal Bayan server error."
    });
  }
);

/* =========================================================
   START SERVER
========================================================= */

async function start() {
  ensureSettingsFile();

  app.listen(
    PORT,
    "127.0.0.1",
    () => {
      console.log(
        `Bayan website: http://localhost:${PORT}`
      );

      console.log(
        `Bayan dashboard: http://localhost:${PORT}/dashboard`
      );
    }
  );

  if (!BOT_TOKEN) {
    console.error(
      "DISCORD_BOT_TOKEN is missing from .env"
    );

    return;
  }

  try {
    await discord.login(
      BOT_TOKEN
    );
  } catch (error) {
    console.error(
      "Discord login failed:",
      error.message
    );
  }
}

start();

/* =========================================================
   SHUTDOWN
========================================================= */

function shutdown(
  signal
) {
  console.log(
    `${signal}: shutting down Bayan...`
  );

  try {
    discord.destroy();
  } catch {}

  process.exit(0);
}

process.on(
  "SIGINT",
  () => shutdown("SIGINT")
);

process.on(
  "SIGTERM",
  () => shutdown("SIGTERM")
);