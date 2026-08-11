// api/gallery.js
//
// Endpoint serverless pour la galerie photo du Bridge Club Roy René.
// Le mot de passe admin ET le token GitHub restent CÔTÉ SERVEUR en permanence :
// aucun des deux n'est jamais envoyé au navigateur, contrairement à l'ancien
// système où le hash du mot de passe (et un éventuel token) vivaient dans le HTML.
//
// Variables d'environnement à configurer sur Vercel (Project Settings > Environment Variables) :
//   GITHUB_TOKEN        Fine-grained PAT, scope "Contents: Read and write" sur le repo cible UNIQUEMENT
//   GITHUB_OWNER        ex: "capgui13"
//   GITHUB_REPO         ex: "capgui13.github.io"
//   GITHUB_BRANCH       ex: "main" (optionnel, défaut "main")
//   GALLERY_JSON_PATH   ex: "gallery/gallery.json" (optionnel, valeur par défaut ci-dessous)
//   GALLERY_IMAGES_DIR  ex: "gallery/images" (optionnel, valeur par défaut ci-dessous)
//   ADMIN_PASSWORD      mot de passe en clair choisi par toi (jamais commité dans le code)

const crypto = require('crypto');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER;
const GITHUB_REPO = process.env.GITHUB_REPO;
const BRANCH = process.env.GITHUB_BRANCH || 'main';
const GALLERY_JSON_PATH = process.env.GALLERY_JSON_PATH || 'gallery/gallery.json';
const GALLERY_IMAGES_DIR = process.env.GALLERY_IMAGES_DIR || 'gallery/images';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// === Anti brute-force (protection best-effort en mémoire) ===
// Vit tant que l'instance serverless reste "chaude" ; repart à zéro sur une
// instance froide. Suffisant pour décourager un script qui teste des mots de
// passe en boucle, sans dépendance externe (Redis/KV).
const failedAttempts = new Map(); // ip -> { count, lastAttempt }
const MAX_ATTEMPTS_BEFORE_LOCKOUT = 8;
const LOCKOUT_MS = 5 * 60 * 1000; // 5 minutes de blocage après trop d'échecs

function getClientIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  if (fwd) return fwd.split(',')[0].trim();
  return req.socket?.remoteAddress || 'unknown';
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Retourne true si la requête doit être bloquée (trop de tentatives récentes)
async function checkRateLimit(ip) {
  const entry = failedAttempts.get(ip);
  if (!entry) return false;

  const elapsed = Date.now() - entry.lastAttempt;
  if (entry.count >= MAX_ATTEMPTS_BEFORE_LOCKOUT && elapsed < LOCKOUT_MS) {
    return true; // bloqué
  }
  if (elapsed >= LOCKOUT_MS) {
    failedAttempts.delete(ip); // le blocage a expiré, on repart de zéro
    return false;
  }

  // Délai croissant : 500ms, 1s, 1.5s... plafonné à 5s
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

// Comparaison en temps constant pour éviter les attaques par timing
function checkPassword(password) {
  if (!ADMIN_PASSWORD || typeof password !== 'string') return false;
  const a = Buffer.from(password);
  const b = Buffer.from(ADMIN_PASSWORD);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

async function ghFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github+json',
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  return res;
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
  try {
    return { sha: file.sha, items: JSON.parse(file.content) };
  } catch {
    return { sha: file.sha, items: [] };
  }
}

async function saveGallery(items, sha, message) {
  const contentBase64 = Buffer.from(JSON.stringify(items, null, 2)).toString('base64');
  return putFile(GALLERY_JSON_PATH, contentBase64, message, sha);
}

module.exports = async function handler(req, res) {
  // Autoriser les appels depuis le site (domaines différents = CORS nécessaire).
  // On pourrait restreindre à ton domaine précis, mais '*' suffit ici puisque
  // l'endpoint est de toute façon protégé par le mot de passe côté serveur.
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'Méthode non autorisée' });
    return;
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  body = body || {};
  const { action, password } = body;

  const ip = getClientIp(req);

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

  try {
    if (action === 'verify') {
      res.status(200).json({ ok: true });
      return;
    }

    if (action === 'upload') {
      const { image, title, category } = body;
      if (!image || !title || !category) {
        res.status(400).json({ ok: false, error: 'Champs manquants' });
        return;
      }
      const match = /^data:(image\/[a-zA-Z+]+);base64,(.+)$/.exec(image);
      if (!match) {
        res.status(400).json({ ok: false, error: 'Format d\'image invalide' });
        return;
      }
      const ext = MIME_EXT[match[1]] || 'jpg';
      const base64Data = match[2];
      const id = Date.now();
      const filename = `${id}.${ext}`;
      const imagePath = `${GALLERY_IMAGES_DIR}/${filename}`;

      await putFile(imagePath, base64Data, `Ajout photo galerie : ${title}`);

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
      const { sha, items } = await loadGallery();
      const photo = items.find(p => p.id === id);
      const remaining = items.filter(p => p.id !== id);
      await saveGallery(remaining, sha, `Suppression photo galerie #${id}`);

      if (photo && photo.url) {
        const marker = `/${BRANCH}/`;
        const idx = photo.url.indexOf(marker);
        const path = idx !== -1 ? photo.url.slice(idx + marker.length) : null;
        if (path) {
          const file = await getFile(path);
          if (file) await deleteFile(path, `Suppression fichier photo #${id}`, file.sha);
        }
      }
      res.status(200).json({ ok: true });
      return;
    }

    if (action === 'rename') {
      const { id, title } = body;
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
      if (!Array.isArray(order)) { res.status(400).json({ ok: false, error: 'order manquant' }); return; }
      const { sha, items } = await loadGallery();
      const byId = new Map(items.map(p => [p.id, p]));
      const reordered = order.map(id => byId.get(id)).filter(Boolean);
      items.forEach(p => { if (!order.includes(p.id)) reordered.push(p); }); // sécurité anti-perte
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
