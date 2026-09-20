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
            `<span class="term-prompt">${esc(currentPrompt())}</span> ` +
            `<span class="term-cmd-text">${esc(cmd)}</span>`,
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
            print(`pt: unknown theme: ${id}`, 'term-err');
            print('Available: ' + THEME_IDS.join(', '), 'term-dim');
            return false;
        }
        term.setAttribute('data-theme', theme.id);
        term.classList.remove('term--flash');
        void term.offsetWidth;
        term.classList.add('term--flash');
        setTimeout(() => term.classList.remove('term--flash'), 600);
        try { localStorage.setItem(THEME_KEY, theme.id); } catch (e) {}
        if (!silent) print(`Theme → ${theme.label}`, 'term-success');
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

            print(`Available commands - ${head}`, 'term-head');
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
                    `<span class="term-cmd-name">${esc(pad(cmd, 32))}</span>` +
                    `<span class="term-out-dim">${esc(desc)}</span>`
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
                    `<span class="term-dim">${esc(pad(String(i + 1), 5))}</span>` +
                    `<span class="term-out">${esc(c)}</span>`
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
                        `<span class="term-accent">${mark}</span> ` +
                        `<span class="term-cmd-name">${esc(pad(t.id, 10))}</span>` +
                        `<span class="term-out-dim">${esc(t.desc)}</span>`
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
                `pt - Creative Developer · ${VERSION}`
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
                    `  <span class="term-accent">${esc(pad(key, 8))}</span>` +
                    `<span class="term-out">${esc(pad(p.type, 18))}</span>` +
                    `<span class="term-dim">${esc(pad(p.lang, 12))}</span>`
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
                print(`pt: project not found: ${key}`, 'term-err');
                print('Available: ' + PROJECT_NAMES.join(', '), 'term-dim');
                return;
            }
            print(p.name, 'term-head');
            print('-'.repeat(Math.min(60, p.name.length)), 'term-dim');
            blank();
            const row = (k, v) =>
                printHTML(`<span class="term-key">${esc(pad(k, 10))}</span> <span class="term-out">${esc(v)}</span>`);
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
                const blob = `${p.name} ${p.type} ${p.lang} ${p.license} ${p.desc}`;
                if (test(blob)) hits.push({ where: 'project', what: key, hint: p.name });
            }

            // Links
            for (const l of LINKS) {
                if (test(l.key) || test(l.value)) hits.push({ where: 'links', what: l.key });
            }

            if (!hits.length) {
                print(`search: no matches for "${q}"`, 'term-dim');
                return;
            }

            print(`Matches for "${q}"`, 'term-head');
            blank();
            hits.forEach(h => {
                const hint = h.hint ? `  <span class="term-out-dim">${esc(h.hint)}</span>` : '';
                printHTML(
                    `<span class="term-key">${esc(pad(h.where, 10))}</span>` +
                    `<span class="term-accent">${esc(h.what)}</span>${hint}`
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
        return `${m}:${s}`;
    }

    const shellCommands = {

        calc(args) {
            const expr = args.join(' ').trim();
            if (!expr) { print('Usage: calc <expression>', 'term-err'); print('Example: calc (2+3)*4', 'term-dim'); return; }
            try {
                const result = safeCalc(expr);
                print(`${expr} = ${result}`, 'term-success');
            } catch (e) {
                print(`calc: ${e.message}`, 'term-err');
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
                print(`ts: invalid input: ${input}`, 'term-err');
                return;
            }
            printHTML(`<span class="term-key">unix:</span>  <span class="term-out">${Math.floor(date.getTime() / 1000)}</span>`);
            printHTML(`<span class="term-key">ms:</span>    <span class="term-out">${date.getTime()}</span>`);
            printHTML(`<span class="term-key">iso:</span>   <span class="term-out">${date.toISOString()}</span>`);
            printHTML(`<span class="term-key">local:</span> <span class="term-out">${date.toString()}</span>`);
            printHTML(`<span class="term-key">utc:</span>   <span class="term-out">${date.toUTCString()}</span>`);
        },

        color(args) {
            const s = args.join(' ').trim();
            if (!s) { print('Usage: color <hex | rgb | r,g,b>', 'term-err'); print('Example: color #ff5e3a', 'term-dim'); return; }
            const rgb = parseColor(s);
            if (!rgb) { print(`color: unable to parse: ${s}`, 'term-err'); return; }
            const hex = rgbToHex(rgb);
            const hsl = rgbToHsl(rgb);
            printHTML(`<span class="term-key">HEX:</span>  <span class="term-out">${esc(hex)}</span>`);
            printHTML(`<span class="term-key">RGB:</span>  <span class="term-out">rgb(${rgb.r}, ${rgb.g}, ${rgb.b})</span>`);
            printHTML(`<span class="term-key">HSL:</span>  <span class="term-out">hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)</span>`);
            printHTML(
                `<span class="term-key">prev:</span> ` +
                `<span style="display:inline-block;width:60px;height:14px;background:${esc(hex)};border:1px solid rgba(255,255,255,0.2);vertical-align:middle"></span>`
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
                print(`${hex.slice(0,4).join('')}-${hex.slice(4,6).join('')}-${hex.slice(6,8).join('')}-${hex.slice(8,10).join('')}-${hex.slice(10,16).join('')}`);
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
                print(`hash: unknown algo: ${algo}`, 'term-err');
                return;
            }
            const buf = await crypto.subtle.digest(wcAlgo, new TextEncoder().encode(text));
            const hex = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
            printHTML(`<span class="term-key">${esc(algo)}:</span> <span class="term-out">${esc(hex)}</span>`);
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
                print(`b64: ${e.message}`, 'term-err');
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
                print(`url: ${e.message}`, 'term-err');
            }
        },

        json(args) {
            const text = args.join(' ');
            if (!text) { print('Usage: json <json-text>', 'term-err'); return; }
            try {
                const obj = JSON.parse(text);
                print(JSON.stringify(obj, null, 2), 'term-out');
            } catch (e) {
                print(`json: ${e.message}`, 'term-err');
            }
        },

        ua() {
            const ua = navigator.userAgent;
            printHTML(`<span class="term-key">raw:</span>   <span class="term-out">${esc(ua)}</span>`);
            const lang = navigator.language || '-';
            const platform = navigator.platform || '-';
            printHTML(`<span class="term-key">lang:</span>  <span class="term-out">${esc(lang)}</span>`);
            printHTML(`<span class="term-key">platf:</span> <span class="term-out">${esc(platform)}</span>`);
        },

        screen() {
            const dpr = window.devicePixelRatio || 1;
            printHTML(`<span class="term-key">viewport:</span> <span class="term-out">${window.innerWidth} × ${window.innerHeight}</span>`);
            printHTML(`<span class="term-key">screen:</span>   <span class="term-out">${window.screen.width} × ${window.screen.height}</span>`);
            printHTML(`<span class="term-key">dpr:</span>      <span class="term-out">${dpr}</span>`);
            printHTML(`<span class="term-key">color:</span>    <span class="term-out">${window.screen.colorDepth}-bit</span>`);
            printHTML(`<span class="term-key">touch:</span>    <span class="term-out">${('ontouchstart' in window) ? 'yes' : 'no'}</span>`);
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
                        `<span class="term-dim">${esc(pad(String(i + 1), 4))}</span>` +
                        `<span class="term-out">${esc(n)}</span>`
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
            print(`added (${notes.length} total)`, 'term-success');
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
                print(`added #${id}`, 'term-success');
                return;
            }
            if (sub === 'list') {
                if (!todos.length) { print('(no todos)', 'term-dim'); return; }
                todos.forEach(t => {
                    const mark = t.done ? '[x]' : '[ ]';
                    const cls  = t.done ? 'term-dim' : 'term-out';
                    printHTML(
                        `<span class="term-accent">${esc(mark)}</span> ` +
                        `<span class="term-dim">#${esc(pad(String(t.id), 3))}</span> ` +
                        `<span class="${cls}">${esc(t.text)}</span>`
                    );
                });
                return;
            }
            if (sub === 'done') {
                const id = parseInt(args[1], 10);
                const t  = todos.find(x => x.id === id);
                if (!t) { print(`todo: #${args[1]} not found`, 'term-err'); return; }
                t.done = true;
                setTodos(todos);
                print(`done #${id}`, 'term-success');
                return;
            }
            if (sub === 'rm') {
                const id  = parseInt(args[1], 10);
                const idx = todos.findIndex(x => x.id === id);
                if (idx < 0) { print(`todo: #${args[1]} not found`, 'term-err'); return; }
                todos.splice(idx, 1);
                setTodos(todos);
                print(`removed #${id}`, 'term-success');
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
                print(`pomodoro started: ${mins}:00`, 'term-success');
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
                printHTML(`<span class="term-key">remaining:</span> <span class="term-accent">${esc(fmtTime(left))}</span>`);
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
                        `<span class="term-cmd-name">${esc(pad(k, 10))}</span>` +
                        `<span class="term-out-dim">${esc(aliases[k])}</span>`
                    );
                });
                return;
            }
            const aliases = loadAliases();
            aliases[m[1]] = m[2].trim();
            saveAliases(aliases);
            print(`alias ${m[1]} = ${m[2].trim()}`, 'term-success');
        },

        unalias(args) {
            const name = args[0];
            if (!name) { print('Usage: unalias <name>', 'term-err'); return; }
            const aliases = loadAliases();
            if (!aliases[name]) { print(`unalias: ${name} not found`, 'term-err'); return; }
            delete aliases[name];
            saveAliases(aliases);
            print(`removed alias ${name}`, 'term-success');
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
            print(`pt: command not found: ${cmd}`, 'term-err');
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
        { t: `[  OK  ] Initializing pt-terminal ${VERSION}`, c: 'term-boot-ok' },
        { t: '[  OK  ] Loading kernel modules',              c: 'term-boot-ok' },
        { t: '[  OK  ] Mounting virtual filesystem',         c: 'term-boot-ok' },
        { t: '[  OK  ] Establishing secure connection',      c: 'term-boot-ok' },
        { t: '',                                              c: '' },
        { t: `Welcome to pt-terminal ${VERSION}`,             c: 'term-welcome' },
        { t: '',                                              c: '' }
    ];

    function showBootMenu() {
        print('Two shells available:', 'term-head');
        blank();
        printHTML(
            `<span class="term-cmd-name">${esc(pad('me', 10))}</span>` +
            `<span class="term-out-dim">portfolio shell - about, projects, contact</span>`
        );
        printHTML(
            `<span class="term-cmd-name">${esc(pad('shell', 10))}</span>` +
            `<span class="term-out-dim">tools shell - calc, hash, uuid, ip, ...</span>`
        );
        blank();
        print("Type 'help' for all commands.", 'term-dim');
        blank();
        printHTML(
            `<span class="term-key">theme:</span> ` +
            `<span class="term-out-dim">try 'theme random'</span>`
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