// scripts/geradorDadosGen.js - VERSÃO COMPLETAMENTE CORRIGIDA

class GeradorDadosTeste {
    constructor() {
        this.nomes = [
            'Ana Silva', 'Carlos Santos', 'Marina Oliveira', 'Ricardo Lima', 'Fernanda Costa',
            'Bruno Pereira', 'Juliana Almeida', 'Lucas Rodrigues', 'Patrícia Souza', 'Roberto Ferreira',
            'Amanda Martins', 'Diego Barbosa', 'Cristina Nunes', 'Felipe Castro', 'Vanessa Rocha',
            'Gabriel Cardoso', 'Larissa Dias', 'Rodrigo Mendes', 'Tatiane Araujo', 'Marcos Pinto'
        ];

        this.restaurantes = [
            'McDonalds', 'BurgerKing', 'SodieDoces', 'CacauShow', 'PizzaHut',
            'Dominos', 'Gendai', 'ChinaInBox', 'Habibs', 'Ragazzo'
        ];

        this.categorias = {
            'Lanche': ['McDonalds', 'BurgerKing'],
            'Doces': ['SodieDoces', 'CacauShow'],
            'Pizza': ['PizzaHut', 'Dominos'],
            'Japonesa': ['Gendai', 'ChinaInBox'],
            'Salgados': ['Habibs', 'Ragazzo']
        };

        this.provedoresEmail = ['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com', 'icloud.com'];
    }

    gerarEmail(nome) {
        const nomeFormatado = nome.toLowerCase().replace(/\s+/g, '.');
        const provedor = this.provedoresEmail[Math.floor(Math.random() * this.provedoresEmail.length)];
        return `${nomeFormatado}@${provedor}`;
    }

    gerarDataAssinatura() {
        const data = new Date();
        const mesesAtras = Math.floor(Math.random() * 24) + 1;
        data.setMonth(data.getMonth() - mesesAtras);
        return firebase.firestore.Timestamp.fromDate(data);
    }

    gerarComidaPreferida() {
        const categorias = Object.keys(this.categorias);
        return categorias[Math.floor(Math.random() * categorias.length)];
    }

    gerarRestaurantePreferido(comidaPreferida) {
        const restaurantesDaCategoria = this.categorias[comidaPreferida];
        return restaurantesDaCategoria[Math.floor(Math.random() * restaurantesDaCategoria.length)];
    }

    gerarCliente() {
        const nome = this.nomes[Math.floor(Math.random() * this.nomes.length)];
        const email = this.gerarEmail(nome);
        const comidPref = this.gerarComidaPreferida();
        const partner_choice = this.gerarRestaurantePreferido(comidPref);
        const dataAssinatura = this.gerarDataAssinatura();

        console.log(`👤 Cliente gerado: ${nome} | Prefere: ${comidPref} | Restaurante: ${partner_choice}`);

        return {
            Nome: nome,
            Email: email,
            comidPref: comidPref,
            partner_choice: partner_choice,
            dataAssinatura: dataAssinatura,
            photoUrl: ''
        };
    }

    async gerarPedido(clientes) {
        if (!clientes || !Array.isArray(clientes) || clientes.length === 0) {
            console.warn("⚠️ Array de clientes vazio ou inválido, carregando do Firestore...");
            
            try {
                const clientesSnapshot = await db.collection("usuarios").get();
                clientes = clientesSnapshot.docs.map(doc => doc.data());
                
                if (!clientes || clientes.length === 0) {
                    console.error("❌ ERRO CRÍTICO: Nenhum cliente encontrado no Firestore!");
                    throw new Error("Nenhum cliente disponível para gerar pedidos");
                }
                
                console.log(`✅ Carregados ${clientes.length} clientes do Firestore`);
            } catch (error) {
                console.error("❌ Erro ao carregar clientes:", error);
                throw error;
            }
        }
        
        const cliente = clientes[Math.floor(Math.random() * clientes.length)];
        const restaurantesCompativeis = this.categorias[cliente.comidPref] || this.restaurantes;
        const restaurante = restaurantesCompativeis[Math.floor(Math.random() * restaurantesCompativeis.length)];
        
        const valor = parseFloat((Math.random() * 50 + 15).toFixed(2));
        const taxaApp = parseFloat((valor * 0.15).toFixed(2));
        
        const data = new Date();
        const diasAtras = Math.floor(Math.random() * 30);
        data.setDate(data.getDate() - diasAtras);

        console.log(`📦 Pedido gerado: ${cliente.Nome} | ${restaurante} | R$ ${valor.toFixed(2)}`);

        return {
            valor: valor,
            restaurante: restaurante,
            cliente: cliente.Email,
            nomeCliente: cliente.Nome,
            data: firebase.firestore.Timestamp.fromDate(data),
            taxaApp: taxaApp,
            status: "concluido"
        };
    }

    async gerarClientes(quantidade = 20) {
        console.log(`👥 Gerando ${quantidade} clientes de teste ALINHADOS...`);
        
        const batch = db.batch();
        const clientesGerados = [];

        for (let i = 0; i < quantidade; i++) {
            const cliente = this.gerarCliente();
            clientesGerados.push(cliente);
            
            const clienteRef = db.collection("usuarios").doc(cliente.Email);
            batch.set(clienteRef, cliente);
        }

        try {
            await batch.commit();
            console.log(`✅ ${quantidade} clientes ALINHADOS gerados com sucesso!`);
            return clientesGerados;
        } catch (error) {
            console.error("❌ Erro ao gerar clientes:", error);
            throw error;
        }
    }

    async gerarPedidos(quantidade = 50, clientes) {
        console.log(`📦 Gerando ${quantidade} pedidos de teste ALINHADOS...`);
        
        if (!clientes) {
            console.log("🔍 Clientes não fornecidos, carregando do Firestore...");
            try {
                const clientesSnapshot = await db.collection("usuarios").get();
                clientes = clientesSnapshot.docs.map(doc => doc.data());
                console.log(`✅ Carregados ${clientes.length} clientes do Firestore`);
            } catch (error) {
                console.error("❌ Erro ao carregar clientes:", error);
                throw error;
            }
        }

        if (!clientes || clientes.length === 0) {
            throw new Error("Não há clientes disponíveis para gerar pedidos. Gere clientes primeiro.");
        }
        
        const batch = db.batch();
        const pedidosGerados = [];

        for (let i = 0; i < quantidade; i++) {
            try {
                const pedido = await this.gerarPedido(clientes);
                const pedidoRef = db.collection("pedidos").doc();
                batch.set(pedidoRef, pedido);
                pedidosGerados.push(pedido);
            } catch (error) {
                console.error(`❌ Erro ao gerar pedido ${i + 1}:`, error);
            }
        }

        try {
            await batch.commit();
            console.log(`✅ ${pedidosGerados.length} pedidos ALINHADOS gerados com sucesso!`);
            
            // 🔥🔥🔥 ATUALIZAR JSON/LOCALSTORAGE APÓS GERAR PEDIDOS
            await this.forcarSincronizacao();
            
            return pedidosGerados;
        } catch (error) {
            console.error("❌ Erro ao salvar pedidos no Firestore:", error);
            throw error;
        }
    }

    async verificarCompatibilidadeDados() {
        console.log("🔍 Verificando compatibilidade dos dados...");
        
        try {
            const [clientesSnapshot, pedidosSnapshot] = await Promise.all([
                db.collection("usuarios").get(),
                db.collection("pedidos").get()
            ]);

            const clientes = clientesSnapshot.docs.map(doc => doc.data());
            const pedidos = pedidosSnapshot.docs.map(doc => doc.data());

            let pedidosCompativeis = 0;
            let pedidosIncompativeis = 0;

            pedidos.forEach(pedido => {
                const cliente = clientes.find(c => c.Email === pedido.cliente);
                if (cliente) {
                    const restaurantesCompativeis = this.categorias[cliente.comidPref] || [];
                    if (restaurantesCompativeis.includes(pedido.restaurante)) {
                        pedidosCompativeis++;
                    } else {
                        pedidosIncompativeis++;
                    }
                }
            });

            console.log(`📊 Compatibilidade: ${pedidosCompativeis} compatíveis, ${pedidosIncompativeis} incompatíveis`);
            return { pedidosCompativeis, pedidosIncompativeis };
        } catch (error) {
            console.error("Erro ao verificar compatibilidade:", error);
            return { pedidosCompativeis: 0, pedidosIncompativeis: 0 };
        }
    }

    async atualizarEstatisticasRestaurantes() {
        console.log("📊 Atualizando estatísticas dos restaurantes...");
        
        try {
            const snapshotPedidos = await db.collection("pedidos").get();
            const pedidos = snapshotPedidos.docs.map(doc => doc.data());

            const pedidosPorRestaurante = {};
            pedidos.forEach(pedido => {
                if (!pedidosPorRestaurante[pedido.restaurante]) {
                    pedidosPorRestaurante[pedido.restaurante] = [];
                }
                pedidosPorRestaurante[pedido.restaurante].push(pedido);
            });

            const batch = db.batch();
            
            for (const [nomeRestaurante, pedidosRestaurante] of Object.entries(pedidosPorRestaurante)) {
                const totalPedidos = pedidosRestaurante.length;
                const receitaTotal = pedidosRestaurante.reduce((sum, pedido) => sum + pedido.valor, 0);
                const taxaAppTotal = pedidosRestaurante.reduce((sum, pedido) => sum + pedido.taxaApp, 0);

                const restauranteRef = db.collection("restaurantes").doc(nomeRestaurante);
                
                const doc = await restauranteRef.get();
                if (doc.exists) {
                    batch.update(restauranteRef, {
                        Pedidos: totalPedidos,
                        receitaTotal: receitaTotal,
                        taxaApp: taxaAppTotal
                    });
                } else {
                    console.warn(`⚠️ Documento não existe: ${nomeRestaurante}. Criando...`);
                    batch.set(restauranteRef, {
                        Nome: nomeRestaurante,
                        Pedidos: totalPedidos,
                        receitaTotal: receitaTotal,
                        taxaApp: taxaAppTotal
                    });
                }

                console.log(`🏪 ${nomeRestaurante}: ${totalPedidos} pedidos, R$ ${receitaTotal.toFixed(2)} receita`);
            }

            await batch.commit();
            console.log("✅ Estatísticas dos restaurantes atualizadas!");
        } catch (error) {
            console.error("❌ Erro ao atualizar estatísticas:", error);
        }
    }

    async gerarDashboardCategorias() {
        console.log("📈 Gerando dashboard de categorias...");
        
        try {
            const [clientesSnapshot, pedidosSnapshot] = await Promise.all([
                db.collection("usuarios").get(),
                db.collection("pedidos").get()
            ]);

            const clientes = clientesSnapshot.docs.map(doc => doc.data());
            const pedidos = pedidosSnapshot.docs.map(doc => doc.data());

            const statsCategorias = {};
            Object.keys(this.categorias).forEach(categoria => {
                statsCategorias[categoria] = {
                    clientes: 0,
                    pedidos: 0,
                    receita: 0,
                    restaurantes: this.categorias[categoria]
                };
            });

            clientes.forEach(cliente => {
                if (statsCategorias[cliente.comidPref]) {
                    statsCategorias[cliente.comidPref].clientes++;
                }
            });

            pedidos.forEach(pedido => {
                for (const [categoria, restaurantes] of Object.entries(this.categorias)) {
                    if (restaurantes.includes(pedido.restaurante)) {
                        statsCategorias[categoria].pedidos++;
                        statsCategorias[categoria].receita += pedido.valor;
                        break;
                    }
                }
            });

            console.log("📊 Estatísticas por categoria:", statsCategorias);
            return statsCategorias;
        } catch (error) {
            console.error("Erro ao gerar dashboard categorias:", error);
            return {};
        }
    }

    // 🔥🔥🔥 FUNÇÃO CORRIGIDA - AGORA DENTRO DA CLASSE
    async forcarSincronizacao() {
        console.log("🔁 Forçando sincronização de dados...");
        
        try {
            // 1. Atualizar estatísticas primeiro
            await this.atualizarEstatisticasRestaurantes();
            
            // 2. Buscar dados ATUALIZADOS do Firestore
            const snapshotRes = await db.collection("restaurantes").get();
            const restaurantes = snapshotRes.docs.map(doc => doc.data());
            
            // 3. Formatar dados para JSON
            const arr = restaurantes.map(r => ({
                Nome: r.Nome || "Nome não informado",
                Pedidos: r.Pedidos != null ? r.Pedidos : 0
            }));
            
            // 4. SALVAR NO LOCALSTORAGE (nosso "arquivo .json")
            localStorage.setItem('restaurantes_pedidos', JSON.stringify(arr));
            
            // 5. Disparar evento para atualizar gráficos
            window.dispatchEvent(new CustomEvent('dadosRestaurantesAtualizados', {
                detail: arr
            }));
            
            console.log("✅ JSON/LOCALSTORAGE ATUALIZADO! Dados:", arr);
            
        } catch (error) {
            console.error("❌ Erro na sincronização forçada:", error);
        }
    }

    async gerarDadosCompletos(quantidadeClientes = 20, quantidadePedidos = 50) {
        console.log("🎮 INICIANDO GERAÇÃO DE DADOS DE TESTE ALINHADOS...");
        
        try {
            // 1. Gerar clientes ALINHADOS
            console.log(`👥 Passo 1: Gerando ${quantidadeClientes} clientes...`);
            const clientes = await this.gerarClientes(quantidadeClientes);
            
            // 2. Gerar pedidos ALINHADOS
            console.log(`📦 Passo 2: Gerando ${quantidadePedidos} pedidos...`);
            await this.gerarPedidos(quantidadePedidos, clientes);
            
            // 3. 🔥 FORÇAR SINCRONIZAÇÃO IMEDIATA
            console.log("🔁 Passo 3: Sincronizando dados...");
            await this.forcarSincronizacao();
            
            // 4. Verificar compatibilidade
            console.log("🔍 Passo 4: Verificando compatibilidade...");
            const compatibilidade = await this.verificarCompatibilidadeDados();
            
            // 5. Gerar dashboard de categorias
            console.log("📈 Passo 5: Gerando dashboard...");
            const dashboardCategorias = await this.gerarDashboardCategorias();
            
            // 6. Recarregar dashboard
            if (typeof carregDashboardFinanceiro !== 'undefined') {
                console.log("🔄 Recarregando dashboard...");
                carregDashboardFinanceiro();
            }

            const mensagem = `
🎉 Dados de teste ALINHADOS gerados com sucesso!

✅ ${quantidadeClientes} clientes
✅ ${quantidadePedidos} pedidos  
✅ ${compatibilidade.pedidosCompativeis} pedidos compatíveis
✅ Estatísticas atualizadas

📊 Categorias:
${Object.entries(dashboardCategorias).map(([categoria, stats]) => 
    `• ${categoria}: ${stats.clientes} clientes, ${stats.pedidos} pedidos`
).join('\n')}
            `;
            
            console.log(mensagem);
            alert(mensagem);
            
        } catch (error) {
            console.error("❌ Erro ao gerar dados completos:", error);
            alert("❌ Erro ao gerar dados de teste: " + error.message);
        }
    }

    async limparDadosTeste() {
        if (!confirm('🚨 ATENÇÃO: Isso irá apagar TODOS os clientes e pedidos. Tem certeza?')) {
            return;
        }

        console.log("🧹 Limpando dados de teste...");

        try {
            // Limpar pedidos
            const snapshotPedidos = await db.collection("pedidos").get();
            const batchPedidos = db.batch();
            snapshotPedidos.docs.forEach(doc => {
                batchPedidos.delete(doc.ref);
            });
            await batchPedidos.commit();

            // Limpar clientes (usuarios)
            const snapshotUsuarios = await db.collection("usuarios").get();
            const batchUsuarios = db.batch();
            snapshotUsuarios.docs.forEach(doc => {
                batchUsuarios.delete(doc.ref);
            });
            await batchUsuarios.commit();

            // Resetar estatísticas dos restaurantes
            const snapshotRestaurantes = await db.collection("restaurantes").get();
            const batchRestaurantes = db.batch();
            snapshotRestaurantes.docs.forEach(doc => {
                batchRestaurantes.update(doc.ref, {
                    Pedidos: 0,
                    receitaTotal: 0,
                    taxaApp: 0
                });
            });
            await batchRestaurantes.commit();

            console.log("✅ Dados de teste limpos com sucesso!");
            alert("✅ Todos os dados de teste foram removidos!");

            // 🔥 ATUALIZAR JSON APÓS LIMPAR
            await this.forcarSincronizacao();

            if (typeof carregDashboardFinanceiro !== 'undefined') {
                carregDashboardFinanceiro();
            }

        } catch (error) {
            console.error("❌ Erro ao limpar dados:", error);
            alert("Erro ao limpar dados: " + error.message);
        }
    }
}

// Instância global do gerador
const geradorDados = new GeradorDadosTeste();

// ✅ FUNÇÕES GLOBAIS CORRIGIDAS

async function gerarDadosTeste() {
    try {
        await geradorDados.gerarDadosCompletos(20, 50);
    } catch (error) {
        console.error("❌ Erro na função gerarDadosTeste:", error);
        alert("❌ Erro ao gerar dados: " + error.message);
    }
}

async function gerarApenasPedidos(quantidade = 10) {
    try {
        console.log(`📦 Gerando ${quantidade} pedidos...`);
        await geradorDados.gerarPedidos(quantidade);
        alert(`✅ ${quantidade} pedidos gerados com sucesso!`);
        
        // Atualizar dashboard
        if (typeof carregDashboardFinanceiro !== 'undefined') {
            carregDashboardFinanceiro();
        }
    } catch (error) {
        console.error("❌ Erro ao gerar pedidos:", error);
        alert("❌ Erro ao gerar pedidos: " + error.message);
    }
}

async function gerarApenasClientes(quantidade = 10) {
    try {
        console.log(`👥 Gerando ${quantidade} clientes...`);
        await geradorDados.gerarClientes(quantidade);
        alert(`✅ ${quantidade} clientes gerados com sucesso!`);
    } catch (error) {
        console.error("❌ Erro ao gerar clientes:", error);
        alert("❌ Erro ao gerar clientes: " + error.message);
    }
}

async function limparDadosTeste() {
    await geradorDados.limparDadosTeste();
}

async function atualizarEstatisticas() {
    try {
        console.log("📊 Atualizando estatísticas com transição...");
        
        const container = document.getElementById('estatisticas-atuais');
        if (container) {
            container.classList.add('pulse-loading');
        }

        const [clientesSnapshot, pedidosSnapshot, restaurantesSnapshot] = await Promise.all([
            db.collection("usuarios").get(),
            db.collection("pedidos").get(),
            db.collection("restaurantes").get()
        ]);

        const estatisticas = {
            totalClientes: clientesSnapshot.size,
            totalPedidos: pedidosSnapshot.size,
            totalRestaurantes: restaurantesSnapshot.size,
            receitaTotal: pedidosSnapshot.docs.reduce((sum, doc) => sum + (doc.data().taxaApp || 0), 0)
        };

        if (container) {
            container.innerHTML = `
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px;">
                    <div class="metric-card" style="text-align: center; padding: 15px; background: linear-gradient(135deg, #b71c1c, #d32f2f); color: white; border-radius: 8px;">
                        <strong>👥 Clientes</strong><br>
                        <span style="font-size: 24px; font-weight: bold;">${estatisticas.totalClientes}</span>
                    </div>
                    <div class="metric-card" style="text-align: center; padding: 15px; background: linear-gradient(135deg, #1976d2, #42a5f5); color: white; border-radius: 8px;">
                        <strong>📦 Pedidos</strong><br>
                        <span style="font-size: 24px; font-weight: bold;">${estatisticas.totalPedidos}</span>
                    </div>
                    <div class="metric-card" style="text-align: center; padding: 15px; background: linear-gradient(135deg, #388e3c, #66bb6a); color: white; border-radius: 8px;">
                        <strong>🏪 Restaurantes</strong><br>
                        <span style="font-size: 24px; font-weight: bold;">${estatisticas.totalRestaurantes}</span>
                    </div>
                    <div class="metric-card" style="text-align: center; padding: 15px; background: linear-gradient(135deg, #f57c00, #ffb74d); color: white; border-radius: 8px;">
                        <strong>💰 Receita</strong><br>
                        <span style="font-size: 20px; font-weight: bold;">R$ ${estatisticas.receitaTotal.toFixed(2)}</span>
                    </div>
                </div>
            `;
            
            setTimeout(() => {
                container.classList.remove('pulse-loading');
                container.classList.add('fade-in');
            }, 300);
        }
    } catch (error) {
        console.error("❌ Erro ao carregar estatísticas:", error);
        const container = document.getElementById('estatisticas-atuais');
        if (container) {
            container.innerHTML = '<p>Erro ao carregar estatísticas</p>';
            container.classList.remove('pulse-loading');
        }
    }
}