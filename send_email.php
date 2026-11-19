<?php
/**
 * send-rdv.php — "Prendre rendez-vous" form handler for ghali.cloud
 *
 * Receives the POST from go.html, validates it, and emails it to the inbox.
 * Requires PHP 7.4+ with the mbstring extension and a working mail() / sendmail
 * on the server (standard on most shared hosting and cPanel plans).
 */

declare(strict_types=1);

/* ------------------------------ CONFIGURATION ------------------------------ */

const TO_EMAIL      = 'contact@ghali.cloud';   // inbox that receives the requests
const FROM_EMAIL    = 'no-reply@ghali.cloud';  // MUST be an address on your own domain
const FROM_NAME     = 'ghali.cloud';
const SUCCESS_PAGE  = 'go.html?envoye=1';      // used when JavaScript is off
const ERROR_PAGE    = 'go.html?erreur=1';
const ALLOWED_HOSTS = ['ghali.cloud', 'www.ghali.cloud']; // sites allowed to post here
const RATE_MAX      = 5;                       // max requests per IP ...
const RATE_WINDOW   = 3600;                    // ... per this many seconds
const SEND_COPY_TO_VISITOR = false;            // true = also send an automatic reply to the visitor

date_default_timezone_set('Africa/Casablanca');

/* --------------------------------- HELPERS --------------------------------- */

function wants_json(): bool
{
    return ($_SERVER['HTTP_X_REQUESTED_WITH'] ?? '') === 'fetch'
        || stripos($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json') !== false;
}

function respond(bool $ok, string $message, int $status = 200): void
{
    if (wants_json()) {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        header('Cache-Control: no-store');
        echo json_encode(['ok' => $ok, 'message' => $message], JSON_UNESCAPED_UNICODE);
    } else {
        header('Location: ' . ($ok ? SUCCESS_PAGE : ERROR_PAGE), true, 303);
    }
    exit;
}

/** Single-line field: strips line breaks (blocks email header injection) and control characters. */
function clean_line(string $v, int $max): string
{
    $v = preg_replace('/[\x00-\x1F\x7F]+/u', ' ', $v) ?? '';
    return mb_substr(trim($v), 0, $max);
}

/** Multi-line field: keeps line breaks, removes other control characters. */
function clean_text(string $v, int $max): string
{
    $v = str_replace(["\r\n", "\r"], "\n", $v);
    $v = preg_replace('/[^\P{C}\n]+/u', '', $v) ?? '';
    return mb_substr(trim($v), 0, $max);
}

function mime_subject(string $s): string
{
    return '=?UTF-8?B?' . base64_encode($s) . '?=';
}

function rate_limited(string $ip): bool
{
    $file = sys_get_temp_dir() . '/rdv_' . hash('sha256', $ip) . '.json';
    $now  = time();
    $hits = [];
    if (is_file($file)) {
        $hits = json_decode((string) file_get_contents($file), true);
        $hits = is_array($hits) ? $hits : [];
    }
    $hits = array_values(array_filter($hits, static fn($t) => is_int($t) && $t > $now - RATE_WINDOW));
    if (count($hits) >= RATE_MAX) {
        return true;
    }
    $hits[] = $now;
    @file_put_contents($file, json_encode($hits), LOCK_EX);
    return false;
}

function send_mail(string $to, string $subject, string $body, string $replyTo = ''): bool
{
    $headers = [
        'From: ' . mime_subject(FROM_NAME) . ' <' . FROM_EMAIL . '>',
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Transfer-Encoding: 8bit',
        'X-Mailer: ghali.cloud/send-rdv.php',
    ];
    if ($replyTo !== '') {
        $headers[] = 'Reply-To: ' . $replyTo;
    }
    return mail($to, mime_subject($subject), $body, implode("\r\n", $headers), '-f' . FROM_EMAIL);
}

/* --------------------------------- REQUEST --------------------------------- */

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    respond(false, 'Méthode non autorisée.', 405);
}

// Only accept submissions coming from the site itself.
$origin = $_SERVER['HTTP_ORIGIN'] ?? ($_SERVER['HTTP_REFERER'] ?? '');
if ($origin !== '') {
    $host = strtolower((string) parse_url($origin, PHP_URL_HOST));
    $self = strtolower(preg_replace('/:\d+$/', '', $_SERVER['HTTP_HOST'] ?? ''));
    if ($host !== '' && $host !== $self && !in_array($host, ALLOWED_HOSTS, true)) {
        respond(false, 'Origine non autorisée.', 403);
    }
}

// Honeypot: real visitors never fill this hidden field. Pretend success to bots.
if (trim((string) ($_POST['website'] ?? '')) !== '') {
    respond(true, 'Votre demande a bien été envoyée.');
}

$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
if (rate_limited($ip)) {
    respond(false, 'Trop de demandes. Réessayez plus tard ou écrivez-nous à ' . TO_EMAIL . '.', 429);
}

$nom     = clean_line((string) ($_POST['nom']   ?? ''), 120);
$ent     = clean_line((string) ($_POST['ent']   ?? ''), 120);
$email   = clean_line((string) ($_POST['mail']  ?? ''), 160);
$tel     = clean_line((string) ($_POST['tel']   ?? ''), 40);
$date    = clean_line((string) ($_POST['date']  ?? ''), 10);
$heure   = clean_line((string) ($_POST['heure'] ?? ''), 5);
$message = clean_text((string) ($_POST['msg']   ?? ''), 4000);

$errors = [];
if ($nom === '')                                    $errors[] = 'nom';
if (!filter_var($email, FILTER_VALIDATE_EMAIL))     $errors[] = 'e-mail';
if ($message === '')                                $errors[] = 'projet';

$d = DateTime::createFromFormat('!Y-m-d', $date);
if (!$d || $d->format('Y-m-d') !== $date || $d < new DateTime('today')) {
    $errors[] = 'date';
}
if (!preg_match('/^([01]\d|2[0-3]):[0-5]\d$/', $heure)) {
    $errors[] = 'heure';
}
if ($tel !== '' && !preg_match('/^[0-9 +().\-]{6,40}$/', $tel)) {
    $errors[] = 'téléphone';
}

if ($errors) {
    respond(false, 'Champs invalides : ' . implode(', ', $errors) . '.', 422);
}

/* ---------------------------------- EMAIL ---------------------------------- */

$dateFr = $d->format('d/m/Y');
$subject = sprintf('Demande de rendez-vous — %s%s — %s %s',
    $nom, $ent !== '' ? " ($ent)" : '', $dateFr, $heure);

$body = implode("\n", [
    'Nouvelle demande de rendez-vous reçue via ghali.cloud',
    '',
    "Date souhaitée  : $dateFr",
    "Heure souhaitée : $heure (heure du Maroc)",
    '',
    "Nom         : $nom",
    'Entreprise  : ' . ($ent !== '' ? $ent : '—'),
    "E-mail      : $email",
    'Téléphone   : ' . ($tel !== '' ? $tel : '—'),
    '',
    'Projet :',
    $message,
    '',
    '--',
    'Envoyé le ' . date('d/m/Y à H:i') . ' (heure du Maroc) — IP ' . $ip,
    'Répondre à ce message écrit directement au visiteur.',
]);

if (!send_mail(TO_EMAIL, $subject, $body, $email)) {
    error_log('send-rdv.php: mail() failed for ' . $email);
    respond(false, 'L’envoi a échoué. Écrivez-nous à ' . TO_EMAIL . '.', 500);
}

if (SEND_COPY_TO_VISITOR) {
    $reply = implode("\n", [
        "Bonjour $nom,",
        '',
        "Nous avons bien reçu votre demande de rendez-vous du $dateFr à $heure (heure du Maroc).",
        'Nous revenons vers vous pour la confirmer.',
        '',
        'Récapitulatif de votre projet :',
        $message,
        '',
        'L’équipe ghali.cloud',
    ]);
    send_mail($email, 'Votre demande de rendez-vous — ghali.cloud', $reply, TO_EMAIL);
}

respond(true, 'Votre demande a bien été envoyée.');