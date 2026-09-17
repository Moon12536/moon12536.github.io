"use strict";

/*
    بيان
    وظائف الموقع الرئيسية:
    - مؤثرات صوتية للأزرار
    - انتقالات ناعمة
    - خلفية متحركة
*/

(() => {

    let soundEnabled = true;
    let audioContext = null;


    /* =====================================================
       الصوت
    ====================================================== */

    function getAudioContext() {

        if (!audioContext) {
            const AudioContext =
                window.AudioContext ||
                window.webkitAudioContext;

            if (!AudioContext) {
                return null;
            }

            audioContext =
                new AudioContext();
        }

        if (
            audioContext.state ===
            "suspended"
        ) {
            audioContext.resume();
        }

        return audioContext;
    }


    function playTone(
        frequency,
        duration,
        type = "sine",
        volume = 0.025
    ) {

        if (!soundEnabled) {
            return;
        }

        const ctx =
            getAudioContext();

        if (!ctx) {
            return;
        }

        const oscillator =
            ctx.createOscillator();

        const gain =
            ctx.createGain();

        oscillator.type =
            type;

        oscillator.frequency.setValueAtTime(
            frequency,
            ctx.currentTime
        );

        gain.gain.setValueAtTime(
            0,
            ctx.currentTime
        );

        gain.gain.linearRampToValueAtTime(
            volume,
            ctx.currentTime + 0.01
        );

        gain.gain.exponentialRampToValueAtTime(
            0.0001,
            ctx.currentTime + duration
        );

        oscillator.connect(
            gain
        );

        gain.connect(
            ctx.destination
        );

        oscillator.start();

        oscillator.stop(
            ctx.currentTime +
            duration
        );
    }


    function playButtonSound(
        style = "soft"
    ) {

        if (!soundEnabled) {
            return;
        }

        if (style === "success") {

            playTone(
                660,
                0.10,
                "sine",
                0.024
            );

            setTimeout(() => {
                playTone(
                    880,
                    0.13,
                    "sine",
                    0.022
                );
            }, 45);

            return;
        }

        if (style === "error") {

            playTone(
                180,
                0.13,
                "triangle",
                0.023
            );

            return;
        }

        playTone(
            480,
            0.07,
            "sine",
            0.018
        );
    }


    /* =====================================================
       Buttons
    ====================================================== */

    document.addEventListener(
        "click",
        event => {

            const target =
                event.target.closest(
                    "[data-sound]"
                );

            if (!target) {
                return;
            }

            playButtonSound(
                target.dataset.sound ||
                "soft"
            );
        }
    );


    /* =====================================================
       تأثير دخول العناصر
    ====================================================== */

    const observer =
        new IntersectionObserver(
            entries => {

                for (
                    const entry of entries
                ) {

                    if (
                        !entry.isIntersecting
                    ) {
                        continue;
                    }

                    entry.target.classList.add(
                        "revealed"
                    );

                    observer.unobserve(
                        entry.target
                    );
                }

            },
            {
                threshold:
                    0.12
            }
        );


    document
        .querySelectorAll(
            ".feature-card, .number-card, .command-demo-card"
        )
        .forEach(
            element => {
                element.classList.add(
                    "reveal-ready"
                );

                observer.observe(
                    element
                );
            }
        );


    /* =====================================================
       زر إضافة البوت
    ====================================================== */

    document
        .querySelectorAll(
            'a[href="/add-bot"]'
        )
        .forEach(
            link => {

                link.addEventListener(
                    "click",
                    () => {
                        playButtonSound(
                            "success"
                        );
                    }
                );

            }
        );


    /* =====================================================
       زر الصوت في حال وجوده
    ====================================================== */

    const soundToggle =
        document.getElementById(
            "soundToggle"
        );

    if (soundToggle) {

        soundToggle.addEventListener(
            "click",
            () => {

                soundEnabled =
                    !soundEnabled;

                soundToggle.textContent =
                    soundEnabled
                        ? "♪"
                        : "×";

                if (
                    soundEnabled
                ) {
                    playButtonSound(
                        "success"
                    );
                }
            }
        );
    }

})();