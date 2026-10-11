// ROBOCODE: o jogador escreve JavaScript de verdade (for, if, while, function).
// O código roda num Worker (protege contra loop infinito) e o resultado é animado no mapa.

const $ = id => document.getElementById(id);

/* ---------- Fases ---------- */
const MOV = ["cima", "baixo", "esquerda", "direita"].map(d => [`mover("${d}")`, `mover("${d}");\n`]);
const FOR = ["for", 'for (let i = 0; i < 3; i++) {\n  mover("direita");\n}\n'];
const IF = ["if / else", 'if (livre("direita")) {\n  mover("direita");\n} else {\n  mover("baixo");\n}\n'];
const WHILE = ["while", "while (!chegou()) {\n  \n}\n"];
const FUN = ["function", "function andar(direcao, vezes) {\n  for (let i = 0; i < vezes; i++) {\n    mover(direcao);\n  }\n}\n"];

const NIVEIS = [
    {
        titulo: "PROGRAME O ROBÔ",
        texto: "O robô perdeu o caminho até a linha de chegada. Escreva comandos em JavaScript e leve-o até 🏁 sem bater nas paredes. Passar pelo 💎 dá XP extra.",
        mapa: ["R.#...", "#.#.#.", ".C..#.", ".##...", "...#.F"],
        cmds: [...MOV], par: 13,
        dicas: ["Comece indo para a direita e depois para baixo: a parede de cima bloqueia o resto da linha.", "Depois do cristal, o corredor sobe pela coluna 4 e depois desce pelo lado direito.", 'O caminho completo tem 13 passos e termina com 4 vezes <code>mover("baixo");</code>.'],
        conceito: ["Sequência", "O computador executa os comandos na ordem em que você escreve. Trocar a ordem muda o caminho.", 'mover("direita");\nmover("baixo");\nmover("baixo");']
    },
    {
        titulo: "REPITA SEM CANSAR",
        texto: "Esse corredor é longo demais para digitar passo a passo. Use um laço de repetição e ganhe estrelas escrevendo menos linhas.",
        mapa: ["##############", "R.....C......F", "##############"],
        cmds: [...MOV, FOR], par: 3,
        dicas: ["São 13 passos para a direita. Um laço <code>for</code> repete o mesmo comando quantas vezes você pedir.", 'Troque o 3 do exemplo por 13: <code>for (let i = 0; i &lt; 13; i++)</code>.'],
        conceito: ["Repetição (for)", "Um laço repete um bloco de código. Em vez de escrever o mesmo comando 13 vezes, você escreve uma vez e diz quantas repetições quer.", 'for (let i = 0; i < 13; i++) {\n  mover("direita");\n}']
    },
    {
        titulo: "O ROBÔ DECIDE",
        texto: "A escada zigue-zague segue um padrão. Em vez de contar passos, deixe o robô olhar à frente e decidir sozinho com if e while.",
        mapa: ["R.####", "#..###", "##..##", "###..#", "####.F"],
        cmds: [...MOV, IF, WHILE], par: 7,
        dicas: ["<code>livre(\"direita\")</code> devolve verdadeiro se não houver parede à direita.", "Regra: se der para ir à direita, vá; senão, desça. Repita até <code>chegou()</code>."],
        conceito: ["Condições (if / else)", "Uma condição faz o programa escolher o que fazer. Combinada com while, o robô resolve qualquer escada sem você contar passos.", 'while (!chegou()) {\n  if (livre("direita")) {\n    mover("direita");\n  } else {\n    mover("baixo");\n  }\n}']
    },
    {
        titulo: "MESTRE DO CÓDIGO",
        texto: "Labirinto com dois cristais. Reutilize código criando sua própria função e tente chegar com o menor número de linhas.",
        mapa: ["R..#...", ".#.#.C.", ".C...#.", ".#.##..", "...C..F"],
        cmds: [...MOV, FOR, IF, WHILE, FUN], par: 10,
        dicas: ["Desça 2, vá 4 para a direita, suba 1, vá 2 para a direita e desça 3.", 'Crie <code>andar(direcao, vezes)</code> e chame: <code>andar("baixo", 2);</code>'],
        conceito: ["Funções", "Uma função guarda um bloco de código com nome e pode ser chamada várias vezes, com valores diferentes.", 'function andar(direcao, vezes) {\n  for (let i = 0; i < vezes; i++) {\n    mover(direcao);\n  }\n}\nandar("baixo", 2);']
    }
];

/* ---------- Worker: roda o código do jogador e simula o robô ---------- */
function corpoWorker() {
    onmessage = e => {
        const g = e.data.mapa.map(l => l.split(""));
        let r = 0, c = 0;
        g.forEach((l, y) => l.forEach((ch, x) => { if (ch === "R") { r = y; c = x; } }));
        const D = { cima: [-1, 0], baixo: [1, 0], esquerda: [0, -1], direita: [0, 1] };
        const passos = [];
        const livre = d => {
            if (!D[d]) throw new Error('Direção inválida: "' + d + '". Use cima, baixo, esquerda ou direita.');
            const y = r + D[d][0], x = c + D[d][1];
            return g[y] !== undefined && g[y][x] !== undefined && g[y][x] !== "#";
        };
        const chegou = () => g[r][c] === "F";
        const mover = d => {
            if (passos.length >= 300) throw new Error("Comandos demais. Seu código pode estar em loop.");
            if (!livre(d)) { passos.push({ d, r, c, hit: true }); throw "BATEU"; }
            r += D[d][0]; c += D[d][1];
            const cr = g[r][c] === "C";
            if (cr) g[r][c] = ".";
            passos.push({ d, r, c, cr });
        };
        try {
            new Function("mover", "livre", "chegou", e.data.codigo)(mover, livre, chegou);
            postMessage({ passos });
        } catch (err) {
            postMessage({ passos, bateu: err === "BATEU", erro: err === "BATEU" ? null : String(err.message || err) });
        }
    };
}

function rodar(codigo, mapa) {
    return new Promise(res => {
        try {
            const url = URL.createObjectURL(new Blob(["(" + corpoWorker + ")()"], { type: "text/javascript" }));
            const w = new Worker(url);
            const fim = r => { clearTimeout(t); w.terminate(); URL.revokeObjectURL(url); res(r); };
            const t = setTimeout(() => fim({ passos: [], erro: "Seu código demorou demais. Verifique se há um loop infinito." }), 1500);
            w.onmessage = e => fim(e.data);
            w.onerror = () => fim({ passos: [], erro: "Não consegui rodar o código. Se abriu o arquivo direto, tente usar o Live Server." });
            w.postMessage({ mapa, codigo });
        } catch (e) {
            res({ passos: [], erro: "Seu navegador bloqueou a execução. Tente usar o Live Server." });
        }
    });
}

/* ---------- Estado ---------- */
let prog = { xp: 0, melhor: [], nivel: 0 };
try { Object.assign(prog, JSON.parse(localStorage.getItem("robocode") || "{}")); } catch (e) {}
const salvar = () => { try { localStorage.setItem("robocode", JSON.stringify(prog)); } catch (e) {} };

let n = Math.min(prog.nivel || 0, NIVEIS.length - 1);
let erros = 0, errosFase = 0, vel = 1, ocupado = false, token = 0, cel = [], ini = [0, 0], totalCr = 0, coletados = 0;

const mapaEl = $("mapa"), grade = $("grade"), robo = $("robo"), codigo = $("codigo");
const esperar = ms => new Promise(r => setTimeout(r, ms));

/* ---------- Montagem da fase ---------- */
function montar() {
    const m = NIVEIS[n].mapa;
    mapaEl.style.setProperty("--cols", m[0].length);
    mapaEl.style.setProperty("--rows", m.length);
    grade.innerHTML = ""; cel = []; coletados = 0;
    m.forEach((linha, y) => {
        cel[y] = [];
        [...linha].forEach((ch, x) => {
            const d = document.createElement("div");
            d.className = "celula" + ({ "#": " parede", F: " chegada", C: " cristal" }[ch] || "");
            d.innerHTML = { "#": "🧱", F: "<span>🏁</span>", C: "<span>💎</span>" }[ch] || "";
            if (ch === "R") ini = [y, x];
            grade.append(d); cel[y][x] = d;
        });
    });
    totalCr = m.join("").split("C").length - 1;
    colocar(ini[0], ini[1], false);
    $("cristais").textContent = `0/${totalCr}`;
    mapaEl.classList.remove("vitoria", "bateu");
}

function colocar(y, x, trilha = true) {
    robo.style.setProperty("--x", x);
    robo.style.setProperty("--y", y);
    if (trilha) cel[y][x].classList.add("trilha");
}

function carregar(i) {
    n = i; prog.nivel = i; salvar(); errosFase = 0;
    const N = NIVEIS[i];
    $("fase").textContent = `${i + 1}/${NIVEIS.length}`;
    $("tag").textContent = `MISSÃO ${String(i + 1).padStart(2, "0")}`;
    $("titulo").textContent = N.titulo;
    $("texto").textContent = N.texto;
    $("xp").textContent = prog.xp;
    $("erros").textContent = erros;
    $("conceito").innerHTML = `<h3>O QUE VOCÊ ESTÁ APRENDENDO?</h3><div><h4>${N.conceito[0]}</h4><p>${N.conceito[1]}</p></div><pre>${N.conceito[2]}</pre>`;
    $("comandos").innerHTML = "";
    N.cmds.forEach(([rotulo, trecho]) => {
        const b = document.createElement("button");
        b.textContent = rotulo; b.title = "Inserir no editor";
        b.onclick = () => inserir(trecho);
        $("comandos").append(b);
    });
    codigo.value = "";
    codigo.placeholder = i === 0 ? 'mover("direita");\nmover("baixo");' : "// escreva seu código aqui";
    atualizarEditor();
    montar();
    $("linhaAtual").textContent = "aguardando código...";
    $("dica").hidden = true;
    msg("Escreva seu código e clique em executar. Atalho: Ctrl + Enter.");
}

/* ---------- Editor ---------- */
function atualizarEditor() {
    codigo.style.height = "auto";
    codigo.style.height = Math.max(codigo.scrollHeight, 176) + "px";
    const total = Math.max(7, codigo.value.split("\n").length);
    $("nums").textContent = Array.from({ length: total }, (_, i) => i + 1).join("\n");
}

function inserir(texto) {
    const a = codigo.selectionStart, b = codigo.selectionEnd;
    codigo.setRangeText(texto, a, b, "end");
    codigo.focus(); atualizarEditor();
}

codigo.addEventListener("input", atualizarEditor);
codigo.addEventListener("keydown", e => {
    if (e.key === "Tab") { e.preventDefault(); inserir("  "); }
    if (e.ctrlKey && e.key === "Enter") { e.preventDefault(); executar(); }
});

/* ---------- Mensagens ---------- */
function msg(html, tipo = "") { const m = $("mensagem"); m.className = "mensagem " + tipo; m.innerHTML = html; }

function registrarErro() {
    erros++; errosFase++;
    $("erros").textContent = erros;
    const dicas = NIVEIS[n].dicas;
    if (errosFase >= 2) {
        const d = dicas[Math.min(Math.floor(errosFase / 2) - 1, dicas.length - 1)];
        $("dica").innerHTML = `<strong>💡 DICA:</strong> ${d}`;
        $("dica").hidden = false;
    }
}

/* ---------- Execução ---------- */
function travar(v) { ocupado = v; $("executar").disabled = v; $("limpar").disabled = v; }

async function executar() {
    if (ocupado) return;
    if (!codigo.value.trim()) { msg("Você ainda não escreveu nenhum código.", "erro"); return; }
    montar();
    const meu = ++token;
    travar(true);
    msg("⚡ Executando seu programa...", "rodando");

    const res = await rodar(codigo.value, NIVEIS[n].mapa);
    if (meu !== token) return;

    $("linhaAtual").textContent = "-";
    for (let i = 0; i < res.passos.length; i++) {
        const p = res.passos[i];
        $("linhaAtual").textContent = `passo ${i + 1}: mover("${p.d}")`;
        robo.style.transitionDuration = (0.3 / vel) + "s";
        await esperar(380 / vel);
        if (meu !== token) return;

        if (p.hit) {
            robo.classList.add("bateu"); mapaEl.classList.add("bateu");
            await esperar(450);
            robo.classList.remove("bateu"); mapaEl.classList.remove("bateu");
            break;
        }
        colocar(p.r, p.c);
        if (p.cr) {
            coletados++;
            cel[p.r][p.c].innerHTML = "";
            $("cristais").textContent = `${coletados}/${totalCr}`;
            $("cristais").parentElement.classList.add("pulso");
            setTimeout(() => $("cristais").parentElement.classList.remove("pulso"), 500);
        }
        if (NIVEIS[n].mapa[p.r][p.c] === "F") { await esperar(300 / vel); vencer(); return; }
    }

    travar(false);
    if (res.bateu) msg("❌ O robô bateu em uma parede ou saiu do mapa. Confira a direção do último comando.", "erro");
    else if (res.erro) msg("❌ " + res.erro, "erro");
    else msg("❌ O programa terminou, mas o robô não chegou na 🏁.", "erro");
    registrarErro();
}

function vencer() {
    const linhas = codigo.value.split("\n").filter(l => l.trim()).length, par = NIVEIS[n].par;
    const estrelas = linhas <= par ? 3 : linhas <= par + 2 ? 2 : 1;
    const ganho = estrelas * 100 + coletados * 50;
    const extra = Math.max(0, ganho - (prog.melhor[n] || 0));
    prog.melhor[n] = Math.max(prog.melhor[n] || 0, ganho);
    prog.xp += extra; salvar();
    $("xp").textContent = prog.xp;
    mapaEl.classList.add("vitoria");
    msg("🎉 <strong>MISSÃO CONCLUÍDA!</strong>", "sucesso");
    $("estrelas").textContent = "★".repeat(estrelas) + "☆".repeat(3 - estrelas);
    $("resumo").innerHTML = `Você usou <strong>${linhas}</strong> linhas (meta: ${par}) e pegou <strong>${coletados}/${totalCr}</strong> cristais.<br>+${extra} XP${estrelas < 3 ? " · tente com menos linhas para 3 estrelas" : ""}`;
    const ultima = n === NIVEIS.length - 1;
    $("proxima").textContent = ultima ? "VOLTAR AOS JOGOS" : "PRÓXIMA FASE ▶";
    $("final").hidden = false;
    confete();
    travar(false);
}

function confete() {
    const cores = ["#ff4f8b", "#3de0ff", "#ffd23f", "#5dff9a"];
    for (let i = 0; i < 40; i++) {
        const c = document.createElement("div");
        c.className = "confete";
        c.style.left = Math.random() * 100 + "vw";
        c.style.background = cores[i % 4];
        c.style.animationDelay = Math.random() * 0.6 + "s";
        document.body.append(c);
        setTimeout(() => c.remove(), 3000);
    }
}

/* ---------- Botões ---------- */
$("executar").onclick = executar;
$("reiniciar").onclick = () => { token++; travar(false); montar(); $("linhaAtual").textContent = "aguardando código..."; msg("Robô de volta ao início."); };
$("limpar").onclick = () => { codigo.value = ""; atualizarEditor(); $("reiniciar").click(); };
$("vel").onclick = () => { vel = vel === 1 ? 2 : vel === 2 ? 4 : 1; $("vel").textContent = `⏩ ${vel}x`; };
$("repetir").onclick = () => { $("final").hidden = true; montar(); msg("Tente de novo para ganhar mais estrelas."); };
$("proxima").onclick = () => {
    if (n === NIVEIS.length - 1) { location.href = "jogar.html"; return; }
    $("final").hidden = true; carregar(n + 1);
};

carregar(n);