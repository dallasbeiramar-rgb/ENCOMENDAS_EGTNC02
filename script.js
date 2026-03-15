const WEBHOOK_URL = "https://discord.com/api/webhooks/1482626269534355547/iGrd_rIIx3Q-UvgZprIr8HSA8fqN_SG4Qeag6aKAtV0eDBJ-bX2ZPh6i9z9zawCKDq5J";
let produtos = JSON.parse(localStorage.getItem('produtos')) || [];
let carrinho = [];
let usuarioAtivo = null;

function reconhecerUsuario() {
    const nick = document.getElementById('l-nick').value.toUpperCase();
    const banco = JSON.parse(localStorage.getItem('banco_usuarios')) || {};
    if (banco[nick]) {
        const u = banco[nick];
        document.getElementById('l-pass').value = u.passaporte;
        document.getElementById('l-discord').value = u.discord;
        document.getElementById('l-tel').value = u.tel;
        document.getElementById('l-tipo').value = u.tipo;
    }
}

function salvarConta() {
    const nick = document.getElementById('l-nick').value.toUpperCase();
    const dados = { nick, passaporte: document.getElementById('l-pass').value, discord: document.getElementById('l-discord').value, tel: document.getElementById('l-tel').value, tipo: document.getElementById('l-tipo').value };
    if(!nick || !dados.passaporte) return alert("Preencha os dados!");
    let banco = JSON.parse(localStorage.getItem('banco_usuarios')) || {};
    banco[nick] = dados;
    localStorage.setItem('banco_usuarios', JSON.stringify(banco));
    alert("Dados Salvos com Sucesso!");
}

function entrarNoSite() {
    const nick = document.getElementById('l-nick').value.toUpperCase();
    if(!nick || !document.getElementById('l-pass').value) return alert("Identifique-se primeiro!");
    usuarioAtivo = { nick, passaporte: document.getElementById('l-pass').value, tipo: document.getElementById('l-tipo').value, discord: document.getElementById('l-discord').value, tel: document.getElementById('l-tel').value };
    document.getElementById('tela-login').classList.add('hidden');
    document.getElementById('tela-catalogo').classList.remove('hidden');
    renderizarProdutos(produtos);
}

function renderizarProdutos(lista) {
    const grid = document.getElementById('grid-produtos');
    grid.innerHTML = "";
    lista.forEach((p, idx) => {
        let precoReal = usuarioAtivo.tipo === 'aliado' ? p.preco * 0.75 : p.preco;
        let cNome = p.cores ? p.cores.nome : '#333';
        let cValor = p.cores ? p.cores.valor : '#ff0000';
        let cDesc = p.cores ? p.cores.desc : '#888';
        let layoutClass = p.layout || 'padrao';

        grid.innerHTML += `
        <div class="card-produto card-layout-${layoutClass}" style="animation-delay: ${idx * 0.1}s">
            <div class="card-img-container">
                <img src="${p.img || 'https://via.placeholder.com/150'}">
            </div>
            <div class="card-info">
                <h3 style="color: ${cNome}">${p.nome}</h3>
                <p style="color: ${cValor}">R$ ${precoReal.toLocaleString()}</p>
                <small style="color: ${cDesc}; display:block; margin-bottom:10px;">${p.desc || ''}</small>
                <button class="btn-add" onclick="addCarrinho(${p.id})">🛒 ADICIONAR AO CARRINHO</button>
            </div>
        </div>`;
    });
}

function filtrarItens(termo) {
    const filtrados = produtos.filter(p => p.nome.toLowerCase().includes(termo.toLowerCase()));
    renderizarProdutos(filtrados);
}

function addCarrinho(id) {
    const p = produtos.find(item => item.id === id);
    const itemNoCarrinho = carrinho.find(item => item.id === id);
    if(itemNoCarrinho) { itemNoCarrinho.qtd++; } else { carrinho.push({...p, qtd: 1}); }
    document.getElementById('cart-qtd').innerText = carrinho.length;
}

function abrirCarrinho() {
    if(carrinho.length === 0) return alert("Seu carrinho está vazio!");
    document.getElementById('tela-catalogo').classList.add('hidden');
    document.getElementById('tela-carrinho').classList.remove('hidden');
    renderizarCarrinhoCheckout();
}

function renderizarCarrinhoCheckout() {
    const container = document.getElementById('lista-carrinho-check');
    container.innerHTML = ""; let totalGeral = 0;
    carrinho.forEach((item, index) => {
        let precoReal = usuarioAtivo.tipo === 'aliado' ? item.preco * 0.75 : item.preco;
        let subtotal = precoReal * item.qtd;
        totalGeral += subtotal;
        container.innerHTML += `
        <div class="cart-item-row">
            <span>${item.nome}</span>
            <input type="number" value="${item.qtd}" min="1" onchange="alterarQtd(${index}, this.value)">
            <strong>R$ ${subtotal.toLocaleString()}</strong>
        </div>`;
    });
    document.getElementById('total-carrinho').innerText = `TOTAL: R$ ${totalGeral.toLocaleString()}`;
}

function alterarQtd(index, valor) { carrinho[index].qtd = parseInt(valor); renderizarCarrinhoCheckout(); }

function abrirMeusPedidos() {
    document.getElementById('tela-catalogo').classList.add('hidden');
    document.getElementById('tela-meus-pedidos').classList.remove('hidden');
    const todos = JSON.parse(localStorage.getItem('encomendas')) || [];
    const meus = todos.filter(e => e.cliente.passaporte === usuarioAtivo.passaporte);
    const container = document.getElementById('container-pedidos-cliente');
    container.innerHTML = meus.length ? "" : "<p style='color:gray;'>Nenhum pedido realizado.</p>";
    
    meus.forEach((e) => {
        let statusColor = e.status === 'ACEITO' ? '#00ff7f' : (e.status === 'PRONTA' ? '#ffaa00' : (e.status === 'ENTREGUE' ? '#00ccff' : '#ff0000'));
        let btnConfirmar = (e.status === 'PRONTA' && !e.avaliacao) ? 
            `<button class="btn-confirmar-entrega" onclick="abrirAvaliacao(${e.id})">✅ CONFIRMAR ENTREGA & AVALIAR</button>` : '';
        let infoPronta = e.status === 'PRONTA' ? `<div class="pronta-box">📍 <b>LOCAL:</b> ${e.local} | ⏰ <b>HORA:</b> ${e.horario}</div>` : '';

        container.innerHTML += `
        <div class="pedido-card">
            <div style="display:flex; justify-content:space-between;">
                <strong>PEDIDO #${e.id}</strong>
                <span style="color:${statusColor}; font-weight:900; text-shadow: 0 0 5px rgba(0,0,0,0.1)">● ${e.status}</span>
            </div>
            <p style="font-size:13px; margin: 10px 0;">${e.itens.map(i => i.qtd + 'x ' + i.nome).join(' | ')}</p>
            ${e.prazo ? `<p style="font-size:11px; color: #666;">⏳ Prazo: ${e.prazo}</p>` : ''}
            ${infoPronta}
            ${btnConfirmar}
            ${e.avaliacao ? `<div class="voto-show" style="margin-top:10px; border-top:1px solid #eee; padding-top:5px;">⭐ Nota: ${e.avaliacao.estrelas}/5<br><small>"${e.avaliacao.comentario}"</small></div>` : ''}
        </div>`;
    });
}

function abrirAvaliacao(pedidoId) {
    let estrelas = prompt("De 1 a 5 estrelas, como avalia o atendimento do responsável?");
    if(estrelas < 1 || estrelas > 5) return alert("Por favor, digite um número de 1 a 5.");
    let comentario = prompt("Deixe um breve elogio ou comentário sobre sua entrega:");
    let encomendas = JSON.parse(localStorage.getItem('encomendas'));
    let index = encomendas.findIndex(e => e.id === pedidoId);
    encomendas[index].avaliacao = { estrelas, comentario };
    encomendas[index].status = "ENTREGUE";
    localStorage.setItem('encomendas', JSON.stringify(encomendas));
    alert("Entrega confirmada! Sua avaliação foi enviada ao Egito.");
    abrirMeusPedidos();
}

async function confirmarEncomenda() {
    const totalTxt = document.getElementById('total-carrinho').innerText;
    const novaEnc = { 
        id: Math.floor(Math.random() * 8999) + 1000, 
        cliente: usuarioAtivo, 
        itens: [...carrinho], 
        status: "AGUARDANDO", 
        responsavel: null, 
        total: totalTxt 
    };
    
    let encomendas = JSON.parse(localStorage.getItem('encomendas')) || [];
    encomendas.push(novaEnc);
    localStorage.setItem('encomendas', JSON.stringify(encomendas));

    const embed = {
        title: "⚜️ NOVO CARREGAMENTO SOLICITADO ⚜️",
        description: `⚠️ **ALERTA DE PEDIDO** ⚠️\n<@&1284864780972326953> \n\n*Um novo cliente acaba de solicitar armamentos.*`,
        color: 16711680,
        thumbnail: { url: "https://cdn.discordapp.com/attachments/1284882367156195389/1482589013163376640/Egito3.png" },
        fields: [
            { name: "👤 CIDADÃO", value: `\`${usuarioAtivo.nick}\` | ID: \`${usuarioAtivo.passaporte}\``, inline: true },
            { name: "📞 CONTATO", value: `TEL: ${usuarioAtivo.tel}\nDC: <@${usuarioAtivo.discord}>`, inline: true },
            { name: "📦 CARGA", value: "```" + carrinho.map(i => `➤ ${i.qtd}x ${i.nome}`).join('\n') + "```" },
            { name: "💰 VALOR", value: `💵 **${totalTxt}**`, inline: false }
        ],
        footer: { text: "EGITO NCRP - O Império no Topo" },
        timestamp: new Date()
    };

    try {
        await fetch(WEBHOOK_URL, { 
            method: 'POST', 
            headers: {'Content-Type': 'application/json'}, 
            body: JSON.stringify({ 
                content: `<@${usuarioAtivo.discord}> sua encomenda foi registrada!`, 
                embeds: [embed] 
            }) 
        });
        alert("Sua encomenda foi enviada com sucesso!");
        carrinho = [];
        document.getElementById('cart-qtd').innerText = "0";
        voltarCatalogo(); 
    } catch (error) {
        alert("Erro ao enviar para o Discord, mas seu pedido foi salvo no histórico!");
    }
}
function acessoPainelAdm() { const pass = prompt("Senha Administrativa:"); if(pass === "Egitonc001") window.location.href = "admin.html"; }
function voltarCatalogo() { document.querySelectorAll('section').forEach(s => s.classList.add('hidden')); document.getElementById('tela-catalogo').classList.remove('hidden'); }

const musica = document.getElementById('bg-music');
const btnMusica = document.getElementById('btn-play-pause');
function toggleMusic() { if (musica.paused) { musica.play(); btnMusica.innerText = "⏸️ PAUSE"; } else { musica.pause(); btnMusica.innerText = "▶️ PLAY"; } }
function ajustarVolume(valor) { musica.volume = valor; }