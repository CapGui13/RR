// api/gallery.js
//
// Endpoint serverless pour la galerie photo du Bridge Club Roy René.
// Le mot de passe admin ET le token GitHub restent CÔTÉ SERVEUR en permanence :
// aucun des deux n'est jamais envoyé au navigateur.
//
// Variables d'environnement à configurer sur Vercel (Project Settings > Environment Variables) :
//   GITHUB_TOKEN        Fine-grained PAT, scope "Contents: Read and write" sur le repo cible UNIQUEMENT
//   GITHUB_OWNER        ex: "CapGui13"
//   GITHUB_REPO         ex: "RR"
//   GITHUB_BRANCH       ex: "main" (optionnel, défaut "main")
//   GALLERY_JSON_PATH   ex: "gallery/gallery.json" (optionnel, valeur par défaut ci-dessous)
//   GALLERY_IMAGES_DIR  ex: "gallery/images" (optionnel, valeur par défaut ci-dessous)
//   ADMIN_PASSWORD      mot de passe en clair choisi par toi (jamais commité dans le code)
//   ADMIN_SESSION_SECRET optionnel, secret additionnel pour signer les connexions mémorisées
//   ALLOWED_ORIGINS     optionnel, liste séparée par des virgules. Par défaut : domaines officiels du club.

const crypto = require('crypto');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER;
const GITHUB_REPO = process.env.GITHUB_REPO;
const BRANCH = process.env.GITHUB_BRANCH || 'main';
const GALLERY_JSON_PATH = process.env.GALLERY_JSON_PATH || 'gallery/gallery.json';
const GALLERY_IMAGES_DIR = process.env.GALLERY_IMAGES_DIR || 'gallery/images';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_SESSION_SECRET = process.env.ADMIN_SESSION_SECRET
  ? `${process.env.ADMIN_SESSION_SECRET}\0${ADMIN_PASSWORD || ''}`
  : ADMIN_PASSWORD;
const ADMIN_SESSION_TTL_SECONDS = 30 * 24 * 60 * 60; // 30 jours

const DEFAULT_ALLOWED_ORIGINS = [
  'https://www.roy-rene-bridge.com',
  'https://roy-rene-bridge.com'
];
const ALLOWED_ORIGINS = new Set(
  (process.env.ALLOWED_ORIGINS || DEFAULT_ALLOWED_ORIGINS.join(','))
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean)
);

const ALLOWED_CATEGORIES = new Set(['salle', 'tournois', 'cours', 'events']);
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 Mo décodés
const MAX_TITLE_LENGTH = 120;
const MAX_REORDER_ITEMS = 500;

// === Anti brute-force (protection best-effort en mémoire) ===
const failedAttempts = new Map();
const MAX_ATTEMPTS_BEFORE_LOCKOUT = 8;
const LOCKOUT_MS = 5 * 60 * 1000;

function getClientIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  if (fwd) return fwd.split(',')[0].trim();
  return req.socket?.remoteAddress || 'unknown';
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function checkRateLimit(ip) {
  const entry = failedAttempts.get(ip);
  if (!entry) return false;
  const elapsed = Date.now() - entry.lastAttempt;
  if (entry.count >= MAX_ATTEMPTS_BEFORE_LOCKOUT && elapsed < LOCKOUT_MS) return true;
  if (elapsed >= LOCKOUT_MS) {
    failedAttempts.delete(ip);
    return false;
  }
  const delay = Math.min(entry.count * 500, 5000);
  if (delay > 0) await sleep(delay);
  return false;
}

function recordFailedAttempt(ip) {
  const entry = failedAttempts.get(ip) || { count: 0, lastAttempt: 0 };
  entry.count += 1;
  entry.lastAttempt = Date.now();
  failedAttempts.set(ip, entry);
}

function clearFailedAttempts(ip) {
  failedAttempts.delete(ip);
}

const API_BASE = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}`;

const MIME_EXT = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif'
};

function applyCors(req, res) {
  const origin = req.headers.origin;
  const allowed = !origin || ALLOWED_ORIGINS.has(origin);

  if (origin && allowed) res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  return allowed;
}

function checkPassword(password) {
  if (!ADMIN_PASSWORD || typeof password !== 'string') return false;
  const a = Buffer.from(password);
  const b = Buffer.from(ADMIN_PASSWORD);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function createAdminSessionToken() {
  if (!ADMIN_SESSION_SECRET) return null;
  const now = Math.floor(Date.now() / 1000);
  const payload = Buffer.from(JSON.stringify({ v: 1, iat: now, exp: now + ADMIN_SESSION_TTL_SECONDS })).toString('base64url');
  const signature = crypto.createHmac('sha256', ADMIN_SESSION_SECRET).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

function verifyAdminSessionToken(token) {
  if (!ADMIN_SESSION_SECRET || typeof token !== 'string') return false;
  const parts = token.split('.');
  if (parts.length !== 2 || !parts[0] || !parts[1]) return false;

  const expected = crypto.createHmac('sha256', ADMIN_SESSION_SECRET).update(parts[0]).digest();
  let received;
  try { received = Buffer.from(parts[1], 'base64url'); } catch { return false; }
  if (received.length !== expected.length || !crypto.timingSafeEqual(received, expected)) return false;

  try {
    const payload = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'));
    const now = Math.floor(Date.now() / 1000);
    return payload && payload.v === 1 && Number.isSafeInteger(payload.exp) && payload.exp > now;
  } catch {
    return false;
  }
}

function normalizeTitle(value) {
  if (typeof value !== 'string') return null;
  const title = value.trim();
  if (!title || title.length > MAX_TITLE_LENGTH) return null;
  if(/[\u0000-\u001F\u007F]/.test(title)) return null;
  return title;
}

function isValidCategory(value) {
  return typeof value === 'string' && ALLOWED_CATEGORIES.has(value);
}

function isValidId(value) {
  return Number.isSafeInteger(value) && value > 0;
}

function hasExpectedImageSignature(buffer, mime) {
  if (!Buffer.isBuffer(buffer) || buffer.length < 4) return false;

  if (mime === 'image/jpeg' || mime === 'image/jpg') {
    return buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF;
  }
  if (mime === 'image/png') {
    const png = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
    return buffer.length >= png.length && buffer.subarray(0, png.length).equals(png);
  }
  if (mime === 'image/webp') {
    return buffer.length >= 12 &&
      buffer.toString('ascii', 0, 4) === 'RIFF' &&
      buffer.toString('ascii', 8, 12) === 'WEBP';
  }
  if (mime === 'image/gif') {
    const signature = buffer.toString('ascii', 0, 6);
    return signature === 'GIF87a' || signature === 'GIF89a';
  }
  return false;
}

function parseImageDataUrl(image) {
  if (typeof image !== 'string') return { error: 'Format d\'image invalide' };

  const match = /^data:(image\/(?:jpeg|jpg|png|webp|gif));base64,([A-Za-z0-9+/]+={0,2})$/.exec(image);
  if (!match) return { error: 'Format d\'image non autorisé (JPEG, PNG, WebP ou GIF uniquement)' };

  const mime = match[1];
  const base64Data = match[2];
  if (base64Data.length % 4 !== 0) return { error: 'Données d\'image invalides' };

  const buffer = Buffer.from(base64Data, 'base64');
  if (!buffer.length) return { error: 'Image vide' };
  if (buffer.length > MAX_IMAGE_BYTES) return { error: 'Image trop volumineuse (5 Mo maximum)' };
  if (!hasExpectedImageSignature(buffer, mime)) return { error: 'Le contenu du fichier ne correspond pas au format annoncé' };

  return { mime, ext: MIME_EXT[mime], base64Data };
}

async function ghFetch(path, options = {}) {
  return fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github+json',
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
}

async function getFile(path) {
  const res = await ghFetch(`/contents/${path}?ref=${BRANCH}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Lecture GitHub échouée (${path}) : ${res.status}`);
  const data = await res.json();
  return { sha: data.sha, content: Buffer.from(data.content, 'base64').toString('utf-8') };
}

async function putFile(path, contentBase64, message, sha) {
  const res = await ghFetch(`/contents/${path}`, {
    method: 'PUT',
    body: JSON.stringify({ message, content: contentBase64, sha: sha || undefined, branch: BRANCH })
  });
  if (!res.ok) {
    const err = await res.text().catch(() => '');
    throw new Error(`Écriture GitHub échouée (${path}) : ${res.status} ${err}`);
  }
  return res.json();
}

async function deleteFile(path, message, sha) {
  const res = await ghFetch(`/contents/${path}`, {
    method: 'DELETE',
    body: JSON.stringify({ message, sha, branch: BRANCH })
  });
  if (!res.ok) {
    const err = await res.text().catch(() => '');
    throw new Error(`Suppression GitHub échouée (${path}) : ${res.status} ${err}`);
  }
}

async function loadGallery() {
  const file = await getFile(GALLERY_JSON_PATH);
  if (!file) return { sha: null, items: [] };
  try { return { sha: file.sha, items: JSON.parse(file.content) }; }
  catch { return { sha: file.sha, items: [] }; }
}

async function saveGallery(items, sha, message) {
  const contentBase64 = Buffer.from(JSON.stringify(items, null, 2)).toString('base64');
  return putFile(GALLERY_JSON_PATH, contentBase64, message, sha);
}

module.exports = async function handler(req, res) {
  const corsAllowed = applyCors(req, res);

  if (req.method === 'OPTIONS') {
    if (!corsAllowed) { res.status(403).end(); return; }
    res.status(204).end();
    return;
  }
  if (!corsAllowed) { res.status(403).json({ ok: false, error: 'Origine non autorisée' }); return; }
  if (req.method !== 'POST') { res.status(405).json({ ok: false, error: 'Méthode non autorisée' }); return; }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  body = body || {};
  const { action, password, sessionToken } = body;
  const ip = getClientIp(req);
  const sessionIsValid = verifyAdminSessionToken(sessionToken);

  if (!sessionIsValid) {
    if (sessionToken && !password) {
      res.status(401).json({ ok: false, error: 'Connexion mémorisée expirée ou invalide' });
      return;
    }
    if (await checkRateLimit(ip)) {
      res.status(429).json({ ok: false, error: 'Trop de tentatives. Réessayez dans quelques minutes.' });
      return;
    }
    if (!checkPassword(password)) {
      recordFailedAttempt(ip);
      res.status(401).json({ ok: false, error: 'Mot de passe incorrect' });
      return;
    }
    clearFailedAttempts(ip);
  }

  try {
    if (action === 'verify') {
      const response = { ok: true };
      if (!sessionIsValid && body.remember === true) response.sessionToken = createAdminSessionToken();
      res.status(200).json(response);
      return;
    }

    if (action === 'upload') {
      const title = normalizeTitle(body.title);
      const category = body.category;
      if (!title || !isValidCategory(category)) {
        res.status(400).json({ ok: false, error: 'Titre ou catégorie invalide' });
        return;
      }

      const parsedImage = parseImageDataUrl(body.image);
      if (parsedImage.error) {
        res.status(400).json({ ok: false, error: parsedImage.error });
        return;
      }

      const id = Date.now();
      const filename = `${id}.${parsedImage.ext}`;
      const imagePath = `${GALLERY_IMAGES_DIR}/${filename}`;
      await putFile(imagePath, parsedImage.base64Data, `Ajout photo galerie : ${title}`);

      const { sha, items } = await loadGallery();
      const url = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${BRANCH}/${imagePath}`;
      const newPhoto = { id, url, title, category };
      items.unshift(newPhoto);
      await saveGallery(items, sha, `Ajout photo galerie : ${title}`);

      res.status(200).json({ ok: true, photo: newPhoto });
      return;
    }

    if (action === 'delete') {
      const { id } = body;
      if (!isValidId(id)) { res.status(400).json({ ok: false, error: 'Identifiant invalide' }); return; }

      const { sha, items } = await loadGallery();
      const photo = items.find(p => p.id === id);
      const remaining = items.filter(p => p.id !== id);
      await saveGallery(remaining, sha, `Suppression photo galerie #${id}`);

      if (photo && photo.url) {
        const marker = `/${BRANCH}/`;
        const idx = photo.url.indexOf(marker);
        const path = idx !== -1 ? photo.url.slice(idx + marker.length) : null;
        if (path && path.startsWith(`${GALLERY_IMAGES_DIR}/`)) {
          const file = await getFile(path);
          if (file) await deleteFile(path, `Suppression fichier photo #${id}`, file.sha);
        }
      }
      res.status(200).json({ ok: true });
      return;
    }

    if (action === 'rename') {
      const { id } = body;
      const title = normalizeTitle(body.title);
      if (!isValidId(id) || !title) { res.status(400).json({ ok: false, error: 'Identifiant ou titre invalide' }); return; }

      const { sha, items } = await loadGallery();
      const photo = items.find(p => p.id === id);
      if (!photo) { res.status(404).json({ ok: false, error: 'Photo introuvable' }); return; }
      photo.title = title;
      await saveGallery(items, sha, `Renommage photo #${id}`);
      res.status(200).json({ ok: true });
      return;
    }

    if (action === 'recategorize') {
      const { id, category } = body;
      if (!isValidId(id) || !isValidCategory(category)) {
        res.status(400).json({ ok: false, error: 'Identifiant ou catégorie invalide' });
        return;
      }

      const { sha, items } = await loadGallery();
      const photo = items.find(p => p.id === id);
      if (!photo) { res.status(404).json({ ok: false, error: 'Photo introuvable' }); return; }
      photo.category = category;
      await saveGallery(items, sha, `Recatégorisation photo #${id}`);
      res.status(200).json({ ok: true });
      return;
    }

    if (action === 'reorder') {
      const { order } = body;
      const validOrder = Array.isArray(order) &&
        order.length <= MAX_REORDER_ITEMS &&
        order.every(isValidId) &&
        new Set(order).size === order.length;
      if (!validOrder) { res.status(400).json({ ok: false, error: 'Ordre invalide' }); return; }

      const { sha, items } = await loadGallery();
      const byId = new Map(items.map(p => [p.id, p]));
      const reordered = order.map(id => byId.get(id)).filter(Boolean);
      items.forEach(p => { if (!order.includes(p.id)) reordered.push(p); });
      await saveGallery(reordered, sha, 'Réordonnancement galerie');
      res.status(200).json({ ok: true });
      return;
    }

    res.status(400).json({ ok: false, error: 'Action inconnue' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message || 'Erreur serveur' });
  }
};
