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
        mostrarRelacaoClienteRestaurante(usuarios, restaurantes);
        gerarRankRestaus(restaurantes); // ✅ Função com nome correto
        // Atualizar gráfico de pizza com os dados de restaurantes
        if (typeof atualizarGraficoPizza !== 'undefined') {
            atualizarGraficoPizza(restaurantes);
        }

        if (typeof gerarArquivoRestaurantesPedidos === 'function') {
            try {
                await gerarArquivoRestaurantesPedidos(); // ✅ Agora salva localmente
            } catch (e) {
                console.error('Erro ao gerar dados de restaurantes:', e);
            }
        }

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
    <br><div class="ranking-item">
        <strong>${index + 1}. ${restaurante.Nome}</strong><br>
        📦 Pedidos: ${restaurante.Pedidos || 0} | 
        💰 Receita: R$ ${(restaurante.receitaTotal || 0).toFixed(2)} | 
        🏢 Taxa App: R$ ${(restaurante.taxaApp || 0).toFixed(2)}
    </div>
    `).join('');
}

// AQUI A FUN^ÇÃO NOVITA

function mostrarRelacaoClienteRestaurante(usuarios, restaurantes) {
    console.log("Gerando relação Cliente x Restaurante...");
    
    const container = document.getElementById('clients-preferences');
    if (!container) {
        console.error("Elemento 'clients-preferences' não encontrado!");
        return;
    }

    // Filtrar usuários que têm restaurante preferido
    const usuariosComPreferencia = usuarios.filter(usuario => 
        usuario['partner_choice'] && usuario['partner_choice'] !== 'Sem Restaurantes Preferenciais'
    );

    console.log("Usuários com preferência:", usuariosComPreferencia.length);

    if (usuariosComPreferencia.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 20px; background: #f8f9fa; border-radius: 8px;">
                <p>Nenhuma preferência de restaurante registrada ainda.</p>
                <p><small>Os clientes aparecerão aqui quando escolherem seus restaurantes preferidos.</small></p>
            </div>
        `;
        return;
    }

    // Agrupar por restaurante
    const prefPorRestaurante = {};
    usuariosComPreferencia.forEach(usuario => {
        const restaurante = usuario['partner_choice'];
        if (!prefPorRestaurante[restaurante]) {
            prefPorRestaurante[restaurante] = [];
        }
        prefPorRestaurante[restaurante].push(usuario);
    });

    // Ordenar restaurantes por número de preferências
    const restaurantesOrdem = Object.entries(prefPorRestaurante)
        .sort(([, clientesA], [, clientesB]) => clientesB.length - clientesA.length);

    let html = `
        <div style="display: grid; gap: 15px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <h4 style="margin: 0;">Preferências dos Clientes</h4>
                <span style="background: #b71c1c; color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px;">
                    ${usuariosComPreferencia.length} cliente${usuariosComPreferencia.length !== 1 ? 's' : ''}
                </span>
            </div>
    `;

    restaurantesOrdem.forEach(([restaurante, clientes], index) => {
        const porcentagem = ((clientes.length / usuariosComPreferencia.length) * 100).toFixed(1);
        
        html += `
            <div style="border: 1px solid #e0e0e0; border-radius: 8px; padding: 15px; background: white;">
                <div style="display: flex; justify-content: between; align-items: center; margin-bottom: 10px;">
                    <strong style="color: #b71c1c;">${index + 1}. ${restaurante}</strong>
                    <div style="width: 15px;"></div><span style="background: #4caf50; color: white; padding: 2px 8px; border-radius: 10px; font-size: 12px;">
                        <div style="width: 15px; height: "></div>${clientes.length} cliente${clientes.length !== 1 ? 's' : ''} (${porcentagem}%)
                    </span>
                </div>
                <div style="font-size: 14px; color: #666;">
                    <strong>Clientes:</strong> ${clientes.map(cliente => cliente.Nome || 'Nome não informado').join(', ')}
                </div>
            </div>
        `;
    });

    html += `</div>`;
    container.innerHTML = html;
}

async function sincronizarDadosRestaurantes() {
    try {
        console.log("🔄 Sincronizando dados dos restaurantes...");
        
        if (typeof syncManager !== 'undefined') {
            return await syncManager.sincronizarRestaurantes();
        } else {
            // Fallback: sincronização manual
            const snapshotRes = await db.collection("restaurantes").get();
            const restaurantes = snapshotRes.docs.map(doc => doc.data());
            
            const arr = restaurantes.map(r => ({
                Nome: r.Nome || "Nome não informado",
                Pedidos: r.Pedidos != null ? r.Pedidos : 0
            }));
            
            localStorage.setItem('restaurantes_pedidos', JSON.stringify(arr));
            
            window.dispatchEvent(new CustomEvent('dadosRestaurantesAtualizados', {
                detail: arr
            }));
            
            return arr;
        }
    } catch (err) {
        console.error("❌ Erro ao sincronizar dados:", err);
        return [];
    }
}

// 🔄 ATUALIZAR o carregDashboardFinanceiro:
async function carregDashboardFinanceiro() {
    try {
        console.log("📊 Carregando dashboard financeiro...");
        
        const [pedidosSnapshot, restaurantesSnapshot, usuariosSnapshot] = await Promise.all([
            db.collection("pedidos").get(),
            db.collection("restaurantes").get(),
            db.collection("usuarios").get()
        ]);

        const pedidos = pedidosSnapshot.docs.map(doc => doc.data());
        const restaurantes = restaurantesSnapshot.docs.map(doc => doc.data());
        const usuarios = usuariosSnapshot.docs.map(doc => doc.data());

        console.log("📦 Pedidos:", pedidos.length);
        console.log("🏪 Restaurantes:", restaurantes.length);
        console.log("👥 Usuários:", usuarios.length);

        // ✅ SEMPRE SINCRONIZAR OS DADOS
        await sincronizarDadosRestaurantes();

        // ... resto do código existente
        calculusMetricaFinan(pedidos, restaurantes, usuarios);
        mostrarRelacaoClienteRestaurante(usuarios, restaurantes);
        gerarRankRestaus(restaurantes);
        
        if (typeof atualizarGraficoPizza !== 'undefined') {
            atualizarGraficoPizza(restaurantes);
        }

    } catch (error) {
        console.error("❌ Erro ao carregar dashboard:", error);
    }
}
async function forcarAtualizacaoJSON() {
    try {
        console.log("🚨 FORÇANDO ATUALIZAÇÃO DO JSON/LOCALSTORAGE...");
        
        // Buscar dados FRESCOS do Firestore
        const snapshotRes = await db.collection("restaurantes").get();
        const restaurantes = snapshotRes.docs.map(doc => {
            const data = doc.data();
            return {
                Nome: data.Nome || "Nome não informado",
                Pedidos: data.Pedidos != null ? data.Pedidos : 0
            };
        });

        // Salvar NO LOCALSTORAGE
        localStorage.setItem('restaurantes_pedidos', JSON.stringify(restaurantes));
        
        console.log("✅ JSON ATUALIZADO! Dados:", restaurantes);
        
        // Disparar evento para o gráfico
        window.dispatchEvent(new CustomEvent('dadosRestaurantesAtualizados', {
            detail: restaurantes
        }));

        return restaurantes;
        
    } catch (error) {
        console.error("❌ ERRO na atualização forçada:", error);
    }
}