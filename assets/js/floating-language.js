"use strict";

(function initializeFloatingLanguageModule() {
    const supportedLanguages = ["en", "fr", "ar"];

    function getActiveLanguage() {
        const language = document.documentElement.lang;
        return supportedLanguages.includes(language) ? language : "en";
    }

    function getMenu(root) {
        return root?.querySelector("[data-language-options]") || null;
    }

    function getToggle(root) {
        return root?.querySelector("[data-language-menu-button]") || null;
    }

    function setMenuState(root, isOpen, moveFocus = false) {
        const menu = getMenu(root);
        const toggle = getToggle(root);

        if (!menu || !toggle) return;

        menu.hidden = !isOpen;
        toggle.setAttribute("aria-expanded", String(isOpen));

        if (isOpen && moveFocus) {
            const active = menu.querySelector('[aria-current="true"]');
            const first = menu.querySelector("[data-language-choice]");
            window.requestAnimationFrame(() => (active || first)?.focus());
        }
    }

    function closeAll(except = null) {
        document.querySelectorAll("[data-language-menu]").forEach(root => {
            if (root !== except) setMenuState(root, false);
        });
    }

    function syncActiveChoice(root) {
        const activeLanguage = getActiveLanguage();

        root.querySelectorAll("[data-language-choice]").forEach(choice => {
            const isActive = choice.dataset.languageChoice === activeLanguage;
            choice.classList.toggle("is-active", isActive);

            if (isActive) {
                choice.setAttribute("aria-current", "true");
            } else {
                choice.removeAttribute("aria-current");
            }
        });
    }

    function initialize(root) {
        const toggle = getToggle(root);
        if (!toggle) return;

        syncActiveChoice(root);
        setMenuState(root, false);
    }

    async function selectLanguage(language) {
        if (!supportedLanguages.includes(language)) return;

        localStorage.setItem("ghali-cloud-language", language);

        if (typeof window.loadComponents === "function") {
            await window.loadComponents(language);
            return;
        }

        const url = new URL(window.location.href);
        url.searchParams.set("lang", language);
        window.location.assign(url.toString());
    }

    document.addEventListener("click", event => {
        const toggle = event.target.closest("[data-language-menu-button]");

        if (toggle) {
            const root = toggle.closest("[data-language-menu]");
            const isOpen = toggle.getAttribute("aria-expanded") === "true";
            closeAll(root);
            setMenuState(root, !isOpen, !isOpen);
            return;
        }

        const choice = event.target.closest("[data-language-choice]");

        if (choice) {
            const root = choice.closest("[data-language-menu]");
            setMenuState(root, false);
            selectLanguage(choice.dataset.languageChoice);
            return;
        }

        if (!event.target.closest("[data-language-menu]")) closeAll();
    });

    document.addEventListener("keydown", event => {
        const root = document.activeElement?.closest?.("[data-language-menu]");
        if (!root) return;

        const toggle = getToggle(root);
        const menu = getMenu(root);
        const options = [...root.querySelectorAll("[data-language-choice]")];
        const isOpen = toggle?.getAttribute("aria-expanded") === "true";

        if (event.key === "Escape" && isOpen) {
            event.preventDefault();
            setMenuState(root, false);
            toggle.focus();
            return;
        }

        if (!isOpen || !options.length) return;

        const current = options.indexOf(document.activeElement);

        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            const delta = event.key === "ArrowDown" ? 1 : -1;
            const next = (current + delta + options.length) % options.length;
            options[next].focus();
        }
    });

    function initializeAll() {
        document.querySelectorAll("[data-language-menu]").forEach(initialize);

        if (window.lucide) window.lucide.createIcons();
    }

    document.addEventListener("DOMContentLoaded", initializeAll);
    document.body.addEventListener("htmx:afterSwap", initializeAll);

    window.initializeFloatingLanguageMenu = initializeAll;
}());
