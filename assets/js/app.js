"use strict";

/* ==========================================================================
   Configuration
   ========================================================================== */

const CONFIG = {
    supportedLanguages: ["en", "fr", "ar"],
    defaultLanguage: "en",
    storageKey: "ghali-cloud-language",
    counterDuration: 1500,
    stickyScrollThreshold: 16,
    components: [
        "header",
        "hero",
        "solutions",
        "approach",
        "security",
        "contact",
        "footer"
    ]
};

const TRANSLATIONS = {
    pageTitle: {
        en: "Ghali Cloud | Practical AI for Business",
        fr: "Ghali Cloud | Intelligence artificielle pour les entreprises",
        ar: "Ghali Cloud | ذكاء اصطناعي للأعمال"
    },

    skipLink: {
        en: "Skip to main content",
        fr: "Aller au contenu principal",
        ar: "انتقل إلى المحتوى الرئيسي"
    },

    componentError: {
        en: "Unable to load this section.",
        fr: "Impossible de charger cette section.",
        ar: "تعذر تحميل هذا القسم."
    },

    openNavigation: {
        en: "Open navigation",
        fr: "Ouvrir la navigation",
        ar: "فتح قائمة التنقل"
    },

    closeNavigation: {
        en: "Close navigation",
        fr: "Fermer la navigation",
        ar: "إغلاق قائمة التنقل"
    }
};


/* ==========================================================================
   Language management
   ========================================================================== */

/**
 * Check whether a language is supported.
 *
 * @param {string|null} language
 * @returns {boolean}
 */
function isSupportedLanguage(language) {
    return CONFIG.supportedLanguages.includes(language);
}

/**
 * Return the active language.
 *
 * Priority:
 * 1. URL query parameter
 * 2. localStorage
 * 3. Default language
 *
 * @returns {string}
 */
function getLanguage() {
    const url = new URL(window.location.href);
    const requestedLanguage = url.searchParams.get("lang");
    const savedLanguage = localStorage.getItem(CONFIG.storageKey);

    if (isSupportedLanguage(requestedLanguage)) {
        return requestedLanguage;
    }

    if (isSupportedLanguage(savedLanguage)) {
        return savedLanguage;
    }

    return CONFIG.defaultLanguage;
}

/**
 * Return a translated value with an English fallback.
 *
 * @param {string} group
 * @param {string} language
 * @returns {string}
 */
function getTranslation(group, language) {
    return (
        TRANSLATIONS[group]?.[language] ||
        TRANSLATIONS[group]?.[CONFIG.defaultLanguage] ||
        ""
    );
}

/**
 * Apply the active language to the document.
 *
 * @param {string} language
 */
function applyDocumentLanguage(language) {
    const isArabic = language === "ar";

    document.documentElement.lang = language;
    document.documentElement.dir = isArabic ? "rtl" : "ltr";
    document.documentElement.dataset.language = language;

    document.title = getTranslation("pageTitle", language);

    const skipLink = document.querySelector("[data-skip-link]");

    if (skipLink) {
        skipLink.textContent = getTranslation(
            "skipLink",
            language
        );
    }
}

/**
 * Store the language and update the URL without reloading.
 *
 * @param {string} language
 */
function persistLanguage(language) {
    localStorage.setItem(CONFIG.storageKey, language);

    const url = new URL(window.location.href);

    url.searchParams.set("lang", language);

    window.history.replaceState(
        {},
        "",
        url.toString()
    );
}


/* ==========================================================================
   Component loading
   ========================================================================== */

/**
 * Build a localized partial URL.
 *
 * @param {string} language
 * @param {string} component
 * @returns {string}
 */
function getComponentUrl(language, component) {
    return `partials/${language}/${component}.html`;
}

/**
 * Render a localized component error.
 *
 * @param {HTMLElement} shell
 * @param {string} language
 * @param {string} component
 */
function renderComponentError(shell, language, component) {
    const message = getTranslation(
        "componentError",
        language
    );

    shell.innerHTML = `
        <section
            class="component-error"
            role="alert"
            data-failed-component="${component}"
        >
            <p>${message}</p>
        </section>
    `;
}

/**
 * Load an individual localized component.
 *
 * @param {string} language
 * @param {string} component
 * @returns {Promise<void>}
 */
async function loadComponent(language, component) {
    const selector =
        `[data-component-shell="${component}"]`;

    const shell = document.querySelector(selector);

    if (!shell) {
        console.warn(
            `Component shell not found: ${component}`
        );

        return;
    }

    shell.setAttribute("aria-busy", "true");

    try {
        const response = await fetch(
            getComponentUrl(language, component),
            {
                headers: {
                    "HX-Request": "true"
                },
                cache: "no-cache"
            }
        );

        if (!response.ok) {
            throw new Error(
                `${response.status} ${response.statusText}`
            );
        }

        const html = await response.text();

        shell.innerHTML = html;

        /*
         * Inform HTMX about the newly inserted content.
         */
        if (window.htmx) {
            window.htmx.process(shell);
        }
    } catch (error) {
        renderComponentError(
            shell,
            language,
            component
        );

        console.error(
            `Unable to load component "${component}":`,
            error
        );
    } finally {
        shell.removeAttribute("aria-busy");
    }
}

/**
 * Load every component for the selected language.
 *
 * @param {string} language
 */
async function loadComponents(language) {
    const safeLanguage = isSupportedLanguage(language)
        ? language
        : CONFIG.defaultLanguage;

    applyDocumentLanguage(safeLanguage);
    persistLanguage(safeLanguage);

    await Promise.all(
        CONFIG.components.map((component) =>
            loadComponent(safeLanguage, component)
        )
    );

    /*
     * Initialize interactive elements once all components
     * have been inserted.
     */
    initializePage();
}


/* ==========================================================================
   Lucide icons
   ========================================================================== */

/**
 * Render all Lucide icon placeholders.
 */
function renderIcons() {
    if (!window.lucide) {
        return;
    }

    window.lucide.createIcons();
}


/* ==========================================================================
   Mobile navigation
   ========================================================================== */

/**
 * Initialize the mobile navigation.
 */
function initializeMenu() {
    const button = document.querySelector(
        "[data-menu-button]"
    );

    const menu = document.querySelector(
        "[data-mobile-nav]"
    );

    if (!button || !menu) {
        return;
    }

    /*
     * Prevent duplicate event listeners on the same Header.
     */
    if (button.dataset.menuInitialized === "true") {
        return;
    }

    button.dataset.menuInitialized = "true";

    /**
     * Update the mobile-menu state.
     *
     * @param {boolean} isOpen
     */
    function setMenuState(isOpen) {
        const language =
            document.documentElement.lang ||
            CONFIG.defaultLanguage;

        menu.hidden = !isOpen;

        button.setAttribute(
            "aria-expanded",
            String(isOpen)
        );

        button.setAttribute(
            "aria-label",
            getTranslation(
                isOpen
                    ? "closeNavigation"
                    : "openNavigation",
                language
            )
        );

        const icon = button.querySelector(
            "[data-lucide]"
        );

        if (icon) {
            icon.setAttribute(
                "data-lucide",
                isOpen ? "x" : "menu"
            );
        }

        renderIcons();
    }

    button.addEventListener("click", () => {
        const isCurrentlyOpen =
            button.getAttribute("aria-expanded") ===
            "true";

        setMenuState(!isCurrentlyOpen);
    });

    menu.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
            setMenuState(false);
        });
    });
}

/**
 * Close the mobile navigation with the Escape key.
 *
 * This listener is registered only once at document level.
 *
 * @param {KeyboardEvent} event
 */
function handleEscapeKey(event) {
    if (event.key !== "Escape") {
        return;
    }

    const button = document.querySelector(
        "[data-menu-button]"
    );

    const menu = document.querySelector(
        "[data-mobile-nav]"
    );

    if (!button || !menu) {
        return;
    }

    const isOpen =
        button.getAttribute("aria-expanded") === "true";

    if (!isOpen) {
        return;
    }

    menu.hidden = true;

    button.setAttribute(
        "aria-expanded",
        "false"
    );

    const language =
        document.documentElement.lang ||
        CONFIG.defaultLanguage;

    button.setAttribute(
        "aria-label",
        getTranslation(
            "openNavigation",
            language
        )
    );

    const icon = button.querySelector(
        "[data-lucide]"
    );

    if (icon) {
        icon.setAttribute(
            "data-lucide",
            "menu"
        );
    }

    renderIcons();
    button.focus();
}


/* ==========================================================================
   Sticky Header
   ========================================================================== */

/**
 * Update the current Header according to the scroll position.
 *
 * The Header can be replaced when the language changes,
 * so the function queries the current element every time.
 */
function updateStickyHeader() {
    const header = document.querySelector(
        ".site-header"
    );

    if (!header) {
        return;
    }

    header.classList.toggle(
        "is-scrolled",
        window.scrollY >
            CONFIG.stickyScrollThreshold
    );
}

/**
 * Initialize the global sticky Header listener once.
 */
function initializeStickyHeader() {
    if (
        document.documentElement.dataset
            .stickyHeaderInitialized === "true"
    ) {
        updateStickyHeader();
        return;
    }

    document.documentElement.dataset
        .stickyHeaderInitialized = "true";

    window.addEventListener(
        "scroll",
        updateStickyHeader,
        {
            passive: true
        }
    );

    updateStickyHeader();
}


/* ==========================================================================
   Animated counters
   ========================================================================== */

/**
 * Format a number according to the active language.
 *
 * @param {number} value
 * @param {number} decimals
 * @returns {string}
 */
function formatCounterValue(value, decimals) {
    const language =
        document.documentElement.lang ||
        CONFIG.defaultLanguage;

    return new Intl.NumberFormat(language, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(value);
}

/**
 * Animate one counter element.
 *
 * @param {HTMLElement} element
 */
function animateCounter(element) {
    if (
        element.dataset.counterAnimated === "true"
    ) {
        return;
    }

    element.dataset.counterAnimated = "true";

    const target = Number.parseFloat(
        element.dataset.target || "0"
    );

    const decimals = Number.parseInt(
        element.dataset.decimals || "0",
        10
    );

    const prefix =
        element.dataset.prefix || "";

    const suffix =
        element.dataset.suffix || "";

    const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    /**
     * Set the counter text.
     *
     * @param {number} value
     */
    function setCounterText(value) {
        element.textContent =
            prefix +
            formatCounterValue(
                value,
                decimals
            ) +
            suffix;
    }

    if (
        reduceMotion ||
        !Number.isFinite(target)
    ) {
        setCounterText(target);
        return;
    }

    const startTime = performance.now();

    /**
     * Update the counter animation.
     *
     * @param {number} currentTime
     */
    function updateCounter(currentTime) {
        const elapsed =
            currentTime - startTime;

        const progress = Math.min(
            elapsed / CONFIG.counterDuration,
            1
        );

        /*
         * Cubic ease-out.
         */
        const easedProgress =
            1 - Math.pow(1 - progress, 3);

        setCounterText(
            target * easedProgress
        );

        if (progress < 1) {
            window.requestAnimationFrame(
                updateCounter
            );

            return;
        }

        setCounterText(target);
    }

    window.requestAnimationFrame(
        updateCounter
    );
}

/**
 * Initialize counters when they enter the viewport.
 */
function initializeCounters() {
    const sections = document.querySelectorAll(
        "[data-counter-section]"
    );

    if (!sections.length) {
        return;
    }

    /*
     * Fallback for older browsers.
     */
    if (!("IntersectionObserver" in window)) {
        document
            .querySelectorAll("[data-counter]")
            .forEach(animateCounter);

        return;
    }

    const observer = new IntersectionObserver(
        (entries, currentObserver) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) {
                    return;
                }

                entry.target
                    .querySelectorAll(
                        "[data-counter]"
                    )
                    .forEach(animateCounter);

                currentObserver.unobserve(
                    entry.target
                );
            });
        },
        {
            threshold: 0.3,
            rootMargin:
                "0px 0px -40px 0px"
        }
    );

    sections.forEach((section) => {
        if (
            section.dataset.counterObserved ===
            "true"
        ) {
            return;
        }

        section.dataset.counterObserved =
            "true";

        observer.observe(section);
    });
}


/* ==========================================================================
   Generated content
   ========================================================================== */

/**
 * Update elements that display the current year.
 */
function updateCurrentYear() {
    const currentYear = String(
        new Date().getFullYear()
    );

    document
        .querySelectorAll(
            "[data-current-year]"
        )
        .forEach((element) => {
            element.textContent =
                currentYear;
        });
}


/* ==========================================================================
   Page initialization
   ========================================================================== */

/**
 * Initialize all elements currently available in the page.
 */
function initializePage() {
    renderIcons();
    initializeMenu();
    initializeCounters();
    initializeStickyHeader();
    updateCurrentYear();
}


/* ==========================================================================
   Event handlers
   ========================================================================== */

/**
 * Handle language changes through event delegation.
 *
 * Event delegation remains functional when the Header is
 * replaced after a language switch.
 */
function handleLanguageChange(event) {
    const selector = event.target.closest(
        "[data-language-selector]"
    );

    if (!selector) {
        return;
    }

    const selectedLanguage =
        selector.value;

    if (!isSupportedLanguage(selectedLanguage)) {
        return;
    }

    loadComponents(selectedLanguage);
}

/**
 * Initialize the application.
 */
async function initializeApplication() {
    document.addEventListener(
        "change",
        handleLanguageChange
    );

    document.addEventListener(
        "keydown",
        handleEscapeKey
    );

    initializeStickyHeader();

    await loadComponents(getLanguage());
}


/* ==========================================================================
   Application startup
   ========================================================================== */

document.addEventListener(
    "DOMContentLoaded",
    initializeApplication
);

/*
 * Reinitialize content inserted by other HTMX interactions.
 * The multilingual loader already calls initializePage after
 * all components finish loading.
 */
document.body.addEventListener(
    "htmx:afterSwap",
    initializePage
);