async function aceitarPedido(pedidoId) {
    let encomendas = JSON.parse(localStorage.getItem('encomendas')) || [];
    let index = encomendas.findIndex(e => e.id === pedidoId);
    
    if (index !== -1) {
        // 1. Atualiza o status no localStorage
        encomendas[index].status = "ACEITO";
        localStorage.setItem('encomendas', JSON.stringify(encomendas));

        // 2. Envia notificação de atualização para o Discord
        const webhookUrl = "https://discord.com/api/webhooks/1482626269534355547/iGrd_rIIx3Q-UvgZprIr8HSA8fqN_SG4Qeag6aKAtV0eDBJ-bX2ZPh6i9z9zawCKDq5J";
        
        await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                content: `✅ **PEDIDO ATUALIZADO**\nO pedido **#${pedidoId}** foi aceito e está em processamento!`
            })
        });

        alert("✅ Pedido aceito e Discord notificado!");
        location.reload(); // Recarrega a tela de admin para atualizar a lista
    }
}