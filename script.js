// Salas padrão iniciais (caso o localStorage esteja vazio)
const defaultSalas = [
    { id: "s1", nome: "Sala 101", bloco: "Bloco A", x: 20, y: 30 },
    { id: "s2", nome: "Sala 102", bloco: "Bloco A", x: 40, y: 30 },
    { id: "s3", nome: "Lab Info", bloco: "Bloco B", x: 70, y: 60 },
    { id: "s4", nome: "Auditório", bloco: "Bloco C", x: 30, y: 80 }
];

function initData() {
    if (!localStorage.getItem("salas")) {
        localStorage.setItem("salas", JSON.stringify(defaultSalas));
    }
    if (!localStorage.getItem("cursosCadastrados")) {
        localStorage.setItem("cursosCadastrados", JSON.stringify(["Engenharia de Software", "Administração Avançada", "Design Gráfico"]));
    }
    if (!localStorage.getItem("ocupacoes")) {
        localStorage.setItem("ocupacoes", JSON.stringify({}));
    }
}

// --- TELA PÚBLICA (Mapa Visual Desktop + Legenda em Cards Mobile) ---
function carregarMapaPublico() {
    initData();
    const salas = JSON.parse(localStorage.getItem("salas"));
    const ocupacoes = JSON.parse(localStorage.getItem("ocupacoes"));
    
    // 1. Renderização para Desktop (Mapa com Marcadores)
    const containerDesktop = document.getElementById("mapa-container");
    if (containerDesktop) {
        containerDesktop.innerHTML = "";

        const wrapper = document.createElement("div");
        wrapper.classList.add("planta-visual-wrapper");

        const imgContainer = document.createElement("div");
        imgContainer.classList.add("planta-imagem-container");

        const img = document.createElement("img");
        img.src = "planta-baixa.png";
        img.alt = "Planta Baixa do Prédio";
        imgContainer.appendChild(img);

        salas.forEach(sala => {
            const ocupacao = ocupacoes[sala.id];
            const isOcupada = ocupacao && ocupacao.curso;

            const marcador = document.createElement("div");
            marcador.className = `sala-marcador ${isOcupada ? 'ocupada' : 'livre'}`;
            
            const posX = sala.x !== undefined ? sala.x : 50;
            const posY = sala.y !== undefined ? sala.y : 50;
            marcador.style.left = `${posX}%`;
            marcador.style.top = `${posY}%`;

            marcador.innerHTML = `
                ${sala.nome}
                <div class="tooltip-info">
                    <strong>${sala.nome} (${sala.bloco})</strong><br>
                    Status: ${isOcupada ? 'Ocupada' : 'Disponível'}<br>
                    ${isOcupada ? `Curso: ${ocupacao.curso}<br>Turno: ${ocupacao.turno \vert{}\vert{} 'Não informado'}<br>Alunos: ${ocupacao.alunos || 'N/A'}<br>Término: ${formatarData(ocupacao.fim)}<br>Contato:${ocupacao.telefone}` : 'Livre para uso'}
                </div>
            `;
            imgContainer.appendChild(marcador);
        });

        wrapper.appendChild(imgContainer);
        containerDesktop.appendChild(wrapper);
    }

    // 2. Renderização para Celular (Lista em Cards Detalhados)
    const containerMobile = document.getElementById("lista-mobile-container");
    if (containerMobile) {
        containerMobile.innerHTML = "";
        salas.forEach(sala => {
            const ocupacao = ocupacoes[sala.id];
            const isOcupada = ocupacao && ocupacao.curso;

            const cardMobile = document.createElement("div");
            cardMobile.className = `sala-card-mobile ${isOcupada ? 'ocupada' : 'livre'}`;
            cardMobile.innerHTML = `
                <h4>${sala.nome} (${sala.bloco})</h4>
                <p><strong>Status:</strong> ${isOcupada ? '<span style="color:var(--danger-color)">Ocupada</span>' : '<span style="color:var(--accent-color)">Disponível</span>'}</p>
                ${isOcupada ? `
                    <p><strong>Curso:</strong> ${ocupacao.curso}</p>
                    <p><strong>Turno:</strong> ${ocupacao.turno || 'Não informado'}</p>
                    <p><strong>Nº de Alunos:</strong> ${ocupacao.alunos || 'N/A'}</p>
                    <p><strong>Período:</strong> ${formatarData(ocupacao.inicio)} até ${formatarData(ocupacao.fim)}</p>
                    <p><strong>Contato:</strong> ${ocupacao.telefone}</p>
                ` : `<p>Sala livre para agendamento.</p>`}
            `;
            containerMobile.appendChild(cardMobile);
        });
    }
}

// --- ÁREA ADMINISTRATIVA (admin.html) ---
function verificarSenhaDireta() {
    const senhaInput = document.getElementById("senha-input").value;
    if (senhaInput === "123") {
        document.getElementById("login-box").classList.add("hidden");
        document.getElementById("painel-admin").classList.remove("hidden");
        carregarPainelAdmin();
    } else {
        document.getElementById("erro-senha").textContent = "Senha incorreta!";
    }
}

function carregarPainelAdmin() {
    initData();
    carregarSelectsAdmin();
    atualizarListaCursos();
    atualizarListaSalas();
}

function carregarSelectsAdmin() {
    const salas = JSON.parse(localStorage.getItem("salas")) || [];
    const cursos = JSON.parse(localStorage.getItem("cursosCadastrados")) || [];
    
    const selectSala = document.getElementById("select-sala");
    if (selectSala) {
        selectSala.innerHTML = "";
        salas.forEach(s => {
            selectSala.innerHTML += `<option value="${s.id}">${s.nome} (${s.bloco})</option>`;
        });
    }

    const selectCurso = document.getElementById("select-curso-cadastrado");
    if (selectCurso) {
        selectCurso.innerHTML = `<option value="">-- Selecionar curso pré-cadastrado --</option>`;
        cursos.forEach(c => {
            selectCurso.innerHTML += `<option value="${c}">${c}</option>`;
        });
    }
}

function preencherNomeCurso() {
    const selecionado = document.getElementById("select-curso-cadastrado").value;
    if (selecionado) {
        document.getElementById("input-curso-nome").value = selecionado;
    }
}

// --- GESTÃO DE CURSOS ---
function cadastrarNovoCursoPreDefinido() {
    const nomeCurso = document.getElementById("novo-curso-input").value.trim();
    if (!nomeCurso) return alert("Digite o nome do curso.");

    let cursos = JSON.parse(localStorage.getItem("cursosCadastrados")) || [];
    if (!cursos.includes(nomeCurso)) {
        cursos.push(nomeCurso);
        localStorage.setItem("cursosCadastrados", JSON.stringify(cursos));
        document.getElementById("novo-curso-input").value = "";
        carregarSelectsAdmin();
        atualizarListaCursos();
        alert("Curso pré-cadastrado com sucesso!");
    } else {
        alert("Este curso já está cadastrado.");
    }
}

function atualizarListaCursos() {
    const cursos = JSON.parse(localStorage.getItem("cursosCadastrados")) || [];
    const ul = document.getElementById("lista-cursos-ul");
    if (!ul) return;
    ul.innerHTML = "";
    cursos.forEach((c, index) => {
        ul.innerHTML += `<li>${c} <button type="button" onclick="removerCurso(${index})" style="background:var(--danger-color); color:white; border:none; padding:3px 8px; border-radius:3px; cursor:pointer;">Excluir</button></li>`;
    });
}

function removerCurso(index) {
    let cursos = JSON.parse(localStorage.getItem("cursosCadastrados")) || [];
    cursos.splice(index, 1);
    localStorage.setItem("cursosCadastrados", JSON.stringify(cursos));
    carregarSelectsAdmin();
    atualizarListaCursos();
}

// --- GESTÃO DE SALAS ---
function cadastrarNovaSala(event) {
    event.preventDefault(); // Impede o recarregamento da página e o reset do login
    
    const nome = document.getElementById("nova-sala-nome").value.trim();
    const bloco = document.getElementById("nova-sala-bloco").value.trim();
    const x = parseFloat(document.getElementById("nova-sala-x").value);
    const y = parseFloat(document.getElementById("nova-sala-y").value);

    if (!nome || !bloco || isNaN(x) || isNaN(y)) {
        alert("Preencha todos os campos da sala corretamente.");
        return;
    }

    let salas = JSON.parse(localStorage.getItem("salas")) || [];
    const novoId = "s_" + Date.now();
    
    salas.push({ id: novoId, nome, bloco, x, y });
    localStorage.setItem("salas", JSON.stringify(salas));

    alert("Sala cadastrada com sucesso!");
    document.getElementById("form-nova-sala").reset();
    carregarSelectsAdmin();
    atualizarListaSalas();
}

function atualizarListaSalas() {
    const salas = JSON.parse(localStorage.getItem("salas")) || [];
    const ul = document.getElementById("lista-salas-ul");
    if (!ul) return;
    ul.innerHTML = "";
    
    salas.forEach((s) => {
        ul.innerHTML += `<li>${s.nome} (${s.bloco}) - Pos(%): X:${s.x}, Y:${s.y} <button type="button" onclick="removerSala('${s.id}')" style="background:var(--danger-color); color:white; border:none; padding:3px 8px; border-radius:3px; cursor:pointer;">Excluir</button></li>`;
    });
}

function removerSala(id) {
    if (!confirm("Deseja realmente excluir esta sala?")) return;
    let salas = JSON.parse(localStorage.getItem("salas")) || [];
    salas = salas.filter(s => s.id !== id);
    localStorage.setItem("salas", JSON.stringify(salas));

    let ocupacoes = JSON.parse(localStorage.getItem("ocupacoes")) || {};
    if (ocupacoes[id]) {
        delete ocupacoes[id];
        localStorage.setItem("ocupacoes", JSON.stringify(ocupacoes));
    }

    carregarSelectsAdmin();
    atualizarListaSalas();
    alert("Sala removida com sucesso!");
}

// --- ATRIBUIÇÃO DE OCUPAÇÃO ---
function salvarOcupacaoSala(event) {
    event.preventDefault();
    
    const salaId = document.getElementById("select-sala").value;
    const curso = document.getElementById("input-curso-nome").value;
    const turno = document.getElementById("select-turno").value;
    const alunos = document.getElementById("input-alunos").value;
    const inicio = document.getElementById("data-inicio").value;
    const fim = document.getElementById("data-fim").value;
    const telefone = document.getElementById("telefone-contato").value;

    if (!salaId || !curso || !turno || !alunos || !inicio || !fim || !telefone) {
        alert("Preencha todos os campos da ocupação.");
        return;
    }

    let ocupacoes = JSON.parse(localStorage.getItem("ocupacoes")) || {};
    ocupacoes[salaId] = { curso, turno, alunos, inicio, fim, telefone };
    localStorage.setItem("ocupacoes", JSON.stringify(ocupacoes));

    alert("Sala mapeada/ocupada com sucesso!");
    document.getElementById("form-ocupacao").reset();
}

function formatarData(dataIso) {
    if (!dataIso) return "";
    const partes = dataIso.split("-");
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}
