"use strict";

require("dotenv").config();

const express = require("express");
const session = require("express-session");
const path = require("node:path");
const crypto = require("node:crypto");

const {
    simulateCheckout,
    getPremiumStatus
} = require("./database/premium");

const app = express();

const PORT = Number(process.env.PORT) || 3000;
const HOST = "0.0.0.0";

const WEBSITE_DIR = __dirname;

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID || "";
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET || "";
const DISCORD_REDIRECT_URI =
    process.env.DISCORD_REDIRECT_URI ||
    "http://localhost:3000/auth/discord/callback";

const BAYAN_OWNER_ID = process.env.BAYAN_OWNER_ID || "";
const SESSION_SECRET =
    process.env.SESSION_SECRET || "غيّر هذا المفتاح في ملف .env";

const DISCORD_BOT_INVITE = process.env.DISCORD_BOT_INVITE || "";

const DISCORD_API = "https://discord.com/api/v10";

const isProduction =
    process.env.NODE_ENV === "production";

/* =========================================================
   أدوات عامة
========================================================= */

function createState() {
    return crypto.randomBytes(32).toString("hex");
}

function requireLogin(req, res, next) {
    if (!req.session.user) {
        return res.status(401).json({
            success: false,
            message: "يجب تسجيل الدخول أولاً."
        });
    }

    next();
}

function requireOwner(req, res, next) {
    if (!req.session.user) {
        return res.status(401).json({
            success: false,
            message: "يجب تسجيل الدخول أولاً."
        });
    }

    if (req.session.user.id !== BAYAN_OWNER_ID) {
        return res.status(403).json({
            success: false,
            message: "ليس لديك صلاحية الوصول إلى لوحة المالك."
        });
    }

    next();
}

function sendPage(res, filename) {
    return res.sendFile(
        path.join(WEBSITE_DIR, filename)
    );
}

function canManageGuild(guild) {
    if (!guild) return false;

    const permissions = BigInt(
        guild.permissions || "0"
    );

    const ADMINISTRATOR = BigInt(0x8);
    const MANAGE_GUILD = BigInt(0x20);

    return (
        (permissions & ADMINISTRATOR) === ADMINISTRATOR ||
        (permissions & MANAGE_GUILD) === MANAGE_GUILD
    );
}

async function discordRequest(
    endpoint,
    options = {}
) {
    const response = await fetch(
        `${DISCORD_API}${endpoint}`,
        {
            ...options,
            headers: {
                Accept: "application/json",
                ...(options.headers || {})
            }
        }
    );

    let data = null;

    try {
        data = await response.json();
    } catch {
        data = null;
    }

    if (!response.ok) {
        const error = new Error(
            data?.message ||
            "فشل الاتصال بخدمة Discord."
        );

        error.status = response.status;
        error.data = data;

        throw error;
    }

    return data;
}

/* =========================================================
   إعداد Express
========================================================= */

app.set("trust proxy", 1);

app.use(
    express.json({
        limit: "1mb"
    })
);

app.use(
    express.urlencoded({
        extended: true,
        limit: "1mb"
    })
);

/*
    حماية أساسية للرؤوس
*/
app.use((req, res, next) => {
    res.setHeader(
        "X-Content-Type-Options",
        "nosniff"
    );

    res.setHeader(
        "X-Frame-Options",
        "SAMEORIGIN"
    );

    res.setHeader(
        "Referrer-Policy",
        "strict-origin-when-cross-origin"
    );

    res.setHeader(
        "Permissions-Policy",
        "camera=(), microphone=(), geolocation=()"
    );

    next();
});

/*
    جلسات المستخدم
*/
app.use(
    session({
        name: "bayan.sid",
        secret: SESSION_SECRET,
        resave: false,
        saveUninitialized: false,

        cookie: {
            httpOnly: true,
            secure: isProduction,
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        }
    })
);

/* =========================================================
   ملفات الموقع
========================================================= */

app.use(
    express.static(WEBSITE_DIR, {
        dotfiles: "ignore"
    })
);

/* =========================================================
   الصفحات
========================================================= */

app.get("/", (req, res) => {
    sendPage(res, "index.html");
});

app.get("/dashboard", (req, res) => {
    sendPage(res, "dashboard.html");
});

app.get("/owner", (req, res) => {
    sendPage(res, "owner.html");
});

app.get("/pricing", (req, res) => {
    sendPage(res, "pricing.html");
});

/* =========================================================
   صحة الموقع
========================================================= */

app.get("/health", (req, res) => {
    res.json({
        success: true,
        service: "Bayan",
        status: "online",
        message: "خدمات بيان تعمل بشكل طبيعي."
    });
});

app.get("/api/config", (req, res) => {
    res.json({
        success: true,
        siteName: "Bayan",
        language: "ar",
        ownerPanel: Boolean(BAYAN_OWNER_ID),
        discordConfigured:
            Boolean(
                DISCORD_CLIENT_ID &&
                DISCORD_CLIENT_SECRET
            ),
        botInviteConfigured:
            Boolean(DISCORD_BOT_INVITE)
    });
});

/* =========================================================
   تسجيل الدخول عبر Discord
========================================================= */

app.get("/login", (req, res) => {
    if (
        !DISCORD_CLIENT_ID ||
        !DISCORD_CLIENT_SECRET
    ) {
        return res.status(500).send(`
            <!DOCTYPE html>
            <html lang="ar" dir="rtl">
            <head>
                <meta charset="UTF-8">
                <title>خطأ</title>
                <style>
                    body {
                        background:#080912;
                        color:white;
                        font-family:Arial,sans-serif;
                        min-height:100vh;
                        display:grid;
                        place-items:center;
                        margin:0;
                    }

                    .box {
                        width:min(500px,90%);
                        padding:30px;
                        border:1px solid #262a40;
                        border-radius:20px;
                        background:#111322;
                        text-align:center;
                    }

                    h1 {
                        margin-top:0;
                    }

                    p {
                        color:#999fb5;
                        line-height:1.8;
                    }
                </style>
            </head>
            <body>
                <div class="box">
                    <h1>لم يتم إعداد Discord</h1>
                    <p>
                        يجب إضافة إعدادات Discord في ملف
                        <strong>.env</strong> قبل استخدام تسجيل الدخول.
                    </p>
                </div>
            </body>
            </html>
        `);
    }

    const state = createState();

    req.session.oauthState = state;

    const params = new URLSearchParams({
        client_id: DISCORD_CLIENT_ID,
        redirect_uri: DISCORD_REDIRECT_URI,
        response_type: "code",
        scope: "identify guilds",
        state
    });

    const authorizationUrl =
        `https://discord.com/oauth2/authorize?${params.toString()}`;

    res.redirect(authorizationUrl);
});

app.get(
    "/auth/discord/callback",
    async (req, res) => {
        try {
            const {
                code,
                state
            } = req.query;

            if (!code || !state) {
                return res.status(400).send(`
                    <!DOCTYPE html>
                    <html lang="ar" dir="rtl">
                    <head>
                        <meta charset="UTF-8">
                        <title>خطأ تسجيل الدخول</title>
                    </head>
                    <body>
                        <h1>فشل تسجيل الدخول</h1>
                        <p>بيانات تسجيل الدخول غير مكتملة.</p>
                    </body>
                    </html>
                `);
            }

            if (
                !req.session.oauthState ||
                state !== req.session.oauthState
            ) {
                return res.status(400).send(`
                    <!DOCTYPE html>
                    <html lang="ar" dir="rtl">
                    <head>
                        <meta charset="UTF-8">
                        <title>خطأ أمني</title>
                    </head>
                    <body>
                        <h1>انتهت صلاحية طلب تسجيل الدخول</h1>
                        <p>يرجى المحاولة مرة أخرى.</p>
                    </body>
                    </html>
                `);
            }

            delete req.session.oauthState;

            const tokenBody =
                new URLSearchParams({
                    client_id: DISCORD_CLIENT_ID,
                    client_secret: DISCORD_CLIENT_SECRET,
                    grant_type: "authorization_code",
                    code,
                    redirect_uri: DISCORD_REDIRECT_URI
                });

            const tokenResponse =
                await fetch(
                    `${DISCORD_API}/oauth2/token`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type":
                                "application/x-www-form-urlencoded",
                            Accept:
                                "application/json"
                        },
                        body: tokenBody
                    }
                );

            const tokenData =
                await tokenResponse.json();

            if (!tokenResponse.ok) {
                throw new Error(
                    tokenData?.error_description ||
                    "فشل الحصول على جلسة Discord."
                );
            }

            const accessToken =
                tokenData.access_token;

            const user =
                await discordRequest(
                    "/users/@me",
                    {
                        headers: {
                            Authorization:
                                `Bearer ${accessToken}`
                        }
                    }
                );

            const guilds =
                await discordRequest(
                    "/users/@me/guilds",
                    {
                        headers: {
                            Authorization:
                                `Bearer ${accessToken}`
                        }
                    }
                );

            const managedGuilds =
                guilds
                    .filter(canManageGuild)
                    .map(guild => ({
                        id: guild.id,
                        name: guild.name,
                        icon: guild.icon,
                        owner: guild.owner,
                        permissions: guild.permissions
                    }));

            req.session.user = {
                id: user.id,
                username: user.username,
                globalName:
                    user.global_name ||
                    user.username,
                avatar: user.avatar
            };

            req.session.managedGuilds =
                managedGuilds;

            req.session.discordAccessToken =
                accessToken;

            req.session.save(err => {
                if (err) {
                    console.error(
                        "خطأ في حفظ الجلسة:",
                        err
                    );

                    return res.status(500).send(
                        "حدث خطأ أثناء حفظ جلسة تسجيل الدخول."
                    );
                }

                res.redirect("/dashboard");
            });

        } catch (error) {
            console.error(
                "خطأ تسجيل الدخول عبر Discord:",
                error
            );

            return res.status(500).send(`
                <!DOCTYPE html>
                <html lang="ar" dir="rtl">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport"
                        content="width=device-width,initial-scale=1">
                    <title>فشل تسجيل الدخول</title>

                    <style>
                        body {
                            margin:0;
                            min-height:100vh;
                            display:grid;
                            place-items:center;
                            background:#080912;
                            color:#fff;
                            font-family:Arial,sans-serif;
                        }

                        .box {
                            width:min(520px,90%);
                            padding:30px;
                            background:#121526;
                            border:1px solid #292d45;
                            border-radius:20px;
                            text-align:center;
                        }

                        h1 {
                            margin:0 0 12px;
                        }

                        p {
                            color:#9ca2ba;
                            line-height:1.8;
                        }

                        a {
                            display:inline-block;
                            margin-top:15px;
                            padding:12px 18px;
                            color:white;
                            background:#7062e8;
                            border-radius:10px;
                            text-decoration:none;
                        }
                    </style>
                </head>

                <body>
                    <div class="box">
                        <h1>تعذر تسجيل الدخول</h1>

                        <p>
                            حدث خطأ أثناء الاتصال بـ Discord.
                            يرجى المحاولة مرة أخرى.
                        </p>

                        <a href="/login">
                            المحاولة مرة أخرى
                        </a>
                    </div>
                </body>
                </html>
            `);
        }
    }
);

/* =========================================================
   تسجيل الخروج
========================================================= */

app.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/");
    });
});

/* =========================================================
   معلومات المستخدم
========================================================= */

app.get(
    "/api/me",
    (req, res) => {
        if (!req.session.user) {
            return res.json({
                success: true,
                loggedIn: false
            });
        }

        res.json({
            success: true,
            loggedIn: true,
            user: req.session.user,
            owner:
                req.session.user.id ===
                BAYAN_OWNER_ID
        });
    }
);

/* =========================================================
   السيرفرات التي يستطيع المستخدم إدارتها
========================================================= */

app.get(
    "/api/servers",
    requireLogin,
    (req, res) => {
        res.json({
            success: true,
            servers:
                req.session.managedGuilds || []
        });
    }
);

/* =========================================================
   معلومات سيرفر
========================================================= */

app.get(
    "/api/servers/:guildId",
    requireLogin,
    (req, res) => {
        const guildId =
            req.params.guildId;

        const guild =
            (req.session.managedGuilds || [])
                .find(item =>
                    item.id === guildId
                );

        if (!guild) {
            return res.status(403).json({
                success: false,
                message:
                    "ليس لديك صلاحية إدارة هذا السيرفر."
            });
        }

        const premium =
            getPremiumStatus(guildId);

        res.json({
            success: true,
            server: guild,
            premium
        });
    }
);

/* =========================================================
   حالة Premium
========================================================= */

app.get(
    "/api/premium/:guildId",
    requireLogin,
    (req, res) => {
        const guildId =
            req.params.guildId;

        const guild =
            (req.session.managedGuilds || [])
                .find(item =>
                    item.id === guildId
                );

        if (!guild) {
            return res.status(403).json({
                success: false,
                message:
                    "لا يمكنك الوصول إلى إعدادات هذا السيرفر."
            });
        }

        res.json({
            success: true,
            premium:
                getPremiumStatus(guildId)
        });
    }
);

/* =========================================================
   شراء تجريبي فقط
   لا يوجد دفع حقيقي هنا
========================================================= */

app.post(
    "/api/test/checkout",
    requireLogin,
    (req, res) => {
        try {
            const {
                guildId,
                planKey
            } = req.body;

            const guild =
                (req.session.managedGuilds || [])
                    .find(item =>
                        item.id === guildId
                    );

            if (!guild) {
                return res.status(403).json({
                    success: false,
                    message:
                        "ليس لديك صلاحية إدارة هذا السيرفر."
                });
            }

            const result =
                simulateCheckout({
                    guildId,
                    userDiscordId:
                        req.session.user.id,
                    planKey
                });

            res.json({
                success: true,
                message:
                    "تم تفعيل الخطة التجريبية.",
                result
            });

        } catch (error) {
            res.status(400).json({
                success: false,
                message:
                    error.message ||
                    "تعذر تنفيذ العملية."
            });
        }
    }
);

/* =========================================================
   حالة المالك
========================================================= */

app.get(
    "/api/owner/status",
    requireOwner,
    (req, res) => {
        res.json({
            success: true,
            owner: true,
            ownerId:
                req.session.user.id
        });
    }
);

/* =========================================================
   منح Premium من المالك
========================================================= */

app.post(
    "/api/owner/premium",
    requireOwner,
    (req, res) => {
        try {
            const {
                guildId,
                planKey
            } = req.body;

            if (!guildId) {
                return res.status(400).json({
                    success: false,
                    message:
                        "يجب إدخال معرف السيرفر."
                });
            }

            const result =
                simulateCheckout({
                    guildId,
                    userDiscordId:
                        req.session.user.id,
                    planKey: planKey || "lifetime"
                });

            res.json({
                success: true,
                message:
                    "تم منح Premium للسيرفر.",
                result
            });

        } catch (error) {
            res.status(400).json({
                success: false,
                message:
                    error.message ||
                    "تعذر منح Premium."
            });
        }
    }
);

/* =========================================================
   إزالة Premium
========================================================= */

app.delete(
    "/api/owner/premium/:guildId",
    requireOwner,
    (req, res) => {
        try {
            const Database =
                require("better-sqlite3");

            const db =
                new Database(
                    path.join(
                        __dirname,
                        "database",
                        "bayan.db"
                    )
                );

            const result =
                db.prepare(`
                    UPDATE subscriptions
                    SET status = 'revoked',
                        updated_at = CURRENT_TIMESTAMP
                    WHERE guild_id = ?
                    AND status = 'active'
                `).run(
                    req.params.guildId
                );

            db.close();

            res.json({
                success: true,
                message:
                    result.changes > 0
                        ? "تم إلغاء Premium."
                        : "لا توجد خطة Premium نشطة.",
                changes:
                    result.changes
            });

        } catch (error) {
            console.error(
                "خطأ إزالة Premium:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "تعذر إزالة Premium."
            });
        }
    }
);

/* =========================================================
   أوامر بيان - بالعربي
========================================================= */

const BAYAN_COMMANDS = [
    {
        name: "/ban",
        title: "حظر",
        category: "إدارة",
        description:
            "حظر عضو من السيرفر.",
        permission: "الإدارة",
        enabled: true
    },
    {
        name: "/unban",
        title: "إلغاء الحظر",
        category: "إدارة",
        description:
            "إلغاء حظر عضو.",
        permission: "الإدارة",
        enabled: true
    },
    {
        name: "/kick",
        title: "طرد",
        category: "إدارة",
        description:
            "طرد عضو من السيرفر.",
        permission: "المشرفون",
        enabled: true
    },
    {
        name: "/timeout",
        title: "تقييد",
        category: "إدارة",
        description:
            "تقييد عضو مؤقتاً.",
        permission: "المشرفون",
        enabled: true
    },
    {
        name: "/warn",
        title: "تحذير",
        category: "إدارة",
        description:
            "إعطاء عضو تحذيراً.",
        permission: "المشرفون",
        enabled: true
    },
    {
        name: "/warnings",
        title: "تحذيرات العضو",
        category: "إدارة",
        description:
            "عرض تحذيرات عضو.",
        permission: "المشرفون",
        enabled: true
    },
    {
        name: "/clear",
        title: "مسح",
        category: "إدارة",
        description:
            "مسح مجموعة من الرسائل.",
        permission: "المشرفون",
        enabled: true
    },
    {
        name: "/slowmode",
        title: "الوضع البطيء",
        category: "إدارة",
        description:
            "تغيير سرعة إرسال الرسائل في القناة.",
        permission: "الإدارة",
        enabled: true
    },
    {
        name: "/ticket",
        title: "تذكرة",
        category: "التذاكر",
        description:
            "فتح أو إنشاء نظام التذاكر.",
        permission: "الأعضاء",
        enabled: true
    },
    {
        name: "/ticket-close",
        title: "إغلاق التذكرة",
        category: "التذاكر",
        description:
            "إغلاق التذكرة الحالية.",
        permission: "فريق الدعم",
        enabled: true
    },
    {
        name: "/ticket-claim",
        title: "استلام التذكرة",
        category: "التذاكر",
        description:
            "استلام التذكرة من قبل فريق الدعم.",
        permission: "فريق الدعم",
        enabled: true
    },
    {
        name: "/ticket-permissions",
        title: "صلاحيات التذاكر",
        category: "التذاكر",
        description:
            "تحديد رتبة فريق التذاكر.",
        permission: "الإدارة",
        enabled: true
    },
    {
        name: "/autorole",
        title: "الرتبة التلقائية",
        category: "الإعداد",
        description:
            "تحديد رتبة تلقائية للأعضاء الجدد.",
        permission: "الإدارة",
        enabled: true
    },
    {
        name: "/giveaway",
        title: "السحب",
        category: "المسابقات",
        description:
            "إنشاء وإدارة السحوبات.",
        permission: "الإدارة",
        enabled: true
    },
    {
        name: "/tournament",
        title: "البطولة",
        category: "البطولات",
        description:
            "إنشاء وإدارة البطولات.",
        permission: "الإدارة",
        enabled: true
    },
    {
        name: "/ping",
        title: "سرعة البوت",
        category: "أدوات",
        description:
            "عرض سرعة استجابة بيان.",
        permission: "الجميع",
        enabled: true
    },
    {
        name: "/userinfo",
        title: "معلومات العضو",
        category: "أدوات",
        description:
            "عرض معلومات عضو.",
        permission: "الجميع",
        enabled: true
    },
    {
        name: "/serverinfo",
        title: "معلومات السيرفر",
        category: "أدوات",
        description:
            "عرض معلومات السيرفر.",
        permission: "الجميع",
        enabled: true
    },
    {
        name: "/avatar",
        title: "صورة العضو",
        category: "أدوات",
        description:
            "عرض صورة عضو.",
        permission: "الجميع",
        enabled: true
    },
    {
        name: "/invite",
        title: "دعوة بيان",
        category: "أدوات",
        description:
            "الحصول على رابط دعوة البوت.",
        permission: "الجميع",
        enabled: true
    }
];

/* =========================================================
   واجهة الأوامر للداشبورد
========================================================= */

app.get(
    "/api/dashboard/commands",
    requireLogin,
    (req, res) => {
        res.json({
            success: true,
            language: "ar",
            commands: BAYAN_COMMANDS
        });
    }
);

/* =========================================================
   بيانات لوحة التحكم
========================================================= */

app.get(
    "/api/dashboard",
    requireLogin,
    (req, res) => {
        const servers =
            req.session.managedGuilds || [];

        const premiumServers =
            servers.map(server => ({
                id: server.id,
                name: server.name,
                premium:
                    getPremiumStatus(server.id)
            }));

        res.json({
            success: true,
            message:
                "تم تحميل لوحة تحكم بيان.",
            user:
                req.session.user,
            servers:
                premiumServers,
            commands: {
                total:
                    BAYAN_COMMANDS.length,
                enabled:
                    BAYAN_COMMANDS.filter(
                        command =>
                            command.enabled
                    ).length
            },
            owner:
                req.session.user.id ===
                BAYAN_OWNER_ID
        });
    }
);

/* =========================================================
   رابط دعوة البوت
========================================================= */

app.get(
    "/api/bot/invite",
    (req, res) => {
        if (!DISCORD_BOT_INVITE) {
            return res.status(404).json({
                success: false,
                message:
                    "لم يتم إعداد رابط دعوة البوت."
            });
        }

        res.json({
            success: true,
            invite:
                DISCORD_BOT_INVITE
        });
    }
);

/* =========================================================
   اختبار وصول السيرفر
========================================================= */

app.get(
    "/api/servers/:guildId/access",
    requireLogin,
    (req, res) => {
        const guild =
            (req.session.managedGuilds || [])
                .find(item =>
                    item.id ===
                    req.params.guildId
                );

        if (!guild) {
            return res.status(403).json({
                success: false,
                allowed: false,
                message:
                    "ليس لديك صلاحية إدارة هذا السيرفر."
            });
        }

        res.json({
            success: true,
            allowed: true,
            server: guild.name
        });
    }
);

/* =========================================================
   صفحة غير موجودة
========================================================= */

app.use((req, res) => {
    if (req.path.startsWith("/api/")) {
        return res.status(404).json({
            success: false,
            message:
                "مسار واجهة برمجة التطبيقات غير موجود."
        });
    }

    return res.status(404).send(`
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
            <meta charset="UTF-8">
            <meta
                name="viewport"
                content="width=device-width, initial-scale=1"
            >
            <title>الصفحة غير موجودة | بيان</title>

            <style>
                * {
                    box-sizing: border-box;
                }

                body {
                    margin: 0;
                    min-height: 100vh;
                    display: grid;
                    place-items: center;
                    background:
                        radial-gradient(
                            circle at top,
                            #1b1b37,
                            #080912 55%
                        );
                    color: #fff;
                    font-family:
                        Arial,
                        sans-serif;
                }

                .box {
                    width: min(560px, 92%);
                    padding: 42px 30px;
                    text-align: center;
                    border: 1px solid #252940;
                    background:
                        rgba(17, 19, 34, .92);
                    border-radius: 24px;
                    box-shadow:
                        0 30px 100px
                        rgba(0,0,0,.35);
                }

                .logo {
                    width: 58px;
                    height: 58px;
                    margin: 0 auto 18px;
                    display: grid;
                    place-items: center;
                    border-radius: 17px;
                    background:
                        linear-gradient(
                            135deg,
                            #9789ff,
                            #6353df
                        );
                    font-size: 24px;
                    font-weight: 800;
                }

                h1 {
                    margin: 0;
                    font-size: 42px;
                }

                p {
                    margin-top: 12px;
                    color: #949ab1;
                    line-height: 1.8;
                }

                a {
                    display: inline-block;
                    margin-top: 15px;
                    padding: 12px 18px;
                    border-radius: 11px;
                    background: #7566eb;
                    color: white;
                    text-decoration: none;
                    font-weight: 700;
                }
            </style>
        </head>

        <body>
            <main class="box">
                <div class="logo">ب</div>

                <h1>404</h1>

                <p>
                    الصفحة التي تبحث عنها غير موجودة.
                </p>

                <a href="/">
                    العودة للرئيسية
                </a>
            </main>
        </body>
        </html>
    `);
});

/* =========================================================
   معالجة الأخطاء
========================================================= */

app.use(
    (error, req, res, next) => {
        console.error(
            "خطأ في الخادم:",
            error
        );

        if (res.headersSent) {
            return next(error);
        }

        if (req.path.startsWith("/api/")) {
            return res.status(500).json({
                success: false,
                message:
                    "حدث خطأ داخلي في الخادم."
            });
        }

        res.status(500).send(`
            <!DOCTYPE html>
            <html lang="ar" dir="rtl">
            <head>
                <meta charset="UTF-8">
                <title>خطأ | بيان</title>
            </head>

            <body style="
                margin:0;
                min-height:100vh;
                display:grid;
                place-items:center;
                background:#080912;
                color:white;
                font-family:Arial,sans-serif;
            ">
                <div style="
                    max-width:520px;
                    width:90%;
                    padding:30px;
                    border-radius:20px;
                    background:#111322;
                    border:1px solid #282b40;
                    text-align:center;
                ">
                    <h1>حدث خطأ</h1>

                    <p style="
                        color:#969cb2;
                        line-height:1.8;
                    ">
                        تعذر إكمال الطلب حالياً.
                    </p>

                    <a
                        href="/"
                        style="
                            display:inline-block;
                            margin-top:15px;
                            padding:11px 17px;
                            color:white;
                            background:#7263e9;
                            border-radius:10px;
                            text-decoration:none;
                        "
                    >
                        العودة للرئيسية
                    </a>
                </div>
            </body>
            </html>
        `);
    }
);

/* =========================================================
   تشغيل الخادم
========================================================= */

const server =
    app.listen(
        PORT,
        HOST,
        () => {
            console.log("");
            console.log(
                "======================================"
            );
            console.log(
                "             بيان - BAYAN"
            );
            console.log(
                "======================================"
            );
            console.log(
                `الخادم يعمل على المنفذ: ${PORT}`
            );
            console.log(
                `المجلد: ${WEBSITE_DIR}`
            );
            console.log(
                `Discord OAuth: ${
                    DISCORD_CLIENT_ID &&
                    DISCORD_CLIENT_SECRET
                        ? "مفعّل"
                        : "غير مفعّل"
                }`
            );
            console.log(
                `معرف المالك: ${
                    BAYAN_OWNER_ID
                        ? "مضبوط"
                        : "غير مضبوط"
                }`
            );
            console.log(
                "لوحة التحكم: جاهزة"
            );
            console.log(
                "الأوامر العربية: جاهزة"
            );
            console.log(
                "Premium: جاهز"
            );
            console.log(
                "======================================"
            );
            console.log("");
        }
    );

/* =========================================================
   إيقاف آمن
========================================================= */

function shutdown(signal) {
    console.log(
        `\nتم استلام ${signal}، جارٍ إيقاف الخادم...`
    );

    server.close(() => {
        console.log(
            "تم إيقاف الخادم بأمان."
        );

        process.exit(0);
    });

    setTimeout(() => {
        console.error(
            "تعذر إيقاف الخادم خلال الوقت المحدد."
        );

        process.exit(1);
    }, 10000);
}

process.on(
    "SIGINT",
    () => shutdown("SIGINT")
);

process.on(
    "SIGTERM",
    () => shutdown("SIGTERM")
);