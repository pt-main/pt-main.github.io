# Files

- [assets/icon-main.png](#assets-icon-main-png)
- [assets/icon-main.pxd](#assets-icon-main-pxd)
- [assets/icon-term-high.png](#assets-icon-term-high-png)
- [assets/icon-term.png](#assets-icon-term-png)
- [assets/icon-term.pxd](#assets-icon-term-pxd)
- [assets/index.js](#assets-index-js)
- [assets/other.css](#assets-other-css)
- [assets/pt-terminal.css](#assets-pt-terminal-css)
- [assets/pt.css](#assets-pt-css)
- [assets/terminal.js](#assets-terminal-js)
- [assets/touch-main.png](#assets-touch-main-png)
- [assets/touch-main.pxd](#assets-touch-main-pxd)
- [index.html](#index-html)
- [pages/terminal.html](#pages-terminal-html)

---

> Note: all ``` ` ``` symbols was replaced to '

# assets/icon-main.png

```png
Can't read file: 'utf-8' codec can't decode byte 0x89 in position 0: invalid start byte
```

---

# assets/icon-main.pxd

```pxd
Can't read file: 'utf-8' codec can't decode byte 0xee in position 10: invalid continuation byte
```

---

# assets/icon-term-high.png

```png
Can't read file: 'utf-8' codec can't decode byte 0x89 in position 0: invalid start byte
```

---

# assets/icon-term.png

```png
Can't read file: 'utf-8' codec can't decode byte 0x89 in position 0: invalid start byte
```

---

# assets/icon-term.pxd

```pxd
Can't read file: 'utf-8' codec can't decode byte 0xed in position 14: invalid continuation byte
```

---

# assets/index.js

```js
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
```

---

# assets/other.css

```css
/* ============================================================
   PT — animation layer
   ============================================================ */

html.pt-loading,
html.pt-loading body { overflow: hidden !important; }

/* ---------- Preloader ---------- */
#pt-loader {
    position: fixed;
    inset: 0;
    z-index: 99999;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 26px;
    background: radial-gradient(130% 90% at 50% -20%, #221b17 0%, #0b0a09 58%, #08070a 100%);
    font-family: var(--font-family, ui-monospace, monospace);
    opacity: 1;
    visibility: visible;
    transition: opacity .6s cubic-bezier(.22,1,.36,1), visibility .6s;
    contain: layout paint style; 
}
#pt-loader::before {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    background-image:
        linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px);
    background-size: 48px 48px, 48px 48px;
    -webkit-mask-image: radial-gradient(60% 50% at 50% 50%, #000 0%, transparent 100%);
            mask-image: radial-gradient(60% 50% at 50% 50%, #000 0%, transparent 100%);
    opacity: .7;
}
#pt-loader.pt-loader-done {
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
}

.pt-loader-mark {
    display: inline-flex;
    align-items: baseline;
    gap: 8px;
    font-size: clamp(1.75rem, 6vw, 2.75rem);
    font-weight: 600;
    letter-spacing: -0.06em;
    color: var(--c-text-main, #f5f3f0);
    text-shadow: 0 0 26px rgba(255, 138, 101, .35);
}
.pt-loader-dollar { color: #fcb799; font-weight: 700; }
.pt-loader-caret {
    display: inline-block;
    width: .5ch;
    height: .9em;
    background: var(--c-accent, #ed5e3e);
    box-shadow: 0 0 14px rgba(255, 94, 58, .85);
    transform: translateY(.06em);
    animation: pt-caret-blink 1.05s steps(1, end) infinite;
}
@keyframes pt-caret-blink { 0%, 49% { opacity: 1 } 50%, 100% { opacity: 0 } }

.pt-loader-bar {
    position: relative;
    width: min(280px, 62vw);
    height: 3px;
    border-radius: 999px;
    background: rgba(255, 255, 255, .06);
    overflow: hidden;
}

.pt-loader-fill {
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: linear-gradient(90deg, #ed5e3e 0%, #ff8a65 100%);
    box-shadow: 0 0 22px rgba(255, 94, 58, .6);
    transform: scaleX(0);
    transform-origin: 0 50%;
    will-change: transform;
}
.pt-loader-status {
    font-size: .6875rem;
    letter-spacing: .2em;
    text-transform: uppercase;
    color: var(--c-text-secondary, #786f67);
    min-height: 1em;      
}

/* ---------- Motion-only choreography ---------- */
@media (prefers-reduced-motion: no-preference) {

    html.js .reveal {
        opacity: 0;
        transform: translate3d(0, 56px, 0);
        backface-visibility: hidden;
        animation: none !important;
    }
    html.js .reveal.pt-in {
        animation: pt-reveal-in .55s cubic-bezier(.22, 1, .36, 1) var(--pt-delay, 0ms) both !important;
        will-change: transform, opacity;
    }

    html.pt-lite .reveal,
    html.pt-lite .reveal.pt-in {
        animation: none !important;
        opacity: 1;
        transform: none;
        will-change: auto;
    }

    @keyframes pt-reveal-in {
        from { opacity: 0; transform: translate3d(0, 56px, 0); }
        to   { opacity: 1; transform: translate3d(0, 0, 0);    }
    }

    html.pt-lite .reveal,
    html.pt-lite .reveal.pt-in {
        animation: none !important;
        opacity: 1;
        transform: none;
        will-change: auto;
    }

    /* ---- Navbar -------------------------------------------- */
    .navbar {
        transition:
            all .35s cubic-bezier(.22, 1, .36, 1),
            opacity .7s cubic-bezier(.22, 1, .36, 1) .12s,
            transform .7s cubic-bezier(.22, 1, .36, 1) .12s;
    }
    html.pt-loading .navbar {
        opacity: 0;
        transform: translateY(-14px);
        pointer-events: none;
    }
    .hero.pt-seq > * {
        opacity: 0;
        transform: translate3d(0, 18px, 0);
        backface-visibility: hidden;
    }
    .hero.pt-seq.pt-hero-in > * {
        animation: pt-hero-in .7s cubic-bezier(.22, 1, .36, 1) var(--pt-delay, 0ms) both;
        will-change: transform, opacity;
    }
    @keyframes pt-hero-in {
        from { opacity: 0; transform: translate3d(0, 18px, 0); }
        to   { opacity: 1; transform: translate3d(0, 0, 0);    }
    }
}
```

---

# assets/pt-terminal.css

```css
/* =========================================
   PT-TERMINAL - virtual shell page
   ========================================= */

.term-page {
    min-height: 100vh;
    min-height: 100dvh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-6);
    background:
        radial-gradient(circle at 50% 0%, rgba(255, 94, 58, 0.06) 0%, transparent 60%),
        var(--c-bg);
    overflow: hidden;
}

.term-main {
    width: 100%;
    max-width: 1100px;
    height: calc(100vh - var(--space-6) * 2);
    height: calc(100dvh - var(--space-6) * 2);
    display: flex;
    align-items: stretch;
    justify-content: stretch;

    /* CRT power-on */
    transform-origin: 50% 50%;
    animation: crt-power-on 0.85s cubic-bezier(0.2, 0.85, 0.2, 1) both;
}

/* ---------- Terminal window ---------- */
.term {
    position: relative;
    display: flex;
    flex-direction: column;
    width: 100%;
    background: #0a0705;
    border: 1px solid var(--c-border);
    border-radius: var(--radius-lg);
    overflow: hidden;
    font-family: var(--font-family);
    font-size: var(--font-size-s);
    line-height: 1.55;
    box-shadow:
        0 30px 80px rgba(0, 0, 0, 0.7),
        0 0 100px rgba(255, 94, 58, 0.05),
        inset 0 0 0 1px rgba(255, 255, 255, 0.02);
    transition: background-color 0.4s ease, color 0.4s ease;
}

/* =========================================
   CRT OVERLAYS
   ========================================= */

/* Vignette + film grain */
.term::before {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 7;
    background:
        radial-gradient(
            ellipse 130% 110% at 50% 50%,
            transparent 42%,
            rgba(0, 0, 0, 0.30) 78%,
            rgba(0, 0, 0, 0.60) 100%
        ),
        url("data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E");
    background-size: 100% 100%, 180px 180px;
    opacity: var(--t-vig, 0.85);
    mix-blend-mode: multiply;
    animation: crt-flicker 6s linear infinite;
    transition: opacity 0.4s ease;
}

/* Scanlines */
.term::after {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 7;
    background: repeating-linear-gradient(
        0deg,
        var(--t-scan-color, rgba(0, 0, 0, 0.08)) 0px,
        var(--t-scan-color, rgba(0, 0, 0, 0.08)) 1px,
        transparent 1px,
        transparent 3px
    );
    opacity: 0.5;
    mix-blend-mode: multiply;
    transition: opacity 0.4s ease;
}


/* ---------- Header (reuse existing dot/title styles from pt.css) ---------- */
.term .terminal-header {
    position: relative;
    z-index: 8;
    background: rgba(255, 255, 255, 0.02);
    flex-shrink: 0;
}

.term .terminal-title {
    flex: 1;
    margin-left: var(--space-2);
}

.term-close {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    border-radius: var(--radius-sm);
    color: var(--c-text-tertiary);
    font-size: var(--font-size-l);
    line-height: 1;
    transition: var(--transition-fast);
}
.term-close:hover {
    background: rgba(255, 255, 255, 0.05);
    color: var(--c-text-main);
}

/* ---------- Body (scroll area) ---------- */
.term-body {
    flex: 1;
    overflow-y: auto;
    padding: var(--space-5) var(--space-6);
    color: var(--c-text-main);
    scrollbar-width: thin;
    scrollbar-color: var(--c-text-tertiary) transparent;
    cursor: text;
    position: relative;
    z-index: 4;
}
.term-body::-webkit-scrollbar { width: 8px; }
.term-body::-webkit-scrollbar-track { background: transparent; }
.term-body::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.08);
    border-radius: 4px;
}
.term-body::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.15); }

.term-output { display: block; }

/* ---------- Lines ---------- */
.term-line {
    white-space: pre-wrap;
    word-break: break-word;
    margin: 0;
    min-height: 1.55em;
}

.term-line.term-cmd {
    color: var(--c-text-main);
    margin-top: var(--space-3);
    font-weight: 500;
}
.term-line.term-cmd:first-child { margin-top: 0; }

.term-cmd-text { color: var(--c-text-main); }

.term-prompt {
    color: var(--c-accent-bright);
    font-weight: 600;
    user-select: none;
}

.term-line.term-out       { color: var(--c-text-secondary); }
.term-line.term-out-dim   { color: var(--c-text-tertiary); }
.term-line.term-dim       { color: var(--c-text-ghost); }
.term-line.term-err       { color: var(--c-error); }
.term-line.term-ok,
.term-line.term-success   { color: var(--c-success); }
.term-line.term-head      { color: var(--c-accent); font-weight: 600; }
.term-line.term-accent    { color: var(--c-accent-bright); }
.term-line.term-welcome   { color: var(--c-text-main); font-weight: 600; margin-top: var(--space-2); }
.term-line.term-boot-ok   { color: var(--c-success); font-size: var(--font-size-xs); letter-spacing: 0.02em; }

.term-key      { color: var(--c-text-tertiary); }
.term-accent   { color: var(--c-accent-bright); }
.term-success  { color: var(--c-success); }
.term-dim      { color: var(--c-text-ghost); }
.term-out-dim  { color: var(--c-text-tertiary); }
.term-dir      { color: var(--c-info); }

.term-cmd-name {
    color: var(--c-accent-bright);
    display: inline-block;
}

.term-link {
    color: var(--c-accent-bright);
    text-decoration: none;
    border-bottom: 1px dashed rgba(255, 138, 101, 0.35);
    transition: var(--transition-fast);
}
.term-link:hover {
    color: var(--c-accent);
    border-bottom-color: var(--c-accent);
    border-bottom-style: solid;
}

/* ---------- Input line (fixed at bottom) ---------- */
.term-input-line {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-3) var(--space-6) var(--space-5);
    border-top: 1px solid var(--c-border);
    background: rgba(255, 255, 255, 0.012);
    flex-shrink: 0;
    position: relative;
    z-index: 8;
}

.term-input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    color: var(--c-text-main);
    font: inherit;
    letter-spacing: inherit;
    padding: 0;
    caret-color: var(--c-accent-bright);
    min-width: 0;
    transition: text-shadow 0.4s ease;
}

.term-input::selection {
    background: rgba(255, 94, 58, 0.4);
    color: #fff;
}


/* =========================================
   CRT ANIMATIONS
   ========================================= */

/* Power-on: thin line expands vertically with a bright flash */
@keyframes crt-power-on {
    0% {
        transform: scaleY(0.004) scaleX(0.72);
        filter: brightness(6) blur(4px) saturate(1.6);
        opacity: 0;
    }
    35% {
        transform: scaleY(0.03) scaleX(1);
        filter: brightness(2.6) blur(1.5px);
        opacity: 1;
    }
    62% {
        transform: scaleY(1) scaleX(1);
        filter: brightness(1.7) blur(0.5px);
    }
    82% {
        filter: brightness(1.25) blur(0);
    }
    100% {
        transform: scaleY(1) scaleX(1);
        filter: brightness(1) blur(0);
    }
}

/* Subtle CRT flicker: tiny dips in overlay opacity */
@keyframes crt-flicker {
    0%, 17%, 22%, 49%, 53%, 76%, 100% {
        opacity: var(--t-vig, 0.85);
    }
    19%, 51%, 74% {
        opacity: calc(var(--t-vig, 0.85) * 0.82);
    }
    20%, 52%, 75% {
        opacity: calc(var(--t-vig, 0.85) * 1.05);
    }
}

/* Theme switch flash — applied by JS via class */
.term.term--flash {
    animation: term-flash 0.55s cubic-bezier(0.2, 0.9, 0.3, 1);
}
@keyframes term-flash {
    0% {
        box-shadow:
            0 30px 80px var(--t-shadow, rgba(0, 0, 0, 0.72)),
            0 0 100px var(--t-glow, transparent),
            inset 0 0 0 1px var(--t-inset, transparent);
    }
    18% {
        box-shadow:
            0 30px 80px var(--t-shadow, rgba(0, 0, 0, 0.72)),
            0 0 180px var(--t-bright, transparent),
            0 0 40px var(--t-bright, transparent),
            inset 0 0 0 2px var(--t-bright, transparent);
    }
    100% {
        box-shadow:
            0 30px 80px var(--t-shadow, rgba(0, 0, 0, 0.72)),
            0 0 100px var(--t-glow, transparent),
            inset 0 0 0 1px var(--t-inset, transparent);
    }
}


/* =========================================
   THEMES
   ========================================= */

.term[data-theme] {
    background: var(--t-bg, #0a0705);
    border-color: var(--t-border, var(--c-border));
    box-shadow:
        0 30px 80px var(--t-shadow, rgba(0, 0, 0, 0.72)),
        0 0 100px var(--t-glow, transparent),
        inset 0 0 0 1px var(--t-inset, transparent);

    /* scanline defaults for dark themes */
    --t-scan-color: rgba(255, 255, 255, 0.1);
    --t-scan-blend: screen;
    --t-scan: 0.65;
    --t-vig: 0.85;
}

.term[data-theme]::after {
    opacity: var(--t-scan, 0.65);
    mix-blend-mode: var(--t-scan-blend, multiply);
}

.term[data-theme] .term-body,
.term[data-theme] .term-input {
    color: var(--t-fg, var(--c-text-main));
    caret-color: var(--t-caret, var(--t-fg));
}

.term[data-theme] .term-body { scrollbar-color: var(--t-faint, var(--c-text-tertiary)) transparent; }
.term[data-theme] .term-body::-webkit-scrollbar-thumb {
    background: var(--t-scroll, rgba(255, 255, 255, 0.08));
}
.term[data-theme] .term-body::-webkit-scrollbar-thumb:hover {
    background: var(--t-mid, rgba(255, 255, 255, 0.15));
}

.term[data-theme] .term-input-line {
    border-top-color: var(--t-border, var(--c-border));
    background: var(--t-bar-bg, rgba(255, 255, 255, 0.012));
}

.term[data-theme] .term-close { color: var(--t-mid, var(--c-text-tertiary)); }
.term[data-theme] .term-close:hover {
    background: var(--t-hover, rgba(255, 255, 255, 0.05));
    color: var(--t-fg, var(--c-text-main));
}
.term[data-theme] .term-version-badge { color: var(--t-faint, var(--c-text-ghost)); }

/* --- phosphor glow --- */
.term[data-theme] .term-prompt,
.term[data-theme] .term-line.term-cmd,
.term[data-theme] .term-line.term-welcome,
.term[data-theme] .term-accent,
.term[data-theme] .term-cmd-name,
.term[data-theme] .term-line.term-head {
    color: var(--t-bright, var(--c-accent-bright));
    border-color: var(--t-bright, var(--c-accent-bright));
    text-shadow:
        0 0 6px color-mix(in srgb, currentColor 38%, transparent),
        0 0 14px color-mix(in srgb, currentColor 18%, transparent);
}

.term[data-theme] .term-input {
    text-shadow: 0 0 5px color-mix(in srgb, var(--t-fg) 30%, transparent);
}

.term[data-theme] .term-line.term-ok,
.term[data-theme] .term-line.term-success,
.term[data-theme] .term-success,
.term[data-theme] .term-line.term-loading {
    color: var(--t-ok, var(--t-bright));
    text-shadow: 0 0 6px color-mix(in srgb, currentColor 35%, transparent);
}

.term[data-theme] .term-line.term-err {
    color: var(--t-err, var(--c-error));
    text-shadow: 0 0 8px color-mix(in srgb, currentColor 40%, transparent);
}

/* --- rest of the per-line tokens --- */
.term[data-theme] .term-line.term-out,
.term[data-theme] .term-key { color: var(--t-mid, var(--c-text-tertiary)); }

.term[data-theme] .term-line.term-dim,
.term[data-theme] .term-dim,
.term[data-theme] .term-out-dim,
.term[data-theme] .term-line.term-boot-ok { color: var(--t-faint, var(--c-text-ghost)); }

.term[data-theme] .term-line.term-head { color: var(--t-head, var(--t-bright)); }
.term[data-theme] .term-line.term-err  { color: var(--t-err, var(--c-error)); }

.term[data-theme] .term-dir { color: var(--t-dir, var(--t-mid)); }

.term[data-theme] .term-link {
    color: var(--t-bright);
    border-bottom-color: color-mix(in srgb, var(--t-bright) 45%, transparent);
    text-shadow: 0 0 6px color-mix(in srgb, currentColor 30%, transparent);
}
.term[data-theme] .term-link:hover {
    color: var(--t-caret, var(--t-bright));
    border-bottom-color: var(--t-caret, var(--t-bright));
    text-shadow: 0 0 10px color-mix(in srgb, currentColor 45%, transparent);
}

.term[data-theme] ::selection,
.term[data-theme] .term-input::selection {
    background: var(--t-sel, rgba(255, 255, 255, 0.25));
    color: var(--t-sel-fg, #fff);
}


/* ---------- amber · тёплый янтарный CRT ---------- */
.term[data-theme="amber"] {
    --t-bg: #1a1108;
    --t-fg: #ffb454;
    --t-caret: #ffcf8a;
    --t-bright: #ffd79a;
    --t-mid: #c68a44;
    --t-faint: #7d5628;
    --t-head: #ffc478;
    --t-err: #ff8f6b;
    --t-ok: #ffd79a;
    --t-dir: #e0aa66;
    --t-border: rgba(255, 180, 84, 0.16);
    --t-glow: rgba(255, 180, 84, 0.09);
    --t-inset: rgba(255, 180, 84, 0.05);
    --t-sel: rgba(255, 180, 84, 0.28);
    --t-sel-fg: #2a1c0c;
    --t-hover: rgba(255, 180, 84, 0.08);
    --t-scroll: rgba(255, 180, 84, 0.18);
    --t-bar-bg: rgba(255, 180, 84, 0.03);
}


/* ---------- green · фосфорный зелёный ---------- */
.term[data-theme="green"] {
    --t-bg: #0a1410;
    --t-fg: #45d98a;
    --t-caret: #7bf0b4;
    --t-bright: #96f5c4;
    --t-mid: #2f9e66;
    --t-faint: #1b5c3d;
    --t-head: #b6f7d2;
    --t-err: #ff7d84;
    --t-ok: #96f5c4;
    --t-dir: #5fe3d0;
    --t-border: rgba(69, 217, 138, 0.16);
    --t-glow: rgba(69, 217, 138, 0.09);
    --t-inset: rgba(69, 217, 138, 0.05);
    --t-sel: rgba(69, 217, 138, 0.28);
    --t-sel-fg: #06180f;
    --t-hover: rgba(69, 217, 138, 0.08);
    --t-scroll: rgba(69, 217, 138, 0.18);
    --t-bar-bg: rgba(69, 217, 138, 0.025);
}


/* ---------- cyan · холодный неоновый ---------- */
.term[data-theme="cyan"] {
    --t-bg: #08131a;
    --t-fg: #6fdcf2;
    --t-caret: #a8f0ff;
    --t-bright: #c3f4ff;
    --t-mid: #2f9bb6;
    --t-faint: #1d5668;
    --t-head: #dcf9ff;
    --t-err: #ff8098;
    --t-ok: #7df0c0;
    --t-dir: #a8f0ff;
    --t-border: rgba(111, 220, 242, 0.16);
    --t-glow: rgba(111, 220, 242, 0.09);
    --t-inset: rgba(111, 220, 242, 0.05);
    --t-sel: rgba(111, 220, 242, 0.28);
    --t-sel-fg: #04141c;
    --t-hover: rgba(111, 220, 242, 0.09);
    --t-scroll: rgba(111, 220, 242, 0.18);
    --t-bar-bg: rgba(111, 220, 242, 0.025);
}


/* ---------- blue · спокойный синий ---------- */
.term[data-theme="blue"] {
    --t-bg: #0a1020;
    --t-fg: #92b4ff;
    --t-caret: #bccfff;
    --t-bright: #d6e0ff;
    --t-mid: #5c7bd8;
    --t-faint: #2e427e;
    --t-head: #e6ecff;
    --t-err: #ff8199;
    --t-ok: #74e6b8;
    --t-dir: #9dbcff;
    --t-border: rgba(146, 180, 255, 0.16);
    --t-glow: rgba(146, 180, 255, 0.1);
    --t-inset: rgba(146, 180, 255, 0.05);
    --t-sel: rgba(146, 180, 255, 0.3);
    --t-sel-fg: #071022;
    --t-hover: rgba(146, 180, 255, 0.1);
    --t-scroll: rgba(146, 180, 255, 0.2);
    --t-bar-bg: rgba(146, 180, 255, 0.03);
}


/* ---------- cyberpunk · неон-пурпур / циан ---------- */
.term[data-theme="cyberpunk"] {
    --t-bg: #12061f;
    --t-fg: #ff7ddb;
    --t-caret: #ffa6ea;
    --t-bright: #ffbdf0;
    --t-mid: #b34d97;
    --t-faint: #612655;
    --t-head: #84f7ff;
    --t-err: #ff5f7d;
    --t-ok: #84f7ff;
    --t-dir: #84f7ff;
    --t-border: rgba(255, 125, 219, 0.2);
    --t-glow: rgba(255, 125, 219, 0.12);
    --t-inset: rgba(132, 247, 255, 0.06);
    --t-sel: rgba(255, 125, 219, 0.32);
    --t-sel-fg: #1c0726;
    --t-hover: rgba(132, 247, 255, 0.1);
    --t-scroll: rgba(255, 125, 219, 0.24);
    --t-bar-bg: rgba(132, 247, 255, 0.03);
}


/* ---------- dracula ---------- */
.term[data-theme="dracula"] {
    --t-bg: #282a36;
    --t-fg: #f2f2ec;
    --t-caret: #bd93f9;
    --t-bright: #c8a2ff;
    --t-mid: #a3adcd;
    --t-faint: #6272a4;
    --t-head: #8be9fd;
    --t-err: #ff6b6b;
    --t-ok: #5cf58a;
    --t-dir: #8be9fd;
    --t-border: rgba(189, 147, 249, 0.18);
    --t-glow: rgba(189, 147, 249, 0.1);
    --t-inset: rgba(189, 147, 249, 0.05);
    --t-sel: rgba(189, 147, 249, 0.32);
    --t-sel-fg: #f8f8f2;
    --t-hover: rgba(189, 147, 249, 0.1);
    --t-scroll: rgba(189, 147, 249, 0.24);
    --t-bar-bg: rgba(189, 147, 249, 0.04);
}


/* ---------- nord ---------- */
.term[data-theme="nord"] {
    --t-bg: #2e3440;
    --t-fg: #dbe2ee;
    --t-caret: #88c0d0;
    --t-bright: #9dd3e2;
    --t-mid: #a6b1c6;
    --t-faint: #566176;
    --t-head: #8fadcc;
    --t-err: #cc737c;
    --t-ok: #aecf96;
    --t-dir: #96c6c5;
    --t-border: rgba(136, 192, 208, 0.16);
    --t-glow: rgba(136, 192, 208, 0.09);
    --t-inset: rgba(136, 192, 208, 0.05);
    --t-sel: rgba(136, 192, 208, 0.28);
    --t-sel-fg: #eceff4;
    --t-hover: rgba(136, 192, 208, 0.1);
    --t-scroll: rgba(136, 192, 208, 0.2);
    --t-bar-bg: rgba(136, 192, 208, 0.035);
}


/* ---------- solarized dark ---------- */
.term[data-theme="solarized"] {
    --t-bg: #002b36;
    --t-fg: #9fadad;
    --t-caret: #c99a00;
    --t-bright: #eee8d5;
    --t-mid: #8b9c9c;
    --t-faint: #586e75;
    --t-head: #3d9fe0;
    --t-err: #e05a52;
    --t-ok: #96a800;
    --t-dir: #38b3a8;
    --t-border: rgba(147, 161, 161, 0.16);
    --t-glow: rgba(38, 139, 210, 0.1);
    --t-inset: rgba(147, 161, 161, 0.04);
    --t-sel: rgba(38, 139, 210, 0.3);
    --t-sel-fg: #fdf6e3;
    --t-hover: rgba(147, 161, 161, 0.1);
    --t-scroll: rgba(147, 161, 161, 0.2);
    --t-bar-bg: rgba(147, 161, 161, 0.035);
}


/* ---------- crimson · тёплый багровый ---------- */
.term[data-theme="crimson"] {
    --t-bg: #1a080b;
    --t-fg: #f58b8b;
    --t-caret: #ffadad;
    --t-bright: #ffc6c6;
    --t-mid: #c25550;
    --t-faint: #6e2a26;
    --t-head: #ffd6a8;
    --t-err: #ff5468;
    --t-ok: #7ee0a8;
    --t-dir: #ffb08a;
    --t-border: rgba(245, 139, 139, 0.17);
    --t-glow: rgba(255, 70, 70, 0.1);
    --t-inset: rgba(245, 139, 139, 0.05);
    --t-sel: rgba(245, 139, 139, 0.3);
    --t-sel-fg: #24090c;
    --t-hover: rgba(245, 139, 139, 0.1);
    --t-scroll: rgba(245, 139, 139, 0.2);
    --t-bar-bg: rgba(245, 139, 139, 0.03);
}


/* ---------- mono · нейтральный монохром ---------- */
.term[data-theme="mono"] {
    --t-bg: #101012;
    --t-fg: #d6d6db;
    --t-caret: #ffffff;
    --t-bright: #f4f4f6;
    --t-mid: #9c9ca5;
    --t-faint: #5b5b64;
    --t-head: #ffffff;
    --t-err: #ff7b7b;
    --t-ok: #e6e6ea;
    --t-dir: #bfbfc8;
    --t-border: rgba(255, 255, 255, 0.12);
    --t-glow: rgba(255, 255, 255, 0.05);
    --t-inset: rgba(255, 255, 255, 0.03);
    --t-sel: rgba(255, 255, 255, 0.2);
    --t-sel-fg: #101012;
    --t-hover: rgba(255, 255, 255, 0.07);
    --t-scroll: rgba(255, 255, 255, 0.15);
    --t-bar-bg: rgba(255, 255, 255, 0.025);
}


/* ---------- light · тёплая бумага ---------- */
.term[data-theme="light"] {
    --t-bg: #faf8f4;
    --t-fg: #3a342e;
    --t-caret: #d9532b;
    --t-bright: #b83c1c;
    --t-mid: #6b625a;
    --t-faint: #a09689;
    --t-head: #b83c1c;
    --t-err: #c0392b;
    --t-ok: #2e7d4f;
    --t-dir: #1f6f8b;
    --t-border: rgba(58, 52, 46, 0.14);
    --t-glow: rgba(217, 83, 43, 0.08);
    --t-inset: rgba(0, 0, 0, 0.03);
    --t-sel: rgba(217, 83, 43, 0.22);
    --t-sel-fg: #2a2522;
    --t-hover: rgba(58, 52, 46, 0.06);
    --t-scroll: rgba(58, 52, 46, 0.18);
    --t-bar-bg: rgba(58, 52, 46, 0.03);
    --t-shadow: rgba(60, 45, 30, 0.18);

    /* scanline + vignette overrides for light theme */
    --t-scan-color: rgba(0, 0, 0, 0.09);
    --t-scan-blend: multiply;
    --t-scan: 0.35;
    --t-vig: 0.5;
}


/* ---------- Responsive ---------- */
@media (max-width: 900px) {
    .term-page { padding: var(--space-3); }
    .term-main {
        height: calc(100vh - var(--space-3) * 2);
        height: calc(100dvh - var(--space-3) * 2);
    }
    .term { font-size: var(--font-size-xs); }
    .term-body { padding: var(--space-4); }
    .term-input-line { padding: var(--space-3) var(--space-4) var(--space-4); }
}

@media (max-width: 480px) {
    .term { border-radius: var(--radius-md); }
    .term .terminal-title { display: none; }
}

/* ---------- Motion preferences ---------- */
@media (prefers-reduced-motion: reduce) {
    .term-main,
    .term,
    .term * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
    }
    .term::before { animation: none; }
}

/* ---------- Print ---------- */
@media print {
    .term-page { background: #fff; padding: 0; }
    .term {
        background: #fff;
        border: 1px solid #ccc;
        box-shadow: none;
        height: auto;
    }
    .term::after,
    .term::before { display: none; }
    .term-main { animation: none; }
    .term-body, .term-input { color: #000 !important; text-shadow: none !important; }
    .term-input-line, .term-close { display: none; }
}


/* =========================================
   MARK: Release loader
   ========================================= */
.term-line.term-loading {
    color: var(--c-warning);
    animation: term-dots 1.2s steps(4, end) infinite;
}

.term-line.term-loading::after {
    content: "…";
    display: inline-block;
    width: 1em;
    overflow: hidden;
    vertical-align: bottom;
    animation: term-dots 1.2s steps(4, end) infinite;
}

.term-version-badge {
    font-size: 10px;
    color: var(--c-text-ghost);
    margin-left: auto;
    margin-right: var(--space-2);
    letter-spacing: 0.05em;
    text-transform: uppercase;
}
```

---

# assets/pt.css

```css
/* =========================================
    PT - Monospace Design System for PT™
    Theme: Warm Obsidian & Cyber Coral
    ========================================= */

/* =========================================
   MARK:  1. CORE VARIABLES & RESET
    ========================================= */
/* =========================================
    PT - Monospace Design System for PT™
    Theme: Cool Obsidian & Cyber Coral
    ========================================= */
:root {
    /* ---------- 1.1 Base palette ---------- */
    --c-white: #ffffff;
    --c-black: #000000;

    /* ---------- 1.2 Surfaces, borders, dividers ---------- */
    --c-bg: #0a0a0c;                   
    --c-surface: #131316;
    --c-surface-elevated: #1b1b1f;
    --c-surface-hover: #242429;
    --c-border: rgba(255, 255, 255, 0.08);
    --c-border-hover: rgba(255, 157, 122, 0.30);
    --c-divider: rgba(255, 255, 255, 0.09);

    /* ---------- 1.3 Text ---------- */
    --c-text-main: #f6f4f1;
    --c-text-main-accent: #ffefea;
    --c-text-secondary: #9a938c;  
    --c-text-tertiary: #6c665f;   
    --c-text-ghost: #565049;      

    /* ---------- 1.4 Accent (Cyber Coral) ---------- */
    --c-accent: #ff5533;                   
    --c-accent-hover: #ff7455;             
    --c-accent-bright: #ff9d7a;
    --c-accent-glow: rgba(255, 85, 51, 0.32);
    --c-accent-glow-strong: rgba(255, 85, 51, 0.55);

    /* Accent alpha ramp (255, 85, 51) */
    --c-accent-a02: rgba(255, 85, 51, 0.02);
    --c-accent-a04: rgba(255, 85, 51, 0.04);
    --c-accent-a05: rgba(255, 85, 51, 0.05);
    --c-accent-a06: rgba(255, 85, 51, 0.06);
    --c-accent-a08: rgba(255, 85, 51, 0.08);
    --c-accent-a10: rgba(255, 85, 51, 0.10);
    --c-accent-a15: rgba(255, 85, 51, 0.15);
    --c-accent-a18: rgba(255, 85, 51, 0.18);
    --c-accent-a20: rgba(255, 85, 51, 0.20);
    --c-accent-a25: rgba(255, 85, 51, 0.25);
    --c-accent-a30: rgba(255, 85, 51, 0.30);
    --c-accent-a35: rgba(255, 85, 51, 0.35);
    --c-accent-a40: rgba(255, 85, 51, 0.40);

    /* Accent-bright (peach) alpha ramp — 255, 157, 122 */
    --c-peach-a02: rgba(255, 157, 122, 0.02);
    --c-peach-a025: rgba(255, 157, 122, 0.025);
    --c-peach-a06: rgba(255, 157, 122, 0.06);
    --c-peach-a10: rgba(255, 157, 122, 0.10);
    --c-peach-a15: rgba(255, 157, 122, 0.15);
    --c-peach-a18: rgba(255, 157, 122, 0.18);
    --c-peach-solid: rgba(255, 157, 122, 1);
    --c-peach-highlight: rgba(255, 210, 190, 0.24);

    /* ---------- 1.5 Semantic states ---------- */
    --c-success: #4ade80;
    --c-warning: #fbbf24;
    --c-error: #f87171;
    --c-info: #38bdf8;                 

    --c-success-a08: rgba(74, 222, 128, 0.08);
    --c-success-a15: rgba(74, 222, 128, 0.15);
    --c-success-a40: rgba(74, 222, 128, 0.40);
    --c-warning-a08: rgba(251, 191, 36, 0.08);
    --c-warning-a15: rgba(251, 191, 36, 0.15);
    --c-warning-a40: rgba(251, 191, 36, 0.40);
    --c-error-a08: rgba(248, 113, 113, 0.08);
    --c-error-a15: rgba(248, 113, 113, 0.15);
    --c-error-a40: rgba(248, 113, 113, 0.40);
    --c-info-a08: rgba(56, 189, 248, 0.08);
    --c-info-a15: rgba(56, 189, 248, 0.15);
    --c-info-a40: rgba(56, 189, 248, 0.40);

    /* ---------- 1.6 White alpha ramp ---------- */
    --c-white-a02: rgba(255, 255, 255, 0.02);
    --c-white-a03: rgba(255, 255, 255, 0.03);
    --c-white-a04: rgba(255, 255, 255, 0.04);
    --c-white-a05: rgba(255, 255, 255, 0.05);
    --c-white-a06: rgba(255, 255, 255, 0.06);
    --c-white-a08: rgba(255, 255, 255, 0.08);
    --c-white-a10: rgba(255, 255, 255, 0.10);
    --c-white-a11: rgba(255, 255, 255, 0.11);

    /* ---------- 1.7 Black alpha ramp ---------- */
    --c-black-a28: rgba(0, 0, 0, 0.28);
    --c-black-a35: rgba(0, 0, 0, 0.35);
    --c-black-a40: rgba(0, 0, 0, 0.40);
    --c-black-a45: rgba(0, 0, 0, 0.45);
    --c-black-a55: rgba(0, 0, 0, 0.55);
    --c-black-a60: rgba(0, 0, 0, 0.60);
    --c-black-a70: rgba(0, 0, 0, 0.70);

    /* ---------- 1.8 Component-specific colors ---------- */
    --c-logo-accent: #ffb599;

    --c-badge-bg: rgba(200, 50, 19, 0.246); 
    --c-badge-text: #ff9d7a;

    --c-card-dark-bg: #08080a;
    --c-card-dark-border: rgba(255, 255, 255, 0.04);
    --c-card-dark-text: #ffffff;
    --c-card-dark-muted: #6b6b76;     
    --c-card-elevated-border: rgba(255, 255, 255, 0.08);

    --c-navbar-bg: rgba(10, 10, 12, 0.62);
    --c-navbar-bg-mobile: rgba(10, 10, 12, 0.85);
    --c-navbar-menu-bg: rgba(10, 10, 12, 0.96);

    --c-overlay: rgba(0, 0, 0, 0.72);

    --c-selection-bg: rgba(255, 85, 51, 0.35);
    --c-selection-text: #ffffff;

    --c-hero-tagline: #8a3d22;
    --c-hero-desc: rgba(255, 239, 234, 0.90);

    --c-grad-text-start: #f6f4f1;
    --c-grad-text-mid: #918a83;

    /* ---------- 1.9 Gradients ---------- */
    --grad-hero-1: linear-gradient(180deg,
        #ff9d7a 0%, #c2410c 55%, #1b1b1f 90%, #08080a 100%);
    --grad-hero-2: linear-gradient(180deg, #000000 0%, #1b1b1f 100%);
    --grad-text: linear-gradient(160deg,
        var(--c-grad-text-start) 0%,
        var(--c-grad-text-mid) 50%,
        var(--c-accent) 100%);
    --grad-text-accent: linear-gradient(135deg,
        var(--c-accent-bright) 0%, var(--c-accent) 100%);
    --grad-btn-sheen: linear-gradient(180deg,
        var(--c-white-a08) 0%, transparent 100%);
    --grad-card-shine: linear-gradient(90deg,
        transparent, var(--c-peach-a10), transparent);
    --grad-accent-fallback: linear-gradient(180deg, #2a140e 0%, #131316 100%);

    /* ---------- 1.10 Typography ---------- */
    --font-family: "JetBrains Mono", "SF Mono", "Fira Code", "Cascadia Code", "Consolas", monospace;
    --font-size-xs: 0.6875rem;
    --font-size-s: 0.8125rem;
    --font-size-m: 0.9375rem;
    --font-size-l: 1.125rem;
    --font-size-xl: 1.375rem;
    --font-size-2xl: 1.75rem;
    --font-size-3xl: 2.5rem;
    --font-size-4xl: 3.5rem;
    --font-size-5xl: 4.5rem;
    --font-size-e5xl: 10rem;

    /* ---------- 1.11 Spacing scale ---------- */
    --space-1: 4px;   --space-2: 8px;   --space-3: 12px;  --space-4: 16px;
    --space-5: 20px;  --space-6: 24px;  --space-8: 32px;  --space-10: 40px;
    --space-12: 48px; --space-16: 64px; --space-20: 80px; --space-24: 96px;
    --space-32: 128px; --space-40: 160px;

    /* ---------- 1.12 Radius scale ---------- */
    --radius-sm: 6px;  --radius-md: 10px; --radius-lg: 14px;
    --radius-xl: 18px; --radius-2xl: 24px;--radius-3xl: 48px;
    --radius-full: 9999px;

    /* ---------- 1.13 Layout ---------- */
    --container-width: 960px;
    --container-wide: 1200px;
    --section-spacing: 140px;
    --navbar-height: 56px;
    --navbar-offset: 20px;
    --scroll-padding-top: 100px;

    /* ---------- 1.14 Shadows ---------- */
    --shadow-sm: 0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3);
    --shadow-md: 0 4px 12px rgba(0,0,0,0.5), 0 2px 4px rgba(0,0,0,0.4);
    --shadow-lg: 0 8px 24px rgba(0,0,0,0.6), 0 4px 8px rgba(0,0,0,0.5);
    --shadow-xl: 0 16px 48px rgba(0,0,0,0.7), 0 8px 16px rgba(0,0,0,0.6);
    --shadow-glow: 0 0 40px var(--c-accent-glow), 0 0 80px rgba(255, 85, 51, 0.12);
    --shadow-navbar: 0 4px 30px rgba(0, 0, 0, 0.30);

    /* ---------- 1.15 Glass system — base ---------- */
    --glass-bg: rgba(19, 19, 22, 0.55);
    --glass-bg-strong: rgba(10, 10, 12, 0.72);
    --glass-bg-subtle: rgba(19, 19, 22, 0.35);
    --glass-border: rgba(255, 255, 255, 0.11);
    --glass-border-hover: rgba(255, 255, 255, 0.20);
    --glass-border-subtle: rgba(255, 255, 255, 0.08);
    --glass-highlight: rgba(255, 255, 255, 0.15);
    --glass-highlight-strong: rgba(255, 255, 255, 0.22);
    --glass-inner-ring: rgba(255, 255, 255, 0.015);
    --glass-bottom-rim: rgba(0, 0, 0, 0.35);
    --glass-bottom-rim-strong: rgba(0, 0, 0, 0.45);
    --glass-bottom-rim-card-hover: rgba(0, 0, 0, 0.4);
    --glass-warm-bloom: rgba(255, 157, 122, 0.02);
    --glass-warm-bloom-strong: rgba(255, 157, 122, 0.03);

    /* ---------- 1.16 Glass system — blur ---------- */
    --glass-blur: blur(20px) saturate(180%) brightness(1.02);
    --glass-blur-strong: blur(10px) saturate(190%) brightness(1.04);
    --glass-blur-subtle: blur(5px) saturate(140%);

    /* ---------- 1.17 Glass system — shadows ---------- */
    --glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.45);
    --glass-shadow-strong: 0 16px 48px rgba(0, 0, 0, 0.6);
    --glass-shadow-subtle: 0 4px 20px rgba(0, 0, 0, 0.28);
    --glass-shadow-card-hover: 0 12px 40px rgba(0, 0, 0, 0.55);

    /* ---------- 1.18 Glass system — sheen & body ---------- */
    --glass-sheen: rgba(255, 255, 255, 0.10);
    --glass-sheen-mid: rgba(255, 255, 255, 0.025);
    --glass-sheen-strong: rgba(255, 255, 255, 0.13);
    --glass-sheen-strong-mid: rgba(255, 255, 255, 0.03);
    --glass-sheen-card: rgba(255, 255, 255, 0.09);
    --glass-sheen-card-mid: rgba(255, 255, 255, 0.02);
    --glass-sheen-hover: rgba(255, 255, 255, 0.14);
    --glass-sheen-hover-mid: rgba(255, 255, 255, 0.035);

    --glass-body: rgba(255, 255, 255, 0.06);
    --glass-body-end: rgba(255, 255, 255, 0.015);
    --glass-body-strong: rgba(255, 255, 255, 0.075);
    --glass-body-strong-end: rgba(255, 255, 255, 0.02);
    --glass-body-subtle: rgba(255, 255, 255, 0.04);
    --glass-body-subtle-end: rgba(255, 255, 255, 0.012);
    --glass-body-card: rgba(255, 255, 255, 0.05);
    --glass-body-card-end: rgba(255, 255, 255, 0.012);
    --glass-body-hover: rgba(255, 255, 255, 0.08);
    --glass-body-hover-end: rgba(255, 255, 255, 0.02);

    /* ---------- 1.19 Glass system — accent variant ---------- */
    --glass-accent-bg: rgba(28, 12, 8, 0.55);
    --glass-accent-border: rgba(255, 157, 122, 0.18);
    --glass-accent-body: rgba(255, 85, 51, 0.10);
    --glass-accent-body-end: rgba(255, 85, 51, 0.02);
    --glass-accent-sheen-mid: rgba(255, 85, 51, 0.05);
    --glass-accent-highlight: rgba(255, 210, 190, 0.24);
    --glass-accent-glow: rgba(255, 85, 51, 0.10);
    --glass-accent-focus: rgba(255, 85, 51, 0.28);
    --glass-accent-fallback-border: rgba(255, 85, 51, 0.38);

    /* ---------- 1.20 Glass system — hover accent ring ---------- */
    --glass-hover-ring: rgba(255, 157, 122, 0.08);

    /* ---------- 1.21 Transitions ---------- */
    --transition-fast: all 0.15s cubic-bezier(0.22, 1, 0.36, 1);
    --transition-smooth: all 0.35s cubic-bezier(0.22, 1, 0.36, 1);
    --transition-slow: all 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html {
    overflow-x: hidden;
    scroll-behavior: smooth;
    scroll-padding-top: var(--scroll-padding-top);
    -webkit-text-size-adjust: 100%;
}

body {
    font-family: var(--font-family);
    background-color: var(--c-bg);
    color: var(--c-text-main);
    line-height: 1.65;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    letter-spacing: -0.01em;
    font-feature-settings: "tnum" 1, "ss01" 1, "zero" 1;
    overflow-x: hidden;
}

body.modal-open { overflow: hidden; }

img { max-width: 100%; height: auto; display: block; }
a { text-decoration: none; color: inherit; transition: var(--transition-smooth); }
ul { list-style: none; }

/* Skip link */
.skip-link {
    position: absolute;
    top: -100px;
    left: var(--space-4);
    z-index: 9999;
    padding: var(--space-3) var(--space-5);
    background: var(--c-accent);
    color: var(--c-white);
    border-radius: var(--radius-md);
    font-size: var(--font-size-s);
    font-weight: 600;
    transition: top 0.2s ease;
}
.skip-link:focus { top: var(--space-4); outline: 2px solid var(--c-white); outline-offset: 2px; }

/* Focus */
:focus { outline: none; }
:focus-visible { outline: 2px solid var(--c-accent); outline-offset: 3px; border-radius: var(--radius-sm); }

/* =========================================
   MARK:  2. TYPOGRAPHY
    ========================================= */
h1, h2, h3, h4, h5, h6 {
    font-weight: 500;
    letter-spacing: -0.05em;
    line-height: 1.12;
    margin-bottom: var(--space-5);
    font-feature-settings: "tnum" 1, "ss01" 1, "zero" 1;
}

h1 { font-size: var(--font-size-4xl); }
h2 { font-size: var(--font-size-3xl); }
h3 { font-size: var(--font-size-2xl); }
h4 { font-size: var(--font-size-xl); }
h5 { font-size: var(--font-size-l); font-weight: 600; }
h6 { font-size: var(--font-size-m); font-weight: 600; color: var(--c-text-secondary); }

p {
    font-size: var(--font-size-l);
    color: var(--c-text-secondary);
    font-weight: 400;
    line-height: 1.7;
    margin-bottom: var(--space-5);
}
p:last-child { margin-bottom: 0; }

/* Code-comment decorations */
h1:not(.hero-title)::before, h2::before {
    content: "// ";
    color: var(--c-text-ghost);
    font-weight: 400;
    font-size: 0.45em;
    vertical-align: middle;
    margin-right: 0.2em;
    opacity: 0.7;
}

h3:not(.card-title):not(.modal-title):not(.flex-center)::before {
    content: "/* ";
    color: var(--c-text-ghost);
    font-weight: 400;
    font-size: 0.5em;
    vertical-align: middle;
    margin-right: 0.2em;
}
h3:not(.card-title):not(.modal-title):not(.flex-center)::after {
    content: " */";
    color: var(--c-text-ghost);
    font-weight: 400;
    font-size: 0.5em;
    vertical-align: middle;
    margin-left: 0.2em;
}

.text-gradient {
    background: var(--grad-text);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
}
.text-gradient-accent {
    background: var(--grad-text-accent);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
}

.text-center { text-align: center; }
.text-left { text-align: left; }
.text-right { text-align: right; }
.text-large { font-size: var(--font-size-2xl); font-weight: 500; }
.text-small { font-size: var(--font-size-s); }
.text-xs { font-size: var(--font-size-xs); }
.text-muted { color: var(--c-text-secondary); }
.text-faint { color: var(--c-text-tertiary); }
.text-ghost { color: var(--c-text-ghost); }
.text-accent { color: var(--c-accent); }
.text-accent-bright { color: var(--c-accent-bright); }

.font-mono { font-family: var(--font-family); }
.font-normal { font-weight: 400; }
.font-medium { font-weight: 500; }
.font-semibold { font-weight: 600; }
.font-bold { font-weight: 700; }

.tracking-tight { letter-spacing: -0.04em; }
.tracking-normal { letter-spacing: -0.01em; }
.tracking-wide { letter-spacing: 0.05em; }

.leading-tight { line-height: 1.2; }
.leading-normal { line-height: 1.65; }
.leading-relaxed { line-height: 1.8; }

code, .code {
    font-family: var(--font-family);
    font-size: 0.9em;
    background: var(--c-surface);
    padding: 2px 6px;
    border-radius: var(--radius-sm);
    border: 1px solid var(--c-border);
    color: var(--c-accent-bright);
    font-feature-settings: "tnum" 1, "zero" 1;
}

pre, .pre {
    font-family: var(--font-family);
    background: var(--c-surface);
    padding: var(--space-6);
    border-radius: var(--radius-lg);
    border: 1px solid var(--c-border);
    overflow-x: auto;
    font-size: var(--font-size-s);
    line-height: 1.6;
    color: var(--c-text-secondary);
    position: relative;
}
pre code, .pre .code { background: none; border: none; padding: 0; color: inherit; font-size: inherit; }

/* =========================================
   MARK:  3. LAYOUT UTILITIES
    ========================================= */
.container {
    max-width: var(--container-width);
    margin: 0 auto;
    padding: 0 var(--space-6);
}
.container-wide {
    max-width: var(--container-wide);
    margin: 0 auto;
    padding: 0 var(--space-6);
}

.section { padding: var(--section-spacing) 0; }
.section-sm { padding: var(--space-20) 0; }
.section-md { padding: var(--space-32) 0; }
.section-lg { padding: var(--section-spacing) 0; }
.section-first { padding-top: var(--space-12); }

.grid { display: grid; gap: var(--space-5); }
.grid-2 { grid-template-columns: repeat(2, 1fr); }
.grid-3 { grid-template-columns: repeat(3, 1fr); }
.grid-4 { grid-template-columns: repeat(4, 1fr); }
.grid-auto { grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); }

.gap-1 { gap: var(--space-1); } .gap-2 { gap: var(--space-2); }
.gap-3 { gap: var(--space-3); } .gap-4 { gap: var(--space-4); }
.gap-5 { gap: var(--space-5); } .gap-6 { gap: var(--space-6); }
.gap-8 { gap: var(--space-8); } .gap-10 { gap: var(--space-10); }

.flex { display: flex; }
.flex-center { display: flex; align-items: center; justify-content: center; }
.flex-between { display: flex; align-items: center; justify-content: space-between; }
.flex-col { flex-direction: column; }
.flex-wrap { flex-wrap: wrap; }
.items-start { align-items: flex-start; }
.items-center { align-items: center; }
.items-end { align-items: flex-end; }
.justify-start { justify-content: flex-start; }
.justify-center { justify-content: center; }
.justify-end { justify-content: flex-end; }
.justify-between { justify-content: space-between; }

.m-0 { margin: 0; }
.mt-1 { margin-top: var(--space-1); } .mt-2 { margin-top: var(--space-2); }
.mt-3 { margin-top: var(--space-3); } .mt-4 { margin-top: var(--space-4); }
.mt-5 { margin-top: var(--space-5); } .mt-6 { margin-top: var(--space-6); }
.mt-8 { margin-top: var(--space-8); } .mt-10 { margin-top: var(--space-10); }
.mt-12 { margin-top: var(--space-12); } .mt-16 { margin-top: var(--space-16); }
.mt-20 { margin-top: var(--space-20); }

.mb-1 { margin-bottom: var(--space-1); } .mb-2 { margin-bottom: var(--space-2); }
.mb-3 { margin-bottom: var(--space-3); } .mb-4 { margin-bottom: var(--space-4); }
.mb-5 { margin-bottom: var(--space-5); } .mb-6 { margin-bottom: var(--space-6); }
.mb-8 { margin-bottom: var(--space-8); } .mb-10 { margin-bottom: var(--space-10); }
.mb-12 { margin-bottom: var(--space-12); } .mb-16 { margin-bottom: var(--space-16); }
.mb-20 { margin-bottom: var(--space-20); }

.mr-1 { margin-right: var(--space-1); } .mr-2 { margin-right: var(--space-2); }
.mr-3 { margin-right: var(--space-3); } .mr-4 { margin-right: var(--space-4); }
.ml-1 { margin-left: var(--space-1); } .ml-2 { margin-left: var(--space-2); }
.ml-3 { margin-left: var(--space-3); } .ml-4 { margin-left: var(--space-4); }

.ml-auto { margin-left: auto; }
.mr-auto { margin-right: auto; }
.mx-auto { margin-left: auto; margin-right: auto; }

.p-0 { padding: 0; } .p-2 { padding: var(--space-2); }
.p-3 { padding: var(--space-3); } .p-4 { padding: var(--space-4); }
.p-5 { padding: var(--space-5); } .p-6 { padding: var(--space-6); }
.p-8 { padding: var(--space-8); } .p-10 { padding: var(--space-10); } .p-12 { padding: var(--space-12); }

.pt-4 { padding-top: var(--space-4); } .pt-6 { padding-top: var(--space-6); }
.pt-8 { padding-top: var(--space-8); } .pt-10 { padding-top: var(--space-10); }
.pt-12 { padding-top: var(--space-12); } .pt-16 { padding-top: var(--space-16); }
.pt-20 { padding-top: var(--space-20); }

.pb-4 { padding-bottom: var(--space-4); } .pb-6 { padding-bottom: var(--space-6); }
.pb-8 { padding-bottom: var(--space-8); } .pb-10 { padding-bottom: var(--space-10); }
.pb-12 { padding-bottom: var(--space-12); } .pb-16 { padding-bottom: var(--space-16); }
.pb-20 { padding-bottom: var(--space-20); }

.block { display: block; }
.inline { display: inline; }
.inline-block { display: inline-block; }
.hidden { display: none; }

.w-full { width: 100%; }
.h-full { height: 100%; }
.min-h-screen { min-height: 100vh; }

.overflow-hidden { overflow: hidden; }
.overflow-auto { overflow: auto; }
.overflow-x-auto { overflow-x: auto; }

.relative { position: relative; }
.absolute { position: absolute; }
.sticky { position: sticky; }

.border { border: 1px solid var(--c-border); }
.border-t { border-top: 1px solid var(--c-border); }
.border-b { border-bottom: 1px solid var(--c-border); }
.border-l { border-left: 1px solid var(--c-border); }
.border-r { border-right: 1px solid var(--c-border); }

.rounded-sm { border-radius: var(--radius-sm); }
.rounded-md { border-radius: var(--radius-md); }
.rounded-lg { border-radius: var(--radius-lg); }
.rounded-xl { border-radius: var(--radius-xl); }
.rounded-2xl { border-radius: var(--radius-2xl); }
.rounded-full { border-radius: var(--radius-full); }

.bg-bg { background-color: var(--c-bg); }
.bg-surface { background-color: var(--c-surface); }
.bg-surface-elevated { background-color: var(--c-surface-elevated); }

/* =========================================
   MARK:  6. BUTTONS
    ========================================= */
.btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 10px 22px;
    border-radius: var(--radius-md);
    font-family: var(--font-family);
    font-size: var(--font-size-s);
    font-weight: 500;
    cursor: pointer;
    transition: var(--transition-smooth);
    border: 1px solid transparent;
    letter-spacing: -0.01em;
    font-feature-settings: "tnum" 1;
    gap: var(--space-2);
    position: relative;
    overflow: hidden;
    line-height: 1.2;
    white-space: nowrap;
}
.btn::after {
    content: "";
    position: absolute;
    inset: 0;
    background: var(--grad-btn-sheen);
    opacity: 0;
    transition: opacity 0.3s;
    pointer-events: none;
}
.btn:hover::after { opacity: 1; }

.btn-primary {
    background-color: var(--c-accent);
    color: var(--c-white);
    border-color: var(--c-accent);
}
.btn-primary:hover {
    background-color: var(--c-accent-hover);
    border-color: var(--c-accent-hover);
    transform: translateY(-1px);
    box-shadow: 0 4px 20px var(--c-accent-glow), 0 0 40px var(--c-accent-a10);
}

.btn-secondary {
    background-color: transparent;
    color: var(--c-text-main);
    border-color: var(--c-border);
}
.btn-secondary:hover {
    border-color: var(--c-border-hover);
    background-color: var(--c-white-a03);
}

.btn-ghost {
    background-color: transparent;
    color: var(--c-text-secondary);
    border-color: transparent;
}
.btn-ghost:hover {
    background-color: var(--c-white-a04);
    color: var(--c-text-main);
}

.btn-text {
    background: transparent;
    color: var(--c-accent);
    padding: 0;
    border: none;
    overflow: visible;
}
.btn-text:hover { color: var(--c-accent-hover); }
.btn-text::after {
    content: " ->";
    opacity: 0.5;
    transition: var(--transition-fast);
    position: static;
    background: none;
    inset: auto;
}
.btn-text:hover::after { content: " =>"; opacity: 1; }

.btn-large { padding: 14px 28px; font-size: var(--font-size-m); }
.btn-small { padding: 6px 14px; font-size: var(--font-size-xs); }
.btn-icon { padding: 10px; aspect-ratio: 1; }

.btn:disabled, .btn.disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none !important;
    box-shadow: none !important;
}

.btn-group { display: inline-flex; gap: var(--space-2); }

/* =========================================
   MARK:  7. NAVIGATION
    ========================================= */
.navbar {
    position: fixed;
    top: var(--navbar-offset);
    right: var(--navbar-offset);
    z-index: 1000;
    background: var(--c-navbar-bg);
    border-radius: var(--radius-full);
    backdrop-filter: blur(20px) saturate(140%);
    -webkit-backdrop-filter: blur(20px) saturate(140%);
    border: 1px solid var(--c-border);
    height: var(--navbar-height);
    display: flex;
    align-items: center;
    padding: 0 var(--space-3);
    max-width: calc(100vw - var(--navbar-offset) * 2);
    box-shadow: var(--shadow-navbar);
}

.nav-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-8);
    padding: 0 var(--space-4);
    width: 100%;
}

.logo {
    font-weight: 600;
    font-size: var(--font-size-m);
    color: var(--c-text-main);
    letter-spacing: -0.03em;
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    flex-shrink: 0;
}
.logo::before { content: "$"; color: var(--c-logo-accent); font-weight: 700; font-size: 0.85em; }
.logo::after {
    content: "_";
    color: var(--c-logo-accent);
    font-weight: 700;
    animation: blink 1.2s step-end infinite;
}
@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }

.nav-links { display: flex; gap: var(--space-6); align-items: center; }

.nav-link {
    font-size: 11px;
    color: var(--c-text-secondary);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    transition: color 0.25s ease;
    position: relative;
    padding: var(--space-1) 0;
    white-space: nowrap;
}
.nav-link:hover { color: var(--c-text-main); }
.nav-link::after {
    content: "";
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 0;
    height: 1px;
    background: var(--c-accent);
    transition: width 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}
/* JS scroll-spy active state */
.nav-link.active { color: var(--c-text-main); }
.nav-link.active::after { width: 100%; }

/* Mobile nav toggle */
.nav-toggle-input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
    width: 1px;
    height: 1px;
}
.nav-toggle {
    display: none;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 5px;
    cursor: pointer;
    padding: var(--space-2);
    width: 40px;
    height: 40px;
    border-radius: var(--radius-md);
    transition: var(--transition-fast);
    flex-shrink: 0;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
}
.nav-toggle:hover { background: var(--c-white-a03); }
.nav-toggle span {
    display: block;
    width: 22px;
    height: 2px;
    background: var(--c-text-main);
    transition: var(--transition-smooth);
    border-radius: 2px;
    transform-origin: center;
}
.nav-toggle-input:checked ~ .nav-toggle span:nth-child(1) {
    transform: translateY(7px) rotate(45deg);
    background: var(--c-accent);
}
.nav-toggle-input:checked ~ .nav-toggle span:nth-child(2) {
    opacity: 0;
    transform: scaleX(0);
}
.nav-toggle-input:checked ~ .nav-toggle span:nth-child(3) {
    transform: translateY(-7px) rotate(-45deg);
    background: var(--c-accent);
}

/* =========================================
   MARK:  8. CARDS
    ========================================= */
.card {
    border: 1px solid transparent;
    background-color: var(--c-surface);
    border-radius: var(--radius-lg);
    padding: var(--space-8);
    box-shadow: var(--shadow-sm);
    transition: var(--transition-smooth);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: relative;
}
.card::before {
    content: "";
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 1px;
    background: var(--grad-card-shine);
    opacity: 0;
    transition: opacity 0.4s;
}
.card:hover {
    box-shadow: var(--shadow-lg);
    transform: translateY(-3px);
    border-color: var(--c-border-hover);
}
.card:hover::before { opacity: 1; }

.card-dark { background: var(--c-card-dark-bg); color: var(--c-card-dark-text); border-color: var(--c-card-dark-border); }
.card-dark p { color: var(--c-card-dark-muted); }
.card-elevated { background: var(--c-surface-elevated); border-color: var(--c-card-elevated-border); }
.card-interactive { cursor: pointer; }
.card-interactive:active { transform: translateY(-1px); }

.card-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: var(--space-4);
}

.card-title {
    font-size: var(--font-size-l);
    font-weight: 600;
    color: var(--c-text-main);
    margin-bottom: var(--space-2);
    line-height: 1.3;
}
h3.card-title::before, h3.card-title::after { content: none; }

.card-body { flex: 1; }

.card-footer {
    margin-top: var(--space-6);
    padding-top: var(--space-4);
    border-top: 1px solid var(--c-border);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
    flex-wrap: wrap;
}

.eyebrow {
    text-transform: uppercase;
    font-size: 9px;
    font-weight: 600;
    letter-spacing: 0.12em;
    color: var(--c-accent);
    margin-bottom: var(--space-3);
    display: block;
}

.card-icon {
    width: 40px;
    height: 40px;
    border-radius: var(--radius-md);
    background: var(--c-accent-a10);
    border: 1px solid var(--c-accent-a20);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--c-accent);
    font-size: var(--font-size-l);
    margin-bottom: var(--space-4);
    transition: var(--transition-smooth);
}
.card:hover .card-icon {
    background: var(--c-accent-a15);
    border-color: var(--c-accent-a30);
    box-shadow: 0 0 16px var(--c-accent-glow);
}

/* =========================================
    MARK: 10. BADGES & TAGS
    ========================================= */
.badge {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
    padding: 3px 10px;
    border-radius: var(--radius-full);
    background-color: var(--c-badge-bg);
    color: var(--c-badge-text);
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    border: 1px solid var(--c-accent-a20);
}
.badge-success { background: var(--c-success-a08); color: var(--c-success); border-color: var(--c-success-a15); }
.badge-warning { background: var(--c-warning-a08); color: var(--c-warning); border-color: var(--c-warning-a15); }
.badge-error { background: var(--c-error-a08); color: var(--c-error); border-color: var(--c-error-a15); }
.badge-neutral { background: var(--c-white-a04); color: var(--c-text-secondary); border-color: var(--c-border); }

.tag {
    display: inline-flex;
    align-items: center;
    padding: 2px 8px;
    border-radius: var(--radius-sm);
    background: var(--c-surface-elevated);
    color: var(--c-text-secondary);
    font-size: var(--font-size-xs);
    font-weight: 500;
    border: 1px solid var(--c-border);
    transition: var(--transition-fast);
    cursor: default;
}
.tag:hover { border-color: var(--c-border-hover); color: var(--c-text-main); }

/* Status pill */
.status-pill {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    padding: 3px 10px;
    border-radius: var(--radius-full);
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.02em;
}
.status-pill::before {
    content: "";
    width: 5px;
    height: 5px;
    border-radius: 50%;
    display: inline-block;
}
.status-success { background: var(--c-success-a08); color: var(--c-success); border: 1px solid var(--c-success-a15); }
.status-success::before { background: var(--c-success); box-shadow: 0 0 6px var(--c-success-a40); }
.status-pending { background: var(--c-warning-a08); color: var(--c-warning); border: 1px solid var(--c-warning-a15); }
.status-pending::before { background: var(--c-warning); box-shadow: 0 0 6px var(--c-warning-a40); }
.status-error { background: var(--c-error-a08); color: var(--c-error); border: 1px solid var(--c-error-a15); }
.status-error::before { background: var(--c-error); box-shadow: 0 0 6px var(--c-error-a40); }
.status-neutral { background: var(--c-white-a03); color: var(--c-text-secondary); border: 1px solid var(--c-border); }
.status-neutral::before { background: var(--c-text-tertiary); }
.status-info { background: var(--c-info-a08); color: var(--c-info); border: 1px solid var(--c-info-a15); }
.status-info::before { background: var(--c-info); box-shadow: 0 0 6px var(--c-info-a40); }

/* =========================================
    MARK: 13. MODAL / DIALOG
    ========================================= */
.modal-overlay {
    position: fixed;
    inset: 0;
    background: var(--c-overlay);
    backdrop-filter: blur(4px);
    z-index: 2000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-6);
    animation: fade-in 0.2s ease;
}
@keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }

.modal {
    background: var(--c-surface);
    border-radius: var(--radius-xl);
    border: 1px solid var(--c-border);
    box-shadow: var(--shadow-xl);
    max-width: 520px;
    width: 100%;
    max-height: 90vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    animation: modal-in 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}
@keyframes modal-in {
    from { opacity: 0; transform: scale(0.96) translateY(10px); }
    to { opacity: 1; transform: scale(1) translateY(0); }
}

.modal-header {
    padding: var(--space-6) var(--space-6) 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
}
.modal-title { font-size: var(--font-size-xl); font-weight: 600; margin: 0; }
.modal-body { padding: var(--space-5) var(--space-6); overflow-y: auto; flex: 1; }
.modal-footer {
    padding: var(--space-4) var(--space-6) var(--space-6);
    display: flex;
    justify-content: flex-end;
    gap: var(--space-3);
    border-top: 1px solid var(--c-border);
}

/* Modal (no-JS fallback via :target + JS via .open) */
.modal-overlay-css {
    display: none;
    position: fixed;
    inset: 0;
    z-index: 2000;
    background: var(--c-overlay);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    align-items: center;
    justify-content: center;
    padding: var(--space-6);
}
.modal-overlay-css:target,
html.js .modal-overlay-css.open {
    display: flex;
    animation: fade-in 0.2s ease;
}
.modal-overlay-css:target .modal,
html.js .modal-overlay-css.open .modal {
    animation: modal-in 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}

.modal-backdrop {
    position: absolute;
    inset: 0;
    z-index: 0;
    cursor: default;
}
.modal-overlay-css .modal { position: relative; z-index: 1; }

.email-pre {
    font-family: var(--font-family);
    font-size: var(--font-size-l);
    color: var(--c-accent-bright);
    background: var(--c-surface-elevated);
    border: 1px solid var(--c-border);
    border-radius: var(--radius-md);
    padding: var(--space-4) var(--space-5);
    text-align: center;
    letter-spacing: 0.02em;
    overflow-x: auto;
}

/* =========================================
    MARK: 14. TABS (CSS-only :target + JS enhancement)
    ========================================= */
.tabs-radio { display: flex; flex-direction: column; }

.tabs-nav {
    display: flex;
    flex-wrap: nowrap;
    align-items: stretch;
    overflow-x: auto;
    overflow-y: hidden;
    border-bottom: 1px solid var(--c-border);
    scrollbar-width: thin;
    scrollbar-color: var(--c-text-tertiary) transparent;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior-x: contain;
}
.tabs-nav::-webkit-scrollbar { height: 3px; }
.tabs-nav::-webkit-scrollbar-track { background: transparent; }
.tabs-nav::-webkit-scrollbar-thumb { background: var(--c-text-tertiary); border-radius: 2px; }
.tabs-nav::-webkit-scrollbar-thumb:hover { background: var(--c-text-secondary); }

.tab-link {
    flex: 0 0 auto;
    position: relative;
    display: inline-flex;
    align-items: center;
    padding: var(--space-3) var(--space-5);
    font-family: var(--font-family);
    font-size: var(--font-size-s);
    font-weight: 500;
    letter-spacing: -0.01em;
    line-height: 1.4;
    color: var(--c-text-secondary);
    white-space: nowrap;
    border-bottom: 2px solid transparent;
    margin-bottom: -1px;
    transition: color 0.2s ease, border-color 0.2s ease, background-color 0.2s ease;
}
.tab-link:hover {
    color: var(--c-text-main);
    background: var(--c-white-a02);
}
.tab-link:focus-visible {
    color: var(--c-text-main);
    border-bottom-color: var(--c-accent);
    background: var(--c-accent-a04);
    outline: none;
}

/* Panels: hidden by default */
.tabs-radio > .tab-content {
    display: none;
    padding: var(--space-6) 0;
    color: var(--c-text-secondary);
    font-size: var(--font-size-s);
    line-height: 1.7;
    scroll-margin-top: var(--scroll-padding-top);
}

/* No-JS fallback: :target shows, first panel shows when nothing targeted */
html:not(.js) .tabs-radio > .tab-content:target {
    display: block;
    animation: fade-in-up 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
}
html:not(.js) .tabs-radio:not(:has(.tab-content:target)) > .tab-content:nth-of-type(2) {
    display: block;
}

/* JS mode: .active shows */
html.js .tabs-radio > .tab-content.active {
    display: block;
    animation: fade-in-up 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
}

/* Active tab-link: JS mode */
html.js .tab-link.active {
    color: var(--c-accent);
    border-bottom-color: var(--c-accent);
    background: var(--c-accent-a04);
}

/* Active tab-link: no-JS mode */
html:not(.js) .tabs-radio:has(#work-panel-1:target) .tab-link[href="#work-panel-1"],
html:not(.js) .tabs-radio:has(#work-panel-2:target) .tab-link[href="#work-panel-2"],
html:not(.js) .tabs-radio:has(#work-panel-3:target) .tab-link[href="#work-panel-3"],
html:not(.js) .tabs-radio:has(#work-panel-4:target) .tab-link[href="#work-panel-4"],
html:not(.js) .tabs-radio:has(#work-panel-5:target) .tab-link[href="#work-panel-5"],
html:not(.js) .tabs-radio:not(:has(.tab-content:target)) .tab-link[href="#work-panel-1"] {
    color: var(--c-accent);
    border-bottom-color: var(--c-accent);
    background: var(--c-accent-a04);
}

/* =========================================
    MARK: 18. TERMINAL
    ========================================= */
.terminal {
    background: var(--c-surface);
    border-radius: var(--radius-lg);
    border: 1px solid var(--c-border);
    overflow: hidden;
    font-family: var(--font-family);
    font-size: var(--font-size-s);
    line-height: 1.6;
}
.terminal-header {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-3) var(--space-5);
    background: var(--c-white-a02);
    border-bottom: 1px solid var(--c-border);
}
.terminal-dot { width: 10px; height: 10px; border-radius: 50%; }
.terminal-dot-red { background: var(--c-error); }
.terminal-dot-yellow { background: var(--c-warning); }
.terminal-dot-green { background: var(--c-success); }
.terminal-title {
    font-size: var(--font-size-xs);
    color: var(--c-text-tertiary);
    margin-left: var(--space-2);
    letter-spacing: 0.02em;
}
.terminal-body {
    padding: var(--space-5);
    color: var(--c-text-secondary);
    overflow-x: auto;
}
.terminal-line {
    display: flex;
    align-items: baseline;
    gap: var(--space-3);
    margin-bottom: var(--space-2);
}
.terminal-line:last-child { margin-bottom: 0; }
.terminal-prompt { color: var(--c-accent); font-weight: 600; flex-shrink: 0; }
.terminal-output { color: var(--c-text-secondary); }
.terminal-cursor {
    display: inline-block;
    width: 7px;
    height: 1em;
    background: var(--c-accent);
    align-self: center;
    margin-left: -2px;
    animation: blink 1s step-end infinite;
}

/* =========================================
    MARK: 19. FOOTER
    ========================================= */
footer {
    background-color: var(--c-surface);
    padding: var(--space-20) 0 var(--space-10);
    border-top: 1px solid var(--c-border);
    font-size: var(--font-size-xs);
    color: var(--c-text-tertiary);
    letter-spacing: 0.01em;
}
.footer-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: var(--space-12);
    margin-bottom: var(--space-12);
}
.footer-col h5 {
    font-size: var(--font-size-xs);
    color: var(--c-text-secondary);
    margin-bottom: var(--space-4);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-weight: 600;
}
.footer-col li { margin-bottom: var(--space-3); }
.footer-col a {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    transition: color 0.2s;
}
.footer-col a::before {
    content: ">";
    color: var(--c-accent);
    opacity: 0;
    transition: opacity 0.2s, transform 0.2s;
    transform: translateX(-4px);
}
.footer-col a:hover { color: var(--c-text-main); }
.footer-col a:hover::before { opacity: 1; transform: translateX(0); }

.footer-bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: var(--space-6);
    border-top: 1px solid var(--c-border);
    flex-wrap: wrap;
    gap: var(--space-4);
}
.footer-copy { color: var(--c-text-ghost); }

/* =========================================
    MARK: 20. ANIMATIONS
    ========================================= */
@keyframes fade-in-up {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}
@keyframes pulse-glow {
    0%, 100% { box-shadow: 0 0 20px var(--c-accent-glow); }
    50% { box-shadow: 0 0 40px var(--c-accent-glow-strong); }
}

.animate-pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
.hover-lift { transition: var(--transition-smooth); }
.hover-lift:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); }
.glow { box-shadow: 0 0 30px var(--c-accent-glow); }
.glow-strong { box-shadow: 0 0 50px var(--c-accent-glow-strong); }

/* =========================================
   MARK: 21. HERO
   ========================================= */
.page {
    min-height: 100dvh;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-6);
    border-radius: var(--radius-2xl);
}

.pt-grad-1 { background: var(--grad-hero-1); }
.pt-grad-2 { background: var(--grad-hero-2); background-color: var(--c-bg); }

.card-fullscreen {
    width: 100%;
    max-width: 100%;
    min-height: 95dvh;
    min-height: 95vh;
}

.hero {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    gap: var(--space-5);
    padding: var(--space-10) var(--space-6);
    border-radius: var(--radius-3xl);
    border: none;
}
.hero:hover { transform: none; box-shadow: var(--shadow-sm); }
.hero:hover::before { opacity: 0; }

.hero-badges {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    justify-content: center;
    margin-bottom: var(--space-2);
}

.hero-title {
    font-size: var(--font-size-e5xl);
    color: var(--c-text-main-accent);
    letter-spacing: -0.1em;
    line-height: 1;
    margin: 0;
    filter:
        drop-shadow(0 0 10px var(--c-peach-solid))
        drop-shadow(0 0 40px var(--c-peach-solid));
    will-change: filter;
}

.hero-tagline {
    color: var(--c-hero-tagline);
    font-size: var(--font-size-5xl);
    font-weight: 500;
    letter-spacing: -0.05em;
    line-height: 1.1;
    margin: 0;
}
.hero-desc {
    max-width: 500px;
    color: var(--c-hero-desc);
    font-size: var(--font-size-l);
    margin: var(--space-3) 0 0;
}
.hero-actions { margin-top: var(--space-6); }

/* =========================================
   MARK: 22. REVEAL
   ========================================= */
.reveal {
    opacity: 0;
    transform: translateY(56px);
    animation: reveal-in 1s cubic-bezier(.22, 1, .36, 1) forwards;
    animation-timeline: view();
    animation-range: entry 10% cover 100%;
}
@keyframes reveal-in {
    from { opacity: 0; transform: translateY(56px); }
    to { opacity: 1; transform: none; }
}
.reveal-delay-1 { animation-range: entry 20% cover 40%; }
.reveal-delay-2 { animation-range: entry 30% cover 50%; }
.reveal-delay-3 { animation-range: entry 40% cover 60%; }

@supports not (animation-timeline: view()) {
    .reveal { opacity: 1; transform: none; animation: none; }
}

/* =========================================
    MARK: 24. RESPONSIVE
    ========================================= */
@media (max-width: 900px) {
    :root {
        --section-spacing: 80px;
        --font-size-e5xl: 7rem;
        --font-size-5xl: 2.75rem;
        --font-size-4xl: 2rem;
        --font-size-3xl: 1.625rem;
    }

    .grid-2, .grid-3, .grid-4 { grid-template-columns: 1fr; }

    h1:not(.hero-title)::before,
    h2::before,
    h3:not(.card-title):not(.modal-title):not(.flex-center)::before,
    h3:not(.card-title):not(.modal-title):not(.flex-center)::after { display: none; }

    .navbar {
        top: 0;
        left: 0;
        right: 0;
        margin: 0;
        width: 100%;
        max-width: 100%;
        border-radius: 0;
        border-top: none;
        border-left: none;
        border-right: none;
        border-bottom: 1px solid var(--c-border);
        background: var(--c-navbar-bg-mobile);
        backdrop-filter: blur(14px) saturate(140%);
        -webkit-backdrop-filter: blur(14px) saturate(140%);
        padding: 0 var(--space-3);
        box-shadow: none;
    }
    .nav-content { padding: 0 var(--space-2); gap: var(--space-3); }
    .nav-toggle { display: flex; }

    .nav-links {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        flex-direction: column;
        align-items: stretch;
        gap: 0;
        background: var(--c-navbar-menu-bg);
        backdrop-filter: blur(20px) saturate(140%);
        -webkit-backdrop-filter: blur(20px) saturate(140%);
        border-bottom: 1px solid var(--c-border);
        padding: 0;
        max-height: 0;
        overflow: hidden;
        transition: max-height 0.4s cubic-bezier(0.22, 1, 0.36, 1),
                    padding 0.3s ease;
    }
    .nav-toggle-input:checked ~ .nav-links {
        max-height: 400px;
        padding: var(--space-3) 0;
    }
    .nav-links li { width: 100%; }
    .nav-link {
        display: block;
        padding: var(--space-4) var(--space-6);
        font-size: var(--font-size-s);
        border-bottom: 1px solid var(--c-border);
        color: var(--c-text-main);
    }
    .nav-link::after { display: none; }
    .nav-links li:last-child .nav-link { border-bottom: none; }

    body { padding-top: var(--navbar-height); }

    .page {
        min-height: calc(100dvh - var(--navbar-height));
        min-height: calc(100vh  - var(--navbar-height));
        padding: var(--space-3);
    }

    .card-fullscreen {
        min-height: calc(100dvh - var(--navbar-height) - var(--space-3) * 2);
        min-height: calc(100vh  - var(--navbar-height) - var(--space-3) * 2);
    }

    .modal { margin: var(--space-4); max-height: calc(100vh - var(--space-8)); }
    .footer-grid { grid-template-columns: repeat(2, 1fr); gap: var(--space-8); }
    .footer-bottom { flex-direction: column; text-align: center; }
    .page { border-radius: var(--radius-lg); padding: var(--space-4); }
}

@media (max-width: 640px) {
    .tab-link { padding: var(--space-3) var(--space-4); font-size: var(--font-size-xs); }
    .tabs-radio > .tab-content { padding: var(--space-5) 0; }
    .hero-tagline { font-size: var(--font-size-3xl); }
}

@media (max-width: 480px) {
    :root {
        --font-size-e5xl: 3rem;
        --font-size-4xl: 1.75rem;
        --font-size-3xl: 1.5rem;
    }
    .container, .container-wide { padding: 0 var(--space-4); }
    .footer-grid { grid-template-columns: 1fr; }
    .btn-group {
        flex-direction: column;
        width: 100%;
        align-items: stretch;
    }
    .btn-group .btn { border-radius: var(--radius-md) !important; }
}

/* =========================================
    MARK: 25. SCROLLBAR & SELECTION
    ========================================= */
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: var(--c-bg); }
::-webkit-scrollbar-thumb { background: var(--c-text-tertiary); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: var(--c-text-secondary); }

::selection { background: var(--c-selection-bg); color: var(--c-selection-text); }

/* =========================================
    MARK: 26. MOTION PREFERENCES (a11y)
   ========================================= */
@media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
    }
    .reveal { opacity: 1; transform: none; animation: none; }
    .logo::after,
    .terminal-cursor,
    .animate-pulse-glow { animation: none; }
}

/* =========================================
    MARK: 27. PRINT
   ========================================= */
@media print {
    :root {
        --c-bg: #ffffff;
        --c-surface: #f5f5f5;
        --c-text-main: #000000;
        --c-text-secondary: #333333;
        --c-accent: #ff5e3a;
        --c-border: #cccccc;
    }
    .navbar,
    .nav-toggle,
    .modal-overlay,
    .modal-overlay-css,
    .skip-link { display: none !important; }

    body { background: var(--c-bg); color: var(--c-text-main); padding-top: 0 !important; }
    .card, .terminal { border: 1px solid var(--c-border); box-shadow: none; }
    .hero { background: var(--c-bg) !important; }
    .hero-title { color: var(--c-text-main) !important; filter: none !important; }
}

/* =========================================
   MARK: 28. GLASS LAYER
   ========================================= */
/* Base glass: frosted, luminous, layered.
   Compose with any element (add border-radius via utilities). */
.glass {
    background:
        /* top-edge sheen — simulates light catching the surface */
        radial-gradient(140% 100% at 0% 0%,
            var(--glass-sheen) 0%,
            var(--glass-sheen-mid) 38%,
            transparent 72%),
        /* vertical body gradient — soft light falloff */
        linear-gradient(180deg,
            var(--glass-body) 0%,
            var(--glass-body-end) 100%),
        /* frosted base */
        var(--glass-bg);
    -webkit-backdrop-filter: var(--glass-blur);
    backdrop-filter: var(--glass-blur);
    border: 0px solid var(--glass-border);
    box-shadow:
        var(--glass-shadow),
        /* crisp top rim */
        inset 0 1px 0 var(--glass-highlight),
        /* soft bottom rim */
        inset 0 -1px 0 var(--glass-bottom-rim),
        /* whisper-thin inner ring — glass density */
        inset 0 0 0 1px var(--glass-inner-ring),
        /* warm inner bloom — theme continuity */
        inset 0 0 60px var(--glass-warm-bloom);
    transition: var(--transition-smooth);
}

/* Heavier variant: dialogs, modals, command palettes, sticky headers. */
.glass-strong {
    background:
        radial-gradient(140% 100% at 0% 0%,
            var(--glass-sheen-strong) 0%,
            var(--glass-sheen-strong-mid) 38%,
            transparent 72%),
        linear-gradient(180deg,
            var(--glass-body-strong) 0%,
            var(--glass-body-strong-end) 100%),
        var(--glass-bg-strong);
    -webkit-backdrop-filter: var(--glass-blur-strong);
    backdrop-filter: var(--glass-blur-strong);
    border: 1px solid var(--glass-border-hover);
    box-shadow:
        var(--glass-shadow-strong),
        inset 0 1px 0 var(--glass-highlight-strong),
        inset 0 -1px 0 var(--glass-bottom-rim-strong),
        inset 0 0 80px var(--glass-warm-bloom-strong);
    transition: var(--transition-smooth);
}

/* Lightest variant: overlays, badges, floating HUD, footers. */
.glass-subtle {
    background:
        linear-gradient(180deg,
            var(--glass-body-subtle) 0%,
            var(--glass-body-subtle-end) 100%),
        var(--glass-bg-subtle);
    -webkit-backdrop-filter: var(--glass-blur-subtle);
    backdrop-filter: var(--glass-blur-subtle);
    border: 1px solid var(--glass-border-subtle);
    box-shadow:
        var(--glass-shadow-subtle),
        inset 0 1px 0 var(--glass-sheen);
    transition: var(--transition-smooth);
}

/* Composable card: combine with '.card' for a glass-morphism card. */
.glass-card {
    background:
        radial-gradient(140% 100% at 0% 0%,
            var(--glass-sheen-card) 0%,
            var(--glass-sheen-card-mid) 38%,
            transparent 72%),
        linear-gradient(180deg,
            var(--glass-body-card) 0%,
            var(--glass-body-card-end) 100%),
        var(--glass-bg);
    -webkit-backdrop-filter: var(--glass-blur);
    backdrop-filter: var(--glass-blur);
    border: 1px solid var(--glass-border);
    box-shadow:
        var(--glass-shadow),
        inset 0 1px 0 var(--glass-highlight),
        inset 0 -1px 0 var(--glass-bottom-rim);
    transition: var(--transition-smooth);
}
.glass-card:hover {
    border-color: var(--glass-border-hover);
    box-shadow:
        var(--glass-shadow-card-hover),
        inset 0 1px 0 var(--glass-highlight-strong),
        inset 0 -1px 0 var(--glass-bottom-rim-card-hover),
        0 0 0 1px var(--glass-hover-ring);
}

/* Interactive glass: hover/focus feedback for tiles, buttons, rows. */
.glass-interactive {
    cursor: pointer;
    transition: var(--transition-smooth);
}
.glass-interactive:hover {
    border-color: var(--glass-border-hover);
    background:
        radial-gradient(140% 100% at 0% 0%,
            var(--glass-sheen-hover) 0%,
            var(--glass-sheen-hover-mid) 38%,
            transparent 72%),
        linear-gradient(180deg,
            var(--glass-body-hover) 0%,
            var(--glass-body-hover-end) 100%),
        var(--glass-bg);
    transform: translateY(-1px);
}
.glass-interactive:focus-visible {
    outline: none;
    border-color: var(--c-accent);
    box-shadow:
        var(--glass-shadow),
        inset 0 1px 0 var(--glass-highlight),
        0 0 0 3px var(--glass-accent-focus);
}

/* Glass accent: a coral-tinted glass for CTAs and highlighted panels. */
.glass-accent {
    background:
        radial-gradient(140% 100% at 0% 0%,
            var(--c-peach-a18) 0%,
            var(--glass-accent-sheen-mid) 40%,
            transparent 72%),
        linear-gradient(180deg,
            var(--glass-accent-body) 0%,
            var(--glass-accent-body-end) 100%),
        var(--glass-accent-bg);
    -webkit-backdrop-filter: var(--glass-blur);
    backdrop-filter: var(--glass-blur);
    border: 1px solid var(--glass-accent-border);
    box-shadow:
        var(--glass-shadow),
        inset 0 1px 0 var(--glass-accent-highlight),
        inset 0 -1px 0 var(--glass-bottom-rim-card-hover),
        0 0 40px var(--glass-accent-glow);
    transition: var(--transition-smooth);
}

/* Graceful fallback for browsers without backdrop-filter support. */
@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
    .glass,
    .glass-card,
    .glass-interactive {
        background: var(--c-surface);
        border-color: var(--c-border);
        box-shadow: var(--shadow-md);
    }
    .glass-strong {
        background: var(--c-surface-elevated);
        border-color: var(--c-border);
        box-shadow: var(--shadow-lg);
    }
    .glass-subtle {
        background: var(--c-surface);
        border-color: var(--c-border);
    }
    .glass-accent {
        background: var(--grad-accent-fallback);
        border-color: var(--glass-accent-fallback-border);
    }
}
```

---

# assets/terminal.js

```js
(function () {
    'use strict';

    /* ============ ELEMENTS ============ */
    const term    = document.getElementById('term');
    const body    = document.getElementById('termBody');
    const output  = document.getElementById('termOutput');
    const input   = document.getElementById('termInput');
    const titleEl = document.querySelector('.terminal-title');

    const VERSION       = 'v1.0.0';
    const PROJECT_NAMES = ['lc', 'tap', 'run', 'tal', 'tycl', 'manage'];

    /* ============ DATA ============ */
    const PROJECTS = {
        lc: {
            name: 'Lc - Language Creator & Devkit',
            type: 'Framework', status: 'Stable', role: 'Author',
            version: '-', license: 'Apache 2.0', lang: 'Go',
            link: 'https://github.com/pt-main/lc',
            desc: 'Production-oriented toolkit for building language runtimes, compilers, interpreters and bytecode-driven processors. Ships with two engines (String & Byte), a PEG parser with Pratt expressions, an event system, plugins, and a hot loop pushing 120+ Mops/s on an i7-4770HQ.'
        },
        tap: {
            name: 'Tap - Terminal Argument Parsing',
            type: 'CLI Library', status: 'Stable', role: 'Author',
            version: '-', license: 'MIT', lang: 'Go + Rust',
            link: 'https://github.com/pt-main/tap',
            desc: 'Lightweight CLI library for both Go and Rust. Commands, flags, subcommands, auto-generated help with alias grouping, and a rich colour system with short codes like [?GN] and [?RT]. Rust version ships with zero dependencies.'
        },
        run: {
            name: 'Run - Script & Task Manager',
            type: 'Dev Tool', status: 'Stable', role: 'Author',
            version: '-', license: 'Apache 2.0', lang: 'Go + Lua',
            link: 'https://github.com/pt-main/run',
            desc: 'Stores scripts in global (~/run/) or local (.run/) storage, auto-generates Lua wrappers for Python, Bash, Batch and Lua, supports distribution via GitHub URLs (run -install).'
        },
        tal: {
            name: 'Tal - Incremental Task Runner',
            type: 'Dev Tool', status: 'Stable', role: 'Author',
            version: '-', license: 'Apache 2.0', lang: 'Lua',
            link: 'https://github.com/pt-main/run',
            desc: 'Embedded incremental task runner. Plain Lua with comment annotations, SHA256-based dependency tracking, and task-to-task calls.'
        },
        tycl: {
            name: 'Tycl - Typed Config Language',
            type: 'Config Language', status: 'Stable', role: 'Author',
            version: '-', license: 'Apache 2.0', lang: 'Go',
            link: 'https://github.com/pt-main/tycl',
            desc: 'Typed configuration language for Go. Strong typing without code generation, contracts (strict / flexible / dynamic), null-values with explicit type, arrays of primitives and objects, actions like env(), file(), get(). CLI for validation, formatting, and generation to JSON, YAML, TOML.'
        },
        manage: {
            name: 'Manage - CLI Task Manager',
            type: 'Productivity', status: 'Stable', role: 'Author',
            version: '-', license: 'MIT', lang: 'Go',
            link: 'https://github.com/pt-main/manage',
            desc: 'Terminal task manager built around themes, tasks and tables. Named tables group themes into schedules. Filtering by priority, tags, state with AND/OR logic. Config stored in Tycl under a strict contract.'
        }
    };

    const NOW_TEXT = [
        'Building run and [???].',
        'Reading "Crafting Interpreters".',
        'Next up: Run v1.5, [???] v0.'
    ];

    const RESUME = {
        experience: [
            '2026 - now    Active education and writing pet-projects',
            '2023 - 2026   System Developer',
            '2021 - 2023   Freelance automation / CLI tooling'
        ],
        education: [
            'CS50 - Harvard (online)',
            'Self-taught systems programming'
        ],
        skills: ['Go', 'Rust', 'C', 'Lua', 'Python', 'CLI design', 'compilers', 'dev tooling']
    };
    const RESUME_PDF = null; // set to a URL when you have a PDF

    /* ============ MODES ============ */
    const MODES = {
        boot:  { prompt: 'pt@dev:~$', title: 'pt@dev: ~ - bash - 80x24' },
        me:    { prompt: 'pt@me:~$',  title: 'pt@me: ~ - portfolio' },
        shell: { prompt: 'pt@sh:~$',  title: 'pt@sh: ~ - tools' }
    };
    let mode = 'boot';

    /* ============ HELPERS ============ */
    const esc = (s) => String(s).replace(/[&<>"']/g, c =>
        ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

    function writeLine(html, cls) {
        const div = document.createElement('div');
        div.className = 'term-line ' + (cls || 'term-out');
        div.innerHTML = html;
        output.appendChild(div);
        scrollBottom();
        return div;
    }
    function print(text, cls) {
        return writeLine(esc(text).replace(/\n/g, '<br>'), cls);
    }
    function printHTML(html, cls) { return writeLine(html, cls); }
    function blank() { writeLine('&nbsp;', 'term-out'); }
    function scrollBottom() { body.scrollTop = body.scrollHeight; }
    function pad(s, n) { s = String(s); return s + ' '.repeat(Math.max(0, n - s.length)); }

    function currentPrompt() { return MODES[mode].prompt; }

    function writeCmd(cmd) {
        writeLine(
            '<span class="term-prompt">${esc(currentPrompt())}</span> ' +
            '<span class="term-cmd-text">${esc(cmd)}</span>',
            'term-cmd'
        );
    }

    /* ============ THEMES ============ */
    const THEMES = [
        { id: 'amber',     label: 'amber',     desc: 'classic amber phosphor' },
        { id: 'coral',     label: 'coral',     desc: 'warm coral' },
        { id: 'green',     label: 'green',     desc: 'cold green' },
        { id: 'cyan',      label: 'cyan',      desc: 'cold cyan' },
        { id: 'blue',      label: 'blue',      desc: 'blue' },
        { id: 'cyberpunk', label: 'cyberpunk', desc: 'purple cyberpunk' },
        { id: 'dracula',   label: 'dracula',   desc: 'dracula' },
        { id: 'nord',      label: 'nord',      desc: 'minimalistic nord' },
        { id: 'solarized', label: 'solarized', desc: 'warmth solarized' },
        { id: 'crimson',   label: 'crimson',   desc: 'dark crimson' },
        { id: 'mono',      label: 'mono',      desc: 'minimalistic mono' },
        { id: 'light',     label: 'light',     desc: 'just light' }
    ];
    const DEFAULT_THEME = "coral";
    const THEME_IDS     = THEMES.map(t => t.id);
    const THEME_KEY     = 'pt-terminal-theme';

    function getTheme() { return term.getAttribute('data-theme') || DEFAULT_THEME; }

    function setTheme(id, silent) {
        if (id === 'random') {
            id = THEME_IDS[Math.floor(Math.random() * THEME_IDS.length)];
        }
        if (id === 'reset') {
            try { localStorage.removeItem(THEME_KEY); } catch (e) {}
            id = DEFAULT_THEME;
        }
        const theme = THEMES.find(t => t.id === id);
        if (!theme) {
            print('pt: unknown theme: ${id}', 'term-err');
            print('Available: ' + THEME_IDS.join(', '), 'term-dim');
            return false;
        }
        term.setAttribute('data-theme', theme.id);
        term.classList.remove('term--flash');
        void term.offsetWidth;
        term.classList.add('term--flash');
        setTimeout(() => term.classList.remove('term--flash'), 600);
        try { localStorage.setItem(THEME_KEY, theme.id); } catch (e) {}
        if (!silent) print('Theme → ${theme.label}', 'term-success');
        return true;
    }

    /* ============ STORAGE ============ */
    function lsGet(key, fallback) {
        try {
            const v = localStorage.getItem(key);
            return v === null ? fallback : JSON.parse(v);
        } catch (e) { return fallback; }
    }
    function lsSet(key, value) {
        try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
    }

    const ALIAS_KEY    = 'pt-terminal-aliases';
    const NOTEPAD_KEY  = 'pt-terminal-notepad';
    const TODO_KEY     = 'pt-terminal-todo';
    const POMO_KEY     = 'pt-terminal-pomo';

    /* ============ ALIASES ============ */
    function loadAliases() { return lsGet(ALIAS_KEY, {}); }
    function saveAliases(a) { lsSet(ALIAS_KEY, a); }

    function expandAlias(cmd, args) {
        const aliases = loadAliases();
        if (aliases[cmd]) {
            const parts = aliases[cmd].split(/\s+/);
            return { cmd: parts[0], args: parts.slice(1).concat(args) };
        }
        return { cmd, args };
    }

    /* ============ UNIVERSAL COMMANDS ============ */
    const universal = {
        help() {
            const head = {
                boot:  'Boot shell',
                me:    'Portfolio shell',
                shell: 'Tools shell'
            }[mode];

            print('Available commands - ${head}', 'term-head');
            print('-'.repeat(50), 'term-dim');
            blank();

            // Universal
            const universalRows = [
                ['help',    'Show this message'],
                ['clear',   'Clear the terminal'],
                ['history', 'Show command history'],
                ['theme',   'Change terminal theme'],
                ['date',    'Show current date and time'],
                ['echo',    'Echo text back'],
                ['home',    'Return to the main site'],
                ['exit',    mode === 'boot' ? 'Return to the main site' : 'Back to boot shell']
            ];

            // Mode-specific
            let modeRows = [];
            if (mode === 'boot') {
                modeRows = [
                    ['me',    'Open portfolio shell (about, projects, contact)'],
                    ['shell', 'Open tools shell (calc, hash, uuid, ...)']
                ];
            } else if (mode === 'me') {
                modeRows = [
                    ['about',           'Learn about pt'],
                    ['whoami',          'Who am I?'],
                    ['banner',          'Display the pt banner'],
                    ['now',             'What I am doing right now'],
                    ['stack',           'Display tech stack'],
                    ['work',            'List selected work'],
                    ['projects',        'Alias of work'],
                    ['project <name>',  'Show details of a project'],
                    ['contact',         'Get in touch'],
                    ['resume',          'Resume / CV'],
                    ['search <query>',  'Search across portfolio content']
                ];
            } else if (mode === 'shell') {
                modeRows = [
                    ['calc <expr>',           'Evaluate an arithmetic expression'],
                    ['ts [value]',            'Unix timestamp <-> ISO <-> human'],
                    ['color <value>',         'HEX <-> RGB <-> HSL'],
                    ['uuid',                  'Generate UUID v4'],
                    ['pass [len] [--no-symbols]', 'Generate a strong password'],
                    ['rand [min] [max]',      'Cryptographic random number'],
                    ['hash <text> [algo]',    'SHA-1/256/384/512'],
                    ['b64 enc|dec <text>',    'Base64 encode / decode'],
                    ['url enc|dec <text>',    'URL encode / decode'],
                    ['json <text>',           'Validate and pretty-print JSON'],
                    ['ua',                    'Browser / OS info'],
                    ['screen',                'Viewport info'],
                    ['ip',                    'Public IP'],
                    ['notepad [text|clear]',  'Scratchpad (persistent)'],
                    ['todo add|list|done|rm|clear', 'Mini todo list'],
                    ['pomo start|stop|status', 'Pomodoro timer'],
                    ['alias name=cmd',        'Create alias'],
                    ['unalias name',          'Remove alias']
                ];
            }

            const printRows = (rows) => rows.forEach(([cmd, desc]) => {
                printHTML(
                    '<span class="term-cmd-name">${esc(pad(cmd, 32))}</span>' +
                    '<span class="term-out-dim">${esc(desc)}</span>'
                );
            });

            printRows(modeRows);
            blank();
            print('Universal', 'term-head');
            printRows(universalRows);
        },

        clear() { output.innerHTML = ''; },

        history() {
            const h = historyFor(mode);
            if (!h.length) { print('(no history)', 'term-dim'); return; }
            h.forEach((c, i) => {
                printHTML(
                    '<span class="term-dim">${esc(pad(String(i + 1), 5))}</span>' +
                    '<span class="term-out">${esc(c)}</span>'
                );
            });
        },

        theme(args) {
            const sub = (args[0] || '').toLowerCase();
            if (!sub) {
                const cur = getTheme();
                print('Themes', 'term-head');
                blank();
                THEMES.forEach(t => {
                    const mark = t.id === cur ? '#' : '-';
                    printHTML(
                        '<span class="term-accent">${mark}</span> ' +
                        '<span class="term-cmd-name">${esc(pad(t.id, 10))}</span>' +
                        '<span class="term-out-dim">${esc(t.desc)}</span>'
                    );
                });
                blank();
                print('Usage: theme <name> | random | reset | next | prev', 'term-dim');
                return;
            }
            if (sub === 'next' || sub === 'prev') {
                const cur  = THEME_IDS.indexOf(getTheme());
                const step = sub === 'next' ? 1 : -1;
                const next = THEME_IDS[(cur + step + THEME_IDS.length) % THEME_IDS.length];
                setTheme(next);
                return;
            }
            setTheme(sub);
        },

        date() { print(new Date().toString()); },

        echo(args) {
            if (!args.length) { blank(); return; }
            print(args.join(' '));
        },

        home() {
            print('Returning to main site...', 'term-dim');
            setTimeout(() => { location.href = '../index.html'; }, 400);
        },

        exit() {
            if (mode === 'boot') { commands.home(); return; }
            switchMode('boot');
        }
    };

    /* ============ BOOT COMMANDS ============ */
    const bootCommands = {
        me()    { switchMode('me'); },
        shell() { switchMode('shell'); }
    };

    /* ============ ME COMMANDS ============ */
    const meCommands = {
        about() {
            print('Pt - Independent Developer', 'term-head');
            blank();
            print('Building robust and scalable systems.');
            print('Self-taught. CS50 graduate. Three years of experience.');
            blank();
            print('Focus: developer tools, compilers, CLI libraries.', 'term-dim');
        },

        whoami() {
            print('pt');
            print('system developer · terminal-first · self-taught', 'term-dim');
        },

        banner() {
            print([
                ' ____ _____',
                '|  _ \\_   _|',
                '| |_) || |',
                '|  __/ | |',
                '|_|    |_|',
                '',
                'pt - Creative Developer · ${VERSION}'
            ].join('\n'), 'term-accent');
            blank();
        },

        now() {
            print('Now', 'term-head');
            blank();
            NOW_TEXT.forEach(line => print('  · ' + line, 'term-out'));
        },

        stack() {
            print('The Stack', 'term-head');
            blank();
            printHTML('<span class="term-key">core:</span>    Go · Rust · C');
            printHTML('<span class="term-key">design:</span>  Photoshop · Cavalry');
            printHTML('<span class="term-key">other:</span>   Tal · Python · HTML5 · CSS');
            blank();
            print('Environment', 'term-head');
            blank();
            print('MacOS · VsCodium · Cutter · iTerm 2 · Obsidian · Zen', 'term-out-dim');
        },

        work() {
            print('Selected Work', 'term-head');
            print('-'.repeat(60), 'term-dim');
            blank();
            Object.keys(PROJECTS).forEach(key => {
                const p = PROJECTS[key];
                printHTML(
                    '  <span class="term-accent">${esc(pad(key, 8))}</span>' +
                    '<span class="term-out">${esc(pad(p.type, 18))}</span>' +
                    '<span class="term-dim">${esc(pad(p.lang, 12))}</span>'
                );
            });
            blank();
            print("Use 'project <name>' for details.", 'term-dim');
        },

        projects(args) { meCommands.work(args); },

        project(args) {
            if (!args.length) {
                print('Usage: project <name>', 'term-err');
                print('Available: ' + PROJECT_NAMES.join(', '), 'term-dim');
                return;
            }
            const key = args[0].toLowerCase();
            const p = PROJECTS[key];
            if (!p) {
                print('pt: project not found: ${key}', 'term-err');
                print('Available: ' + PROJECT_NAMES.join(', '), 'term-dim');
                return;
            }
            print(p.name, 'term-head');
            print('-'.repeat(Math.min(60, p.name.length)), 'term-dim');
            blank();
            const row = (k, v) =>
                printHTML('<span class="term-key">${esc(pad(k, 10))}</span> <span class="term-out">${esc(v)}</span>');
            row('Type:', p.type);
            row('Status:', p.status);
            row('Role:', p.role);
            row('License:', p.license);
            row('Language:', p.lang);
            row('Link:', p.link);
            blank();
            print(p.desc);
        },

        contact() {
            print('Contact', 'term-head');
            blank();
            printHTML('<span class="term-key">email:</span>  <a class="term-link" href="mailto:pt.main.acc@gmail.com">pt.main.acc@gmail.com</a>');
            printHTML('<span class="term-key">github:</span> <a class="term-link" href="https://github.com/pt-main/" target="_blank" rel="noopener">github.com/pt-main</a>');
            blank();
        },

        resume(args) {
            const sub = (args[0] || '').toLowerCase();
            if (sub === 'pdf') {
                if (!RESUME_PDF) {
                    print('resume: PDF not available', 'term-err');
                    return;
                }
                print('Opening PDF...', 'term-dim');
                window.open(RESUME_PDF, '_blank', 'noopener');
                return;
            }
            print('Resume', 'term-head');
            print('-'.repeat(50), 'term-dim');
            blank();
            print('Experience', 'term-head');
            RESUME.experience.forEach(l => print('  ' + l, 'term-out'));
            blank();
            print('Education', 'term-head');
            RESUME.education.forEach(l => print('  ' + l, 'term-out'));
            blank();
            print('Skills', 'term-head');
            print('  ' + RESUME.skills.join(' · '), 'term-out');
            blank();
            if (RESUME_PDF) {
                print("Run 'resume pdf' to open the full PDF.", 'term-dim');
            } else {
                print('[ PDF not available ]', 'term-dim');
            }
        },

        search(args) {
            const q = args.join(' ').trim().toLowerCase();
            if (!q) { print('Usage: search <query>', 'term-err'); return; }

            const hits = [];
            const test = (text) => text.toLowerCase().includes(q);

            // Bio
            const bio = 'Pt Independent Developer Building robust scalable systems CS50 self-taught compilers CLI libraries developer tools';
            if (test(bio)) hits.push({ where: 'about', what: 'bio' });

            // Stack
            const stackText = 'Go Rust C Lua Python Tal HTML5 CSS Photoshop Cavalry MacOS VsCodium Cutter iTerm Obsidian Zen';
            if (test(stackText)) hits.push({ where: 'stack', what: 'tech stack' });

            // Projects
            for (const key of PROJECT_NAMES) {
                const p = PROJECTS[key];
                const blob = '${p.name} ${p.type} ${p.lang} ${p.license} ${p.desc}';
                if (test(blob)) hits.push({ where: 'project', what: key, hint: p.name });
            }

            if (!hits.length) {
                print('search: no matches for "${q}"', 'term-dim');
                return;
            }

            print('Matches for "${q}"', 'term-head');
            blank();
            hits.forEach(h => {
                const hint = h.hint ? '  <span class="term-out-dim">${esc(h.hint)}</span>' : '';
                printHTML(
                    '<span class="term-key">${esc(pad(h.where, 10))}</span>' +
                    '<span class="term-accent">${esc(h.what)}</span>${hint}'
                );
            });
        }
    };

    /* ============ SHELL COMMANDS ============ */

    // ----- calc -----
    function safeCalc(expr) {
        // Replace ^ with **
        let e = expr.replace(/\^/g, '**');
        // Expose math functions
        e = e.replace(/\b(sqrt|sin|cos|tan|log|abs|floor|ceil|round)\s*\(/g, 'Math.$1(');
        e = e.replace(/\bpi\b/g, 'Math.PI');
        // Check for anything dangerous after stripping Math.* references
        const cleaned = e.replace(/Math\.\w+/g, '0');
        if (!/^[0-9+\-*/().%,\s0]+$/.test(cleaned)) {
            throw new Error('invalid expression');
        }
        // eslint-disable-next-line no-new-func
        const fn = new Function('"use strict"; return (' + e + ');');
        const result = fn();
        if (typeof result !== 'number' || !isFinite(result)) {
            throw new Error('invalid result');
        }
        return result;
    }

    // ----- color -----
    function parseColor(str) {
        str = str.trim();
        let m = str.match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i);
        if (m) {
            let hex = m[1];
            if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
            return {
                r: parseInt(hex.slice(0, 2), 16),
                g: parseInt(hex.slice(2, 4), 16),
                b: parseInt(hex.slice(4, 6), 16)
            };
        }
        m = str.match(/^rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i);
        if (m) return { r: +m[1], g: +m[2], b: +m[3] };
        m = str.match(/^(\d+)\s*,\s*(\d+)\s*,\s*(\d+)$/);
        if (m) return { r: +m[1], g: +m[2], b: +m[3] };
        return null;
    }
    const toHex = (n) => n.toString(16).padStart(2, '0');
    function rgbToHex({ r, g, b }) { return '#' + toHex(r) + toHex(g) + toHex(b); }
    function rgbToHsl({ r, g, b }) {
        r /= 255; g /= 255; b /= 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h = 0, s = 0;
        const l = (max + min) / 2;
        if (max !== min) {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
    }

    // ----- base64 (utf-8 safe) -----
    function b64Encode(str) {
        const bytes = new TextEncoder().encode(str);
        let bin = '';
        bytes.forEach(b => bin += String.fromCharCode(b));
        return btoa(bin);
    }
    function b64Decode(b64) {
        const bin = atob(b64);
        const bytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        return new TextDecoder().decode(bytes);
    }

    // ----- password -----
    function genPass(len, noSymbols) {
        len = Math.max(4, Math.min(256, len || 20));
        const lower   = 'abcdefghijklmnopqrstuvwxyz';
        const upper   = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const digits  = '0123456789';
        const symbols = '!@#$%^&*()-_=+[]{};:,.<>?';
        const chars   = lower + upper + digits + (noSymbols ? '' : symbols);
        const arr     = new Uint32Array(len);
        crypto.getRandomValues(arr);
        return Array.from(arr).map(n => chars[n % chars.length]).join('');
    }

    // ----- random -----
    function genRand(min, max) {
        min = typeof min === 'number' ? min : 0;
        max = typeof max === 'number' ? max : 100;
        if (min > max) [min, max] = [max, min];
        const range = max - min + 1;
        const arr = new Uint32Array(1);
        crypto.getRandomValues(arr);
        return min + (arr[0] % range);
    }

    // ----- notepad / todo / pomo -----
    function getNotepad()      { return lsGet(NOTEPAD_KEY, []); }
    function setNotepad(v)     { lsSet(NOTEPAD_KEY, v); }
    function getTodos()        { return lsGet(TODO_KEY, []); }
    function setTodos(v)       { lsSet(TODO_KEY, v); }
    function getPomo()         { return lsGet(POMO_KEY, null); }
    function setPomo(v)        { lsSet(POMO_KEY, v); }

    function fmtTime(ms) {
        const total = Math.max(0, Math.floor(ms / 1000));
        const m = String(Math.floor(total / 60)).padStart(2, '0');
        const s = String(total % 60).padStart(2, '0');
        return '${m}:${s}';
    }

    const shellCommands = {

        calc(args) {
            const expr = args.join(' ').trim();
            if (!expr) { print('Usage: calc <expression>', 'term-err'); print('Example: calc (2+3)*4', 'term-dim'); return; }
            try {
                const result = safeCalc(expr);
                print('${expr} = ${result}', 'term-success');
            } catch (e) {
                print('calc: ${e.message}', 'term-err');
            }
        },

        ts(args) {
            const input = args.join(' ').trim();
            let date;
            if (!input) {
                date = new Date();
            } else if (/^\d+$/.test(input)) {
                const n = parseInt(input, 10);
                date = new Date(n > 1e12 ? n : n * 1000);
            } else {
                date = new Date(input);
            }
            if (isNaN(date.getTime())) {
                print('ts: invalid input: ${input}', 'term-err');
                return;
            }
            printHTML('<span class="term-key">unix:</span>  <span class="term-out">${Math.floor(date.getTime() / 1000)}</span>');
            printHTML('<span class="term-key">ms:</span>    <span class="term-out">${date.getTime()}</span>');
            printHTML('<span class="term-key">iso:</span>   <span class="term-out">${date.toISOString()}</span>');
            printHTML('<span class="term-key">local:</span> <span class="term-out">${date.toString()}</span>');
            printHTML('<span class="term-key">utc:</span>   <span class="term-out">${date.toUTCString()}</span>');
        },

        color(args) {
            const s = args.join(' ').trim();
            if (!s) { print('Usage: color <hex | rgb | r,g,b>', 'term-err'); print('Example: color #ff5e3a', 'term-dim'); return; }
            const rgb = parseColor(s);
            if (!rgb) { print('color: unable to parse: ${s}', 'term-err'); return; }
            const hex = rgbToHex(rgb);
            const hsl = rgbToHsl(rgb);
            printHTML('<span class="term-key">HEX:</span>  <span class="term-out">${esc(hex)}</span>');
            printHTML('<span class="term-key">RGB:</span>  <span class="term-out">rgb(${rgb.r}, ${rgb.g}, ${rgb.b})</span>');
            printHTML('<span class="term-key">HSL:</span>  <span class="term-out">hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)</span>');
            printHTML(
                '<span class="term-key">prev:</span> ' +
                '<span style="display:inline-block;width:60px;height:14px;background:${esc(hex)};border:1px solid rgba(255,255,255,0.2);vertical-align:middle"></span>'
            );
        },

        uuid() {
            if (crypto.randomUUID) {
                print(crypto.randomUUID());
            } else {
                const arr = new Uint8Array(16);
                crypto.getRandomValues(arr);
                arr[6] = (arr[6] & 0x0f) | 0x40;
                arr[8] = (arr[8] & 0x3f) | 0x80;
                const hex = Array.from(arr).map(b => b.toString(16).padStart(2, '0'));
                print('${hex.slice(0,4).join('')}-${hex.slice(4,6).join('')}-${hex.slice(6,8).join('')}-${hex.slice(8,10).join('')}-${hex.slice(10,16).join('')}');
            }
        },

        pass(args) {
            const noSymbols = args.includes('--no-symbols');
            const lenArg    = args.find(a => /^\d+$/.test(a));
            const len       = lenArg ? parseInt(lenArg, 10) : 20;
            print(genPass(len, noSymbols), 'term-accent');
        },

        rand(args) {
            const nums = args.filter(a => /^-?\d+$/.test(a)).map(Number);
            const min  = nums.length >= 1 ? nums[0] : 0;
            const max  = nums.length >= 2 ? nums[1] : 100;
            print(String(genRand(min, max)));
        },

        async hash(args) {
            const text = args[0];
            const algo = (args[1] || 'sha256').toLowerCase().replace('-', '');
            const algos = { sha1: 'SHA-1', sha256: 'SHA-256', sha384: 'SHA-384', sha512: 'SHA-512' };
            const wcAlgo = algos[algo];
            if (!text) {
                print('Usage: hash <text> [algo]', 'term-err');
                print('Algos: sha1 · sha256 · sha384 · sha512', 'term-dim');
                return;
            }
            if (!wcAlgo) {
                print('hash: unknown algo: ${algo}', 'term-err');
                return;
            }
            const buf = await crypto.subtle.digest(wcAlgo, new TextEncoder().encode(text));
            const hex = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
            printHTML('<span class="term-key">${esc(algo)}:</span> <span class="term-out">${esc(hex)}</span>');
        },

        b64(args) {
            const sub = (args[0] || '').toLowerCase();
            const text = args.slice(1).join(' ');
            if ((sub !== 'enc' && sub !== 'dec') || !text) {
                print('Usage: b64 enc <text> | b64 dec <base64>', 'term-err');
                return;
            }
            try {
                if (sub === 'enc') print(b64Encode(text), 'term-accent');
                else               print(b64Decode(text), 'term-accent');
            } catch (e) {
                print('b64: ${e.message}', 'term-err');
            }
        },

        url(args) {
            const sub = (args[0] || '').toLowerCase();
            const text = args.slice(1).join(' ');
            if ((sub !== 'enc' && sub !== 'dec') || !text) {
                print('Usage: url enc <text> | url dec <text>', 'term-err');
                return;
            }
            try {
                if (sub === 'enc') print(encodeURIComponent(text), 'term-accent');
                else               print(decodeURIComponent(text), 'term-accent');
            } catch (e) {
                print('url: ${e.message}', 'term-err');
            }
        },

        json(args) {
            const text = args.join(' ');
            if (!text) { print('Usage: json <json-text>', 'term-err'); return; }
            try {
                const obj = JSON.parse(text);
                print(JSON.stringify(obj, null, 2), 'term-out');
            } catch (e) {
                print('json: ${e.message}', 'term-err');
            }
        },

        ua() {
            const ua = navigator.userAgent;
            printHTML('<span class="term-key">raw:</span>   <span class="term-out">${esc(ua)}</span>');
            const lang = navigator.language || '-';
            const platform = navigator.platform || '-';
            printHTML('<span class="term-key">lang:</span>  <span class="term-out">${esc(lang)}</span>');
            printHTML('<span class="term-key">platf:</span> <span class="term-out">${esc(platform)}</span>');
        },

        screen() {
            const dpr = window.devicePixelRatio || 1;
            printHTML('<span class="term-key">viewport:</span> <span class="term-out">${window.innerWidth} × ${window.innerHeight}</span>');
            printHTML('<span class="term-key">screen:</span>   <span class="term-out">${window.screen.width} × ${window.screen.height}</span>');
            printHTML('<span class="term-key">dpr:</span>      <span class="term-out">${dpr}</span>');
            printHTML('<span class="term-key">color:</span>    <span class="term-out">${window.screen.colorDepth}-bit</span>');
            printHTML('<span class="term-key">touch:</span>    <span class="term-out">${('ontouchstart' in window) ? 'yes' : 'no'}</span>');
        },

        async ip() {
            const cacheKey = 'pt-terminal-ip';
            try {
                const cached = sessionStorage.getItem(cacheKey);
                if (cached) { print(cached); return; }
            } catch (e) {}
            try {
                const res = await fetch('https://api.ipify.org?format=json');
                if (!res.ok) throw new Error('HTTP ' + res.status);
                const data = await res.json();
                try { sessionStorage.setItem(cacheKey, data.ip); } catch (e) {}
                print(data.ip, 'term-accent');
            } catch (e) {
                print('ip: unable to fetch (offline or blocked)', 'term-err');
            }
        },

        notepad(args) {
            const sub = (args[0] || '').toLowerCase();
            const notes = getNotepad();

            if (!args.length) {
                if (!notes.length) { print('(notepad is empty)', 'term-dim'); return; }
                notes.forEach((n, i) => {
                    printHTML(
                        '<span class="term-dim">${esc(pad(String(i + 1), 4))}</span>' +
                        '<span class="term-out">${esc(n)}</span>'
                    );
                });
                return;
            }
            if (sub === 'clear') {
                setNotepad([]);
                print('notepad cleared', 'term-success');
                return;
            }
            const text = args.join(' ');
            notes.push(text);
            setNotepad(notes);
            print('added (${notes.length} total)', 'term-success');
        },

        todo(args) {
            const sub  = (args[0] || 'list').toLowerCase();
            const todos = getTodos();

            if (sub === 'add') {
                const text = args.slice(1).join(' ').trim();
                if (!text) { print('Usage: todo add <text>', 'term-err'); return; }
                const id = todos.length ? Math.max(...todos.map(t => t.id)) + 1 : 1;
                todos.push({ id, text, done: false });
                setTodos(todos);
                print('added #${id}', 'term-success');
                return;
            }
            if (sub === 'list') {
                if (!todos.length) { print('(no todos)', 'term-dim'); return; }
                todos.forEach(t => {
                    const mark = t.done ? '[x]' : '[ ]';
                    const cls  = t.done ? 'term-dim' : 'term-out';
                    printHTML(
                        '<span class="term-accent">${esc(mark)}</span> ' +
                        '<span class="term-dim">#${esc(pad(String(t.id), 3))}</span> ' +
                        '<span class="${cls}">${esc(t.text)}</span>'
                    );
                });
                return;
            }
            if (sub === 'done') {
                const id = parseInt(args[1], 10);
                const t  = todos.find(x => x.id === id);
                if (!t) { print('todo: #${args[1]} not found', 'term-err'); return; }
                t.done = true;
                setTodos(todos);
                print('done #${id}', 'term-success');
                return;
            }
            if (sub === 'rm') {
                const id  = parseInt(args[1], 10);
                const idx = todos.findIndex(x => x.id === id);
                if (idx < 0) { print('todo: #${args[1]} not found', 'term-err'); return; }
                todos.splice(idx, 1);
                setTodos(todos);
                print('removed #${id}', 'term-success');
                return;
            }
            if (sub === 'clear') {
                setTodos([]);
                print('todos cleared', 'term-success');
                return;
            }
            print('Usage: todo add|list|done|rm|clear', 'term-err');
        },

        pomo(args) {
            const sub = (args[0] || 'status').toLowerCase();
            const state = getPomo();

            if (sub === 'start') {
                const mins = parseInt(args[1], 10) || 25;
                const endTime = Date.now() + mins * 60 * 1000;
                setPomo({ endTime, mins });
                print('pomodoro started: ${mins}:00', 'term-success');
                return;
            }
            if (sub === 'stop') {
                if (!state) { print('pomo: nothing running', 'term-dim'); return; }
                setPomo(null);
                print('pomodoro stopped', 'term-dim');
                return;
            }
            if (sub === 'status' || sub === '') {
                if (!state) { print('pomo: idle', 'term-dim'); return; }
                const left = state.endTime - Date.now();
                if (left <= 0) {
                    setPomo(null);
                    print('pomodoro finished ✓', 'term-success');
                    return;
                }
                printHTML('<span class="term-key">remaining:</span> <span class="term-accent">${esc(fmtTime(left))}</span>');
                return;
            }
            print('Usage: pomo start [minutes] | stop | status', 'term-err');
        },

        alias(args) {
            const joined = args.join(' ');
            const m = joined.match(/^([A-Za-z][\w-]*)\s*=\s*(.+)$/);
            if (!m) {
                const aliases = loadAliases();
                const keys = Object.keys(aliases);
                if (!keys.length) {
                    print('(no aliases)', 'term-dim');
                    print('Usage: alias name=command', 'term-dim');
                    return;
                }
                print('Aliases', 'term-head');
                blank();
                keys.forEach(k => {
                    printHTML(
                        '<span class="term-cmd-name">${esc(pad(k, 10))}</span>' +
                        '<span class="term-out-dim">${esc(aliases[k])}</span>'
                    );
                });
                return;
            }
            const aliases = loadAliases();
            aliases[m[1]] = m[2].trim();
            saveAliases(aliases);
            print('alias ${m[1]} = ${m[2].trim()}', 'term-success');
        },

        unalias(args) {
            const name = args[0];
            if (!name) { print('Usage: unalias <name>', 'term-err'); return; }
            const aliases = loadAliases();
            if (!aliases[name]) { print('unalias: ${name} not found', 'term-err'); return; }
            delete aliases[name];
            saveAliases(aliases);
            print('removed alias ${name}', 'term-success');
        }
    };

    /* ============ MODE SWITCHING ============ */
    function switchMode(next) {
        if (!MODES[next]) return;
        if (next === mode) return;
        mode = next;
        histIdx = historyFor(mode).length;

        if (titleEl) titleEl.textContent = MODES[mode].title;

        if (mode === 'me') {
            print('→ portfolio shell', 'term-success');
            print("Type 'help' for commands.", 'term-dim');
        } else if (mode === 'shell') {
            print('→ tools shell', 'term-success');
            print("Type 'help' for commands.", 'term-dim');
        } else {
            print('← back to boot', 'term-dim');
            print("Type 'me' or 'shell' to continue.", 'term-dim');
        }
        blank();
        input.focus();
    }

    /* ============ HISTORY (per mode) ============ */
    const histories = { boot: [], me: [], shell: [] };
    let histIdx = 0;
    function historyFor(m) { return histories[m]; }

    /* ============ COMMAND RESOLUTION ============ */
    function getCommandTable() {
        if (mode === 'boot')  return Object.assign({}, universal, bootCommands);
        if (mode === 'me')    return Object.assign({}, universal, meCommands);
        if (mode === 'shell') return Object.assign({}, universal, shellCommands);
        return universal;
    }

    /* ============ RUN ============ */
    async function run(raw) {
        const trimmed = raw.trim();

        if (trimmed) {
            historyFor(mode).push(trimmed);
            histIdx = historyFor(mode).length;
            writeCmd(trimmed);
        } else {
            writeCmd('');
            return;
        }

        const parts = trimmed.split(/\s+/);
        let cmd = parts[0].toLowerCase();
        let args = parts.slice(1);

        // Alias expansion (works in all modes)
        const expanded = expandAlias(cmd, args);
        cmd  = expanded.cmd.toLowerCase();
        args = expanded.args;

        const table = getCommandTable();
        const fn = table[cmd];

        if (typeof fn === 'function') {
            try {
                await fn(args);
            } catch (e) {
                print('pt: ' + (e && e.message ? e.message : 'runtime error'), 'term-err');
            }
        } else {
            print('pt: command not found: ${cmd}', 'term-err');
            print("Type 'help' for a list of available commands.", 'term-dim');
        }

        blank();
    }

    /* ============ INPUT ============ */
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const v = input.value;
            input.value = '';
            run(v);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            const h = historyFor(mode);
            if (histIdx > 0) {
                histIdx--;
                input.value = h[histIdx] || '';
                requestAnimationFrame(() =>
                    input.setSelectionRange(input.value.length, input.value.length));
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            const h = historyFor(mode);
            if (histIdx < h.length - 1) {
                histIdx++;
                input.value = h[histIdx] || '';
                requestAnimationFrame(() =>
                    input.setSelectionRange(input.value.length, input.value.length));
            } else {
                histIdx = h.length;
                input.value = '';
            }
        } else if (e.key === 'Tab') {
            e.preventDefault();
            autocomplete();
        } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'l') {
            e.preventDefault();
            universal.clear();
        } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
            if (!window.getSelection().toString() && !input.value) {
                e.preventDefault();
                writeCmd('^C');
            }
        }
    });

    function autocomplete() {
        const v = input.value;
        if (!v.trim()) return;
        const parts = v.split(/\s+/);
        const cmd   = parts[0].toLowerCase();
        const table = getCommandTable();

        if (parts.length <= 1) {
            const matches = Object.keys(table).filter(c => c.startsWith(cmd));
            if (matches.length === 1) {
                input.value = matches[0] + ' ';
            } else if (matches.length > 1) {
                writeCmd(v);
                print(matches.join('  '), 'term-dim');
                blank();
            }
        } else if (cmd === 'project' && parts.length === 2 && mode === 'me') {
            const partial = parts[1].toLowerCase();
            const matches = PROJECT_NAMES.filter(p => p.startsWith(partial));
            if (matches.length === 1) {
                input.value = 'project ' + matches[0];
            } else if (matches.length > 1) {
                writeCmd(v);
                print(matches.join('  '), 'term-dim');
                blank();
            }
        } else if (cmd === 'theme' && parts.length === 2) {
            const partial = parts[1].toLowerCase();
            const extra = ['next', 'prev', 'random', 'reset'];
            const matches = THEME_IDS.concat(extra).filter(t => t.startsWith(partial));
            if (matches.length === 1) {
                input.value = 'theme ' + matches[0];
            } else if (matches.length > 1) {
                writeCmd(v);
                print(matches.join('  '), 'term-dim');
                blank();
            }
        }
    }

    /* ============ FOCUS ============ */
    term.addEventListener('mousedown', (e) => {
        if (e.target.closest('a, input, .term-close')) return;
        if (window.getSelection().toString()) return;
        e.preventDefault();
        input.focus();
    });

    /* ============ BOOT ============ */
    const boot = [
        { t: '[  OK  ] Initializing pt-terminal ${VERSION}', c: 'term-boot-ok' },
        { t: '[  OK  ] Loading kernel modules',              c: 'term-boot-ok' },
        { t: '[  OK  ] Mounting virtual filesystem',         c: 'term-boot-ok' },
        { t: '[  OK  ] Establishing secure connection',      c: 'term-boot-ok' },
        { t: '',                                              c: '' },
        { t: 'Welcome to pt-terminal ${VERSION}',             c: 'term-welcome' },
        { t: '',                                              c: '' }
    ];

    function showBootMenu() {
        print('Two shells available:', 'term-head');
        blank();
        printHTML(
            '<span class="term-cmd-name">${esc(pad('me', 10))}</span>' +
            '<span class="term-out-dim">portfolio shell - about, projects, contact</span>'
        );
        printHTML(
            '<span class="term-cmd-name">${esc(pad('shell', 10))}</span>' +
            '<span class="term-out-dim">tools shell - calc, hash, uuid, ip, ...</span>'
        );
        blank();
        print("Type 'help' for all commands.", 'term-dim');
        blank();
        printHTML(
            '<span class="term-key">theme:</span> ' +
            '<span class="term-out-dim">try 'theme random'</span>'
        );
    }

    function runBoot() {
        let i = 0;
        const step = () => {
            if (i >= boot.length) {
                showBootMenu();
                input.focus();
                return;
            }
            const line = boot[i++];
            if (line.t) print(line.t, line.c);
            else blank();
            setTimeout(step, 130);
        };
        step();
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        showBootMenu();
        input.focus();
    } else {
        runBoot();
    }

    /* ============ THEME RESTORE ============ */
    try {
        const saved = localStorage.getItem(THEME_KEY);
        if (saved && THEME_IDS.includes(saved)) {
            term.setAttribute('data-theme', saved);
        }
    } catch (e) {}

})();
```

---

# assets/touch-main.png

```png
Can't read file: 'utf-8' codec can't decode byte 0x89 in position 0: invalid start byte
```

---

# assets/touch-main.pxd

```pxd
Can't read file: 'utf-8' codec can't decode byte 0x90 in position 19: invalid start byte
```

---

# index.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="Pt - Independent developer building robust, scalable systems and open-source developer tools: Lc, Tap, Run, Tal, Tycl, Manage.">
    <meta name="theme-color" content="#0b0a09">
    <meta name="color-scheme" content="dark">

    <link rel="icon" type="image/png" href="assets/icon-main.png">
    <link rel="apple-touch-icon" href="assets/touch-main.png">

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
    <title>Pt - Creative Developer</title>
    <link rel="stylesheet" href="assets/pt.css">
    <link rel="stylesheet" href="assets/other.css">
    <script>
        if ('scrollRestoration' in history) {
            history.scrollRestoration = 'manual';
        }
        document.documentElement.classList.add('js');
        setTimeout(function () {
            var r = document.documentElement;
            if (!r.classList.contains('pt-ready')) r.classList.add('pt-lite');
        }, 4000);
    </script>
</head>
<body>

    <a href="#main" class="skip-link">Skip to content</a>

    <!-- NAVBAR -->
    <nav class="navbar glass" aria-label="Primary">
        <div class="nav-content">
            <a href="#" class="logo" aria-label="Home">pt</a>

            <input type="checkbox" id="nav-toggle" class="nav-toggle-input" aria-hidden="true" tabindex="-1">
            <label for="nav-toggle" class="nav-toggle" aria-label="Toggle navigation" role="button">
                <span></span><span></span><span></span>
            </label>

            <ul class="nav-links">
                <li><a href="#about"   class="nav-link">About</a></li>
                <li><a href="#stack"   class="nav-link">Stack</a></li>
                <li><a href="#work"    class="nav-link">Work</a></li>
                <li><a href="#contact" class="nav-link">Contact</a></li>
                <li><a href="pages/terminal.html" class="nav-link">Terminal</a></li>
            </ul>
        </div>
    </nav>

    <main id="main">
        <!-- HERO -->
        <div class="page pt-grad-2">
            <section class="hero card card-fullscreen pt-grad-1" aria-label="Introduction">
                <div class="hero-badges">
                    <span class="badge">Designer</span>
                    <span class="badge">System developer</span>
                    <span class="badge">Tech lead</span>
                </div>

                <h1 class="hero-title">Pt</h1>

                <p class="hero-tagline">people work's for people</p>

                <p class="hero-desc">
                    Independent developer. Building robust and scalable systems.
                </p>

                <div class="btn-group hero-actions">
                    <a href="#work"    class="btn btn-primary">View Projects</a>
                    <a href="#contact" class="btn btn-secondary">Get in touch</a>
                </div>
            </section>
        </div>

        <!-- ABOUT -->
        <section id="about" class="section section-first">
            <div class="container">
                <h1 class="reveal reveal-delay-3">Who I am?</h1>
                <h4 class="reveal reveal-delay-3">I am a system developer creating open dev tools and frameworks.</h4>

                <div class="grid grid-3 mt-16">
                    <div class="card reveal reveal-delay-1">
                        <div class="card-icon">01</div>
                        <h4 class="card-title">Philosophy</h4>
                        <p class="text-muted text-small">
                            AI is merely a tool. It cannot and should not take over more than 30% of routine tasks—and only provided that you actually understand what it is writing.
                        </p>
                    </div>

                    <div class="card reveal reveal-delay-2">
                        <div class="card-icon">02</div>
                        <h4 class="card-title">Focus</h4>
                        <p class="text-muted text-small">
                            Building really simple, useful and convenient developer tools. Simple installation, operation, and extensibility.
                        </p>
                    </div>

                    <div class="card reveal reveal-delay-3">
                        <div class="card-icon">03</div>
                        <h4 class="card-title">Education</h4>
                        <p class="text-muted text-small">
                            Entirely self-taught. I completed CS50, enjoyed it, and started writing my own projects while simultaneously studying others' code. Three years of experience.
                        </p>
                    </div>
                </div>
            </div>
        </section>

        <!-- STACK -->
        <section id="stack" class="section">
            <div class="container">
                <h2 class="reveal">The Stack</h2>
                <p class="reveal reveal-delay-1 text-muted mb-10">Tools and languages I use to bring ideas to life.</p>

                <div class="grid grid-2 gap-6">
                    <div class="terminal reveal reveal-delay-2">
                        <div class="terminal-header">
                            <span class="terminal-dot terminal-dot-red"></span>
                            <span class="terminal-dot terminal-dot-yellow"></span>
                            <span class="terminal-dot terminal-dot-green"></span>
                            <span class="terminal-title">bash</span>
                        </div>
                        <div class="terminal-body">
                            <div class="terminal-line">
                                <span class="terminal-prompt">pt@dev:~$</span>
                                <span class="terminal-output">cat stack.config</span>
                            </div>
                            <div class="terminal-line">
                                <span class="terminal-output" style="color: var(--c-accent-bright);">
                                    core: [ 'Go', 'Rust', 'C' ]<br>
                                    design: [ 'Photoshop', 'Cavalry' ]<br>
                                    other: [ 'Tal', 'Python', 'HTML5', 'CSS' ]
                                </span>
                            </div>
                            <div class="terminal-line">
                                <span class="terminal-prompt">pt@dev:~$</span>
                                <span class="terminal-output">status: <span style="color: var(--c-success);">active</span></span>
                                <span class="terminal-cursor"></span>
                            </div>
                        </div>
                    </div>

                    <div class="card card-elevated reveal reveal-delay-3">
                        <div class="card-header">
                            <span class="eyebrow">Environment</span>
                        </div>
                        <h4 class="card-title">Current Setup</h4>
                        <p class="text-small text-muted mb-6">
                            Working locally with a highly customized environment. Always relying on terminal-first workflows.
                        </p>
                        <div class="flex gap-2 flex-wrap">
                            <span class="tag">MacOS</span>
                            <span class="tag">VsCodium</span>
                            <span class="tag">Cutter</span>
                            <span class="tag">Run</span>
                            <span class="tag">Git</span>
                            <span class="tag">GitKraken</span>
                            <span class="tag">iTerm 2</span>
                            <span class="tag">Obsidian</span>
                            <span class="tag">Zen browser</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- WORK -->
        <section id="work" class="section">
            <div class="container">
                <h2 class="reveal">Selected Work</h2>
                <p class="reveal reveal-delay-3 text-muted mb-10">
                    A few projects I've built. Switch between tabs to inspect them.
                </p>

                <div class="card glass-strong reveal reveal-delay-2" style="padding: var(--space-6);">
                    <div class="tabs-radio">

                        <div class="tabs-nav" role="tablist" aria-label="Projects">
                            <a href="#work-panel-1" class="tab-link" role="tab" aria-controls="work-panel-1">Lc</a>
                            <a href="#work-panel-2" class="tab-link" role="tab" aria-controls="work-panel-2">Tap</a>
                            <a href="#work-panel-3" class="tab-link" role="tab" aria-controls="work-panel-3">Run + Tal</a>
                            <a href="#work-panel-4" class="tab-link" role="tab" aria-controls="work-panel-4">Tycl</a>
                            <a href="#work-panel-5" class="tab-link" role="tab" aria-controls="work-panel-5">Manage</a>
                        </div>

                        <!-- PANEL 1: Lc -->
                        <div class="tab-content" id="work-panel-1" role="tabpanel">
                            <div class="grid grid-2 gap-8 items-start">
                                <div>
                                    <span class="eyebrow">2026 - Framework</span>
                                    <h3 class="card-title" style="font-size: var(--font-size-2xl);">
                                        Lc - Language Creator &amp; Devkit
                                    </h3>
                                    <p class="text-muted text-small">
                                        Production-oriented toolkit for building language runtimes,
                                        compilers, interpreters and bytecode-driven processors.
                                        Ships with two engines (String &amp; Byte), a PEG parser with Pratt
                                        expressions, an event system, plugins, and a hot loop pushing
                                        120+ Mops/s on an i7-4770HQ. 12k+ lines of Go.
                                    </p>
                                    <div class="flex gap-2 flex-wrap mt-4">
                                        <span class="tag">Go</span>
                                        <span class="tag">Compilers</span>
                                        <span class="tag">Bytecode</span>
                                        <span class="tag">Plugins</span>
                                    </div>
                                </div>

                                <div class="card card-elevated" style="padding: var(--space-5);">
                                    <div class="flex-between mb-3">
                                        <span class="text-faint text-xs">STATUS</span>
                                        <span class="status-pill status-success">Stable</span>
                                    </div>
                                    <div class="flex-between mb-3">
                                        <span class="text-faint text-xs">ROLE</span>
                                        <span class="text-small">Author</span>
                                    </div>
                                    <div class="flex-between">
                                        <span class="text-faint text-xs">LICENSE</span>
                                        <span class="text-small">Apache 2.0</span>
                                    </div>
                                </div>
                            </div>

                            <div class="card-footer">
                                <span class="text-faint text-small">go · compiler toolkit</span>
                                <a href="https://github.com/pt-main/lc" class="btn-text">Explore project</a>
                            </div>
                        </div>

                        <!-- PANEL 2: Tap -->
                        <div class="tab-content" id="work-panel-2" role="tabpanel">
                            <div class="grid grid-2 gap-8 items-start">
                                <div>
                                    <span class="eyebrow">2026 - CLI Library</span>
                                    <h3 class="card-title" style="font-size: var(--font-size-2xl);">
                                        Tap - Terminal Argument Parsing
                                    </h3>
                                    <p class="text-muted text-small">
                                        A lightweight CLI library available for both Go and Rust.
                                        Commands, flags, subcommands, auto-generated help with alias
                                        grouping, and a rich colour system with short codes like
                                        <code>[?GN]</code> and <code>[?RT]</code>. The Rust version
                                        (tap-rs) ships with zero dependencies and a Console abstraction
                                        suitable for viewport-based rendering.
                                    </p>
                                    <div class="flex gap-2 flex-wrap mt-4">
                                        <span class="tag">Go</span>
                                        <span class="tag">Rust</span>
                                        <span class="tag">Zero deps</span>
                                        <span class="tag">Colours</span>
                                    </div>
                                </div>

                                <div class="card card-elevated" style="padding: var(--space-5);">
                                    <div class="flex-between mb-3">
                                        <span class="text-faint text-xs">STATUS</span>
                                        <span class="status-pill status-success">Stable</span>
                                    </div>
                                    <div class="flex-between mb-3">
                                        <span class="text-faint text-xs">ROLE</span>
                                        <span class="text-small">Author</span>
                                    </div>
                                    <div class="flex-between">
                                        <span class="text-faint text-xs">LICENSE</span>
                                        <span class="text-small">MIT</span>
                                    </div>
                                </div>
                            </div>

                            <div class="card-footer">
                                <span class="text-faint text-small">go + rust · cli toolkit</span>
                                <a href="https://github.com/pt-main/tap" class="btn-text">Explore project</a>
                            </div>
                        </div>

                        <!-- PANEL 3: Run + Tal -->
                        <div class="tab-content" id="work-panel-3" role="tabpanel">
                            <div class="grid grid-2 gap-8 items-start">
                                <div>
                                    <span class="eyebrow">2026 - Dev Tool</span>
                                    <h3 class="card-title" style="font-size: var(--font-size-2xl);">
                                        Run + Tal - Script &amp; Task Manager
                                    </h3>
                                    <p class="text-muted text-small">
                                        Run stores scripts in a global (<code>~/run/</code>) or local
                                        (<code>.run/</code>) storage, auto-generates Lua wrappers for
                                        Python, Bash, Batch, Lua or another languages, and supports distribution via
                                        GitHub URLs (<code>run -install</code>). Tal is an embedded
                                        incremental task runner: plain Lua with comment annotations,
                                        SHA256-based dependency tracking, and task-to-task calls.
                                    </p>
                                    <div class="flex gap-2 flex-wrap mt-4">
                                        <span class="tag">Go</span>
                                        <span class="tag">Lua</span>
                                        <span class="tag">Incremental</span>
                                        <span class="tag">Scripts</span>
                                    </div>
                                </div>

                                <div class="card card-elevated" style="padding: var(--space-5);">
                                    <div class="flex-between mb-3">
                                        <span class="text-faint text-xs">STATUS</span>
                                        <span class="status-pill status-success">Stable</span>
                                    </div>
                                    <div class="flex-between mb-3">
                                        <span class="text-faint text-xs">ROLE</span>
                                        <span class="text-small">Author</span>
                                    </div>
                                    <div class="flex-between">
                                        <span class="text-faint text-xs">LICENSE</span>
                                        <span class="text-small">Apache 2.0</span>
                                    </div>
                                </div>
                            </div>

                            <div class="card-footer">
                                <span class="text-faint text-small">go + lua · script runtime</span>
                                <a href="https://github.com/pt-main/run" class="btn-text">Explore project</a>
                            </div>
                        </div>

                        <!-- PANEL 4: Tycl -->
                        <div class="tab-content" id="work-panel-4" role="tabpanel">
                            <div class="grid grid-2 gap-8 items-start">
                                <div>
                                    <span class="eyebrow">2026 - Config Language</span>
                                    <h3 class="card-title" style="font-size: var(--font-size-2xl);">
                                        Tycl - Typed Config Language
                                    </h3>
                                    <p class="text-muted text-small">
                                        A typed configuration language for Go. Strong typing without
                                        code generation, contracts (strict / flexible / dynamic),
                                        null-values with explicit type, arrays of primitives and
                                        objects, and actions like <code>env()</code>, <code>file()</code>,
                                        <code>get()</code>. Comes with a CLI for validation, formatting,
                                        direct file editing, and generation to JSON, YAML, TOML.
                                    </p>
                                    <div class="flex gap-2 flex-wrap mt-4">
                                        <span class="tag">Go</span>
                                        <span class="tag">Config</span>
                                        <span class="tag">Contracts</span>
                                        <span class="tag">Codegen</span>
                                    </div>
                                </div>

                                <div class="card card-elevated" style="padding: var(--space-5);">
                                    <div class="flex-between mb-3">
                                        <span class="text-faint text-xs">STATUS</span>
                                        <span class="status-pill status-success">Stable</span>
                                    </div>
                                    <div class="flex-between mb-3">
                                        <span class="text-faint text-xs">ROLE</span>
                                        <span class="text-small">Author</span>
                                    </div>
                                    <div class="flex-between">
                                        <span class="text-faint text-xs">LICENSE</span>
                                        <span class="text-small">Apache 2.0</span>
                                    </div>
                                </div>
                            </div>

                            <div class="card-footer">
                                <span class="text-faint text-small">go · typed configs</span>
                                <a href="https://github.com/pt-main/tycl" class="btn-text">Explore project</a>
                            </div>
                        </div>

                        <!-- PANEL 5: Manage -->
                        <div class="tab-content" id="work-panel-5" role="tabpanel">
                            <div class="grid grid-2 gap-8 items-start">
                                <div>
                                    <span class="eyebrow">2026 - Productivity</span>
                                    <h3 class="card-title" style="font-size: var(--font-size-2xl);">
                                        Manage - CLI Task Manager
                                    </h3>
                                    <p class="text-muted text-small">
                                        A terminal task manager built around themes, tasks and tables.
                                        Each theme carries a priority and tags; each task has an ID,
                                        description and creation timestamp. Named tables group themes
                                        into schedules. Filtering by priority, tags, state (todo / done)
                                        with AND / OR logic. Config is stored in Tycl under a strict
                                        contract.
                                    </p>
                                    <div class="flex gap-2 flex-wrap mt-4">
                                        <span class="tag">Go</span>
                                        <span class="tag">CLI</span>
                                        <span class="tag">Tycl</span>
                                        <span class="tag">Tasks</span>
                                    </div>
                                </div>

                                <div class="card card-elevated" style="padding: var(--space-5);">
                                    <div class="flex-between mb-3">
                                        <span class="text-faint text-xs">STATUS</span>
                                        <span class="status-pill status-success">Stable</span>
                                    </div>
                                    <div class="flex-between mb-3">
                                        <span class="text-faint text-xs">ROLE</span>
                                        <span class="text-small">Author</span>
                                    </div>
                                    <div class="flex-between">
                                        <span class="text-faint text-xs">LICENSE</span>
                                        <span class="text-small">MIT</span>
                                    </div>
                                </div>
                            </div>

                            <div class="card-footer">
                                <span class="text-faint text-small">go · productivity</span>
                                <a href="https://github.com/pt-main/manage" class="btn-text">Explore project</a>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </section>
    </main>

    <!-- FOOTER -->
    <footer id="contact">
        <h3 class="mb-10 flex-center">Contact</h3>
        <div class="container">
            <div class="footer-grid">
                <div class="footer-col">
                    <h5>Navigate</h5>
                    <ul>
                        <li><a href="#about">About</a></li>
                        <li><a href="#work">Projects</a></li>
                        <li><a href="#stack">Stack</a></li>
                    </ul>
                </div>
                <div class="footer-col">
                    <h5>Connect</h5>
                    <ul>
                        <li><a href="#modal-email">Email</a></li>
                        <li><a href="https://github.com/pt-main/">Github</a></li>
                    </ul>
                </div>
                <div class="footer-col">
                    <h5>Products</h5>
                    <ul>
                        <li><a href="https://github.com/pt-main/tap">Tap</a></li>
                        <li><a href="https://github.com/pt-main/lc">Lc</a></li>
                        <li><a href="https://github.com/pt-main/run">Run</a></li>
                        <li><a href="https://github.com/pt-main/tycl">Tycl</a></li>
                        <li><a href="https://github.com/pt-main/manage">Manage</a></li>
                        <li><a href="https://github.com/pt-main/nets">Nets</a></li>
                    </ul>
                </div>
            </div>

            <div class="footer-bottom">
                <span class="footer-copy">© 2026 PT. All rights reserved.</span>
                <span class="footer-copy">INT (TM) member.</span>
                <span class="text-faint text-small">v1.0.0</span>
            </div>
        </div>
    </footer>

    <!-- MODAL -->
    <div id="modal-email" class="modal-overlay-css" role="dialog" aria-modal="true" aria-label="Contact email">
        <a href="#contact" class="modal-backdrop" data-modal-close aria-label="Close"></a>
        <div class="modal">
            <div class="modal-header">
                <h3 class="modal-title">My email</h3>
            </div>
            <div class="modal-body">
                <pre class="email-pre">pt.main.acc@gmail.com</pre>
            </div>
            <div class="modal-footer">
                <a href="#contact" class="btn btn-ghost" data-modal-close>OK</a>
            </div>
        </div>
    </div>
    <script src="assets/index.js"></script>
</body>
</html>
```

---

# pages/terminal.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="pt-terminal - interactive shell for the pt portfolio.">
    <meta name="theme-color" content="#0a0705">
    <meta name="color-scheme" content="dark">

    <link rel="icon" type="image/png" href="../assets/icon-term.png">
    <link rel="apple-touch-icon" href="../assets/icon-term-high.png">

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">

    <title>pt@terminal$</title>
    <link rel="stylesheet" href="../assets/pt.css">
    <link rel="stylesheet" href="../assets/pt-terminal.css">
    <script>document.documentElement.classList.add('js');</script>
</head>
<body class="term-page">

    <a href="#term" class="skip-link">Skip to terminal</a>

    <main class="term-main">
        <div class="term" id="term" data-theme="coral" role="application" aria-label="Interactive terminal">
            <div class="terminal-header">
                <span class="terminal-dot terminal-dot-red"></span>
                <span class="terminal-dot terminal-dot-yellow"></span>
                <span class="terminal-dot terminal-dot-green"></span>
                <span class="terminal-title">pt@dev: ~ - bash - 80x24</span>
                <a href="../index.html" class="term-close" aria-label="Back to main site">×</a>
            </div>

            <div class="term-body" id="termBody" tabindex="-1">
                <div class="term-output" id="termOutput"></div>
            </div>

            <div class="term-input-line" id="termInputLine">
                <span class="term-prompt" id="termPrompt">pt@dev:~$</span>
                <input
                    type="text"
                    class="term-input"
                    id="termInput"
                    autocomplete="off"
                    autocorrect="off"
                    autocapitalize="off"
                    spellcheck="false"
                    aria-label="Terminal input"
                    aria-autocomplete="list"
                >
            </div>
        </div>
    </main>

    <script src="../assets/terminal.js"></script>
</body>
</html>
```

---

