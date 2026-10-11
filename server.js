(() => {
    /* ---------- Fundo de pixels ---------- */
    const canvas = document.getElementById('pixel-bg');
    const colors = ['#ff4f8b', '#3de0ff', '#ffd23f', '#8b6cff'];
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (canvas) {
        const ctx = canvas.getContext('2d');
        let w, h, size, cols, rows, cells;

        const light = (cell, a) => {
            cell.a = Math.max(cell.a, a);
            cell.c = colors[(Math.random() * colors.length) | 0];
        };

        const draw = (decay = true) => {
            ctx.clearRect(0, 0, w, h);
            for (let i = 0; i < cells.length; i++) {
                const cell = cells[i];
                const x = (i % cols) * size;
                const y = ((i / cols) | 0) * size;
                ctx.fillStyle = 'rgba(255,255,255,0.035)';
                ctx.fillRect(x + 1, y + 1, size - 2, size - 2);
                if (cell.a > 0.01) {
                    ctx.globalAlpha = cell.a;
                    ctx.fillStyle = cell.c;
                    ctx.fillRect(x + 2, y + 2, size - 4, size - 4);
                    ctx.globalAlpha = 1;
                    if (decay) cell.a *= 0.93;
                }
            }
        };

        const resize = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            w = canvas.clientWidth;
            h = canvas.clientHeight;
            canvas.width = w * dpr;
            canvas.height = h * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            size = w < 600 ? 24 : 36;
            cols = Math.ceil(w / size);
            rows = Math.ceil(h / size);
            cells = Array.from({ length: cols * rows }, () => ({ a: 0, c: colors[0] }));
            if (reduce) {
                cells.forEach(c => { if (Math.random() < 0.06) light(c, 0.5); });
                draw(false);
            }
        };

        const pointerLight = (px, py) => {
            const rect = canvas.getBoundingClientRect();
            const cx = Math.floor((px - rect.left) / size);
            const cy = Math.floor((py - rect.top) / size);
            const r = 2;
            for (let dy = -r; dy <= r; dy++) {
                for (let dx = -r; dx <= r; dx++) {
                    const x = cx + dx, y = cy + dy;
                    if (x < 0 || y < 0 || x >= cols || y >= rows) continue;
                    const dist = Math.hypot(dx, dy);
                    if (dist > r + 0.3) continue;
                    if (Math.random() < 0.7) light(cells[y * cols + x], 1 - dist / (r + 1));
                }
            }
        };

        window.addEventListener('resize', resize);
        resize();

        if (!reduce) {
            window.addEventListener('pointermove', e => pointerLight(e.clientX, e.clientY));
            window.addEventListener('pointerdown', e => {
                for (let i = 0; i < 6; i++) pointerLight(e.clientX, e.clientY);
            });
            const loop = () => {
                if (Math.random() < 0.25) light(cells[(Math.random() * cells.length) | 0], 0.6);
                draw();
                requestAnimationFrame(loop);
            };
            requestAnimationFrame(loop);
        }
    }

    /* ---------- Teclado: 1, 2, 3 abrem o jogo; setas movem a seleção ---------- */
    const cards = Array.from(document.querySelectorAll('.card'));
    if (!cards.length) return;

    window.addEventListener('keydown', e => {
        if (e.ctrlKey || e.metaKey || e.altKey) return;

        const n = parseInt(e.key, 10);
        if (n >= 1 && n <= cards.length) {
            window.location.href = cards[n - 1].getAttribute('href');
            return;
        }

        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
            e.preventDefault();
            const i = cards.indexOf(document.activeElement);
            const step = e.key === 'ArrowRight' ? 1 : -1;
            const next = i === -1 ? 0 : (i + step + cards.length) % cards.length;
            cards[next].focus();
        }
    });
})();