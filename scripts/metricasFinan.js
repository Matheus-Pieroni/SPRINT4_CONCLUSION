// scripts/metricasFinan.js - CORRIGIDO

async function carregDashboardFinanceiro() {
    try {
        console.log("📊 Carregando dashboard financeiro...");
        
        // Procura pelos pedidos
        const snapshotPed = await db.collection("pedidos").get();
        const pedidos = snapshotPed.docs.map(doc => doc.data());
        console.log("📦 Pedidos encontrados:", pedidos.length);

        // Procura pelos restaurantes
        const snapshotRes = await db.collection("restaurantes").get();
        const restaurantes = snapshotRes.docs.map(doc => doc.data());
        console.log("🏪 Restaurantes encontrados:", restaurantes.length);

        // E agora busca pelos usuários - ✅ CORRIGIDO
        const snapshotUsu = await db.collection("usuarios").get();
        const usuarios = snapshotUsu.docs.map(doc => doc.data()); // ✅ 'doc' definido
        console.log("👥 Usuários encontrados:", usuarios.length);

        // Calculo ou busca pelas métricas
        calculusMetricaFinan(pedidos, restaurantes, usuarios);
        gerarRankRestaus(restaurantes); // ✅ Função com nome correto

    } catch (error) {
        console.error("❌ Erro ao carregar dashboard:", error);
    }
}

// Atualizar dashboard quando pedidos forem criados
function setupDashboardAutoRefresh() {
    // Ouvir novos pedidos em tempo real
    db.collection("pedidos").onSnapshot((snapshot) => {
        console.log("🔄 Novo pedido detectado, atualizando dashboard...");
        carregDashboardFinanceiro();
    });
}

function calculusMetricaFinan(pedidos, restaurantes, usuarios) {
    // Calculando a receita total
    const retornoTotalApp = pedidos.reduce((sum, pedido) => sum + (pedido.taxaApp || 0), 0);
    document.getElementById('total-app-revenue').textContent = `R$ ${retornoTotalApp.toFixed(2)}`;

    // Total de pedidos
    document.getElementById('contagem-total-pedidos').textContent = pedidos.length;

    // Restaurantes ativos
    document.getElementById('restaurantes-ativos').textContent = restaurantes.length;
}

function gerarRankRestaus(restaurantes) {
    const restauranteContainer = document.getElementById('ranking-restaus');

    // ✅ ADICIONEI VALIDAÇÃO para campos undefined
    const restausOrdenados = [...restaurantes].sort((a, b) => 
        (b.Pedidos || 0) - (a.Pedidos || 0)
    );

    restauranteContainer.innerHTML = restausOrdenados.map((restaurante, index) => `
    <div class="ranking-item">
        <strong>${index + 1}. ${restaurante.Nome}</strong><br>
        📦 Pedidos: ${restaurante.Pedidos || 0} | 
        💰 Receita: R$ ${(restaurante.receitaTotal || 0).toFixed(2)} | 
        🏢 Taxa App: R$ ${(restaurante.taxaApp || 0).toFixed(2)}
    </div>
    `).join('');
}