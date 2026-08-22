let _popupTrapCleanup = null;

        function closePopup() {
            var popup = document.getElementById('welcomePopup');
            if (!popup) return;
            popup.classList.remove('active');
            popup.classList.add('closing');
            if (_popupTrapCleanup) { _popupTrapCleanup(); _popupTrapCleanup = null; }
            setTimeout(function(){ if (popup.parentNode) popup.remove(); }, 300);
        }

        function showPopup() {
            var popup = document.getElementById('welcomePopup');
            if (!popup) return;
            popup.setAttribute('role', 'dialog');
            popup.setAttribute('aria-modal', 'true');
            popup.setAttribute('aria-label', 'Annonce du club');
            popup.style.display = 'flex';
            requestAnimationFrame(function() {
                requestAnimationFrame(function() {
                    popup.classList.add('active');
                    setTimeout(() => { _popupTrapCleanup = trapFocus(popup); }, 50);
                });
            });
        }

        // Popup désactivé
        // if (document.readyState === 'loading') {
        //     document.addEventListener('DOMContentLoaded', showPopup);
        // } else {
        //     showPopup();
        // }
    

        // Désactive la restauration native du scroll par le navigateur (mobile Safari/Chrome)
        if ('scrollRestoration' in history) {
            history.scrollRestoration = 'manual';
        }
        // Force le retour en haut au chargement et au refresh
        window.addEventListener('pageshow', function() {
            window.scrollTo(0, 0);
        });
    


document.getElementById('currentYear').textContent = new Date().getFullYear();

        // ================================================================
        // ╔══════════════════════════════════════════════════════════════╗
        // ║              CONFIGURATION DU SITE — À MODIFIER ICI         ║
        // ╚══════════════════════════════════════════════════════════════╝
        // Toutes les données du club sont ici. Inutile de chercher
        // ailleurs dans le code pour mettre à jour le site.
        // ================================================================

        const CONFIG = {

            // --- Informations générales ---
            club: {
                nom:       "Bridge Club Roy René",
                adresse:   "Boulevard du Maréchal Juin",
                codePostal:"13090",
                ville:     "Aix-en-Provence",
                tel:       "04 42 95 62 03",
                telHref:   "tel:+33442956203",
                // EMAIL EN CLAIR — ne pas laisser Cloudflare obfusquer cette ligne
                email:     "royrenebridge@gmail.com",
                facebook:  "https://www.facebook.com/profile.php?id=100008045747478",
                fondation: "Octobre 1967",
            },

            // --- Cours ---
            reprise: "15 Septembre 2025",

            enseignants: [
                {
                    nom: "Muriel Trouillez & Frédéric Le Gall",
                    cours: [
                        { niveau: "Débutants",    horaires: [{ jour: "Lundi",    heure: "10 h à 12 h" }, { jour: "Jeudi",     heure: "18 h à 20 h" }] },
                        { niveau: "2ème année",   horaires: [{ jour: "Lundi",    heure: "18 h à 20 h" }, { jour: "Mercredi",  heure: "10 h à 12 h" }] },
                        { niveau: "3ème année",   horaires: [{ jour: "Vendredi", heure: "10 h à 12 h" }] },
                    ]
                },
                {
                    nom: "William Audibert",
                    cours: [
                        { niveau: "Perfectionnement 1", horaires: [{ jour: "Lundi",    heure: "10 h à 12 h" }] },
                        { niveau: "Perfectionnement 2", horaires: [{ jour: "Mercredi", heure: "10 h à 12 h" }] },
                    ]
                },
            ],

            // --- Tournois ---
            rondesDeFrance: {
                heure: "14 H 30",
                jours: "Lundi, Mercredi, Vendredi",
                inscriptionsUrl: "https://www.ffbridge.fr/competitions/entries?competitionType=club&page=1&itemsPerPage=80&clubId=1302",
            },

            // Mettre passed:true pour barrer une date
            coupeDesClubs: [
                { date: "08/10", passed: true  },
                { date: "22/10", passed: true  },
                { date: "12/11", passed: true  },
                { date: "19/11", passed: true  },
                { date: "10/12", passed: true  },
                { date: "11/12", passed: true  },
                { date: "21/01", passed: true  },
                { date: "18/02", passed: true  },
                { date: "11/03", passed: true  },
                { date: "25/03", passed: true  },
                { date: "08/04", passed: true  },
                { date: "22/04", passed: false, prochain: true },
                { date: "06/05", passed: false },
                { date: "13/05", passed: false },
                { date: "20/06", passed: false, finale: true  },
            ],

            coupeDeProvence: [
                { date: "26/11", passed: true  },
                { date: "28/01", passed: true  },
                { date: "25/02", passed: true  },
                { date: "18/03", passed: true  },
                { date: "29/04", passed: false, prochain: true },
                { date: "27/05", passed: false },
                { date: "24/06", passed: false, finale: true  },
            ],

            // --- Actualités ---
            actualites: [
                {
                    dateAffichee: "Vendredi 17 Avril 2026",
                    dateTri:      "17/04",
                    description:  "Tournoi Tutorat suivi d'un apéritif.",
                },
                {
                    dateAffichee: "Vendredi 1er Mai 2026",
                    dateTri:      "01/05",
                    description:  "Tournoi le matin à 10h — Paëlla — Tournoi l'après-midi à 14h30.",
                    note:         "Gratuit pour les membres du club.",
                },
                {
                    dateAffichee: "11 & 12 Juin 2026 — Voyage de fin d'année",
                    dateTri:      "11/06",
                    description:  "Escapade dans les Alpilles.",
                },
            ],

            // --- Tarifs ---
            tarifs: {
                licenceFFB:         "41€",
                cotisationIndiv:    "50€",
                cotisationCouple:   "85€",
                droitTableMembre:   "6€",
                carnetMembre:       "60€",  // carnet de 11
                droitTableNonMembre:"8€",
                carnetNonMembre:    "80€",  // carnet de 11
            },

            // --- Équipe ---
            equipe: {
                electionDate: "29 Septembre 2025",
                bureau: [
                    { role: "Président",       nom: "Jean-Michel Huc de Bat" },
                    { role: "Vice-Présidente", nom: "Marie-José Maître"       },
                    { role: "Secrétaire",      nom: "Frédéric Le Gall"        },
                    { role: "Trésorier",       nom: "Gaël Aizier"             },
                ],
                ca: [
                    "Dominique Bourdelet",
                    "Yann Briancourt",
                    "Martine Caille",
                    "Guillaume Capron",
                    "Hélène Gonzales",
                    "Muriel Trouillez",
                ],
                ethique: {
                    president: "Gaël Aizier",
                    membres: ["Lucile Blin", "Bernard Zocco"],
                },
            },
        };
    

        // === SCROLL-TO-TOP IN MODALS ===
        (function() {
            const scrollTopBtn = document.getElementById('modalScrollTop');
            if (!scrollTopBtn) return;

            // Scrollable containers to watch
            const scrollableSelectors = [
                '.dropdown-modal',
                '.contact-modal-content'
            ];

            function checkScroll(el) {
                if (el.scrollTop > 80) {
                    scrollTopBtn.classList.add('visible');
                } else {
                    scrollTopBtn.classList.remove('visible');
                }
            }

            scrollableSelectors.forEach(sel => {
                document.querySelectorAll(sel).forEach(el => {
                    el.addEventListener('scroll', () => checkScroll(el), { passive: true });
                });
            });

            scrollTopBtn.addEventListener('click', () => {
                // Find the visible scrollable container
                scrollableSelectors.forEach(sel => {
                    document.querySelectorAll(sel).forEach(el => {
                        if (el.scrollTop > 0) {
                            el.scrollTo({ top: 0, behavior: 'smooth' });
                        }
                    });
                });
            });

            // Hide button when all modals close
            const observer = new MutationObserver(() => {
                const anyActive = document.querySelector('.dropdown-overlay.active, .contact-modal.active');
                if (!anyActive) scrollTopBtn.classList.remove('visible');
            });
            document.querySelectorAll('.dropdown-overlay, .contact-modal').forEach(el => {
                observer.observe(el, { attributes: true, attributeFilter: ['class'] });
            });
        })();

        // === DATE UTILITIES ===
        function formatDate(dateStr) {
            const [day, month] = dateStr.split('/');
            const today = new Date();
            const currentMonth = today.getMonth();
            const currentYear = today.getFullYear();

            let dateYear = currentYear;
            if (currentMonth >= 8) {
                if (month - 1 < 8) dateYear = currentYear + 1;
            } else {
                if (month - 1 >= 8) dateYear = currentYear - 1;
            }

            return new Date(dateYear, month - 1, day);
        }

        function isDatePassed(dateStr) {
            const date = formatDate(dateStr);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            date.setHours(0, 0, 0, 0);
            return date < today;
        }

        function updateDates() {
            // Mark past dates avec classe CSS
            document.querySelectorAll('[data-date]').forEach(el => {
                if (isDatePassed(el.getAttribute('data-date'))) {
                    el.classList.add('date-passee');
                    el.style.textDecoration = '';
                    el.style.color = '';
                }
            });

            // Mark past events
            document.querySelectorAll('[data-event-date]').forEach(event => {
                if (isDatePassed(event.getAttribute('data-event-date'))) {
                    event.classList.add('past');
                }
            });

            highlightNextDates();
        }

        function highlightNextDates() {
            const infoBlocks = document.querySelectorAll('.info-block');
            let clubsBlock, provinceBlock;
            
            for (let block of infoBlocks) {
                const h3 = block.querySelector('h3');
                if (!h3) continue;
                if (h3.textContent.includes('Coupe des Clubs')) clubsBlock = block;
                if (h3.textContent.includes('Coupe de Provence')) provinceBlock = block;
            }

            [clubsBlock, provinceBlock].forEach(block => {
                if (!block) return;
                let found = false;
                for (let p of block.querySelectorAll('[data-date]')) {
                    if (!found && !isDatePassed(p.getAttribute('data-date'))) {
                        p.classList.add('date-prochaine');
                        if (!p.querySelector('.badge-prochain')) {
                            const badge = document.createElement('span');
                            badge.className = 'badge-prochain';
                            badge.textContent = 'Prochain';
                            p.appendChild(badge);
                        }
                        found = true;
                    }
                }
            });
        }


        // === SCROLL LOCK ===
        //
        // Mécanisme voulu : quand une modale s'ouvre, le fond est verrouillé (pas de scroll
        // en arrière-plan). La scrollbar reste visible et devient grisée/inactive — c'est
        // intentionnel, grâce à :
        //   html { overflow-y: scroll; scrollbar-gutter: stable; }
        // Ces deux règles CSS empêchent le layout shift (saut de page) qui se produirait
        // si la scrollbar disparaissait à l'ouverture de la modale.
        //
        // ⚠️ COUPLAGE CRITIQUE avec le parallaxe header (updateParallax) :
        // Quand body passe en position:fixed, le navigateur déclenche un faux événement
        // "scroll" avec window.scrollY === 0. Sans protection, updateParallax() réinitialise
        // le translateY du logo à 0 → la carte du Roi, le BCRR et le titre "Bridge Club du
        // Roy René" sautent visuellement vers le haut.
        //
        // Solution : le flag _scrollLocked.
        //   - lockScroll() le passe à true AVANT de fixer le body.
        //   - unlockScroll() le repasse à false AVANT de restaurer la position.
        //   - updateParallax() sort immédiatement si _scrollLocked === true,
        //     ignorant ainsi le faux scroll déclenché par position:fixed.
        //
        // Ne pas supprimer _scrollLocked ni le check dans updateParallax sans remplacer
        // ce mécanisme, sous peine de réintroduire le saut du header à l'ouverture des modales.

        let _scrollY = 0;
        let _scrollLocked = false; // ← voir commentaire ci-dessus, couplé à updateParallax()

        function _preventScroll(e) {
            if (e.target.closest('.dropdown-modal, .lightbox, .contact-modal')) return;
            e.preventDefault();
        }

        function lockScroll() {
            _scrollY = window.scrollY;
            _scrollLocked = true;
            window._scrollLocked = true;
            window.addEventListener('wheel', _preventScroll, { passive: false });
            window.addEventListener('touchmove', _preventScroll, { passive: false });
            // Sur mobile (≤480px) : _preventScroll suffit, pas de modification DOM
            // (position:fixed sur body et overflow:hidden sur html causent un zoom du fond)
            if (window.innerWidth > 480) {
                document.body.style.position = 'fixed';
                document.body.style.top = `-${_scrollY}px`;
                document.body.style.width = '100%';
                // Tablette : bloquer le scroll latéral du body
                document.body.style.overflowX = 'hidden';
            }
        }

        function unlockScroll() {
            _scrollLocked = false;
            window._scrollLocked = false;
            window.removeEventListener('wheel', _preventScroll);
            window.removeEventListener('touchmove', _preventScroll);
            if (window.innerWidth > 480) {
                document.body.style.position = '';
                document.body.style.top = '';
                document.body.style.width = '';
                document.body.style.overflowX = '';
                window.scrollTo(0, _scrollY);
            }
            if (window._syncParallaxResetFade) window._syncParallaxResetFade();
        }

        // === FOCUS TRAP ===
        // Keeps keyboard focus inside an active modal.
        // Returns a cleanup function to call when the modal closes.
        function trapFocus(container) {
            const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
            function getFocusable() { return Array.from(container.querySelectorAll(FOCUSABLE)).filter(el => !el.closest('[style*="display: none"]') && !el.closest('[style*="display:none"]')); }

            // Focus the first focusable element (e.g. close button)
            const first = getFocusable()[0];
            if (first) first.focus({ preventScroll: true });

            function onKeyDown(e) {
                if (e.key !== 'Tab') return;
                const focusable = getFocusable();
                if (!focusable.length) { e.preventDefault(); return; }
                const firstEl = focusable[0];
                const lastEl = focusable[focusable.length - 1];
                if (e.shiftKey) {
                    if (document.activeElement === firstEl) { e.preventDefault(); lastEl.focus(); }
                } else {
                    if (document.activeElement === lastEl) { e.preventDefault(); firstEl.focus(); }
                }
            }

            container.addEventListener('keydown', onKeyDown);
            return function cleanup() { container.removeEventListener('keydown', onKeyDown); };
        }

        // === OVERLAY MANAGEMENT ===
        const _overlayCleanup = {};

        function toggleOverlay(id) {
            const overlay = document.getElementById(id);
            const btn = document.querySelector(`[data-overlay="${id}"]`);

            if (overlay.classList.contains('active')) {
                overlay.classList.remove('active');
                overlay.classList.add('closing');
                setTimeout(() => overlay.classList.remove('closing'), 300);
                unlockScroll();
                if (_overlayCleanup[id]) { _overlayCleanup[id](); delete _overlayCleanup[id]; }
                if (btn) { btn.classList.remove('nav-active'); btn.setAttribute('aria-expanded', 'false'); btn.focus({ preventScroll: true }); }
            } else {
                overlay.classList.remove('closing');
                overlay.classList.add('active');
                lockScroll();
                const modal = overlay.querySelector('.dropdown-modal');
                if (modal) modal.scrollTop = 0;
                if (btn) { btn.classList.add('nav-active'); btn.setAttribute('aria-expanded', 'true'); }

                if (id === 'galleryDropdown') {
                    filteredImages = [...galleryImages];
                    initGallery();
                }

                // Google Maps est chargé uniquement à la première ouverture de « Nous trouver ».
                // Tant que l'utilisateur n'ouvre pas cette modale, aucune iframe Maps n'est chargée.
                if (id === 'locationDropdown') {
                    const mapIframe = overlay.querySelector('iframe[data-src]');
                    if (mapIframe) {
                        mapIframe.src = mapIframe.dataset.src;
                        mapIframe.removeAttribute('data-src');
                    }
                }

                // Activate focus trap after a short delay to let the modal render
                setTimeout(() => { _overlayCleanup[id] = trapFocus(overlay); }, 50);
            }
        }

        // === CONTACT MANAGEMENT ===
        let _contactTrapCleanup = null;

        function toggleContact() {
            const modal = document.getElementById('contactModal');
            const panel = document.getElementById('contactInfoPanel');
            const btn = document.querySelector('[data-overlay="contactModal"]');

            if (modal.classList.contains('active')) {
                modal.classList.remove('active');
                modal.classList.add('closing');
                panel.classList.remove('active');
                setTimeout(() => modal.classList.remove('closing'), 300);
                unlockScroll();
                if (_contactTrapCleanup) { _contactTrapCleanup(); _contactTrapCleanup = null; }
                if (btn) { btn.classList.remove('nav-active'); btn.setAttribute('aria-expanded', 'false'); btn.focus({ preventScroll: true }); }
            } else {
                modal.classList.remove('closing');
                modal.classList.add('active');
                panel.classList.add('active');
                lockScroll();
                const modalContent = modal.querySelector('.contact-modal-content');
                if (modalContent) modalContent.scrollTop = 0;
                if (btn) { btn.classList.add('nav-active'); btn.setAttribute('aria-expanded', 'true'); }
                setTimeout(() => { _contactTrapCleanup = trapFocus(modal); }, 50);
            }
        }

        // === FORM HANDLING ===
        function handleSubmit(e) {
            e.preventDefault();
            const form = e.target;
            const submitBtn = form.querySelector('.submit-btn');

            // === 1. HONEYPOT — si le champ caché est rempli, c'est un bot ===
            if (form.elements['website'] && form.elements['website'].value !== '') {
                // Silence total : on fait semblant que ça marche
                showSuccessMessage('✓ Message envoyé avec succès !');
                form.reset();
                setTimeout(() => toggleContact(), 1500);
                return;
            }

            // === 2. VALIDATION CÔTÉ CLIENT ===
            const fields = [
                {
                    el: form.elements['name'],
                    errId: 'err-name',
                    test: v => v.trim().length >= 2,
                    msg: 'Veuillez entrer votre nom et prénom.'
                },
                {
                    el: form.elements['phone'],
                    errId: 'err-phone',
                    test: v => (v.replace(/\D/g, '').length >= 10),
                    msg: 'Numéro invalide (min. 10 chiffres).'
                },
                {
                    el: form.elements['email'],
                    errId: 'err-email',
                    test: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()),
                    msg: 'Adresse e-mail invalide.'
                },
                {
                    el: form.elements['message'],
                    errId: 'err-message',
                    test: v => v.trim().length >= 10,
                    msg: 'Le message doit faire au moins 10 caractères.'
                }
            ];

            let valid = true;
            fields.forEach(({ el, errId, test, msg }) => {
                const errEl = document.getElementById(errId);
                if (!test(el.value)) {
                    el.classList.add('invalid');
                    el.classList.remove('valid');
                    if (errEl) errEl.textContent = msg;
                    valid = false;
                } else {
                    el.classList.remove('invalid');
                    el.classList.add('valid');
                    if (errEl) errEl.textContent = '';
                }
            });

            if (!valid) return;

            // Effacer les erreurs résiduelles et feedback valid
            fields.forEach(({ el }) => el.classList.remove('valid'));

            // === 3. ANTI-DOUBLE-ENVOI ===
            submitBtn.disabled = true;
            submitBtn.textContent = 'Envoi en cours…';

            // === 4. ENVOI ===
            const formData = new FormData(form);
            const jsonBody = {
                name:     formData.get('name'),
                phone:    formData.get('phone'),
                email:    formData.get('email'),
                message:  formData.get('message'),
                _subject: 'Nouveau message depuis le site du BCRR',
                _captcha: 'false'
            };

            // EMAIL EN CLAIR — ne pas laisser Cloudflare obfusquer cette ligne
            fetch('https://formsubmit.co/ajax/royrenebridge@gmail.com', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(jsonBody)
            })
            .then(response => {
                if (!response.ok) throw new Error('HTTP ' + response.status);
                return response.json();
            })
            .then(data => {
                if (data.success === "true" || data.success === true) {
                    showSuccessMessage('✓ Message envoyé avec succès !');
                    form.reset();
                    fields.forEach(({ el }) => el.classList.remove('invalid', 'valid'));
                    setTimeout(() => toggleContact(), 1500);
                } else {
                    throw new Error('Erreur d\'envoi');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                // Fallback : ouvrir le client mail
                const name    = formData.get('name') || '';
                const phone   = formData.get('phone') || '';
                const email   = formData.get('email') || '';
                const message = formData.get('message') || '';
                const body = encodeURIComponent(
                    'Nom : ' + name + '\n' +
                    'Téléphone : ' + phone + '\n' +
                    'Email : ' + email + '\n\n' +
                    message
                );
                const mailto = 'mailto:royrenebridge@gmail.com?subject=' +
                    encodeURIComponent('Message depuis le site BCRR') +
                    '&body=' + body;
                window.location.href = mailto;
                showSuccessMessage('📧 Ouverture de votre messagerie…');
                form.reset();
                setTimeout(() => toggleContact(), 2000);
            })
            .finally(() => {
                // On ne réactive le bouton que si la modale est encore ouverte
                if (document.getElementById('contactModal') &&
                    document.getElementById('contactModal').classList.contains('active')) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Envoyer';
                }
            });
        }

        // Validation en temps réel — feedback immédiat dès que l'utilisateur quitte un champ
        document.addEventListener('DOMContentLoaded', function() {
            const form = document.getElementById('contactForm');
            if (!form) return;
            const realTimeRules = [
                { name: 'name',    errId: 'err-name',    test: v => v.trim().length >= 2,                             msg: 'Veuillez entrer votre nom et prénom.' },
                { name: 'phone',   errId: 'err-phone',   test: v => (v.replace(/\D/g, '').length >= 10),             msg: 'Numéro invalide (min. 10 chiffres).' },
                { name: 'email',   errId: 'err-email',   test: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()),  msg: 'Adresse e-mail invalide.' },
                { name: 'message', errId: 'err-message', test: v => v.trim().length >= 10,                            msg: 'Le message doit faire au moins 10 caractères.' }
            ];
            realTimeRules.forEach(({ name, errId, test, msg }) => {
                const el = form.elements[name];
                const errEl = document.getElementById(errId);
                if (!el || !errEl) return;
                el.addEventListener('blur', function() {
                    if (el.value === '') { el.classList.remove('invalid', 'valid'); errEl.textContent = ''; return; }
                    if (!test(el.value)) {
                        el.classList.add('invalid'); el.classList.remove('valid'); errEl.textContent = msg;
                    } else {
                        el.classList.remove('invalid'); el.classList.add('valid'); errEl.textContent = '';
                    }
                });
                el.addEventListener('input', function() {
                    if (el.classList.contains('invalid') && test(el.value)) {
                        el.classList.remove('invalid'); el.classList.add('valid'); errEl.textContent = '';
                    }
                });
            });
        });
        
        function showSuccessMessage(text = '✓ Message envoyé avec succès !') {
            const message = document.createElement('div');
            message.className = 'success-message';
            message.textContent = text;
            document.body.appendChild(message);
            
            setTimeout(() => message.remove(), 3000);
        }

        // === CLICK OUTSIDE HANDLING ===
        document.addEventListener('click', (e) => {
            const overlays = ['locationDropdown', 'equipeDropdown', 'tarifsDropdown', 'galleryDropdown', 'adminPanel'];
            
            overlays.forEach(overlayId => {
                const overlay = document.getElementById(overlayId);
                if (!overlay.classList.contains('active')) return;
                
                if (e.target === overlay) {
                    toggleOverlay(overlayId);
                }
            });

            // Contact modal — fermeture au clic sur le fond
            const modal = document.getElementById('contactModal');
            if (modal && modal.classList.contains('active')) {
                if (e.target === modal) {
                    toggleContact();
                }
            }
        });

        // === POPUP ACCUEIL ===
        // closePopup défini dans le <head>


        // ================================================================
        // RENDU DEPUIS CONFIG — Ne pas modifier cette section
        // ================================================================
        function renderFromConfig() {

            // --- COURS ---
            const coursContainer = document.getElementById('cours-container');
            if (coursContainer) {
                const repriseEl = document.getElementById('cours-reprise');
                if (repriseEl) repriseEl.textContent = CONFIG.reprise;

                let html = '';
                CONFIG.enseignants.forEach(ens => {
                    html += `<div class="teacher-section"><h3>Avec ${escapeHtml(ens.nom)}</h3>`;
                    ens.cours.forEach(c => {
                        html += `<div class="info-block"><h3>${escapeHtml(c.niveau)}</h3>`;
                        c.horaires.forEach(h => {
                            html += `<div class="schedule"><span class="day">${escapeHtml(h.jour)}</span><span class="time">${escapeHtml(h.heure)}</span></div>`;
                        });
                        html += `</div>`;
                    });
                    html += `</div>`;
                });
                coursContainer.innerHTML = html;
            }

            // --- TOURNOIS : Rondes de France ---
            const rdfHeure = document.getElementById('rdf-heure');
            const rdfJours = document.getElementById('rdf-jours');
            const rdfBtn   = document.getElementById('rdf-btn');
            if (rdfHeure) rdfHeure.textContent = CONFIG.rondesDeFrance.heure;
            if (rdfJours) rdfJours.textContent = CONFIG.rondesDeFrance.jours;
            if (rdfBtn)   rdfBtn.href = CONFIG.rondesDeFrance.inscriptionsUrl;

            // --- TOURNOIS : Coupes ---
            const renderCoupe = (dates, containerId) => {
                const el = document.getElementById(containerId);
                if (!el) return;
                el.innerHTML = dates.map(d => {
                    if (d.finale) return `<p data-date="${d.date}"><strong>Finale : ${d.date}</strong></p>`;
                    return `<p data-date="${d.date}">- ${d.date}</p>`;
                }).join('');
            };
            renderCoupe(CONFIG.coupeDesClubs,   'coupe-clubs-dates');
            renderCoupe(CONFIG.coupeDeProvence, 'coupe-provence-dates');

            // --- ACTUALITÉS ---
            const actContainer = document.getElementById('actualites-container');
            if (actContainer) {
                actContainer.innerHTML = CONFIG.actualites.map(a => {
                    const note = a.note ? `<p><strong>${escapeHtml(a.note)}</strong></p>` : '';
                    return `<div class="event-item" data-event-date="${escapeHtml(a.dateTri)}">
                        <h4>${escapeHtml(a.dateAffichee)}</h4>
                        <p>${escapeHtml(a.description)}</p>${note}
                    </div>`;
                }).join('');
            }

            // --- TARIFS ---
            const t = CONFIG.tarifs;
            const setT = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
            setT('tarif-licence',           t.licenceFFB);
            setT('tarif-cotis-indiv',       t.cotisationIndiv);
            setT('tarif-cotis-couple',      t.cotisationCouple);
            setT('tarif-table-membre',      t.droitTableMembre);
            setT('tarif-carnet-membre',     t.carnetMembre);
            setT('tarif-table-nonmembre',   t.droitTableNonMembre);
            setT('tarif-carnet-nonmembre',  t.carnetNonMembre);

            // Synchronise les données structurées (JSON-LD) avec CONFIG.tarifs,
            // seule source de vérité pour les prix — évite d'avoir à modifier
            // les tarifs à 3 endroits différents à chaque changement.
            (function syncJsonLdPrices() {
                try {
                    const sportsScript = document.getElementById('jsonld-sports-location');
                    if (sportsScript) {
                        const data = JSON.parse(sportsScript.textContent);
                        data.priceRange = `${t.licenceFFB}-${t.cotisationCouple}`;
                        sportsScript.textContent = JSON.stringify(data);
                    }

                    const faqScript = document.getElementById('jsonld-faq');
                    if (faqScript) {
                        const data = JSON.parse(faqScript.textContent);
                        const tarifQ = data.mainEntity && data.mainEntity.find(q =>
                            q.name && q.name.toLowerCase().includes('tarif')
                        );
                        if (tarifQ) {
                            tarifQ.acceptedAnswer.text =
                                `La licence FFB coûte ${t.licenceFFB}. La cotisation annuelle est de ${t.cotisationIndiv} en individuel ou ${t.cotisationCouple} en couple. ` +
                                `Le droit de table est de ${t.droitTableMembre} pour les membres (carnet de 11 : ${t.carnetMembre}) et ${t.droitTableNonMembre} pour les non-membres (carnet de 11 : ${t.carnetNonMembre}).`;
                        }
                        faqScript.textContent = JSON.stringify(data);
                    }
                } catch (e) {
                    console.error('Erreur synchronisation JSON-LD tarifs :', e);
                }
            })();

            // --- ÉQUIPE ---
            const eq = CONFIG.equipe;
            const equipeIntro = document.getElementById('equipe-intro');
            if (equipeIntro) equipeIntro.textContent = `Entièrement composée de bénévoles, élus le ${eq.electionDate}, pour une durée de 4 ans.`;

            const bureauEl = document.getElementById('equipe-bureau');
            if (bureauEl) bureauEl.innerHTML = eq.bureau.map(m => `<p><strong>${escapeHtml(m.role)} :</strong> ${escapeHtml(m.nom)}</p>`).join('');

            const caEl = document.getElementById('equipe-ca');
            if (caEl) caEl.innerHTML = `<p><strong>Membres du bureau :</strong></p>` + eq.ca.map(m => `<p>${escapeHtml(m)}</p>`).join('');

            const ethEl = document.getElementById('equipe-ethique');
            if (ethEl) ethEl.innerHTML = `<p><strong>Présidée par :</strong> ${escapeHtml(eq.ethique.president)}</p>
                <p style="margin-top:1rem;"><strong>Assisté de :</strong></p>` +
                eq.ethique.membres.map(m => `<p>${escapeHtml(m)}</p>`).join('');
        }

        document.addEventListener('DOMContentLoaded', async () => {
            renderFromConfig();
            await loadGalleryPublic();
            filteredImages = [...galleryImages];
            initGallery();

            initUploadListeners();
            updateDates();

            // Figer tous les éléments du header après leur animation d'apparition
            const animatedEls = [
                { sel: '.logo-img img',                          finalTransform: '', restoreTransition: 'transform 0.3s ease, box-shadow 0.3s ease' },
                { sel: '.logo-title',                            finalTransform: '', restoreTransition: 'none' },
                { sel: '.logo-subtitle-main',                    finalTransform: '', restoreTransition: 'none' },
                { sel: '.logo-right-inner',                      finalTransform: '', restoreTransition: 'none' },
                { sel: '.nav-facebook-wrap > .facebook-icon',    finalTransform: '', restoreTransition: 'none' },
            ];
            animatedEls.forEach(({ sel, finalTransform, restoreTransition }) => {
                const el = document.querySelector(sel);
                if (!el) return;
                el.addEventListener('animationend', () => {
                    if (el.classList.contains('anim-pending')) {
                        el.classList.remove('anim-pending');
                    } else {
                        el.style.animation = 'none';
                    }
                    el.style.opacity = '1';
                    el.style.transform = finalTransform;
                    el.style.transition = restoreTransition;
                }, { once: true });
            });

            // Nav : transition opacity, on coupe après
            const navEl = document.querySelector('.nav-card-container');
            if (navEl) {
                navEl.addEventListener('transitionend', () => {
                    navEl.style.transition = '';
                }, { once: true });
            }

            // === PARALLAXE HEADER ===
            //
            // Effet de parallaxe sur .logo-section (carte du Roi, BCRR, titre) :
            // translateY monte lentement (×0.25) et le logo devient transparent passé 220px.
            //
            // ⚠️ COUPLAGE CRITIQUE avec lockScroll / _scrollLocked :
            // position:fixed sur le body (posé par lockScroll) génère un faux événement
            // "scroll" avec window.scrollY === 0 côté navigateur. Sans le guard ci-dessous,
            // updateParallax() remettrait translateY à 0 → saut visible du header à chaque
            // ouverture de modale après avoir scrollé.
            //
            // Le guard `if (_scrollLocked) return;` est la seule protection contre ce bug.
            // Ne pas le supprimer. Ne pas remplacer updateParallax par une version qui
            // lirait window.scrollY sans ce check.
            //
            // updateParallax accepte aussi un paramètre forceScrollY (inutilisé en pratique
            // depuis l'ajout du flag, conservé pour usage éventuel).

            const logoSection = document.querySelector('.logo-section');
            const navCard = document.querySelector('.nav-card-container');

            let _parallaxRAF = null;
            function updateParallax(forceScrollY) {
                const isMobile = window.innerWidth <= 599;
                const isTablet = window.innerWidth >= 600 && window.innerWidth <= 1024;
                if (isMobile || isTablet) {
                    if (logoSection) {
                        logoSection.style.transform = '';
                        logoSection.style.opacity = '';
                    }
                    return;
                }
                // ⚠️ Guard anti-saut header : position:fixed déclenche un faux scroll à 0.
                // Sans ce return, le logo saute vers le haut à chaque ouverture de modale.
                if (_scrollLocked) return;
                const scrollY = (typeof forceScrollY === 'number') ? forceScrollY : window.scrollY;
                if (_parallaxRAF) return; // déjà planifié ce cycle
                _parallaxRAF = requestAnimationFrame(function() {
                    _parallaxRAF = null;
                    if (logoSection) {
                        logoSection.style.transform = `translateY(${scrollY * 0.25}px)`;
                        if (window.innerWidth > 1024) {
                            logoSection.style.opacity = Math.max(0, 1 - scrollY / 220);
                        }
                    }
                });
            }

            window.addEventListener('scroll', updateParallax, { passive: true });
            // Debounce resize pour éviter des centaines de reflows par seconde
            let _parallaxResizeTimer = null;
            window.addEventListener('resize', function() {
                clearTimeout(_parallaxResizeTimer);
                _parallaxResizeTimer = setTimeout(updateParallax, 80);
            }, { passive: true });

            // === BOUTON RETOUR EN HAUT ===
            const backToTop = document.getElementById('backToTop');

            let _scrollingToTop = false;

            let _scrollUIFrame = null;
            function updateScrollUI() {
                if (_scrollingToTop) return;
                if (_scrollUIFrame) return;
                _scrollUIFrame = requestAnimationFrame(() => {
                    _scrollUIFrame = null;
                    const scrollY = window.scrollY;
                    if (backToTop) {
                        if (scrollY > 300) {
                            backToTop.classList.add('visible');
                        } else {
                            backToTop.classList.remove('visible');
                        }
                    }
                });
            }

            window.addEventListener('scroll', updateScrollUI, { passive: true });

            if (backToTop) {
                backToTop.addEventListener('click', () => {
                    _scrollingToTop = true;
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    setTimeout(() => {
                        _scrollingToTop = false;
                        backToTop.classList.remove('visible');
                    }, 800);
                });
            }

            // === SCROLL REVEAL ===
            const sectionCards = document.querySelectorAll('.section-card');
            sectionCards.forEach((el, i) => {
                if (i === 1) {
                    el.classList.add('reveal-down');
                } else {
                    el.classList.add('reveal');
                }
            });

            const revealEls = document.querySelectorAll('.section-card, .info-block, .event-item, .highlight');
            revealEls.forEach((el) => {
                if (!el.classList.contains('reveal') && !el.classList.contains('reveal-down')) {
                    el.classList.add('reveal');
                }
            });

            const observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const el = entry.target;
                        observer.unobserve(el);

                        // Révèle l'élément lui-même
                        el.classList.add('visible');

                        // Révèle aussi tous les enfants reveal de cette section en cascade
                        const children = [...el.querySelectorAll('.reveal:not(.visible), .reveal-down:not(.visible)')];
                        children.forEach((child, idx) => {
                            observer.unobserve(child);
                            setTimeout(() => {
                                child.classList.add('visible');
                            }, Math.min(idx * 60, 300));
                        });
                    }
                });
            }, { threshold: 0.05 });

            // Lancer l'observer seulement quand le site est révélé
            window._startReveal = function() {
                const isSmallScreen = window.innerWidth <= 1024; // tablette + mobile

                const triggerAll = () => {
                    if (isSmallScreen) {
                        /*
                         * Sur tablette et mobile : révéler toutes les cards instantanément,
                         * sans stagger ni translateY (neutralisé en CSS via @media max-width:1024px).
                         * La nav étant dans le flux normal, le translateY provoquerait un
                         * layout shift visible. On passe directement à visible + content-reveal
                         * avec une simple transition d'opacité.
                         */
                        sectionCards.forEach((el) => {
                            el.classList.add('visible');
                            el.classList.add('content-reveal');
                        });
                        document.body.classList.add('logo-go');
                        revealEls.forEach(el => observer.observe(el));
                        return;
                    }

                    // Desktop : comportement original avec stagger
                    const CARD_STAGGER  = 200;
                    const CONTENT_DELAY = 350;
                    sectionCards.forEach((el, i) => {
                        const cardStart = i * CARD_STAGGER;
                        setTimeout(() => el.classList.add('visible'), cardStart);
                        setTimeout(() => el.classList.add('content-reveal'), cardStart + CONTENT_DELAY);
                    });

                    setTimeout(() => {
                        document.body.classList.add('logo-go');
                    }, 600);

                    revealEls.forEach(el => observer.observe(el));
                };
                setTimeout(triggerAll, 400);

            };

            // Si on redimensionne vers mobile après que le site soit déjà révélé en desktop,
            // s'assurer que .mobile-revealed est bien appliqué
            let _revealResizeTimer = null;
            window.addEventListener('resize', function() {
                clearTimeout(_revealResizeTimer);
                _revealResizeTimer = setTimeout(function() {
                    if (window.innerWidth <= 1024) {
                        const mainContainer = document.querySelector('.main-container');
                        if (mainContainer && !mainContainer.classList.contains('mobile-revealed')) {
                            mainContainer.classList.add('mobile-revealed');
                        }
                    }
                }, 80);
            }, { passive: true });

            // Signale que _startReveal est prêt (pour le cas où le cover se charge avant DOMContentLoaded)
            document.dispatchEvent(new Event('_startRevealReady'));
        });
    

        // === ACCORDÉON MOBILE ===
        (function() {
            function isMobile() {
                return window.innerWidth <= 599;
            }

            function openCard(card) {
                var content = card.querySelector('.card-content');
                var btn = card.querySelector('.section-card-toggle');

                // Mesure la hauteur réelle avec padding-top visible
                content.style.transition = 'none';
                content.style.overflow = 'hidden';
                content.style.maxHeight = 'none';
                content.style.paddingTop = '18px';
                var fullH = content.scrollHeight;
                content.style.maxHeight = '0px';
                content.style.paddingTop = '0px';

                card.classList.add('accordion-open');
                btn.setAttribute('aria-expanded', 'true');

                requestAnimationFrame(function() {
                    requestAnimationFrame(function() {
                        content.style.transition = 'max-height 1.45s cubic-bezier(0.22, 1, 0.36, 1), padding-top 1.1s cubic-bezier(0.22, 1, 0.36, 1)';
                        content.style.maxHeight = fullH + 'px';
                        content.style.paddingTop = '18px';

                        content.addEventListener('transitionend', function onEnd(e) {
                            if (e.propertyName !== 'max-height') return;
                            content.removeEventListener('transitionend', onEnd);
                            if (card.classList.contains('accordion-open')) {
                                content.style.maxHeight = 'none';
                                content.style.overflow = 'visible';
                            }
                        });
                    });
                });
            }

            function closeCard(card) {
                var content = card.querySelector('.card-content');
                var btn = card.querySelector('.section-card-toggle');

                var currentH = content.scrollHeight;
                content.style.overflow = 'hidden';
                content.style.maxHeight = currentH + 'px';
                content.style.paddingTop = '18px';

                requestAnimationFrame(function() {
                    requestAnimationFrame(function() {
                        content.style.transition = 'max-height 0.7s cubic-bezier(0.22, 1, 0.36, 1), padding-top 0.5s cubic-bezier(0.22, 1, 0.36, 1)';
                        content.style.maxHeight = '0px';
                        content.style.paddingTop = '0px';

                        card.classList.remove('accordion-open');
                        btn.setAttribute('aria-expanded', 'false');
                    });
                });
            }

            function initAccordion() {
                if (!isMobile()) return;
                document.querySelectorAll('.section-card-toggle').forEach(function(btn) {
                    if (btn._accordionInit) return;
                    btn._accordionInit = true;

                    var _accStartX = 0, _accStartY = 0;
                    var _touchHandled = false;

                    btn.addEventListener('touchstart', function(e) {
                        var t = e.touches[0];
                        _accStartX = t.clientX;
                        _accStartY = t.clientY;
                        _touchHandled = false;
                    }, { passive: true });

                    btn.addEventListener('touchend', function(e) {
                        var t = e.changedTouches[0];
                        if (Math.abs(t.clientX - _accStartX) > 10 || Math.abs(t.clientY - _accStartY) > 10) return;
                        e.preventDefault();
                        _touchHandled = true;
                        var card = btn.closest('.section-card');
                        if (card.classList.contains('accordion-open')) {
                            closeCard(card);
                        } else {
                            openCard(card);
                        }
                    }, { passive: false });

                    // Fallback click pour appareils hybrides / DevTools mobile
                    btn.addEventListener('click', function() {
                        if (_touchHandled) { _touchHandled = false; return; }
                        var card = btn.closest('.section-card');
                        if (card.classList.contains('accordion-open')) {
                            closeCard(card);
                        } else {
                            openCard(card);
                        }
                    });
                });
            }

            function handleResize() {
                if (!isMobile()) {
                    document.querySelectorAll('.section-card').forEach(function(card) {
                        card.classList.remove('accordion-open');
                        var content = card.querySelector('.card-content');
                        if (content) {
                            content.style.maxHeight = '';
                            content.style.padding = '';
                            content.style.overflow = '';
                            content.style.transition = '';
                        }
                    });
                } else {
                    initAccordion();
                }
            }

            // Fix : DOMContentLoaded ne se déclenche jamais si le script s'exécute après le parsing.
            // On vérifie readyState et on appelle directement si déjà chargé.
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', initAccordion);
            } else {
                initAccordion();
            }
            window.addEventListener('resize', handleResize);
        })();
    

        // === FIX TOUCH MOBILE — boutons de navigation ===
        // Certains mobiles ignorent onclick inline quand touch-action interfère.
        // On utilise touchend + preventDefault pour garantir le déclenchement.
        (function() {
            var TOUCH_MOVE_THRESHOLD = 10; // px — en dessous = tap, au dessus = scroll

            function bindNavButton(btn) {
                if (!btn) return;
                btn.style.touchAction = 'manipulation';

                var touchStartX = 0, touchStartY = 0;

                btn.addEventListener('touchstart', function(e) {
                    var t = e.touches[0];
                    touchStartX = t.clientX;
                    touchStartY = t.clientY;
                }, { passive: true });

                btn.addEventListener('touchend', function(e) {
                    var t = e.changedTouches[0];
                    var dx = Math.abs(t.clientX - touchStartX);
                    var dy = Math.abs(t.clientY - touchStartY);
                    if (dx > TOUCH_MOVE_THRESHOLD || dy > TOUCH_MOVE_THRESHOLD) return; // c'était un scroll
                    e.preventDefault();
                    e.stopPropagation();
                    var overlayId = btn.getAttribute('data-overlay');
                    if (!overlayId) return;
                    if (overlayId === 'contactModal') {
                        toggleContact();
                    } else {
                        toggleOverlay(overlayId);
                    }
                }, { passive: false });
            }

            function initNavTouch() {
                document.querySelectorAll('.nav-card button[data-overlay]').forEach(bindNavButton);
                // Bouton fermer dans la modale contact
                var closeContact = document.querySelector('#contactModal .close-btn');
                if (closeContact) {
                    closeContact.style.touchAction = 'manipulation';
                    var cStartX = 0, cStartY = 0;
                    closeContact.addEventListener('touchstart', function(e) {
                        var t = e.touches[0];
                        cStartX = t.clientX;
                        cStartY = t.clientY;
                    }, { passive: true });
                    closeContact.addEventListener('touchend', function(e) {
                        var t = e.changedTouches[0];
                        var dx = Math.abs(t.clientX - cStartX);
                        var dy = Math.abs(t.clientY - cStartY);
                        if (dx > TOUCH_MOVE_THRESHOLD || dy > TOUCH_MOVE_THRESHOLD) return;
                        e.preventDefault();
                        toggleContact();
                    }, { passive: false });
                }
            }

            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', initNavTouch);
            } else {
                initNavTouch();
            }
        })();
    

        /* Supprime les transitions pendant un redimensionnement (artefact DevTools uniquement) */
        (function() {
            var resizeTimer;
            window.addEventListener('resize', function() {
                document.body.classList.add('no-transition');
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(function() {
                    document.body.classList.remove('no-transition');
                }, 100);
            }, { passive: true });
        })();
    

        /* Empêche le hover CSS de "coller" sur les boutons nav pendant le scroll mobile */
        (function() {
            var scrollTimer;
            window.addEventListener('scroll', function() {
                document.body.classList.add('is-scrolling');
                clearTimeout(scrollTimer);
                scrollTimer = setTimeout(function() {
                    document.body.classList.remove('is-scrolling');
                }, 150);
            }, { passive: true });

            /* Feedback visuel is-tapped uniquement sur tap réel (pas scroll) */
            var THRESHOLD = 10;
            document.querySelectorAll('.nav-card button').forEach(function(btn) {
                var sx = 0, sy = 0;
                btn.addEventListener('touchstart', function(e) {
                    sx = e.touches[0].clientX;
                    sy = e.touches[0].clientY;
                }, { passive: true });
            });
        })();
    

        /* === PARALLAXE LOGO-RIGHT (TABLETTE UNIQUEMENT) === */
        /*
         * Fade out logo-section + logo-right au moment précis où ils "touchent"
         * la nav en remontant, pas avant (et surtout pas dès le premier pixel de scroll).
         *
         * Pourquoi ce script existe :
         *   Sur tablette, la nav est en position:static sous les logos dans le DOM.
         *   Au scroll, logo-section monte via translateY(scrollY × 0.25). Sans fade,
         *   les logos glissent sous la nav (z-index les cache) mais restent cliquables.
         *   Le fondu les rend invisibles au bon moment et évite tout overflow:hidden
         *   qui clipperait trop tôt.
         *
         * Calcul du point de contact (getFadeStartScrollY) :
         *   1. On mesure la distance réelle entre le bas de logo-section et le haut
         *      de la nav en coordonnées document (getBoundingClientRect + scrollY).
         *   2. logo-section monte de scrollY × 0.25 px.
         *      Contact quand : scrollY × 0.25 = gap  →  fadeStart = gap / 0.25
         *   3. _fadeStart est recalculé à chaque resize (rotation, redimensionnement)
         *      et au premier scroll réel (évite les dimensions fausses au DOMContentLoaded
         *      quand les images ne sont pas encore chargées).
         *
         * ⚠️  Si tu modifies la vitesse du parallaxe (× 0.25), mets à jour le
         *     diviseur dans getFadeStartScrollY en conséquence.
         * ⚠️  Si tu modifies la hauteur du header ou de la nav, _fadeStart se
         *     recalcule automatiquement — pas besoin de toucher aux valeurs en dur.
         */
        (function() {
            function isTablet() { return window.innerWidth >= 481 && window.innerWidth <= 1024; }

            var logoRight = document.querySelector('.logo-right');
            var logoSection = document.querySelector('.logo-section');
            var navContainer = document.querySelector('.nav-card-container');

            // scrollY auquel le bas de logo-section atteint le haut de la nav.
            // Sur tablette la nav est SOUS les logos dans le DOM.
            // logo-section monte de scrollY*0.25 px → contact quand scrollY*0.25 = logoBottom - navTop
            // donc fadeStart = (logoBottom - navTop) / 0.25
            function getFadeStartScrollY() {
                if (!logoSection || !navContainer) return 220;
                // Mesures à scrollY courant → on ramène en coordonnées document
                var scrollY0 = window.scrollY;
                var logoBottom = logoSection.getBoundingClientRect().bottom + scrollY0;
                var navTop    = navContainer.getBoundingClientRect().top    + scrollY0;
                // Distance (en px de document) entre bas du logo et haut de la nav au repos
                var gap = navTop - logoBottom; // positif : logo est au-dessus de la nav
                if (gap <= 0) return 0;
                // Pour combler ce gap avec translateY(scrollY*0.25), il faut scrollY = gap/0.25
                return gap / 0.25;
            }

            var _fadeStart = null;
            var _fadeDist = 80; // px de scroll sur lesquels s'effectue le fondu

            function syncParallax() {
                if (!logoRight || !logoSection) return;
                if (!isTablet()) {
                    // Sur desktop/mobile, syncParallax ne touche PAS logoSection
                    // (géré exclusivement par updateParallax) — on reset seulement logo-right
                    logoRight.style.transform = '';
                    logoRight.style.opacity = '';
                    return;
                }
                // Sur tablette : éléments fixes, pas de parallaxe ni de fondu
                logoRight.style.transform = '';
                logoRight.style.opacity = '';
                logoSection.style.transform = '';
                logoSection.style.opacity = '';
            }

            window.addEventListener('scroll', syncParallax, { passive: true });
            window.addEventListener('resize', function() {
                _fadeStart = null; // recalcul au prochain scroll
            }, { passive: true });
            // Permet à unlockScroll() de forcer un recalcul de _fadeStart après fermeture modale
            window._syncParallaxResetFade = function() { _fadeStart = null; };
            // Ne pas appeler syncParallax au DOMContentLoaded : les dimensions
            // peuvent être fausses avant que les images soient chargées.
            // Le premier appel depuis l'événement scroll calculera _fadeStart correctement.
        })();
    

        /* === CENTRAGE ADAPTATIF DU LOGO-TEXT ENTRE CARTE DU ROI ET BOUTON FB === */
        (function() {
            function isTablet() { return window.innerWidth >= 481 && window.innerWidth <= 1024; }

            function centerLogoText() {
                if (!isTablet()) return;
                var logoText = document.querySelector('.logo-text');
                var roi = document.querySelector('.logo-img');
                var fb = document.querySelector('.logo-right-inner a:first-child');
                var logoSection = document.querySelector('.logo-section');
                if (!logoText || !roi || !fb || !logoSection) return;
                var roiRect = roi.getBoundingClientRect();
                var fbRect = fb.getBoundingClientRect();
                var sectionRect = logoSection.getBoundingClientRect();
                var centerX = (roiRect.right + (fbRect.left + fbRect.width / 2)) / 2;
                var centerRelative = centerX - sectionRect.left;
                logoText.style.position = 'absolute';
                logoText.style.left = centerRelative + 'px';
                logoText.style.transform = 'translateX(-50%)';
                logoText.style.bottom = '0';
                logoText.style.textAlign = 'center';
                logoText.classList.add('positioned');
            }

            function reset() {
                var logoText = document.querySelector('.logo-text');
                if (logoText) {
                    logoText.style.position = '';
                    logoText.style.left = '';
                    logoText.style.transform = '';
                    logoText.style.bottom = '';
                    logoText.style.opacity = '';
                    logoText.classList.remove('positioned');
                }
            }

            document.addEventListener('DOMContentLoaded', function() {
                // Plus besoin de délai : logo-text est déjà position:absolute en CSS.
                // Le JS ne fait que calculer les coordonnées left/bottom → pas de reflow.
                if (isTablet()) centerLogoText();
                else reset();
            });
            var _centerResizeTimer = null;
            window.addEventListener('resize', function() {
                clearTimeout(_centerResizeTimer);
                _centerResizeTimer = setTimeout(function() {
                    if (isTablet()) centerLogoText();
                    else reset();
                }, 80);
            }, { passive: true });
        })();
    

        /*
         * === BLOQUER LE DÉPASSEMENT EN BAS SUR SAFARI iOS ===
         *
         * Problème : Safari iOS ignore overscroll-behavior-y: none (non supporté).
         * Résultat : l'utilisateur peut scroller au-delà du bas de la page et voir
         * le fond (vert sombre) derrière le contenu.
         *
         * Solution : écouter touchmove et appeler preventDefault() UNIQUEMENT quand
         * on est déjà tout en bas (atBottom) ET qu'on continue à glisser vers le bas
         * (dy < 0 = doigt qui monte = scroll vers le bas).
         * Dans tous les autres cas le scroll natif est préservé, y compris le bounce en haut.
         *
         * ⚠️ Ne pas utiliser passive: true ici — preventDefault() exige passive: false.
         * ⚠️ Ne pas étendre ce preventDefault() au haut de page (atTop && dy > 0) :
         *    cela casse le bounce natif iOS vers le haut et crée des glitches visuels.
         */

    

// === DESCRIPTION « NOUS TROUVER » : UNE SEULE OCCURRENCE DOM ===
// Sur tablette la description devient un item direct de la grille ; ailleurs
// elle revient dans le bloc des coordonnées. Aucun texte n'est dupliqué.
(function () {
    function placeLocationDescription() {
        var desc = document.getElementById('location-description');
        var content = document.querySelector('#locationDropdown .location-content');
        var coords = content && content.querySelector('.dropdown-info-coords');
        var photo = content && content.querySelector('.dropdown-photo');
        if (!desc || !content || !coords || !photo) return;

        var tablet = window.innerWidth >= 600 && window.innerWidth <= 1199;
        if (tablet) {
            if (desc.parentElement !== content) content.insertBefore(desc, photo);
        } else if (desc.parentElement !== coords) {
            coords.appendChild(desc);
        }
    }

    document.addEventListener('DOMContentLoaded', placeLocationDescription);
    window.addEventListener('resize', placeLocationDescription, { passive: true });
})();
