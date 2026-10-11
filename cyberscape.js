// CYBERSCAPE: a lacuna é preenchida dentro do código e o resultado é EXECUTADO e testado num Worker.
// Qualquer resposta que funcione é aceita (ex.: 1+2 no lugar de 3).

const $ = id => document.getElementById(id);

/* ---------- Missões ---------- */
const NIVEIS = [
    { nome: "Strings", arq: "string_concat.js", conceito: "Aprenda a unir textos (strings) usando o operador += para formar novas palavras.", desc: "Complete o código para formar a palavra 'JavaScript'.",
      codigo: 'let linguagem = "Java";\n\nlinguagem += ________;', teste: 'linguagem === "JavaScript"',
      dica: 'Use uma string com aspas: o que falta depois de "Java"?', resposta: '"Script"' },
    { nome: "Variáveis", arq: "variable_math.js", conceito: "Variáveis guardam valores que podem ser atualizados somando novos números.", desc: "Aumente a quantidade de acessos de 5 para 8.",
      codigo: "let acessos = 5;\n\nacessos = acessos + ________;", teste: "acessos === 8",
      dica: "Quanto você precisa somar a 5 para chegar a 8? (8 - 5)", resposta: "3" },
    { nome: "Arrays", arq: "array_index.js", conceito: "Arrays são listas ordenadas. A contagem dos itens começa no índice ZERO!", desc: 'Acesse a porta HTTPS "443", que é o segundo item da lista.',
      codigo: 'let portas = ["80", "443", "8080"];\n\nlet portaSegura = portas[________];', teste: 'portaSegura === "443"',
      dica: 'O 1º item ("80") é o índice 0. Qual é o índice do 2º?', resposta: "1" },
    { nome: "Condições", arq: "if_condition.js", conceito: "O 'if' toma decisões verificando se algo é verdadeiro.", desc: "Compare a variável 'senha' com 'cyber2026' usando igualdade estrita.",
      codigo: 'let senha = "cyber2026";\n\nif (senha ________ "cyber2026") {\n  console.log("Acesso Concedido");\n}', teste: '__logs.includes("Acesso Concedido")', padrao: /^={2,3}$/,
      dica: "A igualdade estrita em JavaScript usa três sinais de igual juntos.", resposta: "===" },
    { nome: "Laços", arq: "loop_counter.js", conceito: "O laço 'for' repete comandos. O i++ aumenta o contador a cada volta.", desc: "Faça o loop rodar exatamente 3 vezes (de 0 até menor que 3).",
      codigo: "let tentativas = 0;\n\nfor (let i = 0; i < ________; i++) {\n  tentativas++;\n}", teste: "tentativas === 3",
      dica: "Começando do zero, qual limite faz o laço rodar 3 vezes?", resposta: "3" },
    { nome: "Funções", arq: "function_return.js", conceito: "Funções usam 'return' para devolver o resultado de volta.", desc: "Faça a função devolver o 'hash' em letras maiúsculas.",
      codigo: "function decodificar(hash) {\n  ________ hash.toUpperCase();\n}", teste: 'decodificar("abc") === "ABC"', padrao: /^return$/,
      dica: "Qual palavra envia um valor para fora da função? Começa com R.", resposta: "return" },
    { nome: "Métodos", arq: "array_push.js", conceito: "O método .push() adiciona itens ao final de um array.", desc: "Adicione o IP '192.168.1.1' às regras do firewall.",
      codigo: 'let firewall = ["10.0.0.1"];\n\nfirewall.________("192.168.1.1");', teste: 'firewall.length === 2 && firewall[1] === "192.168.1.1"', padrao: /^push$/,
      dica: 'Use o método que "empurra" um item para o final da lista.', resposta: "push" },
    { nome: "Lógica", arq: "logical_and.js", conceito: "O operador && (E) exige que as DUAS condições sejam verdadeiras.", desc: "Verifique se o usuário é admin E também tem o token.",
      codigo: 'let admin = true;\nlet temToken = true;\n\nif (admin ________ temToken) {\n  console.log("Super Acesso Liberto!");\n}', teste: '__logs.includes("Super Acesso Liberto!")', padrao: /^&&$/,
      dica: "O E lógico é formado por dois & colados.", resposta: "&&" }
];

const RANKS = [[0, "Script Kiddie"], [100, "Netrunner"], [200, "Cyber Ghost"], [350, "Arquiteto Cyber"]];
const LOJA = [
    { id: "mult", icone: "⚡", nome: "Chip Multiplicador 2x", preco: 50, desc: "Dobra os créditos ganhos nas missões." },
    { id: "dica", icone: "👁️", nome: "Decodificador de IA", preco: 40, desc: "Dicas ficam grátis." }
];
const MANUAL = [
    ["Concatenar strings", "O += junta um texto a uma variável.", 'let a = "Java";\na += "Script";'],
    ["Variáveis e contas", "Some números com +.", "let n = 5;\nn = n + 3; // 8"],
    ["Arrays e índices", "A contagem começa no 0.", 'let l = ["a", "b"];\nl[1]; // "b"'],
    ["Métodos de array", ".push() adiciona ao final.", 'let l = ["A"];\nl.push("B");']
];

/* ---------- Áudio ---------- */
const audio = {
    ctx: null, on: true,
    tom(notas, tipo, vol, dur) {
        if (!this.on) return;
        this.ctx = this.ctx || new (window.AudioContext || window.webkitAudioContext)();
        notas.forEach((f, i) => {
            const t = this.ctx.currentTime + i * 0.07, o = this.ctx.createOscillator(), g = this.ctx.createGain();
            o.type = tipo; o.frequency.setValueAtTime(f, t);
            g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
            o.connect(g); g.connect(this.ctx.destination); o.start(t); o.stop(t + dur);
        });
    },
    click() { this.tom([700, 350], "sine", 0.04, 0.05); },
    ok() { this.tom([523, 659, 784, 1047], "triangle", 0.08, 0.2); },
    erro() { this.tom([140, 70], "sawtooth", 0.1, 0.25); }
};

/* ---------- Fundo animado ---------- */
(() => {
    const c = $("fundo"), x = c.getContext("2d"), P = [];
    let w, h;
    const rs = () => { w = c.width = innerWidth; h = c.height = innerHeight; };
    addEventListener("resize", rs); rs();
    for (let i = 0; i < 45; i++) P.push({ x: Math.random() * w, y: Math.random() * h, vx: Math.random() - 0.5, vy: Math.random() - 0.5, c: Math.random() > 0.5 ? "#a855f7" : "#3de0ff" });
    const quadro = () => {
        x.clearRect(0, 0, w, h);
        x.strokeStyle = "rgba(76,42,154,.18)";
        for (let i = 0; i < w; i += 40) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, h); x.stroke(); }
        for (let i = 0; i < h; i += 40) { x.beginPath(); x.moveTo(0, i); x.lineTo(w, i); x.stroke(); }
        P.forEach((p, i) => {
            p.x += p.vx * 0.5; p.y += p.vy * 0.5;
            if (p.x < 0 || p.x > w) p.vx *= -1;
            if (p.y < 0 || p.y > h) p.vy *= -1;
            x.fillStyle = p.c; x.fillRect(p.x, p.y, 3, 3);
            for (let j = i + 1; j < P.length; j++) {
                const d = Math.hypot(p.x - P[j].x, p.y - P[j].y);
                if (d < 100) { x.strokeStyle = `rgba(168,85,247,${0.25 * (1 - d / 100)})`; x.beginPath(); x.moveTo(p.x, p.y); x.lineTo(P[j].x, P[j].y); x.stroke(); }
            }
        });
    };
    quadro();
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches) (function loop() { quadro(); requestAnimationFrame(loop); })();
})();

/* ---------- Worker: executa o código do jogador e roda o teste ---------- */
function corpoWorker() {
    onmessage = e => {
        const __logs = [];
        const fmt = a => a.map(v => typeof v === "string" ? v : JSON.stringify(v)).join(" ");
        const fake = { log: (...a) => __logs.push(fmt(a)) };
        try {
            const r = new Function("console", "__logs", e.data.codigo + "\nreturn (" + e.data.teste + ");")(fake, __logs);
            postMessage({ ok: !!r, logs: __logs });
        } catch (err) { postMessage({ ok: false, logs: __logs, erro: String(err) }); }
    };
}

function rodar(codigo, teste) {
    return new Promise(res => {
        try {
            const url = URL.createObjectURL(new Blob(["(" + corpoWorker + ")()"], { type: "text/javascript" }));
            const w = new Worker(url);
            const fim = r => { clearTimeout(t); w.terminate(); URL.revokeObjectURL(url); res(r); };
            const t = setTimeout(() => fim({ ok: false, logs: [], erro: "Tempo esgotado (loop infinito?)" }), 1500);
            w.onmessage = e => fim(e.data);
            w.onerror = () => fim({ ok: false, logs: [], erro: "Não consegui rodar o código. Tente usar o Live Server." });
            w.postMessage({ codigo, teste });
        } catch (e) { res({ ok: false, logs: [], erro: "Seu navegador bloqueou a execução. Tente usar o Live Server." }); }
    });
}

/* ---------- Estado ---------- */
const PADRAO = { xp: 0, cred: 20, streak: 0, feitas: [], loja: [], atual: 0 };
let S = { ...PADRAO };
try { Object.assign(S, JSON.parse(localStorage.getItem("cyberscape") || "{}")); } catch (e) {}
const salvar = () => { try { localStorage.setItem("cyberscape", JSON.stringify(S)); } catch (e) {} };
let falhas = 0, dicas = 0, usouResp = false, ocupado = false;
const liberada = i => i === 0 || S.feitas.includes(i - 1);

/* ---------- Interface ---------- */
function hud() {
    let i = RANKS.length - 1;
    while (S.xp < RANKS[i][0]) i--;
    const prox = RANKS[i + 1];
    $("rank").textContent = RANKS[i][1];
    $("xp-txt").textContent = prox ? `${S.xp}/${prox[0]}` : `${S.xp} MAX`;
    $("xp-barra").style.width = (prox ? (S.xp - RANKS[i][0]) / (prox[0] - RANKS[i][0]) * 100 : 100) + "%";
    $("cred").textContent = S.cred;
    $("streak").textContent = S.streak + "x";
    $("rede").innerHTML = NIVEIS.map((n, k) =>
        (k ? `<span class="fio ${S.feitas.includes(k - 1) ? "ok" : ""}"></span>` : "") +
        `<button class="no ${S.feitas.includes(k) ? "feita" : ""} ${k === S.atual ? "atual" : ""}" data-m="${k}" title="${n.nome}" ${liberada(k) ? "" : "disabled"}>${liberada(k) ? (S.feitas.includes(k) ? "✓" : k + 1) : "🔒"}</button>`
    ).join("");
}

function realce(t) {
    const e = t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    return e.replace(/("[^"]*")|\b(let|const|function|if|for|return)\b|\b(\d+)\b|(console\.log)/g,
        (m, s, k, n, f) => `<span class="${s ? "s" : k ? "k" : n ? "n" : "f"}">${m}</span>`);
}

function carregar(i) {
    S.atual = i; salvar();
    falhas = 0; dicas = 0; usouResp = false;
    const L = NIVEIS[i], [a, b] = L.codigo.split("________");
    $("badge").textContent = `MISSÃO ${String(i + 1).padStart(2, "0")}/${NIVEIS.length}`;
    $("titulo").textContent = L.nome.toUpperCase();
    $("desc").textContent = L.desc;
    $("conceito").textContent = L.conceito;
    $("arq").textContent = L.arq;
    $("codigo").innerHTML = realce(a) + '<input id="lacuna" class="lacuna" autocomplete="off" spellcheck="false" aria-label="Complete o código">' + realce(b);
    const inp = $("lacuna");
    inp.oninput = () => { inp.style.width = Math.max(8, inp.value.length + 1) + "ch"; };
    inp.onkeydown = e => { if (e.key === "Enter") executar(); };
    inp.focus();
    $("mensagem").textContent = ""; $("mensagem").className = "mensagem";
    $("hint-box").hidden = true;
    pips(); hud();
    log(`Nó carregado: [${L.arq}]`);
}

function pips() { document.querySelectorAll(".alerta i").forEach((p, k) => p.classList.toggle("on", falhas > k)); }
function msg(t, c = "") { $("mensagem").className = "mensagem " + c; $("mensagem").textContent = t; }
function log(t, tipo = "") {
    const d = document.createElement("div");
    d.className = tipo; d.textContent = "> " + t;
    $("log").append(d); $("log").scrollTop = $("log").scrollHeight;
}
function dica(html) { $("hint-box").innerHTML = html; $("hint-box").hidden = false; }

/* ---------- Jogo ---------- */
async function executar() {
    if (ocupado) return;
    audio.click();
    const L = NIVEIS[S.atual], v = $("lacuna").value.trim();
    if (!v) { msg("⚠️ Preencha a lacuna antes de executar!", "erro"); return; }
    ocupado = true; $("b-exec").disabled = true;
    msg("⚡ Executando...", "rodando");
    log(`Executando ${L.arq} com: ${v}`);
    const r = await rodar(L.codigo.replace("________", v), L.teste);
    ocupado = false; $("b-exec").disabled = false;
    r.logs.forEach(l => log("console: " + l));
    if (r.ok && (!L.padrao || L.padrao.test(v))) vencer(); else falhar(r);
}

function falhar(r) {
    audio.erro();
    S.streak = 0; falhas++; salvar(); hud(); pips();
    msg(r.erro ? "✖ " + r.erro : "✖ O código rodou, mas não resolveu o desafio.", "erro");
    log(r.erro || "TESTE FALHOU: resultado diferente do esperado.", "e");
    $("terminal").classList.add("tremer");
    setTimeout(() => $("terminal").classList.remove("tremer"), 400);
    const L = NIVEIS[S.atual];
    if (falhas === 3) { log("ALERTA: 3 falhas. Dica liberada.", "w"); dica(`<strong>💡 DICA GRÁTIS:</strong> ${L.dica}`); }
    if (falhas >= 5) { usouResp = true; dica(`<strong>🚨 RESPOSTA:</strong> <code>${L.resposta}</code> (menos XP nesta missão)`); }
}

function vencer() {
    audio.ok();
    const nova = !S.feitas.includes(S.atual);
    const mult = 1 + Math.min(S.streak, 5) * 0.1;
    const xp = nova ? Math.round((usouResp ? 20 : Math.max(20, 50 - 10 * dicas)) * mult) : 0;
    const cred = nova ? 20 * (S.loja.includes("mult") ? 2 : 1) : 0;
    if (nova) { S.xp += xp; S.cred += cred; S.streak++; S.feitas.push(S.atual); }
    salvar(); hud();
    msg("✓ SINTAXE CORRETA! ACESSO CONCEDIDO.", "ok");
    log(`EXPLOIT VÁLIDO: missão ${S.atual + 1} concluída!`, "s");
    if (nova && S.feitas.length === NIVEIS.length) { telaFinal(); return; }
    modal(`<h3>🔓 EXPLOIT EXECUTADO!</h3>
        <div class="linha">XP GANHO <b>+${xp}</b></div>
        <div class="linha">CYBER CREDITS <b>+${cred}</b></div>
        <div class="linha">COMBO <b>${mult.toFixed(1)}x</b></div>
        ${nova ? "" : "<p style='margin-top:1rem;color:var(--muted)'>Missão já concluída: sem XP na repetição.</p>"}
        <div class="acoes"><button class="btn" data-a="prox">PRÓXIMA MISSÃO ▶</button></div>`);
}

function telaFinal() {
    const t = ["AUTHENTICATION ... GRANTED", "FIREWALL ........ BYPASSED", "DATABASE ........ ACCESSED", "ALL MISSIONS .... COMPLETE"];
    modal(`<h3 class="glitch" data-text="SYSTEM BREACHED">SYSTEM BREACHED</h3>
        <p style="color:var(--muted);font-size:.85rem">Todas as camadas de segurança foram superadas.</p>
        <div class="term-final">${t.map((l, i) => `<div style="--d:${0.3 + i * 0.3}s"><span>&gt;</span> ${l}</div>`).join("")}</div>
        <div class="linha">XP TOTAL <b>${S.xp}</b></div>
        <div class="linha">RANK <b>${document.getElementById("rank").textContent.toUpperCase()}</b></div>
        <div class="acoes"><a class="btn" href="jogar.html">VOLTAR AOS JOGOS</a><button class="btn sec2" data-a="reiniciar">JOGAR DE NOVO</button></div>`, "final");
    const simb = ["01", "10", "{}", "[]", ">", "#", "/"];
    for (let i = 0; i < 70; i++) {
        const q = document.createElement("div");
        q.className = "queda"; q.textContent = simb[i % simb.length];
        q.style.left = Math.random() * 100 + "%";
        q.style.animationDuration = 2 + Math.random() * 3 + "s";
        q.style.animationDelay = Math.random() * 1.5 + "s";
        document.body.append(q); setTimeout(() => q.remove(), 6500);
    }
}

/* ---------- Modais, loja e manual ---------- */
function modal(html, cls = "") {
    $("modal-corpo").className = "modal " + cls;
    $("modal-corpo").innerHTML = html;
    $("modal").hidden = false;
}
const fechar = () => { $("modal").hidden = true; };

function abrirLoja() {
    modal(`<h3>🛒 LOJA CYBERWARE · ❖ ${S.cred}</h3>` + LOJA.map(i => {
        const tem = S.loja.includes(i.id);
        return `<div class="item"><div><strong>${i.icone} ${i.nome}</strong><p>${i.desc}</p></div>
            <button data-a="comprar" data-id="${i.id}" ${tem ? "disabled" : ""}>${tem ? "INSTALADO" : i.preco + " ❖"}</button></div>`;
    }).join("") + `<div class="acoes"><button class="btn sec2" data-a="fechar">FECHAR</button></div>`);
}

const acoes = {
    fechar,
    prox() { fechar(); const i = Math.min(S.atual + 1, NIVEIS.length - 1); carregar(i); },
    comprar(d) {
        const it = LOJA.find(i => i.id === d.id);
        if (!it || S.cred < it.preco || S.loja.includes(it.id)) { audio.erro(); return; }
        S.cred -= it.preco; S.loja.push(it.id); salvar(); hud(); audio.ok();
        log(`UPGRADE: [${it.nome}] ativado.`, "s"); abrirLoja();
    },
    reiniciar() { S = { ...PADRAO, feitas: [], loja: [] }; salvar(); fechar(); carregar(0); }
};

$("modal").onclick = e => {
    const a = e.target.closest("[data-a]");
    if (a) { audio.click(); acoes[a.dataset.a]?.(a.dataset); }
    else if (e.target.id === "modal") fechar();
};
$("rede").onclick = e => {
    const b = e.target.closest("[data-m]");
    if (b && liberada(+b.dataset.m)) { audio.click(); carregar(+b.dataset.m); }
};
$("b-exec").onclick = executar;
$("b-loja").onclick = () => { audio.click(); abrirLoja(); };
$("b-manual").onclick = () => {
    audio.click();
    modal("<h3>📑 GUIA RÁPIDO DE JAVASCRIPT</h3>" + MANUAL.map(([t, d, c]) =>
        `<div class="item" style="display:block"><strong>${t}</strong><p>${d}</p><pre>${c}</pre></div>`).join("") +
        `<div class="acoes"><button class="btn sec2" data-a="fechar">FECHAR</button></div>`);
};
$("b-som").onclick = () => { audio.on = !audio.on; $("b-som").textContent = audio.on ? "🔊" : "🔇"; };
$("b-dica").onclick = () => {
    audio.click();
    const gratis = S.loja.includes("dica");
    if (!gratis && S.cred < 10) { log("CRÉDITOS INSUFICIENTES: precisa de 10 ❖.", "e"); return; }
    if (!gratis) S.cred -= 10;
    dicas++; salvar(); hud();
    dica(`<strong>💡 DICA DO SISTEMA:</strong> ${NIVEIS[S.atual].dica}`);
};
document.addEventListener("keydown", e => { if (e.key === "Escape") fechar(); });

carregar(Math.min(S.atual, NIVEIS.length - 1));