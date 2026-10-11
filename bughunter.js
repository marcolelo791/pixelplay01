// BUG HUNTER: o código roda de verdade num Worker. Para vencer, a saída precisa bater
// com a esperada E cada bug escondido precisa estar corrigido (alguns bugs não dão erro!).
// Qualquer correção que funcione é aceita (=== ou ==, i++ ou i += 1, etc.).

const $ = id => document.getElementById(id);

/* ---------- Fases ---------- */
// ok(c) recebe o código SEM espaços e SEM comentários.
const FASES = [
    {
        titulo: "CORRIJA A VARIÁVEL", desc: "O sistema não consegue encontrar o nome do usuário. Leia o erro do terminal: ele aponta o problema.",
        codigo: 'let nome = "Marquin";\n\nconsole.log(nom);', esperado: ["Marquin"],
        bugs: [{ nome: "Variável com o nome errado", ok: c => /console\.log\(nome\)/.test(c) }],
        dica: "A variável foi criada como <code>nome</code>, mas o console tenta usar outro nome.",
        aprende: ["Variáveis", "Guardam informações. O nome usado precisa ser exatamente igual ao nome criado (maiúsculas contam)."]
    },
    {
        titulo: "LIBERE O ACESSO CERTO", desc: "Um usuário de 16 anos está entrando no sistema! A condição está errada, mesmo sem dar erro.",
        codigo: 'let idade = 16;\n\nif (idade = 18) {\n  console.log("Acesso liberado");\n} else {\n  console.log("Acesso negado");\n}', esperado: ["Acesso negado"],
        bugs: [{ nome: "Condição usando = no lugar de comparação", ok: c => /if\(idade(={2,3}|>=|>)18\)/.test(c) }],
        dica: "Um único <code>=</code> atribui um valor. Para comparar, use <code>===</code> (ou <code>&gt;=</code> para maior de idade).",
        aprende: ["Condições", "O if decide o caminho do programa. Cuidado: = atribui, === compara."]
    },
    {
        titulo: "CONSERTE O LOOP", desc: "O sistema precisa contar de 0 até 4, mas o loop está quebrado e o programa nem começa.",
        codigo: "for (let i = 0; i < 5; i+) {\n  console.log(i);\n}", esperado: ["0", "1", "2", "3", "4"],
        bugs: [{ nome: "Incremento do contador incompleto", ok: c => /for\(leti=0;i<5;(i\+\+|\+\+i|i\+=1|i=i\+1)\)/.test(c) }],
        dica: "Falta um símbolo no último trecho do <code>for</code>: o contador precisa aumentar de 1 em 1.",
        aprende: ["Loops", "O for repete comandos. Um erro de sintaxe impede o programa inteiro de rodar."]
    },
    {
        titulo: "RECUPERE A FUNÇÃO", desc: "A função calcula a soma, mas o resultado se perde pelo caminho e o console mostra undefined.",
        codigo: "function calcular(a, b) {\n  a + b;\n}\n\nconsole.log(calcular(5, 3));", esperado: ["8"],
        bugs: [{ nome: "Função não devolve o resultado", ok: c => /return(a\+b|b\+a)/.test(c) }],
        dica: "Para devolver um valor, a função precisa da palavra <code>return</code>.",
        aprende: ["Funções", "Sem return, a função devolve undefined, mesmo que a conta esteja certa."]
    },
    {
        titulo: "🔥 VÍRUS PRINCIPAL", desc: "ALERTA! O sistema principal foi infectado com 3 bugs. Um deles é silencioso: o programa roda, mas está errado.",
        codigo: 'let pontos = 100;\n\nif (pontos = 100) {\n  console.log("Pontuação máxima");\n}\n\nfunction bonus(valor) {\n  valor + 50;\n}\n\nconsole.log(bonus(ponto));', esperado: ["Pontuação máxima", "150"],
        bugs: [
            { nome: "Condição com = no lugar de ===", ok: c => /if\(pontos={2,3}100\)/.test(c) },
            { nome: "Função sem return", ok: c => /return(valor\+50|50\+valor)/.test(c) },
            { nome: "Variável com nome errado", ok: c => /bonus\(pontos\)/.test(c) }
        ],
        dica: "Procure: o nome da variável no último console.log, o return que falta e o sinal de igual da condição.",
        aprende: ["Debugging", "Depurar é ler erros, comparar a saída com o esperado e caçar até os bugs silenciosos."]
    }
];

/* ---------- Worker ---------- */
function corpoWorker() {
    onmessage = e => {
        const logs = [];
        const fmt = a => a.map(v => typeof v === "string" ? v : JSON.stringify(v) === undefined ? String(v) : JSON.stringify(v)).join(" ");
        try {
            new Function("console", e.data.codigo)({ log: (...a) => logs.push(fmt(a)) });
            postMessage({ logs });
        } catch (err) { postMessage({ logs, erro: String(err) }); }
    };
}

function rodar(codigo) {
    return new Promise(res => {
        try {
            const url = URL.createObjectURL(new Blob(["(" + corpoWorker + ")()"], { type: "text/javascript" }));
            const w = new Worker(url);
            const fim = r => { clearTimeout(t); w.terminate(); URL.revokeObjectURL(url); res(r); };
            const t = setTimeout(() => fim({ logs: [], erro: "Tempo esgotado (loop infinito?)" }), 1500);
            w.onmessage = e => fim(e.data);
            w.onerror = () => fim({ logs: [], erro: "Não consegui rodar o código. Tente usar o Live Server." });
            w.postMessage({ codigo });
        } catch (e) { res({ logs: [], erro: "Seu navegador bloqueou a execução. Tente usar o Live Server." }); }
    });
}

/* ---------- Estado ---------- */
let S = { xp: 0, fase: 0, feitas: [] };
try { Object.assign(S, JSON.parse(localStorage.getItem("bughunter") || "{}")); } catch (e) {}
const salvar = () => { try { localStorage.setItem("bughunter", JSON.stringify(S)); } catch (e) {} };
let erros = 0, dicas = 0, ocupado = false, feito = false, esmagados = [];
const liberada = i => i === 0 || S.feitas.includes(i - 1);
const limpo = c => c.replace(/\/\/.*$/gm, "").replace(/\s+/g, "");
const status = () => FASES[S.fase].bugs.map(b => b.ok(limpo($("codigo").value)));

/* ---------- Interface ---------- */
function hud() {
    $("fase").textContent = `${String(S.fase + 1).padStart(2, "0")}/${String(FASES.length).padStart(2, "0")}`;
    $("xp").textContent = S.xp; $("erros").textContent = erros;
    $("rede").innerHTML = FASES.map((f, k) =>
        (k ? `<span class="fio ${S.feitas.includes(k - 1) ? "ok" : ""}"></span>` : "") +
        `<button class="no ${S.feitas.includes(k) ? "feita" : ""} ${k === S.fase ? "atual" : ""}" data-f="${k}" ${liberada(k) ? "" : "disabled"}>${liberada(k) ? (S.feitas.includes(k) ? "✓" : k === FASES.length - 1 ? "🔥" : k + 1) : "🔒"}</button>`).join("");
}

function atualizar() {
    const F = FASES[S.fase], st = status(), n = st.filter(Boolean).length;
    $("bugs").textContent = `${n}/${F.bugs.length}`;
    $("lista").innerHTML = F.bugs.map((b, i) => st[i] ? `<li class="ok">✓ ${b.nome}</li>` : "<li>🔒 Bug escondido no código</li>").join("");
    document.querySelectorAll(".bug").forEach((el, i) => {
        if (st[i] && !el.classList.contains("esmagado")) { el.textContent = "💥"; el.classList.add("esmagado"); }
    });
    const nums = Math.max(8, $("codigo").value.split("\n").length);
    $("nums").textContent = Array.from({ length: nums }, (_, i) => i + 1).join("\n");
    $("codigo").style.height = "auto";
    $("codigo").style.height = Math.max($("codigo").scrollHeight, 240) + "px";
    $("estado").textContent = n === F.bugs.length ? "● LIMPO?" : "● INFECTADO";
    $("estado").className = n === F.bugs.length ? "limpo" : "";
}

function msg(t, c = "") { $("mensagem").className = "mensagem " + c; $("mensagem").innerHTML = t; }
function dica(html) { $("hint-box").innerHTML = "<strong>💡 DICA:</strong> " + html; $("hint-box").hidden = false; }

function carregar(i) {
    S.fase = i; salvar();
    erros = 0; dicas = 0; feito = false;
    const F = FASES[i];
    document.body.classList.toggle("chefe", i === FASES.length - 1);
    $("tag").textContent = i === FASES.length - 1 ? "🔥 CHEFE FINAL" : `MISSÃO ${String(i + 1).padStart(2, "0")}`;
    $("titulo").textContent = F.titulo; $("desc").textContent = F.desc;
    $("esperado").textContent = F.esperado.join("\n");
    $("c-titulo").textContent = "🧠 " + F.aprende[0].toUpperCase(); $("c-texto").textContent = F.aprende[1];
    $("arena").innerHTML = F.bugs.map((_, k) => `<span class="bug" style="--t:${2.4 + k * 0.9}s;--d:-${k * 0.7}s;left:${10 + k * 20}%">🐛</span>`).join("");
    $("codigo").value = F.codigo;
    $("hint-box").hidden = true;
    $("saida").textContent = "Aguardando execução...";
    $("b-exec").disabled = false;
    msg("Rode o código infectado para ler o que o terminal diz.");
    hud(); atualizar();
}

/* ---------- Jogo ---------- */
function mostrarSaida(r) {
    const s = $("saida"); s.innerHTML = "";
    const add = (t, c) => { const d = document.createElement("div"); d.className = c; d.textContent = (c === "e" ? "✖ " : "> ") + t; s.append(d); };
    r.logs.forEach(l => add(l, "l"));
    if (r.erro) add(r.erro, "e");
    if (!r.logs.length && !r.erro) s.textContent = "(o programa não imprimiu nada)";
}

async function executar() {
    if (ocupado || feito) return;
    ocupado = true; $("b-exec").disabled = true;
    msg("🔎 Escaneando e executando o código...", "rodando");
    const F = FASES[S.fase];
    const r = await rodar($("codigo").value);
    mostrarSaida(r);
    ocupado = false; $("b-exec").disabled = false;
    const bugsOk = status().every(Boolean);
    const igual = !r.erro && r.logs.join("\n") === F.esperado.join("\n");
    if (bugsOk && igual) { vencer(); return; }

    erros++; hud();
    if (r.erro) msg(`❌ O programa quebrou: <code>${r.erro.replace(/</g, "&lt;")}</code><br>Leia o erro: ele diz onde olhar.`, "erro");
    else if (!igual) msg("❌ O programa rodou, mas a saída não é a esperada.", "erro");
    else msg("⚠️ A saída está certa, mas ainda há um bug escondido no código! Confira a lista de bugs.", "erro");
    if (erros === 3) dica(F.dica);
}

function vencer() {
    feito = true;
    const novo = !S.feitas.includes(S.fase);
    const xp = novo ? Math.max(50, 200 - 25 * erros - 25 * dicas) : 0;
    if (novo) { S.xp += xp; S.feitas.push(S.fase); }
    salvar(); hud();
    $("estado").textContent = "● SISTEMA LIMPO"; $("estado").className = "limpo";
    msg("🎉 <strong>BUGS ELIMINADOS!</strong>", "ok");
    const ultima = S.fase === FASES.length - 1;
    chuva();
    setTimeout(() => {
        $("modal-corpo").innerHTML = ultima
            ? `<h2>🏆 SISTEMA RESTAURADO!</h2><p style="color:var(--muted);line-height:1.6">Você caçou todos os bugs e dominou o debugging.</p>
               <div class="linha">XP TOTAL <b>${S.xp}</b></div>
               <div class="acoes2"><a class="btn" href="jogar.html">VOLTAR AOS JOGOS</a><button class="btn s" data-a="reiniciar">JOGAR DE NOVO</button></div>`
            : `<h2>🐛 BUG ESMAGADO!</h2>
               <div class="linha">XP GANHO <b>+${xp}</b></div><div class="linha">ERROS <b>${erros}</b></div>${novo ? "" : "<p style='margin-top:1rem;color:var(--muted)'>Fase já concluída: sem XP na repetição.</p>"}
               <div class="acoes2"><button class="btn" data-a="prox">PRÓXIMA FASE ▶</button></div>`;
        $("modal").hidden = false;
    }, 900);
}

function chuva() {
    for (let i = 0; i < 40; i++) {
        const q = document.createElement("div");
        q.className = "queda"; q.textContent = ["🐛", "✨", "💥"][i % 3];
        q.style.left = Math.random() * 100 + "%";
        q.style.animationDuration = 2 + Math.random() * 2.5 + "s";
        q.style.animationDelay = Math.random() + "s";
        document.body.append(q); setTimeout(() => q.remove(), 5000);
    }
}

/* ---------- Eventos ---------- */
$("codigo").addEventListener("input", atualizar);
$("codigo").addEventListener("keydown", e => {
    if (e.key === "Tab") { e.preventDefault(); $("codigo").setRangeText("  ", $("codigo").selectionStart, $("codigo").selectionEnd, "end"); atualizar(); }
    if (e.ctrlKey && e.key === "Enter") { e.preventDefault(); executar(); }
});
$("b-exec").onclick = executar;
$("b-reset").onclick = () => { feito = false; $("codigo").value = FASES[S.fase].codigo; $("b-exec").disabled = false; $("saida").textContent = "Aguardando execução..."; msg("Código restaurado."); atualizar(); };
$("b-dica").onclick = () => { dicas++; dica(FASES[S.fase].dica); };
$("rede").onclick = e => { const b = e.target.closest("[data-f]"); if (b && liberada(+b.dataset.f)) carregar(+b.dataset.f); };
$("modal").onclick = e => {
    const a = e.target.closest("[data-a]");
    if (!a) return;
    $("modal").hidden = true;
    if (a.dataset.a === "prox") carregar(Math.min(S.fase + 1, FASES.length - 1));
    if (a.dataset.a === "reiniciar") { S = { xp: 0, fase: 0, feitas: [] }; salvar(); carregar(0); }
};
document.addEventListener("keydown", e => { if (e.key === "Escape") $("modal").hidden = true; });

carregar(Math.min(S.fase, FASES.length - 1));