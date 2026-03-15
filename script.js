const WEBHOOK_URL = "https://discord.com/api/webhooks/1482626269534355547/iGrd_rIIx3Q-UvgZprIr8HSA8fqN_SG4Qeag6aKAtV0eDBJ-bX2ZPh6i9z9zawCKDq5J";
let produtos = JSON.parse(localStorage.getItem('produtos')) || [];
let carrinho = [];
let usuarioAtivo = null;

// --- SISTEMA DE USUÁRIO ---

function reconhecerUsuario() {
    const nick = document.getElementById('l-nick').value.toUpperCase();
    if (!nick) return;
    const banco = JSON.parse(localStorage.getItem('banco_usuarios')) || {};
    if (banco[nick]) {
        const u = banco[nick];
        document.getElementById('l-pass').value = u.passaporte;
        document.getElementById('l-discord').value = u.discord;
        document.getElementById('l-tel').value = u.tel;
        document.getElementById('l-tipo').value = u.tipo;
        console.log("✅ Usuário reconhecido: " + nick);
    }
}

function salvarConta() {
    const nick = document.getElementById('l-nick').value.toUpperCase();
    const pass = document.getElementById('l-pass').value;
    const disc = document.getElementById('l-discord').value;
    const tel = document.getElementById('l-tel').value;
    const tipo = document.getElementById('l-tipo').value;

    if(!nick || !pass || !disc) return alert("⚠️ Preencha Nick, Passaporte e Discord para salvar!");

    const dados = { nick, passaporte: pass, discord: disc, tel: tel, tipo: tipo };
    let banco = JSON.parse(localStorage.getItem('banco_usuarios')) || {};
    banco[nick] = dados;
    localStorage.setItem('banco_usuarios', JSON.stringify(banco));
    alert("✅ Dados Salvos com Sucesso!");
}

function entrarNoSite() {
    const nick = document.getElementById('l-nick').value.toUpperCase();
    const pass = document.getElementById('l-pass').value;
    
    if(!nick || !pass) return alert("⚠️ Identifique-se primeiro!");
    
    usuarioAtivo = { 
        nick, 
        passaporte: pass, 
        tipo: document.getElementById('l-tipo').value, 
        discord: document.getElementById('l-discord').value, 
        tel: document.getElementById('l-tel').value 
    };

    document.getElementById('tela-login').classList.add('hidden');
    document.getElementById('tela-catalogo').classList.remove('hidden');
    renderizarProdutos(produtos);
}

// --- SISTEMA DE PRODUTOS ---

function renderizarProdutos(lista) {
    const grid = document.getElementById('grid-produtos');
    grid.innerHTML = "";
    
    if(lista.length === 0) {
        grid.innerHTML = "<p style='color:gray; grid-column: 1/-1; text-align:center;'>Nenhum item encontrado no arsenal.</p>";
        return;
    }

    lista.forEach((p, idx) => {
        // Cálculo de desconto para aliados (25% OFF)
        let temDesconto = usuarioAtivo.tipo === 'aliado';
        let precoReal = temDesconto ? p.preco * 0.75 : p.preco;
        let layoutClass = p.layout || 'padrao';

        grid.innerHTML += `
        <div class="card-produto card-layout-${layoutClass}" style="animation-delay: ${idx * 0.1}s">
            <div class="card-img-container">
                <img src="${p.img || 'https://via.placeholder.com/150'}" alt="${p.nome}">
            </div>
            <div class="card-info">
                <h3 class="rgb-animate" style="color:${p.cores?.nome || '#ff0000'}">${p.nome.toUpperCase()}</h3>
                <div class="price-box">
                    ${temDesconto ? `<small style="text-decoration:line-through; color:gray;">R$ ${p.preco.toLocaleString()}</small>` : ''}
                    <p class="main-price" style="color:${p.cores?.valor || '#00ff00'}">R$ ${precoReal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
                    <small class="pix-tag">Valor unitário</small>
                </div>
                <p class="desc-prod" style="color:${p.cores?.desc || '#ffffff'}">${p.desc || 'Sem descrição técnica.'}</p>
                <button class="btn-add-nova" onclick="addCarrinho(${p.id})">
                    <span class="icon">🛒</span> Adicionar ao Carrinho
                </button>
            </div>
        </div>`;
    });
}

function filtrarItens(termo) {
    const filtrados = produtos.filter(p => 
        p.nome.toLowerCase().includes(termo.toLowerCase()) || 
        (p.desc && p.desc.toLowerCase().includes(termo.toLowerCase()))
    );
    renderizarProdutos(filtrados);
}

// --- CARRINHO ---

function addCarrinho(id) {
    const p = produtos.find(item => item.id === id);
    if(!p) return;

    const itemNoCarrinho = carrinho.find(item => item.id === id);
    if(itemNoCarrinho) { 
        itemNoCarrinho.qtd++; 
    } else { 
        carrinho.push({...p, qtd: 1}); 
    }
    
    // Feedback visual rápido
    document.getElementById('cart-qtd').innerText = carrinho.reduce((acc, curr) => acc + curr.qtd, 0);
    alert(`📦 ${p.nome} adicionado!`);
}

function abrirCarrinho() {
    if(carrinho.length === 0) return alert("🛒 Seu carrinho está vazio!");
    document.getElementById('tela-catalogo').classList.add('hidden');
    document.getElementById('tela-carrinho').classList.remove('hidden');
    renderizarCarrinhoCheckout();
}

function renderizarCarrinhoCheckout() {
    const container = document.getElementById('lista-carrinho-check');
    container.innerHTML = ""; 
    let totalGeral = 0;

    carrinho.forEach((item, index) => {
        let precoReal = usuarioAtivo.tipo === 'aliado' ? item.preco * 0.75 : item.preco;
        let subtotal = precoReal * item.qtd;
        totalGeral += subtotal;

        container.innerHTML += `
        <div class="cart-item-row" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; padding:10px; border-bottom:1px solid #eee;">
            <div style="flex:2;">
                <strong style="color:#111;">${item.nome}</strong><br>
                <small style="color:gray;">Unit: R$ ${precoReal.toLocaleString()}</small>
            </div>
            <div style="flex:1; display:flex; gap:5px;">
                <input type="number" value="${item.qtd}" min="1" onchange="alterarQtd(${index}, this.value)" style="width:50px; padding:5px; border-radius:5px; border:1px solid #ccc;">
                <button onclick="removerDoCarrinho(${index})" style="background:none; border:none; color:red; cursor:pointer;">✖</button>
            </div>
            <div style="flex:1; text-align:right;">
                <strong style="color:#ff0000;">R$ ${subtotal.toLocaleString()}</strong>
            </div>
        </div>`;
    });
    document.getElementById('total-carrinho').innerText = `TOTAL: R$ ${totalGeral.toLocaleString()}`;
}

function alterarQtd(index, valor) { 
    if(valor < 1) valor = 1;
    carrinho[index].qtd = parseInt(valor); 
    renderizarCarrinhoCheckout(); 
}

function removerDoCarrinho(index) {
    carrinho.splice(index, 1);
    document.getElementById('cart-qtd').innerText = carrinho.reduce((acc, curr) => acc + curr.qtd, 0);
    if(carrinho.length === 0) voltarCatalogo();
    else renderizarCarrinhoCheckout();
}

// --- PEDIDOS E AVALIAÇÃO ---

function abrirMeusPedidos() {
    document.getElementById('tela-catalogo').classList.add('hidden');
    document.getElementById('tela-meus-pedidos').classList.remove('hidden');
    
    const todos = JSON.parse(localStorage.getItem('encomendas')) || [];
    const meus = todos.filter(e => e.cliente.passaporte === usuarioAtivo.passaporte);
    const container = document.getElementById('container-pedidos-cliente');
    
    container.innerHTML = meus.length ? "" : "<p style='color:gray; text-align:center;'>Você ainda não possui pedidos.</p>";
    
    meus.reverse().forEach((e) => {
        let statusColor = e.status === 'ACEITO' ? '#00ff7f' : (e.status === 'PRONTA' ? '#0000ff' : (e.status === 'ENTREGUE' ? '#00ccff' : '#ffcc00'));
        
        let btnConfirmar = (e.status === 'PRONTA' && !e.avaliacao) ? 
            `<button class="btn-confirmar-entrega" onclick="abrirAvaliacao(${e.id})" style="width:100%; padding:10px; background:green; color:white; border:none; border-radius:5px; margin-top:10px; cursor:pointer; font-weight:bold;">✅ CONFIRMAR RECEBIMENTO</button>` : '';
        
        let infoEntrega = e.status === 'PRONTA' ? `<div style="background:#f0f7ff; padding:10px; border-radius:5px; margin-top:10px; font-size:12px; border-left:4px solid blue;">📍 <b>RETIRADA:</b> ${e.local || 'A combinar'} | ⏰ ${e.horario || 'Agora'}</div>` : '';

        container.innerHTML += `
        <div class="pedido-card" style="background:#fff; border:1px solid #ddd; padding:15px; border-radius:10px; margin-bottom:15px;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <strong style="color:#111;">ORDEM #${e.id}</strong>
                <span style="background:${statusColor}; color:${e.status === 'PRONTA' ? '#fff' : '#000'}; padding:3px 8px; border-radius:5px; font-size:10px; font-weight:bold;">${e.status}</span>
            </div>
            <p style="font-size:13px; margin: 10px 0; color:#444;">${e.itens.map(i => i.qtd + 'x ' + i.nome).join(' | ')}</p>
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <span style="font-weight:bold; color:#ff0000;">${e.total}</span>
            </div>
            ${infoEntrega}
            ${btnConfirmar}
            ${e.avaliacao ? `<div style="margin-top:10px; font-size:12px; color:#666; font-style:italic;">⭐ Avaliação: ${e.avaliacao.estrelas}/5 - "${e.avaliacao.comentario}"</div>` : ''}
        </div>`;
    });
}

function abrirAvaliacao(pedidoId) {
    let estrelas = prompt("De 1 a 5 estrelas, como foi o atendimento?");
    if(estrelas === null) return;
    if(estrelas < 1 || estrelas > 5) return alert("⚠️ Digite um número de 1 a 5.");
    
    let comentario = prompt("Deixe um breve comentário:");
    if(comentario === null) comentario = "Sem comentários.";

    let encomendas = JSON.parse(localStorage.getItem('encomendas'));
    let index = encomendas.findIndex(e => e.id === pedidoId);
    
    if(index !== -1) {
        encomendas[index].avaliacao = { estrelas, comentario };
        encomendas[index].status = "ENTREGUE";
        localStorage.setItem('encomendas', JSON.stringify(encomendas));
        
        let feedbacks = JSON.parse(localStorage.getItem('feedbacks')) || [];
        feedbacks.push({ usuario: usuarioAtivo.nick, estrelas, texto: comentario });
        localStorage.setItem('feedbacks', JSON.stringify(feedbacks));

        alert("⭐ Obrigado! Sua avaliação ajuda o Egito a crescer.");
        abrirMeusPedidos();
    }
}

// --- WEBHOOK DISCORD ---

async function confirmarEncomenda() {
    if(carrinho.length === 0) return;
    
    const totalTxt = document.getElementById('total-carrinho').innerText;
    const pedidoId = Math.floor(Math.random() * 8999) + 1000;
    
    const novaEnc = { 
        id: pedidoId, 
        cliente: usuarioAtivo, 
        itens: [...carrinho], 
        status: "AGUARDANDO", 
        total: totalTxt 
    };
    
    let encomendas = JSON.parse(localStorage.getItem('encomendas')) || [];
    encomendas.push(novaEnc);
    localStorage.setItem('encomendas', JSON.stringify(encomendas));

    // Verificação de responsável caso o pedido tenha sido aceito (ex: via admin)
    const encomencaAtualizada = encomendas.find(e => e.id === pedidoId);
    const temResponsavel = encomencaAtualizada.responsavel;

    const embed = {
        title: "⚜️ NOVO CARREGAMENTO SOLICITADO ⚜️",
        description: `⚠️ **ALERTA DE PEDIDO** ⚠️\n<@&1284864780972326953> \n\n*Um novo cliente acaba de solicitar armamentos.*`,
        color: 16711680,
        thumbnail: { url: "https://cdn.discordapp.com/attachments/1284882367156195389/1482589013163376640/Egito3.png" },
        fields: [
            temResponsavel ? { 
                name: "🛠️ RESPONSÁVEL", 
                value: `**ATENDIMENTO:** ${temResponsavel.nick}\n**ID DO DC:** <@${temResponsavel.idDc}>\n**ACESSO:** ${usuarioAtivo.tipo.toUpperCase()}`, 
                inline: false 
            } : { name: "⏳ STATUS", value: "AGUARDANDO ATENDIMENTO", inline: false },
            { name: "👤 CIDADÃO", value: `\`${usuarioAtivo.nick}\` | ID: \`${usuarioAtivo.passaporte}\``, inline: true },
            { name: "📞 CONTATO", value: `TEL: ${usuarioAtivo.tel}\nDC: <@${usuarioAtivo.discord}>`, inline: true },
            { name: "📦 CARGA", value: "```" + carrinho.map(i => `➤ ${i.qtd}x ${i.nome}`).join('\n') + "```" },
            { name: "💰 VALOR", value: `💵 **${totalTxt}**`, inline: false }
        ],
        footer: { text: `EGITO NCRP | ID DO PEDIDO: #${pedidoId}` },
        timestamp: new Date()
    };

    try {
        await fetch(WEBHOOK_URL, { 
            method: 'POST', 
            headers: {'Content-Type': 'application/json'}, 
            body: JSON.stringify({ 
                content: `🔔 **NOVA ENCOMENDA REGISTRADA!** Cliente: <@${usuarioAtivo.discord}>`, 
                embeds: [embed] 
            }) 
        });
        alert("🚀 Sua encomenda foi enviada! Fique atento ao rádio/telefone.");
        carrinho = [];
        document.getElementById('cart-qtd').innerText = "0";
        voltarCatalogo(); 
    } catch (error) {
        console.error("Erro Webhook:", error);
        alert("⚠️ Ocorreu um erro ao enviar para o Discord, mas seu pedido foi salvo no histórico do site!");
        carrinho = [];
        voltarCatalogo();
    }
}

// --- UTILITÁRIOS ---

function acessoPainelAdm() { 
    const pass = prompt("🔐 ACESSO RESTRITO\nDigite a combinação de segurança:"); 
    if(pass === "Egitonc001") {
        window.location.href = "admin.html"; 
    } else if(pass !== null) {
        alert("❌ ACESSO NEGADO! As autoridades foram notificadas.");
    }
}

function voltarCatalogo() { 
    document.querySelectorAll('section').forEach(s => s.classList.add('hidden')); 
    document.getElementById('tela-catalogo').classList.remove('hidden'); 
}

// --- PLAYER DE MÚSICA ---
const musica = document.getElementById('bg-music');
const btnMusica = document.getElementById('btn-play-pause');

function toggleMusic() { 
    if (musica.paused) { 
        musica.play().catch(() => alert("Interaja com a página primeiro para tocar a música!"));
        btnMusica.innerText = "⏸️ PAUSE"; 
    } else { 
        musica.pause(); 
        btnMusica.innerText = "▶️ PLAY"; 
    } 
}

function ajustarVolume(valor) { 
    musica.volume = valor; 
}