"use strict";

/*
    بيان - لوحة التحكم
    كل النصوص الظاهرة للمستخدم بالعربية.
*/

(() => {

    const state = {
        user: null,
        guilds: [],
        selectedGuildId: null,
        commands: [],
        activeFilter: "الكل",
        soundEnabled: true
    };


    /* =====================================================
       عناصر
    ====================================================== */

    const $ = selector =>
        document.querySelector(
            selector
        );

    const $$ = selector =>
        Array.from(
            document.querySelectorAll(
                selector
            )
        );


    /* =====================================================
       طلب API
    ====================================================== */

    async function api(
        url,
        options = {}
    ) {

        const response =
            await fetch(
                url,
                {
                    credentials:
                        "same-origin",

                    ...options,

                    headers: {
                        "Content-Type":
                            "application/json",

                        ...(options.headers || {})
                    }
                }
            );

        let data = null;

        try {
            data =
                await response.json();
        } catch {
            data = null;
        }

        if (
            response.status ===
            401
        ) {

            window.location.href =
                "/login";

            throw new Error(
                "يجب تسجيل الدخول."
            );
        }

        if (
            !response.ok
        ) {

            throw new Error(
                data?.message ||
                "حدث خطأ."
            );
        }

        return data;
    }


    /* =====================================================
       Toast
    ====================================================== */

    function showToast(
        title,
        message,
        type = "success"
    ) {

        const toast =
            $("#toast");

        if (!toast) {
            return;
        }

        $("#toastTitle")
            .textContent =
            title;

        $("#toastMessage")
            .textContent =
            message;

        const icon =
            toast.querySelector(
                ".toast-icon"
            );

        if (icon) {
            icon.textContent =
                type === "error"
                    ? "!"
                    : "✓";
        }

        toast.classList.add(
            "show"
        );

        clearTimeout(
            showToast.timer
        );

        showToast.timer =
            setTimeout(
                () => {
                    toast.classList.remove(
                        "show"
                    );
                },
                3200
            );
    }


    $("#toastClose")
        ?.addEventListener(
            "click",
            () => {
                $("#toast")
                    .classList.remove(
                        "show"
                    );
            }
        );


    /* =====================================================
       تنقل الأقسام
    ====================================================== */

    const sectionNames = {
        overview:
            "نظرة عامة",

        commands:
            "الأوامر",

        activity:
            "النشاط",

        moderation:
            "الإدارة",

        tickets:
            "التذاكر",

        permissions:
            "الصلاحيات",

        welcome:
            "الترحيب",

        automod:
            "الحماية التلقائية",

        logs:
            "السجلات",

        giveaways:
            "السحوبات",

        tournaments:
            "البطولات",

        streaming:
            "البث المباشر",

        settings:
            "الإعدادات",

        audit:
            "سجل التدقيق"
    };


    function openSection(
        section
    ) {

        if (
            !sectionNames[
                section
            ]
        ) {
            return;
        }

        $$(".dash-nav-link")
            .forEach(
                link => {

                    link.classList.toggle(
                        "active",
                        link.dataset.section ===
                            section
                    );

                }
            );

        $$(".dash-section")
            .forEach(
                element => {

                    element.classList.toggle(
                        "active",
                        element.id ===
                            `section-${section}`
                    );

                }
            );

        if ($("#breadcrumbText")) {
            $("#breadcrumbText")
                .textContent =
                sectionNames[
                    section
                ];
        }

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }


    $$(".dash-nav-link")
        .forEach(
            link => {

                link.addEventListener(
                    "click",
                    () => {

                        openSection(
                            link.dataset.section
                        );

                    }
                );

            }
        );


    $$("[data-section-target]")
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        openSection(
                            button.dataset.sectionTarget
                        );

                    }
                );

            }
        );


    /* =====================================================
       اختصار Ctrl + K
    ====================================================== */

    document.addEventListener(
        "keydown",
        event => {

            if (
                (event.ctrlKey ||
                event.metaKey) &&
                event.key.toLowerCase() ===
                    "k"
            ) {

                event.preventDefault();

                const search =
                    $("#commandSearch");

                if (search) {
                    search.focus();
                }
            }

        }
    );


    /* =====================================================
       معلومات المستخدم
    ====================================================== */

    async function loadUser() {

        const data =
            await api(
                "/api/me"
            );

        if (
            !data.loggedIn
        ) {
            window.location.href =
                "/login";

            return;
        }

        state.user =
            data.user;

        if ($("#userName")) {
            $("#userName")
                .textContent =
                data.user.globalName ||
                data.user.username;
        }

        if ($("#userAvatar")) {

            $("#userAvatar")
                .textContent =
                (
                    data.user.globalName ||
                    data.user.username ||
                    "م"
                )
                    .trim()
                    .charAt(0)
                    .toUpperCase();
        }
    }


    /* =====================================================
       السيرفرات
    ====================================================== */

    async function loadServers() {

        const data =
            await api(
                "/api/servers"
            );

        state.guilds =
            data.servers ||
            [];

        if (
            state.guilds.length === 0
        ) {

            showToast(
                "لا توجد سيرفرات",
                "حسابك لا يحتوي حالياً على سيرفر يمكنك إدارته.",
                "error"
            );

            return;
        }

        state.selectedGuildId =
            state.guilds[0].id;

        updateServerUI();

        await loadEverything();

    }


    function updateServerUI() {

        const server =
            state.guilds.find(
                guild =>
                    guild.id ===
                    state.selectedGuildId
            );

        if (!server) {
            return;
        }

        if ($("#serverName")) {
            $("#serverName")
                .textContent =
                server.name;
        }

        if (
            $("#settingsServerName")
        ) {
            $("#settingsServerName")
                .value =
                server.name;
        }

        if (
            $(".server-avatar")
        ) {
            $(".server-avatar")
                .textContent =
                server.name
                    .trim()
                    .charAt(0)
                    .toUpperCase();
        }
    }


    /* =====================================================
       تحميل الأوامر
    ====================================================== */

    async function loadCommands() {

        if (
            !state.selectedGuildId
        ) {
            return;
        }

        const data =
            await api(
                `/api/dashboard/commands/${state.selectedGuildId}`
            );

        state.commands =
            data.commands ||
            [];

        updateCommandCounters();

        renderCommands();

    }


    function updateCommandCounters() {

        const total =
            state.commands.length;

        const enabled =
            state.commands.filter(
                command =>
                    command.enabled
            ).length;

        const formatted =
            toArabicNumber(
                total
            );

        const elements = [
            $("#commandCountBadge"),
            $("#overviewCommandCount")
        ];

        elements.forEach(
            element => {
                if (element) {
                    element.textContent =
                        formatted;
                }
            }
        );
    }


    function renderCommands() {

        const grid =
            $("#commandGrid");

        if (!grid) {
            return;
        }

        const query =
            (
                $("#commandSearch")?.value ||
                ""
            )
                .trim()
                .toLowerCase();

        const commands =
            state.commands.filter(
                command => {

                    const matchesFilter =
                        state.activeFilter ===
                        "الكل" ||
                        command.category ===
                        state.activeFilter;

                    const haystack =
                        [
                            command.title,
                            command.name,
                            command.description,
                            command.category,
                            command.permission
                        ]
                            .join(" ")
                            .toLowerCase();

                    const matchesSearch =
                        haystack.includes(
                            query
                        );

                    return (
                        matchesFilter &&
                        matchesSearch
                    );
                }
            );

        if (
            commands.length === 0
        ) {

            grid.innerHTML = `
                <div class="empty-system-card">
                    <div class="empty-icon">⌕</div>
                    <h3>لم يتم العثور على أمر</h3>
                    <p>
                        جرّب كلمة بحث أخرى.
                    </p>
                </div>
            `;

            return;
        }

        grid.innerHTML =
            commands
                .map(
                    command =>
                        commandCardHTML(
                            command
                        )
                )
                .join("");

        bindCommandCards();

    }


    function commandCardHTML(
        command
    ) {

        const enabled =
            command.enabled !==
            false;

        const requiredRole =
            command.requiredRoleId
                ? command.requiredRoleId
                : "الإعداد الافتراضي";

        const channelCount =
            Array.isArray(
                command.channelIds
            )
                ? command.channelIds.length
                : 0;

        return `
            <article
                class="command-card"
                data-command-name="${escapeHTML(command.name)}"
            >

                <div class="command-card-top">

                    <div class="command-card-icon">
                        /
                    </div>

                    <div
                        class="command-enabled ${
                            enabled
                                ? ""
                                : "command-disabled"
                        }"
                    >
                        <span></span>

                        ${
                            enabled
                                ? "مفعّل"
                                : "معطّل"
                        }
                    </div>

                </div>

                <h3>
                    ${escapeHTML(command.title)}
                </h3>

                <span
                    class="command-slash"
                >
                    ${escapeHTML(command.name)}
                </span>

                <p class="command-description">
                    ${escapeHTML(command.description)}
                </p>

                <div class="command-tags">

                    <span class="command-tag">
                        ${escapeHTML(command.category)}
                    </span>

                    <span class="command-tag">
                        ${escapeHTML(command.permission)}
                    </span>

                    <span class="command-tag">
                        ${
                            channelCount
                                ? `${toArabicNumber(channelCount)} قناة`
                                : "كل القنوات"
                        }
                    </span>

                </div>

                <div class="command-card-footer">

                    <button
                        class="configure-command"
                        type="button"
                        data-command-config="${escapeHTML(command.name)}"
                        data-sound="soft"
                    >
                        إعداد الأمر
                    </button>

                    <label class="toggle">

                        <input
                            type="checkbox"
                            data-command-toggle="${escapeHTML(command.name)}"
                            ${enabled ? "checked" : ""}
                        >

                        <span></span>

                    </label>

                </div>

            </article>
        `;
    }


    function bindCommandCards() {

        $$(
            "[data-command-toggle]"
        ).forEach(
            checkbox => {

                checkbox.addEventListener(
                    "change",
                    async () => {

                        const name =
                            checkbox.dataset.commandToggle;

                        await toggleCommand(
                            name,
                            checkbox.checked
                        );

                    }
                );

            }
        );


        $$(
            "[data-command-config]"
        ).forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const command =
                            state.commands.find(
                                item =>
                                    item.name ===
                                    button.dataset.commandConfig
                            );

                        if (!command) {
                            return;
                        }

                        showToast(
                            "إعداد الأمر",
                            `${command.title}: يمكنك ربط صلاحياته وقنواته مع إعدادات السيرفر.`
                        );
                    }
                );

            }
        );

    }


    async function toggleCommand(
        name,
        enabled
    ) {

        if (
            !state.selectedGuildId
        ) {
            return;
        }

        const commandPath =
            name.startsWith("/")
                ? name.slice(1)
                : name;

        try {

            const data =
                await api(
                    `/api/dashboard/commands/${state.selectedGuildId}/${encodeURIComponent(commandPath)}`,
                    {
                        method:
                            "PATCH",

                        body:
                            JSON.stringify({
                                enabled
                            })
                    }
                );

            const existing =
                state.commands.find(
                    command =>
                        command.name ===
                        name
                );

            if (existing) {
                existing.enabled =
                    enabled;
            }

            updateCommandCounters();

            showToast(
                enabled
                    ? "تم تفعيل الأمر"
                    : "تم تعطيل الأمر",

                data.message ||
                    "تم حفظ التغيير."
            );

            renderCommands();

        } catch (error) {

            showToast(
                "تعذر الحفظ",
                error.message,
                "error"
            );

            renderCommands();
        }
    }


    $("#commandSearch")
        ?.addEventListener(
            "input",
            renderCommands
        );


    $$(".command-filter-btn")
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        $$(".command-filter-btn")
                            .forEach(
                                item =>
                                    item.classList.remove(
                                        "active"
                                    )
                            );

                        button.classList.add(
                            "active"
                        );

                        state.activeFilter =
                            button.dataset.commandFilter;

                        renderCommands();
                    }
                );

            }
        );


    /* =====================================================
       الإعدادات
    ====================================================== */

    async function loadSettings() {

        if (
            !state.selectedGuildId
        ) {
            return;
        }

        const data =
            await api(
                `/api/dashboard/settings/${state.selectedGuildId}`
            );

        const settings =
            data.settings || {};

        if (
            $("#welcomeEnabled")
        ) {
            $("#welcomeEnabled")
                .checked =
                Boolean(
                    settings.welcome?.enabled
                );
        }

        if (
            $("#welcomeChannelId")
        ) {
            $("#welcomeChannelId")
                .value =
                settings.welcome?.channelId ||
                "";
        }

        if (
            $("#welcomeMessage")
        ) {
            $("#welcomeMessage")
                .value =
                settings.welcome?.message ||
                "مرحباً بك في السيرفر!";
        }


        if (
            $("#automodEnabled")
        ) {
            $("#automodEnabled")
                .checked =
                Boolean(
                    settings.automod?.enabled
                );
        }


        if (
            $("#logsEnabled")
        ) {
            $("#logsEnabled")
                .checked =
                Boolean(
                    settings.logs?.enabled
                );
        }

        if (
            $("#logsChannelId")
        ) {
            $("#logsChannelId")
                .value =
                settings.logs?.channelId ||
                "";
        }


        if (
            $("#ticketsEnabled")
        ) {
            $("#ticketsEnabled")
                .checked =
                settings.tickets?.enabled !==
                false;
        }

        if (
            $("#ticketCategoryId")
        ) {
            $("#ticketCategoryId")
                .value =
                settings.tickets?.categoryId ||
                "";
        }

        if (
            $("#ticketStaffRoleId")
        ) {
            $("#ticketStaffRoleId")
                .value =
                settings.tickets?.staffRoleId ||
                "";
        }


        if (
            $("#moderationEnabled")
        ) {
            $("#moderationEnabled")
                .checked =
                settings.moderation?.enabled !==
                false;
        }


        renderStreaming(
            settings.streaming
        );
    }


    async function saveSection(
        section
    ) {

        if (
            !state.selectedGuildId
        ) {
            return;
        }

        let payload = {};


        if (
            section ===
            "welcome"
        ) {

            payload.welcome = {
                enabled:
                    Boolean(
                        $("#welcomeEnabled")
                            ?.checked
                    ),

                channelId:
                    $("#welcomeChannelId")
                        ?.value
                        ?.trim() ||
                    "",

                message:
                    $("#welcomeMessage")
                        ?.value ||
                    ""
            };

        }


        if (
            section ===
            "automod"
        ) {

            payload.automod = {
                enabled:
                    Boolean(
                        $("#automodEnabled")
                            ?.checked
                    )
            };

        }


        if (
            section ===
            "logs"
        ) {

            payload.logs = {
                enabled:
                    Boolean(
                        $("#logsEnabled")
                            ?.checked
                    ),

                channelId:
                    $("#logsChannelId")
                        ?.value
                        ?.trim() ||
                    ""
            };

        }


        if (
            section ===
            "tickets"
        ) {

            payload.tickets = {
                enabled:
                    Boolean(
                        $("#ticketsEnabled")
                            ?.checked
                    ),

                categoryId:
                    $("#ticketCategoryId")
                        ?.value
                        ?.trim() ||
                    "",

                staffRoleId:
                    $("#ticketStaffRoleId")
                        ?.value
                        ?.trim() ||
                    ""
            };

        }


        if (
            section ===
            "moderation"
        ) {

            payload.moderation = {
                enabled:
                    Boolean(
                        $("#moderationEnabled")
                            ?.checked
                    )
            };

        }


        try {

            await api(
                `/api/dashboard/settings/${state.selectedGuildId}`,
                {
                    method:
                        "PATCH",

                    body:
                        JSON.stringify(
                            payload
                        )
                }
            );

            showToast(
                "تم الحفظ",
                "تم حفظ الإعدادات بنجاح."
            );

        } catch (error) {

            showToast(
                "تعذر الحفظ",
                error.message,
                "error"
            );
        }
    }


    $$(".save-settings")
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        saveSection(
                            button.dataset.saveSection
                        );

                    }
                );

            }
        );


    /* =====================================================
       Streaming
    ====================================================== */

    function renderStreaming(
        streaming
    ) {

        const list =
            $("#streamList");

        if (!list) {
            return;
        }

        const platforms =
            Array.isArray(
                streaming?.platforms
            )
                ? streaming.platforms
                : [];

        if (
            platforms.length === 0
        ) {

            list.innerHTML = `
                <div class="empty-system-card">
                    <div class="empty-icon">▶</div>
                    <h3>لا توجد قنوات مضافة</h3>
                    <p>
                        أضف قناة للبدء.
                    </p>
                </div>
            `;

            return;
        }

        list.innerHTML =
            platforms
                .map(
                    item => `
                        <div
                            class="stream-item"
                        >

                            <div>

                                <strong>
                                    ${escapeHTML(
                                        item.username
                                    )}
                                </strong>

                                <span>
                                    ${platformArabic(
                                        item.platform
                                    )}
                                </span>

                            </div>

                            <button
                                class="remove-stream"
                                data-stream-platform="${escapeHTML(item.platform)}"
                                data-stream-username="${escapeHTML(item.username)}"
                                data-sound="error"
                            >
                                حذف
                            </button>

                        </div>
                    `
                )
                .join("");

        $$(".remove-stream")
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        async () => {

                            await removeStream(
                                button.dataset.streamPlatform,
                                button.dataset.streamUsername
                            );

                        }
                    );

                }
            );
    }


    async function loadStreaming() {

        if (
            !state.selectedGuildId
        ) {
            return;
        }

        try {

            const data =
                await api(
                    `/api/dashboard/streaming/${state.selectedGuildId}`
                );

            renderStreaming(
                data.settings
            );

        } catch {
            renderStreaming(
                null
            );
        }
    }


    $("#saveStream")
        ?.addEventListener(
            "click",
            async () => {

                const platform =
                    $("#streamPlatform")
                        ?.value;

                const username =
                    $("#streamUsername")
                        ?.value
                        ?.trim();

                if (!username) {

                    showToast(
                        "بيانات ناقصة",
                        "اكتب اسم القناة أولاً.",
                        "error"
                    );

                    return;
                }

                try {

                    const data =
                        await api(
                            `/api/dashboard/streaming/${state.selectedGuildId}`,
                            {
                                method:
                                    "POST",

                                body:
                                    JSON.stringify({
                                        platform,
                                        username
                                    })
                            }
                        );

                    renderStreaming(
                        data.streaming
                    );

                    $("#streamUsername")
                        .value = "";

                    showToast(
                        "تمت إضافة القناة",
                        "تم حفظ قناة البث."
                    );

                } catch (error) {

                    showToast(
                        "تعذر الحفظ",
                        error.message,
                        "error"
                    );

                }
            }
        );


    async function removeStream(
        platform,
        username
    ) {

        try {

            const data =
                await api(
                    `/api/dashboard/streaming/${state.selectedGuildId}`,
                    {
                        method:
                            "DELETE",

                        body:
                            JSON.stringify({
                                platform,
                                username
                            })
                    }
                );

            renderStreaming(
                data.streaming
            );

            showToast(
                "تم الحذف",
                "تم حذف القناة."
            );

        } catch (error) {

            showToast(
                "تعذر الحذف",
                error.message,
                "error"
            );
        }
    }


    $$(".stream-platform")
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        if (
                            $("#streamPlatform")
                        ) {
                            $("#streamPlatform")
                                .value =
                                button.dataset.platform;
                        }

                        showToast(
                            "تم اختيار المنصة",
                            platformArabic(
                                button.dataset.platform
                            )
                        );
                    }
                );

            }
        );


    /* =====================================================
       البيانات
    ====================================================== */

    async function loadEverything() {

        await Promise.all([
            loadCommands(),
            loadSettings(),
            loadStreaming()
        ]);
    }


    /* =====================================================
       أرقام عربية
    ====================================================== */

    function toArabicNumber(
        value
    ) {

        return String(value)
            .replace(
                /\d/g,
                digit =>
                    "٠١٢٣٤٥٦٧٨٩"[
                        Number(digit)
                    ]
            );
    }


    /* =====================================================
       نصوص المنصات
    ====================================================== */

    function platformArabic(
        platform
    ) {

        const map = {
            twitch:
                "تويتش",

            youtube:
                "يوتيوب",

            tiktok:
                "تيك توك",

            kick:
                "كيك"
        };

        return (
            map[
                platform
            ] ||
            platform
        );
    }


    /* =====================================================
       حماية HTML
    ====================================================== */

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


    /* =====================================================
       تهيئة
    ====================================================== */

    async function init() {

        try {

            await loadUser();

            await loadServers();

        } catch (error) {

            console.error(
                error
            );

            showToast(
                "تعذر تحميل اللوحة",
                error.message,
                "error"
            );
        }
    }


    init();

})();