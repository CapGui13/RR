// === API GALERIE (fonction serverless — le mot de passe et le token GitHub
        // sont vérifiés/utilisés côté serveur uniquement, jamais exposés ici) ===
        // ⚠️ À ajuster : URL de l'endpoint déployé sur ton projet Vercel api-gen
        const GALLERY_API_URL = 'https://rr-gallery-beta.vercel.app/api/gallery';
        // Manifeste public servi par le même domaine que le site
        const GALLERY_JSON_URL = '/gallery/gallery.json';

        // === GALLERY DATA ===
        let galleryImages = [];
        // Auth admin : le mot de passe n'est gardé qu'en mémoire pour la session courante.
        // Si l'utilisateur choisit « Mémoriser », seul un jeton signé sans expiration automatique est persisté.
        const ADMIN_SESSION_STORAGE_KEY = 'rrGalleryAdminSessionToken';
        let adminPassword = null;
        let adminSessionToken = null;

        // Charger la galerie publique depuis le manifeste local du site
        async function loadGalleryPublic() {
            try {
                const res = await fetch(GALLERY_JSON_URL + '?t=' + Date.now(), { cache: 'no-store' });
                if (!res.ok) throw new Error('HTTP ' + res.status);
                galleryImages = await res.json();
            } catch (e) {
                console.error('Erreur chargement galerie :', e);
                galleryImages = [];
            }
        }

        // Appel générique à l'API galerie (toute écriture passe par le serveur)
        function getAdminAuthPayload() {
            if (adminSessionToken) return { sessionToken: adminSessionToken };
            return { password: adminPassword };
        }

        async function galleryApiCall(payload) {
            const res = await fetch(GALLERY_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...payload, ...getAdminAuthPayload() })
            });
            let data;
            try { data = await res.json(); } catch { data = {}; }
            if (!res.ok || !data.ok) {
                throw new Error(data.error || ('HTTP ' + res.status));
            }
            return data;
        }

        let currentLightboxIndex = 0;
        let filteredImages = [];
        let currentUploadFile = null;
        let isAdminLoggedIn = false;

        // === ADMIN FUNCTIONS ===
        function getRememberedAdminToken() {
            try { return localStorage.getItem(ADMIN_SESSION_STORAGE_KEY); }
            catch { return null; }
        }

        function saveRememberedAdminToken(token) {
            try { localStorage.setItem(ADMIN_SESSION_STORAGE_KEY, token); return true; }
            catch { return false; }
        }

        function clearRememberedAdminToken() {
            try { localStorage.removeItem(ADMIN_SESSION_STORAGE_KEY); } catch {}
        }

        function updateRememberedAdminUi() {
            const token = getRememberedAdminToken();
            const remember = document.getElementById('adminRememberDevice');
            const forget = document.getElementById('adminForgetDevice');
            const status = document.getElementById('adminRememberStatus');
            const loginBtn = document.querySelector('.admin-btn-login');
            const pwdInput = document.getElementById('adminPassword');

            if (remember) remember.checked = Boolean(token);
            if (forget) forget.style.display = token ? 'inline-block' : 'none';
            if (status) status.style.display = token ? 'block' : 'none';
            if (loginBtn) loginBtn.textContent = token ? 'Se reconnecter' : 'Se connecter';
            if (pwdInput) pwdInput.placeholder = token ? 'Mot de passe (facultatif)' : 'Mot de passe';
        }

        function forgetAdminDevice() {
            clearRememberedAdminToken();
            adminSessionToken = null;
            updateRememberedAdminUi();
            const pwdInput = document.getElementById('adminPassword');
            if (pwdInput) pwdInput.focus();
            showSuccessMessage('Connexion mémorisée supprimée de cet appareil.');
        }

        function resetAdminUiToLogin() {
            const login = document.getElementById('adminLogin');
            const dashboard = document.getElementById('adminDashboard');
            if (login) login.style.display = 'block';
            if (dashboard) dashboard.style.display = 'none';
            isAdminLoggedIn = false;
            adminPassword = null;
            adminSessionToken = null;
            cancelUpload();
            updateRememberedAdminUi();
        }

        function logoutAdmin() {
            resetAdminUiToLogin();
            showSuccessMessage('✓ Déconnexion réussie.');
        }

        function toggleAdminPassword() {
            var input = document.getElementById('adminPassword');
            var btn = document.getElementById('adminEyeBtn');
            if (input.type === 'password') {
                input.type = 'text';
                btn.textContent = '🙈';
                btn.title = 'Masquer le mot de passe';
            } else {
                input.type = 'password';
                btn.textContent = '👁';
                btn.title = 'Afficher le mot de passe';
            }
        }


        const ADMIN_PANEL_HTML = `
    <div class="dropdown-overlay" id="adminPanel" role="dialog" aria-modal="true" aria-labelledby="admin-title" aria-hidden="true" inert>
        <div class="dropdown-modal admin-modal">
            <button type="button" class="close-btn" id="adminPanelCloseBtn" aria-label="Fermer">✕</button>
            <div class="admin-content">
                <h2 class="admin-title" id="admin-title">🔒 Administration - Galerie Photos</h2>
                <div id="adminLogin" class="admin-section">
                    <p class="admin-subtitle">Entrez le mot de passe pour gérer les photos</p>
                    <div class="admin-login-form"><div class="admin-password-wrap"><input type="password" id="adminPassword" placeholder="Mot de passe" autocomplete="current-password"><button type="button" class="admin-eye-btn" id="adminEyeBtn" title="Afficher/masquer le mot de passe" aria-label="Afficher le mot de passe">👁</button></div><button type="button" id="adminLoginBtn" class="admin-btn-login">Se connecter</button></div>
                    <div class="admin-remember-row"><label class="admin-remember-label"><input type="checkbox" id="adminRememberDevice"><span>Mémoriser cette connexion sur cet appareil</span></label><button type="button" id="adminForgetDevice" class="admin-forget-btn admin-hidden-inline">Oublier cet appareil</button></div>
                    <p id="adminRememberStatus" class="admin-remember-status admin-hidden-inline">✓ Connexion mémorisée sans expiration — le mot de passe n'est pas stocké dans le navigateur.</p>
                </div>
                <div id="adminDashboard" class="admin-hidden-inline">
                    <div class="admin-dashboard-bar"><button type="button" id="adminLogoutBtn" class="admin-btn-logout">↪ Déconnexion</button></div>
                    <div class="admin-tabs"><button type="button" class="admin-tab active" data-admin-tab="upload">📤 Ajouter des photos</button><button type="button" class="admin-tab" data-admin-tab="manage">📋 Gérer les photos</button></div>
                    <div id="uploadTab" class="admin-tab-content">
                        <div class="upload-zone" id="uploadZone"><div class="upload-icon">📸</div><p class="upload-text">Glissez-déposez vos photos ici</p><p class="upload-subtext">ou cliquez pour sélectionner</p><input type="file" id="fileInput" accept="image/*" multiple class="admin-hidden-inline"></div>
                        <div id="uploadPreview" class="upload-preview"></div>
                        <div id="uploadForm" class="admin-hidden-inline"><h3>Détails de la photo</h3><input type="text" id="photoTitle" placeholder="Titre de la photo *" class="admin-input"><select id="photoCategory" class="admin-input"><option value="">-- Choisir une catégorie --</option><option value="salle">La Salle</option><option value="tournois">Tournois</option><option value="cours">Cours</option><option value="events">Événements</option></select><div class="admin-actions"><button type="button" id="publishPhotoBtn" class="admin-btn-publish">✓ Publier</button><button type="button" id="cancelUploadBtn" class="admin-btn-cancel">✕ Annuler</button></div></div>
                    </div>
                    <div id="manageTab" class="admin-tab-content admin-hidden-inline"><div class="admin-photos-list" id="adminPhotosList"></div></div>
                </div>
            </div>
        </div>
    </div>`;

        function bindAdminUiActions(panel) {
            if (!panel || panel.dataset.bound === 'true') return;
            panel.dataset.bound = 'true';
            const closeBtn = panel.querySelector('#adminPanelCloseBtn');
            if (closeBtn) closeBtn.addEventListener('click', function() {
                const scrollTopBtn = document.getElementById('modalScrollTop');
                if (scrollTopBtn) scrollTopBtn.classList.remove('visible');
                toggleOverlay('adminPanel');
            });
            const adminModal = panel.querySelector('.dropdown-modal');
            const scrollTopBtn = document.getElementById('modalScrollTop');
            if (adminModal && scrollTopBtn) adminModal.addEventListener('scroll', function() { scrollTopBtn.classList.toggle('visible', adminModal.scrollTop > 80); }, { passive: true });
            const adminEyeBtn = panel.querySelector('#adminEyeBtn'); if (adminEyeBtn) adminEyeBtn.addEventListener('click', toggleAdminPassword);
            const adminLoginBtn = panel.querySelector('#adminLoginBtn'); if (adminLoginBtn) adminLoginBtn.addEventListener('click', loginAdmin);
            const adminPasswordInput = panel.querySelector('#adminPassword'); if (adminPasswordInput) adminPasswordInput.addEventListener('keydown', function(event) { if (event.key === 'Enter') { event.preventDefault(); loginAdmin(); } });
            const forgetBtn = panel.querySelector('#adminForgetDevice'); if (forgetBtn) forgetBtn.addEventListener('click', forgetAdminDevice);
            const logoutBtn = panel.querySelector('#adminLogoutBtn'); if (logoutBtn) logoutBtn.addEventListener('click', logoutAdmin);
            panel.querySelectorAll('.admin-tab[data-admin-tab]').forEach((btn) => btn.addEventListener('click', function(event) { switchAdminTab(event, btn.getAttribute('data-admin-tab')); }));
            const publishBtn = panel.querySelector('#publishPhotoBtn'); if (publishBtn) publishBtn.addEventListener('click', publishPhoto);
            const cancelBtn = panel.querySelector('#cancelUploadBtn'); if (cancelBtn) cancelBtn.addEventListener('click', cancelUpload);
        }

        function ensureAdminPanel() {
            let panel = document.getElementById('adminPanel');
            if (panel) return panel;
            document.body.insertAdjacentHTML('beforeend', ADMIN_PANEL_HTML);
            panel = document.getElementById('adminPanel');
            if (!panel) throw new Error('Impossible de créer le panneau d’administration.');
            bindAdminUiActions(panel);
            initUploadListeners();
            updateRememberedAdminUi();
            return panel;
        }

        function openAdmin() {
            ensureAdminPanel();
            updateRememberedAdminUi();
            toggleOverlay('adminPanel');
            setTimeout(function() {
                const token = getRememberedAdminToken();
                const target = token ? document.querySelector('.admin-btn-login') : document.getElementById('adminPassword');
                if (target) target.focus();
            }, 150);
        }

        async function loginAdmin() {
            const pwdInput = document.getElementById('adminPassword');
            const rememberInput = document.getElementById('adminRememberDevice');
            const password = pwdInput ? pwdInput.value : '';
            const rememberedToken = getRememberedAdminToken();
            const useRememberedToken = !password && Boolean(rememberedToken);
            const loginBtn = document.querySelector('.admin-btn-login');

            if (!password && !rememberedToken) {
                alert('❌ Entrez le mot de passe administrateur.');
                if (pwdInput) pwdInput.focus();
                return;
            }

            if (loginBtn) { loginBtn.disabled = true; loginBtn.textContent = 'Vérification…'; }
            try {
                const requestBody = useRememberedToken
                    ? { action: 'verify', sessionToken: rememberedToken }
                    : { action: 'verify', password, remember: Boolean(rememberInput && rememberInput.checked) };

                const res = await fetch(GALLERY_API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(requestBody)
                });
                const data = await res.json().catch(() => ({}));
                if (!res.ok || !data.ok) throw new Error(data.error || 'Mot de passe incorrect');

                if (useRememberedToken) {
                    adminSessionToken = rememberedToken;
                    adminPassword = null;
                } else if (data.sessionToken && rememberInput && rememberInput.checked) {
                    adminSessionToken = data.sessionToken;
                    adminPassword = null;
                    saveRememberedAdminToken(data.sessionToken);
                    if (pwdInput) pwdInput.value = '';
                } else {
                    adminPassword = password;
                    adminSessionToken = null;
                    if (rememberInput && !rememberInput.checked) clearRememberedAdminToken();
                }

                isAdminLoggedIn = true;
                document.getElementById('adminLogin').style.display = 'none';
                document.getElementById('adminDashboard').style.display = 'block';
                updateAdminPhotosList();
                showSuccessMessage('✓ Connexion réussie !');
            } catch (e) {
                if (useRememberedToken) {
                    clearRememberedAdminToken();
                    adminSessionToken = null;
                    updateRememberedAdminUi();
                }
                alert('❌ ' + (e.message || 'Connexion impossible'));
            } finally {
                if (loginBtn) loginBtn.disabled = false;
                updateRememberedAdminUi();
            }
        }

        function switchAdminTab(event, tab) {
            document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
            event.target.classList.add('active');

            document.getElementById('uploadTab').style.display = tab === 'upload' ? 'block' : 'none';
            document.getElementById('manageTab').style.display = tab === 'manage' ? 'block' : 'none';

            if (tab === 'manage') {
                updateAdminPhotosList();
            }
        }

        function bindGalleryUiActions() {
            document.querySelectorAll('.gallery-filters [data-filter]').forEach((btn) => { btn.addEventListener('click', function() { filterGallery(btn.getAttribute('data-filter'), btn); }); });
            const adminOpenBtn = document.querySelector('[data-admin-open]'); if (adminOpenBtn) adminOpenBtn.addEventListener('click', openAdmin);
            const lightboxCloseBtn = document.getElementById('lightboxCloseBtn'); if (lightboxCloseBtn) lightboxCloseBtn.addEventListener('click', closeLightbox);
            const lightboxPrevBtn = document.getElementById('lightboxPrevBtn'); if (lightboxPrevBtn) lightboxPrevBtn.addEventListener('click', function() { navigateLightbox(-1); });
            const lightboxNextBtn = document.getElementById('lightboxNextBtn'); if (lightboxNextBtn) lightboxNextBtn.addEventListener('click', function() { navigateLightbox(1); });
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', bindGalleryUiActions);
        } else {
            bindGalleryUiActions();
        }

        // === UPLOAD FUNCTIONS ===
        // Initialisé au DOMContentLoaded pour éviter les null sur les éléments de la modale
        let uploadZone = null;
        let fileInput = null;
        function initUploadListeners() {
            updateRememberedAdminUi();
            uploadZone = document.getElementById('uploadZone');
            fileInput = document.getElementById('fileInput');
            if (!uploadZone || !fileInput) return;
            uploadZone.addEventListener('click', () => fileInput.click());
            uploadZone.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadZone.classList.add('dragover');
            });
            uploadZone.addEventListener('dragleave', () => {
                uploadZone.classList.remove('dragover');
            });
            uploadZone.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadZone.classList.remove('dragover');
                handleFiles(e.dataTransfer.files);
            });
            fileInput.addEventListener('change', (e) => {
                handleFiles(e.target.files);
            });
        }

        function handleFiles(files) {
            if (files.length === 0) return;

            const file = files[0];
            if (!file.type.startsWith('image/')) {
                alert('Veuillez sélectionner une image');
                return;
            }

            currentUploadFile = file;
            const reader = new FileReader();

            reader.onload = (e) => {
                document.getElementById('uploadPreview').innerHTML = `
                    <div class="preview-item">
                        <img src="${e.target.result}" alt="Preview">
                    </div>
                `;
                document.getElementById('uploadForm').style.display = 'block';
                document.getElementById('photoTitle').value = file.name.replace(/\.[^/.]+$/, "");
            };

            reader.readAsDataURL(file);
        }

        function publishPhoto() {
            const title = document.getElementById('photoTitle').value;
            const category = document.getElementById('photoCategory').value;

            if (!title || !category) {
                alert('Veuillez remplir tous les champs');
                return;
            }

            const publishBtn = document.querySelector('.admin-btn-publish');
            if (publishBtn) { publishBtn.disabled = true; publishBtn.textContent = 'Publication…'; }

            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    // e.target.result est un data URL base64 — envoyé au serveur qui
                    // committe le fichier + met à jour gallery.json via l'API GitHub.
                    const { photo } = await galleryApiCall({
                        action: 'upload',
                        image: e.target.result,
                        title,
                        category
                    });

                    galleryImages.unshift(photo);
                    showSuccessMessage('✓ Photo publiée avec succès !');
                    cancelUpload();
                    filterGallery('all', document.querySelector('.filter-btn.active') || null);
                    updateAdminPhotosList();
                } catch (err) {
                    console.error('Erreur publication photo :', err);
                    alert('❌ Échec de la publication : ' + err.message);
                } finally {
                    if (publishBtn) { publishBtn.disabled = false; publishBtn.textContent = '✓ Publier'; }
                }
            };

            reader.readAsDataURL(currentUploadFile);
        }

        function cancelUpload() {
            document.getElementById('uploadPreview').innerHTML = '';
            document.getElementById('uploadForm').style.display = 'none';
            document.getElementById('photoTitle').value = '';
            document.getElementById('photoCategory').value = '';
            if (fileInput) fileInput.value = '';
            currentUploadFile = null;
        }

        function updateAdminPhotosList() {
            const list = document.getElementById('adminPhotosList');
            list.innerHTML = '';

            if (galleryImages.length === 0) {
                list.innerHTML = '<p style="text-align: center; color: #888;">Aucune photo pour le moment</p>';
                return;
            }

            galleryImages.forEach((photo, index) => {
                const card = document.createElement('div');
                card.className = 'admin-photo-card';
                card.setAttribute('draggable', 'true');
                card.setAttribute('data-id', photo.id);
                card.style.cursor = 'grab';

                const catOptions = ['salle','tournois','cours','events'].map(c => {
                    const labels = {salle:'La Salle', tournois:'Tournois', cours:'Cours', events:'Événements'};
                    return `<option value="${c}" ${photo.category===c?'selected':''}>${labels[c]}</option>`;
                }).join('');

                card.innerHTML =
                    '<div style="text-align:center;font-size:20px;color:#aaa;padding:4px 0;cursor:grab;user-select:none;" title="Glisser pour réordonner">⠿</div>' +
                    '<img src="' + photo.url + '" alt="' + escapeHtml(photo.title) + '">' +
                    '<div class="admin-photo-info">' +
                    '<input type="text" value="' + escapeHtml(photo.title) + '" data-id="' + photo.id + '" ' +
                    'style="width:100%;padding:4px 6px;border:1px solid #555;border-radius:4px;background:#2a2a2a;color:#fff;font-size:13px;margin-bottom:4px;user-select:text;-webkit-user-select:text;" ' +
                    'title="Cliquer pour modifier le nom">' +
                    '<select data-id="' + photo.id + '" ' +
                    'style="width:100%;padding:4px 6px;border:1px solid #555;border-radius:4px;background:#2a2a2a;color:#fff;font-size:13px;margin-bottom:6px;">' +
                    catOptions +
                    '</select>' +
                    '<button class="admin-photo-delete" data-id="' + photo.id + '">\u{1F5D1}\uFE0F Supprimer</button>' +
                    '</div>';

                // Rename on input blur + fix text selection (disable drag while editing)
                const titleInput = card.querySelector('input[type=text]');
                titleInput.addEventListener('change', function() {
                    renamePhoto(parseInt(this.dataset.id), this.value);
                });
                titleInput.addEventListener('mousedown', function(e) { e.stopPropagation(); });
                titleInput.addEventListener('focus', function() { card.setAttribute('draggable', 'false'); });
                titleInput.addEventListener('blur', function() { card.setAttribute('draggable', 'true'); });
                // Recategorize on select change
                card.querySelector('select').addEventListener('change', function() {
                    recategorizePhoto(parseInt(this.dataset.id), this.value);
                });
                // Delete
                card.querySelector('.admin-photo-delete').addEventListener('click', function() {
                    deletePhoto(parseInt(this.dataset.id));
                });

                // Drag & drop pour réordonner
                card.addEventListener('dragstart', (e) => {
                    e.dataTransfer.setData('text/plain', String(photo.id));
                    setTimeout(() => { card.style.opacity = '0.4'; }, 0);
                });
                card.addEventListener('dragend', () => { card.style.opacity = '1'; });
                card.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    card.style.outline = '2px dashed #7c9e7c';
                });
                card.addEventListener('dragleave', () => { card.style.outline = ''; });
                card.addEventListener('drop', (e) => {
                    e.preventDefault();
                    card.style.outline = '';
                    const draggedId = parseInt(e.dataTransfer.getData('text/plain'));
                    const targetId = photo.id;
                    if (draggedId === targetId) return;
                    const previousOrder = galleryImages.map(p => p.id);
                    const draggedIndex = galleryImages.findIndex(p => p.id === draggedId);
                    const targetIndex = galleryImages.findIndex(p => p.id === targetId);
                    const moved = galleryImages.splice(draggedIndex, 1)[0];
                    galleryImages.splice(targetIndex, 0, moved);
                    updateAdminPhotosList();
                    initGallery();
                    galleryApiCall({ action: 'reorder', order: galleryImages.map(p => p.id) })
                        .then(() => showSuccessMessage('\u2713 Ordre mis \u00e0 jour'))
                        .catch(err => {
                            console.error('Erreur réordonnancement galerie :', err);
                            alert('❌ Échec de la mise à jour de l\'ordre : ' + err.message);
                            // rollback à l'ordre précédent
                            galleryImages.sort((a, b) => previousOrder.indexOf(a.id) - previousOrder.indexOf(b.id));
                            updateAdminPhotosList();
                            initGallery();
                        });
                });

                list.appendChild(card);
            });
        }

        async function renamePhoto(id, newTitle) {
            const photo = galleryImages.find(p => p.id === id);
            if (!photo) return;
            const previousTitle = photo.title;
            photo.title = newTitle; // mise à jour optimiste
            try {
                await galleryApiCall({ action: 'rename', id, title: newTitle });
                initGallery();
                showSuccessMessage('\u2713 Nom mis \u00e0 jour');
            } catch (err) {
                photo.title = previousTitle; // rollback si l'écriture échoue
                console.error('Erreur renommage photo :', err);
                alert('❌ Échec de la mise à jour du nom : ' + err.message);
                updateAdminPhotosList();
            }
        }

        async function recategorizePhoto(id, newCategory) {
            const photo = galleryImages.find(p => p.id === id);
            if (!photo) return;
            const previousCategory = photo.category;
            photo.category = newCategory; // mise à jour optimiste
            try {
                await galleryApiCall({ action: 'recategorize', id, category: newCategory });
                initGallery();
                showSuccessMessage('\u2713 Cat\u00e9gorie mise \u00e0 jour');
            } catch (err) {
                photo.category = previousCategory; // rollback si l'écriture échoue
                console.error('Erreur recatégorisation photo :', err);
                alert('❌ Échec de la mise à jour de la catégorie : ' + err.message);
                updateAdminPhotosList();
            }
        }

        function escapeHtml(str) {
            return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
        }

        function getCategoryName(category) {
            const names = {
                'salle': 'La Salle',
                'tournois': 'Tournois',
                'cours': 'Cours',
                'events': 'Événements'
            };
            return names[category] || category;
        }

        async function deletePhoto(id) {
            if (!confirm('Êtes-vous sûr de vouloir supprimer cette photo ?')) return;

            const removed = galleryImages.find(photo => photo.id === id);
            const removedIndex = galleryImages.findIndex(photo => photo.id === id);
            galleryImages = galleryImages.filter(photo => photo.id !== id); // optimiste
            updateAdminPhotosList();
            initGallery();
            try {
                await galleryApiCall({ action: 'delete', id });
                showSuccessMessage('✓ Photo supprimée');
            } catch (err) {
                if (removed) galleryImages.splice(removedIndex, 0, removed); // rollback
                console.error('Erreur suppression photo :', err);
                alert('❌ Échec de la suppression : ' + err.message);
                updateAdminPhotosList();
                initGallery();
            }
        }

        // === GALLERY INITIALIZATION ===
        function initGallery() {
            const grid = document.getElementById('galleryGrid');

            grid.innerHTML = '';
            
            filteredImages.forEach((img, index) => {
                const item = document.createElement('div');
                item.className = 'gallery-item';
                item.setAttribute('data-category', img.category);
                item.setAttribute('role', 'button');
                item.setAttribute('tabindex', '0');
                item.setAttribute('aria-label', `Ouvrir la photo : ${img.title}`);
                item.onclick = () => openLightbox(index, item);
                item.onkeydown = (event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        openLightbox(index, item);
                    }
                };
                
                item.innerHTML = `
                    <img src="${escapeHtml(img.url)}" alt="${escapeHtml(img.title)}" loading="lazy" decoding="async">
                    <div class="gallery-item-overlay">
                        <p class="gallery-item-title">${escapeHtml(img.title)}</p>
                    </div>
                `;
                
                grid.appendChild(item);
            });
        }

        // === GALLERY FILTER ===
        function filterGallery(category, btnElement) {
            // Update active button
            document.querySelectorAll('.filter-btn:not(.admin-btn)').forEach(btn => {
                btn.classList.remove('active');
            });
            if (btnElement) {
                btnElement.classList.add('active');
            }
            
            // Filter images
            if (category === 'all') {
                filteredImages = [...galleryImages];
            } else {
                filteredImages = galleryImages.filter(img => img.category === category);
            }
            
            initGallery();
        }

        // === LIGHTBOX FUNCTIONS ===
        let _lightboxTrapCleanup = null;
        let _lightboxOpener = null;

        function openLightbox(index, opener) {
            currentLightboxIndex = index;
            updateLightbox();
            const lb = document.getElementById('lightbox');
            _lightboxOpener = opener || (document.activeElement instanceof HTMLElement ? document.activeElement : null);
            setModalA11yState(lb, true);
            lb.classList.remove('closing');
            lb.classList.add('active');
            lockScroll();
            setTimeout(() => { _lightboxTrapCleanup = trapFocus(lb); }, 50);
        }

        function closeLightbox() {
            const lb = document.getElementById('lightbox');
            lb.classList.remove('active');
            lb.classList.add('closing');
            setModalA11yState(lb, false);
            setTimeout(() => lb.classList.remove('closing'), 300);
            unlockScroll();
            if (_lightboxTrapCleanup) { _lightboxTrapCleanup(); _lightboxTrapCleanup = null; }
            const returnTarget = getFocusReturnTarget(_lightboxOpener, null);
            _lightboxOpener = null;
            if (returnTarget) returnTarget.focus({ preventScroll: true });
        }

        function navigateLightbox(direction) {
            currentLightboxIndex += direction;
            if (currentLightboxIndex < 0) currentLightboxIndex = filteredImages.length - 1;
            if (currentLightboxIndex >= filteredImages.length) currentLightboxIndex = 0;
            updateLightbox();
        }

        function updateLightbox() {
            const img = filteredImages[currentLightboxIndex];
            document.getElementById('lightboxImg').src = img.url;
            document.getElementById('lightboxCaption').textContent = img.title;
            document.getElementById('lightboxCounter').textContent = `${currentLightboxIndex + 1} / ${filteredImages.length}`;
        }

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            const lightbox = document.getElementById('lightbox');

            if (e.key === 'Escape') {
                // Lightbox en priorité
                if (lightbox && lightbox.classList.contains('active')) { closeLightbox(); return; }

                const welcomePopup = document.getElementById('welcomePopup');
                if (welcomePopup && welcomePopup.classList.contains('active')) { closePopup(); return; }

                // Fermer les overlays ouverts
                const overlayIds = ['tarifsDropdown', 'equipeDropdown', 'locationDropdown', 'galleryDropdown', 'adminPanel'];
                for (const id of overlayIds) {
                    const el = document.getElementById(id);
                    if (el && el.classList.contains('active')) { toggleOverlay(id); return; }
                }

                // Fermer le contact
                const contactModal = document.getElementById('contactModal');
                if (contactModal && contactModal.classList.contains('active')) { toggleContact(); return; }
                return;
            }

            if (!lightbox || !lightbox.classList.contains('active')) return;
            if (e.key === 'ArrowLeft')  navigateLightbox(-1);
            if (e.key === 'ArrowRight') navigateLightbox(1);
        });

        // Close lightbox on background click
        document.getElementById('lightbox').addEventListener('click', (e) => {
            if (e.target.id === 'lightbox') closeLightbox();
        });

        // Touch swipe for lightbox
        let _lbTouchStartX = 0;
        let _lbTouchStartY = 0;
        const _lbEl = document.getElementById('lightbox');
        _lbEl.addEventListener('touchstart', (e) => {
            _lbTouchStartX = e.touches[0].clientX;
            _lbTouchStartY = e.touches[0].clientY;
        }, { passive: true });
        _lbEl.addEventListener('touchend', (e) => {
            const dx = e.changedTouches[0].clientX - _lbTouchStartX;
            const dy = e.changedTouches[0].clientY - _lbTouchStartY;
            if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
                navigateLightbox(dx < 0 ? 1 : -1);
            }
        }, { passive: true });
