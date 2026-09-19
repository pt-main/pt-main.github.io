/* ============================================================
   PT - animation layer
   Optimised: delegated events, no layout thrash, no stray timers.
   ============================================================ */
(function () {
    'use strict';

    var d    = document;
    var root = d.documentElement;

    var reduce = !!(window.matchMedia &&
                    window.matchMedia('(prefers-reduced-motion: reduce)').matches);

    var now = (window.performance && window.performance.now)
        ? performance.now.bind(performance)
        : Date.now;

    var raf = window.requestAnimationFrame
        ? window.requestAnimationFrame.bind(window)
        : function (fn) { return setTimeout(fn, 16, now()); };

    var caf = window.cancelAnimationFrame
        ? window.cancelAnimationFrame.bind(window)
        : clearTimeout;

    if (!root.classList.contains('js')) root.classList.add('js');
    if (reduce) root.classList.add('pt-lite');

    function ready(fn) {
        if (d.readyState !== 'loading') { fn(); return; }
        d.addEventListener('DOMContentLoaded', fn, { once: true });
    }

    ready(function () {
        var body = d.body;
        var hero = d.querySelector('.hero');

        /* =====================================================
           1. HERO ENTRANCE
           ===================================================== */
        function startHeroSequence() {
            if (!hero || reduce || hero.dataset.ptSeq === 'done') return;
            hero.dataset.ptSeq = 'done';

            var kids = hero.children;
            var n    = kids.length;
            if (!n) return;

            for (var i = 0; i < n; i++) {
                kids[i].style.setProperty('--pt-delay', (i * 55) + 'ms');
            }
            hero.classList.add('pt-hero-in');

            setTimeout(function () {
                hero.classList.remove('pt-seq', 'pt-hero-in');
                for (var j = 0; j < n; j++) kids[j].style.removeProperty('--pt-delay');
            }, (n - 1) * 55 + 800);
        }

        /* =====================================================
           2. SCROLL REVEAL
           ===================================================== */
        var revealStarted = false;

        function cleanupReveal(el) {
            el.classList.remove('reveal', 'pt-in', 'pt-done',
                                'reveal-delay-1', 'reveal-delay-2', 'reveal-delay-3');
            el.style.removeProperty('--pt-delay');
            el.style.removeProperty('will-change');
        }

        function startReveal() {
            if (revealStarted) return;
            revealStarted = true;

            var nodes = d.querySelectorAll('.reveal');
            var i, n = nodes.length;
            if (!n) return;

            if (reduce || !('IntersectionObserver' in window)) {
                for (i = 0; i < n; i++) cleanupReveal(nodes[i]);
                return;
            }

            var counters = new Map();
            for (i = 0; i < n; i++) {
                var el     = nodes[i];
                var parent = el.parentElement || root;
                var idx    = counters.get(parent) || 0;
                counters.set(parent, idx + 1);
                if (idx) el.style.setProperty('--pt-delay', Math.min(idx, 3) * 45 + 'ms');
            }

            var io = new IntersectionObserver(function (entries) {
                for (var k = 0; k < entries.length; k++) {
                    var entry = entries[k];
                    if (!entry.isIntersecting) continue;
                    io.unobserve(entry.target);
                    entry.target.classList.add('pt-in');
                }
            }, { rootMargin: '0px 0px -18% 0px', threshold: 0 });

            for (i = 0; i < n; i++) io.observe(nodes[i]);
        }

        d.addEventListener('animationend', function (e) {
            if (e.animationName !== 'pt-reveal-in') return;
            var t = e.target;
            if (t.classList && t.classList.contains('pt-in')) cleanupReveal(t);
        });

        /* =====================================================
           3. BOOT - preloader + orchestration
           ===================================================== */
        function bootPreloader() {
            root.classList.add('pt-loading');
            body.classList.add('pt-loading');
            if (hero) hero.classList.add('pt-seq');

            var loader = d.createElement('div');
            loader.id = 'pt-loader';
            loader.setAttribute('role', 'status');
            loader.setAttribute('aria-live', 'polite');
            loader.setAttribute('aria-label', 'Loading');
            loader.innerHTML =
                '<div class="pt-loader-mark">' +
                    '<span class="pt-loader-dollar">$</span>' +
                    '<span>pt</span>' +
                    '<span class="pt-loader-caret"></span>' +
                '</div>' +
                '<div class="pt-loader-bar"><span class="pt-loader-fill"></span></div>' +
                '<div class="pt-loader-status">boot</div>';
            body.appendChild(loader);

            var fill  = loader.querySelector('.pt-loader-fill');
            var label = loader.querySelector('.pt-loader-status');

            var STAGES = [
                { at: 0.00, text: 'boot'            },
                { at: 0.20, text: 'loading modules' },
                { at: 0.45, text: 'linking'         },
                { at: 0.70, text: 'rendering'       },
                { at: 0.93, text: 'ready'           }
            ];
            var MIN_MS    = 950;
            var SAFETY_MS = 6000;

            var startedAt  = now();
            var pageLoaded = d.readyState === 'complete';
            var finished   = false;
            var paused     = false;
            var stageIdx   = -1;
            var lastValue  = -1;
            var rafId      = 0;
            var safetyId   = 0;

            function setProgress(v) {
                if (v < 1 && v - lastValue < 0.002) return;
                lastValue = v;
                fill.style.transform = 'scaleX(' + v.toFixed(3) + ')';
            }

            function onLoad() {
                pageLoaded = true;
                if (finished || !paused) return;
                paused = false;
                rafId = raf(frame);
            }
            if (!pageLoaded) window.addEventListener('load', onLoad, { once: true });

            function finish() {
                if (finished) return;
                finished = true;

                if (rafId) { caf(rafId); rafId = 0; }
                clearTimeout(safetyId);

                setProgress(1);
                label.textContent = 'ready';

                setTimeout(function () {
                    loader.classList.add('pt-loader-done');
                    root.classList.remove('pt-loading');
                    body.classList.remove('pt-loading');

                    startHeroSequence();
                    startReveal();

                    setTimeout(function () {
                        if (loader.parentNode) loader.parentNode.removeChild(loader);
                    }, 700);
                }, 220);
            }

            function frame() {
                rafId = 0;
                if (finished) return;

                var t = (now() - startedAt) / MIN_MS;
                if (t > 1) t = 1;

                var eased = 1 - Math.pow(1 - t, 3);
                var value = pageLoaded ? eased : Math.min(eased, 0.9);
                setProgress(value);

                var idx = STAGES.length - 1;
                while (idx > 0 && value < STAGES[idx].at) idx--;
                if (idx !== stageIdx) {
                    stageIdx = idx;
                    label.textContent = STAGES[idx].text;
                }

                if (t >= 1) {
                    if (pageLoaded) { finish(); return; }
                    paused = true;
                    return;
                }
                rafId = raf(frame);
            }

            setProgress(0);
            safetyId = setTimeout(finish, SAFETY_MS);
            rafId = raf(frame);
        }

        if (reduce) {
            startReveal();
        } else {
            try {
                bootPreloader();
            } catch (err) {
                root.classList.remove('pt-loading');
                body.classList.remove('pt-loading');
                root.classList.add('pt-lite');
                var stale = d.getElementById('pt-loader');
                if (stale && stale.parentNode) stale.parentNode.removeChild(stale);
                startReveal();
            }
        }

        /* =====================================================
           4. MOBILE MENU
           ===================================================== */
        var navToggle = d.getElementById('nav-toggle');
        if (navToggle) {
            d.addEventListener('click', function (e) {
                var t = e.target;
                if (t.closest && t.closest('.nav-link')) navToggle.checked = false;
            });
            d.addEventListener('keydown', function (e) {
                if (e.key === 'Escape' && navToggle.checked) {
                    navToggle.checked = false;
                    navToggle.focus();
                }
            });
        }

        /* =====================================================
           5. SCROLL SPY
           ===================================================== */
        (function initScrollSpy() {
            if (!('IntersectionObserver' in window)) return;

            var links = d.querySelectorAll('.nav-link');
            if (!links.length) return;

            var linkFor  = new Map();
            var sections = [];

            for (var i = 0; i < links.length; i++) {
                var link = links[i];
                var href = link.getAttribute('href');
                if (!href || href.charAt(0) !== '#' || href.length < 2) continue;

                var section = d.getElementById(href.slice(1));
                if (!section) continue;

                var bucket = linkFor.get(section);
                if (bucket) bucket.push(link);
                else { linkFor.set(section, [link]); sections.push(section); }
            }
            if (!sections.length) return;

            var ratios    = new Map();
            var activeSec = null;

            function setActive(section) {
                if (section === activeSec) return;
                activeSec = section;

                for (var i = 0; i < links.length; i++) links[i].classList.remove('active');
                var bucket = linkFor.get(section);
                if (bucket) for (var j = 0; j < bucket.length; j++) bucket[j].classList.add('active');
            }

            var io = new IntersectionObserver(function (entries) {
                for (var i = 0; i < entries.length; i++) {
                    var e = entries[i];
                    if (e.isIntersecting) ratios.set(e.target, e.intersectionRatio);
                    else ratios.delete(e.target);
                }

                var best = null, bestRatio = -1;
                ratios.forEach(function (r, el) {
                    if (r > bestRatio) { bestRatio = r; best = el; }
                });
                if (best) setActive(best);
            }, {
                rootMargin: '-45% 0px -50% 0px',
                threshold: [0, 0.25, 0.5, 0.75, 1]
            });

            for (var k = 0; k < sections.length; k++) io.observe(sections[k]);
        })();

        /* =====================================================
           6. TABS
           ===================================================== */
        (function initTabs() {
            var tabsRoot = d.querySelector('.tabs-radio');
            if (!tabsRoot) return;

            var links  = tabsRoot.querySelectorAll('.tab-link');
            var panels = tabsRoot.querySelectorAll('.tab-content');
            if (!links.length || !panels.length) return;

            var byId    = new Map();
            var indexOf = new Map();
            for (var i = 0; i < panels.length; i++) byId.set(panels[i].id, panels[i]);
            for (var j = 0; j < links.length; j++)  indexOf.set(links[j], j);

            function activate(id, updateURL) {
                var panel = byId.get(id);
                if (!panel) return;

                for (var i = 0; i < panels.length; i++) {
                    var p  = panels[i];
                    var on = p === panel;
                    p.hidden = !on;
                    p.classList.toggle('active', on);
                }

                var hash = '#' + id;
                for (var j = 0; j < links.length; j++) {
                    var l  = links[j];
                    var on = l.getAttribute('href') === hash;
                    l.classList.toggle('active', on);
                    l.setAttribute('aria-selected', on ? 'true' : 'false');
                    l.tabIndex = on ? 0 : -1;
                }

                if (updateURL) {
                    try { history.replaceState(null, '', hash); } catch (_) {}
                }
            }

            tabsRoot.addEventListener('click', function (e) {
                var link = e.target.closest && e.target.closest('.tab-link');
                if (!link || !tabsRoot.contains(link)) return;
                e.preventDefault();
                activate(link.getAttribute('href').slice(1), true);
            });

            tabsRoot.addEventListener('keydown', function (e) {
                var link = e.target.closest && e.target.closest('.tab-link');
                if (!link) return;

                var i = indexOf.get(link), n = -1, k = e.key;
                if (k === 'ArrowRight')     n = (i + 1) % links.length;
                else if (k === 'ArrowLeft') n = (i - 1 + links.length) % links.length;
                else if (k === 'Home')      n = 0;
                else if (k === 'End')       n = links.length - 1;
                if (n < 0) return;

                e.preventDefault();
                links[n].click();
                links[n].focus();
            });

            var initial = location.hash.slice(1);
            activate(byId.has(initial) ? initial : panels[0].id, false);
        })();

        /* =====================================================
           7. MODAL
           ===================================================== */
        (function initModal() {
            var modal = d.getElementById('modal-email');
            if (!modal) return;

            var FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),' +
                            'select:not([disabled]),textarea:not([disabled]),' +
                            '[tabindex]:not([tabindex="-1"])';

            var lastFocus = null;
            var isOpen    = false;

            function onKeydown(e) {
                if (e.key === 'Escape') { e.preventDefault(); close(); return; }
                if (e.key !== 'Tab') return;

                var items = modal.querySelectorAll(FOCUSABLE);
                if (!items.length) return;
                var first = items[0], last = items[items.length - 1];

                if (e.shiftKey && d.activeElement === first) {
                    e.preventDefault(); last.focus();
                } else if (!e.shiftKey && d.activeElement === last) {
                    e.preventDefault(); first.focus();
                }
            }

            function open() {
                if (isOpen) return;
                isOpen = true;
                lastFocus = d.activeElement;

                modal.classList.add('open');
                body.classList.add('modal-open');
                d.addEventListener('keydown', onKeydown);

                var target = modal.querySelector('.btn') || modal.querySelector(FOCUSABLE);
                if (target) target.focus();
            }

            function close() {
                if (!isOpen) return;
                isOpen = false;

                modal.classList.remove('open');
                body.classList.remove('modal-open');
                d.removeEventListener('keydown', onKeydown);

                try {
                    history.replaceState(null, '', location.pathname + location.search);
                } catch (_) {}

                if (lastFocus && lastFocus.focus) lastFocus.focus();
                lastFocus = null;
            }

            d.addEventListener('click', function (e) {
                var t = e.target;
                if (!t.closest) return;

                if (t.closest('a[href="#modal-email"]')) {
                    e.preventDefault();
                    open();
                    return;
                }
                if (isOpen && t.closest('[data-modal-close]')) {
                    e.preventDefault();
                    close();
                }
            });

            if (location.hash === '#modal-email') {
                open();
                try {
                    history.replaceState(null, '', location.pathname + location.search);
                } catch (_) {}
            }
        })();

        /* =====================================================
           READY FLAG
           ===================================================== */
        root.classList.add('pt-ready');
    });
})();