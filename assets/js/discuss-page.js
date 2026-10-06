"use strict";

const DISCUSS_CONFIG = {
  languages: ["en", "fr", "ar"],
  defaultLanguage: "fr",
  components: ["header", "discuss", "footer"],
  storageKey: "ghali-cloud-language",
  email: "contact@ghali.cloud"
};

const DISCUSS_TEXT = {
  fr: { title: "Ghali Cloud | Discuter avec notre équipe", skip: "Aller au contenu principal", required: "Ce champ est obligatoire.", email: "Saisissez une adresse e-mail valide.", subject: "Demande d’échange avec Ghali Cloud", labels: ["Nom", "E-mail", "Entreprise", "Fonction", "Sujet", "Date souhaitée", "Contexte"] },
  en: { title: "Ghali Cloud | Meet our team", skip: "Skip to main content", required: "This field is required.", email: "Enter a valid email address.", subject: "Meeting request with Ghali Cloud", labels: ["Name", "Email", "Company", "Role", "Topic", "Preferred date", "Context"] },
  ar: { title: "Ghali Cloud | تواصل مع فريقنا", skip: "انتقل إلى المحتوى الرئيسي", required: "هذا الحقل مطلوب.", email: "أدخل عنوان بريد إلكتروني صالحاً.", subject: "طلب اجتماع مع Ghali Cloud", labels: ["الاسم", "البريد الإلكتروني", "الشركة", "الوظيفة", "الموضوع", "التاريخ المفضل", "السياق"] }
};

function getDiscussLanguage() {
  const requested = new URLSearchParams(location.search).get("lang");
  const saved = localStorage.getItem(DISCUSS_CONFIG.storageKey);
  return DISCUSS_CONFIG.languages.includes(requested)
    ? requested
    : (DISCUSS_CONFIG.languages.includes(saved) ? saved : DISCUSS_CONFIG.defaultLanguage);
}

function applyDiscussLanguage(language) {
  const text = DISCUSS_TEXT[language];
  document.documentElement.lang = language;
  document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  document.title = text.title;
  document.querySelector("[data-skip-link]").textContent = text.skip;
  localStorage.setItem(DISCUSS_CONFIG.storageKey, language);
  const url = new URL(location.href);
  url.searchParams.set("lang", language);
  history.replaceState({}, "", url);
}

async function loadDiscussComponent(language, component) {
  const shell = document.querySelector(`[data-discuss-shell="${component}"]`);
  if (!shell) return;
  shell.setAttribute("aria-busy", "true");

  try {
    const response = await fetch(`partials/${language}/${component}.html`, { cache: "no-cache", headers: { "HX-Request": "true" } });
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    shell.innerHTML = await response.text();
    if (window.htmx) window.htmx.process(shell);
  } catch (error) {
    shell.innerHTML = `<section class="component-error" role="alert"><p>Unable to load ${component}.</p></section>`;
    console.error(`Unable to load ${component}:`, error);
  } finally {
    shell.removeAttribute("aria-busy");
  }
}

async function loadDiscussPage(language) {
  applyDiscussLanguage(language);
  await Promise.all(DISCUSS_CONFIG.components.map(component => loadDiscussComponent(language, component)));
  initializeDiscussPage();
}

function renderDiscussIcons() {
  if (window.lucide) window.lucide.createIcons();
}

function initializeDiscussMenu() {
  const button = document.querySelector("[data-menu-button]");
  const menu = document.querySelector("[data-mobile-nav]");
  if (!button || !menu || button.dataset.ready === "true") return;
  button.dataset.ready = "true";
  button.addEventListener("click", () => {
    const open = button.getAttribute("aria-expanded") !== "true";
    button.setAttribute("aria-expanded", String(open));
    menu.hidden = !open;
  });
  menu.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
    button.setAttribute("aria-expanded", "false");
    menu.hidden = true;
  }));
}

function clearFieldError(field) {
  field.removeAttribute("aria-invalid");
  const helpId = field.getAttribute("aria-describedby");
  if (helpId) document.getElementById(helpId).textContent = "";
}

function showFieldError(field, message) {
  field.setAttribute("aria-invalid", "true");
  const helpId = field.getAttribute("aria-describedby");
  if (helpId) document.getElementById(helpId).textContent = message;
}

function validateDiscussForm(form, language) {
  const text = DISCUSS_TEXT[language];
  let valid = true;
  form.querySelectorAll("[required]").forEach(field => {
    clearFieldError(field);
    if (!field.value.trim()) {
      showFieldError(field, text.required);
      valid = false;
    }
  });
  const email = form.elements.email;
  if (email.value && !/^\S+@\S+\.\S+$/.test(email.value)) {
    showFieldError(email, text.email);
    valid = false;
  }
  return valid;
}

function buildDiscussMailto(form, language) {
  const text = DISCUSS_TEXT[language];
  const labels = text.labels;
  const data = new FormData(form);
  const body = [
    `${labels[0]}: ${data.get("name")}`,
    `${labels[1]}: ${data.get("email")}`,
    `${labels[2]}: ${data.get("company") || "-"}`,
    `${labels[3]}: ${data.get("role") || "-"}`,
    `${labels[4]}: ${data.get("topic")}`,
    `${labels[5]}: ${data.get("date") || "-"}`,
    "",
    `${labels[6]}:`,
    data.get("message")
  ].join("\n");
  return `mailto:${DISCUSS_CONFIG.email}?subject=${encodeURIComponent(text.subject)}&body=${encodeURIComponent(body)}`;
}

function initializeDiscussForm() {
  const form = document.querySelector("[data-meeting-form]");
  if (!form || form.dataset.ready === "true") return;
  form.dataset.ready = "true";
  const language = form.dataset.language;
  const date = form.querySelector("[data-meeting-date]");
  if (date) date.min = new Date().toISOString().split("T")[0];

  form.addEventListener("submit", event => {
    event.preventDefault();
    if (!validateDiscussForm(form, language)) {
      form.querySelector("[aria-invalid='true']")?.focus();
      return;
    }
    const success = document.querySelector("[data-success-panel]");
    document.querySelector("[data-form-content]").hidden = true;
    success.hidden = false;
    success.focus();
    renderDiscussIcons();
    location.href = buildDiscussMailto(form, language);
  });
}

function initializeDiscussPage() {
  renderDiscussIcons();
  initializeDiscussMenu();
  initializeDiscussForm();
  document.querySelectorAll("[data-current-year]").forEach(node => node.textContent = new Date().getFullYear());
}

document.addEventListener("DOMContentLoaded", () => loadDiscussPage(getDiscussLanguage()));
document.body.addEventListener("htmx:afterSwap", initializeDiscussPage);
