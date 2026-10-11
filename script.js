(() => {
    const canvas = document.getElementById('pixel-bg');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const colors = ['#ff4f8b', '#3de0ff', '#ffd23f', '#8b6cff'];
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

    let w, h, size, cols, rows, cells;

    function resize() {
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
            // Sem animação: pinta alguns pixels fixos e desenha uma vez
            cells.forEach(cell => {
                if (Math.random() < 0.06) light(cell, 0.5);
            });
            draw(false);
        }
    }

    function light(cell, alpha) {
        cell.a = Math.max(cell.a, alpha);
        cell.c = colors[(Math.random() * colors.length) | 0];
    }

    function draw(decay = true) {
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
    }

    function pointerLight(clientX, clientY) {
        const rect = canvas.getBoundingClientRect();
        const cx = Math.floor((clientX - rect.left) / size);
        const cy = Math.floor((clientY - rect.top) / size);
        const r = 2;
        for (let dy = -r; dy <= r; dy++) {
            for (let dx = -r; dx <= r; dx++) {
                const x = cx + dx;
                const y = cy + dy;
                if (x < 0 || y < 0 || x >= cols || y >= rows) continue;
                const dist = Math.hypot(dx, dy);
                if (dist > r + 0.3) continue;
                if (Math.random() < 0.7) light(cells[y * cols + x], 1 - dist / (r + 1));
            }
        }
    }

    function loop() {
        // Pixels acendendo sozinhos, para a tela ter vida mesmo sem mouse (e no celular)
        if (Math.random() < 0.25) light(cells[(Math.random() * cells.length) | 0], 0.6);
        draw();
        requestAnimationFrame(loop);
    }

    window.addEventListener('resize', resize);
    resize();

    if (!reduce) {
        window.addEventListener('pointermove', e => pointerLight(e.clientX, e.clientY));
        window.addEventListener('pointerdown', e => {
            for (let i = 0; i < 6; i++) pointerLight(e.clientX, e.clientY);
        });
        requestAnimationFrame(loop);
    }

    // Atalho: Enter começa o jogo
    window.addEventListener('keydown', e => {
        if (e.key === 'Enter' && !e.target.closest('a, button, input, textarea')) {
            window.location.href = 'jogar.html';
        }
    });
})();