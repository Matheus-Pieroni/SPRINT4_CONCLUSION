// scripts/geradorDadosTeste.js - VERSÃO CORRIGIDA E ALINHADA

class GeradorDadosTeste {
    constructor() {
        this.nomes = [
            'Ana Silva', 'Carlos Santos', 'Marina Oliveira', 'Ricardo Lima', 'Fernanda Costa',
            'Bruno Pereira', 'Juliana Almeida', 'Lucas Rodrigues', 'Patrícia Souza', 'Roberto Ferreira',
            'Amanda Martins', 'Diego Barbosa', 'Cristina Nunes', 'Felipe Castro', 'Vanessa Rocha',
            'Gabriel Cardoso', 'Larissa Dias', 'Rodrigo Mendes', 'Tatiane Araujo', 'Marcos Pinto'
        ];

        // 🏪 RESTAURANTES OFICIAIS DO APP (10 EMPRESAS)
        this.restaurantes = [
            'McDonalds', 'BurgerKing', 'SodieDoces', 'CacauShow', 'PizzaHut',
            'Dominos', 'Gendai', 'ChinaInBox', 'Habibs', 'Ragazzo'
        ];

        // 🍕 CATEGORIAS OFICIAIS DO APP
        this.categorias = {
            'Lanche': ['McDonalds', 'BurgerKing'],
            'Doces': ['SodieDoces', 'CacauShow'],
            'Pizza': ['PizzaHut', 'Dominos'],
            'Japonesa': ['Gendai', 'ChinaInBox'],
            'Salgados': ['Habibs', 'Ragazzo']
        };

        this.provedoresEmail = ['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com', 'icloud.com'];
    }

    // Gerar email a partir do nome
    gerarEmail(nome) {
        const nomeFormatado = nome.toLowerCase().replace(/\s+/g, '.');
        const provedor = this.provedoresEmail[Math.floor(Math.random() * this.provedoresEmail.length)];
        return `${nomeFormatado}@${provedor}`;
    }

    // Gerar data de assinatura aleatória (últimos 24 meses)
    gerarDataAssinatura() {
        const data = new Date();
        const mesesAtras = Math.floor(Math.random() * 24) + 1; // 1 a 24 meses atrás
        data.setMonth(data.getMonth() - mesesAtras);
        return firebase.firestore.Timestamp.fromDate(data);
    }

    // 🔥 NOVO: Gerar comida preferida ALINHADA com os restaurantes disponíveis
    gerarComidaPreferida() {
        const categorias = Object.keys(this.categorias);
        return categorias[Math.floor(Math.random() * categorias.length)];
    }

    // 🔥 NOVO: Gerar restaurante preferido baseado na comida preferida
    gerarRestaurantePreferido(comidaPreferida) {
        const restaurantesDaCategoria = this.categorias[comidaPreferida];
        return restaurantesDaCategoria[Math.floor(Math.random() * restaurantesDaCategoria.length)];
    }

    // Gerar um cliente fictício ALINHADO
    gerarCliente() {
        const nome = this.nomes[Math.floor(Math.random() * this.nomes.length)];
        const email = this.gerarEmail(nome);
        const comidPref = this.gerarComidaPreferida(); // ✅ Agora alinhado
        const partner_choice = this.gerarRestaurantePreferido(comidPref); // ✅ Agora coerente
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

    // Gerar um pedido fictício ALINHADO
    gerarPedido(clientes) {
        const cliente = clientes[Math.floor(Math.random() * clientes.length)];
        
        // ✅ Garantir que o pedido seja em um restaurante da categoria preferida do cliente
        const restaurantesCompativeis = this.categorias[cliente.comidPref] || this.restaurantes;
        const restaurante = restaurantesCompativeis[Math.floor(Math.random() * restaurantesCompativeis.length)];
        
        const valor = parseFloat((Math.random() * 50 + 15).toFixed(2)); // R$ 15 a R$ 65
        const taxaApp = parseFloat((valor * 0.15).toFixed(2));
        
        // Data aleatória nos últimos 30 dias
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

    // Gerar múltiplos clientes
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

    // Gerar múltiplos pedidos ALINHADOS
    async gerarPedidos(quantidade = 50, clientes) {
        console.log(`📦 Gerando ${quantidade} pedidos de teste ALINHADOS...`);
        
        const batch = db.batch();

        for (let i = 0; i < quantidade; i++) {
            const pedido = this.gerarPedido(clientes);
            const pedidoRef = db.collection("pedidos").doc();
            batch.set(pedidoRef, pedido);
        }

        try {
            await batch.commit();
            console.log(`✅ ${quantidade} pedidos ALINHADOS gerados com sucesso!`);
        } catch (error) {
            console.error("❌ Erro ao gerar pedidos:", error);
            throw error;
        }
    }

    // 🔥 NOVO: Estatísticas de compatibilidade
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

    // Atualizar estatísticas dos restaurantes baseado nos pedidos gerados
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
                batch.update(restauranteRef, {
                    Pedidos: totalPedidos,
                    receitaTotal: receitaTotal,
                    taxaApp: taxaAppTotal
                });

                console.log(`🏪 ${nomeRestaurante}: ${totalPedidos} pedidos, R$ ${receitaTotal.toFixed(2)} receita`);
            }

            await batch.commit();
            console.log("✅ Estatísticas dos restaurantes atualizadas!");
        } catch (error) {
            console.error("❌ Erro ao atualizar estatísticas:", error);
        }
    }

    // 🔥 NOVO: Dashboard de categorias
    async gerarDashboardCategorias() {
        console.log("📈 Gerando dashboard de categorias...");
        
        try {
            const [clientesSnapshot, pedidosSnapshot] = await Promise.all([
                db.collection("usuarios").get(),
                db.collection("pedidos").get()
            ]);

            const clientes = clientesSnapshot.docs.map(doc => doc.data());
            const pedidos = pedidosSnapshot.docs.map(doc => doc.data());

            // Estatísticas por categoria
            const statsCategorias = {};
            Object.keys(this.categorias).forEach(categoria => {
                statsCategorias[categoria] = {
                    clientes: 0,
                    pedidos: 0,
                    receita: 0,
                    restaurantes: this.categorias[categoria]
                };
            });

            // Contar clientes por categoria
            clientes.forEach(cliente => {
                if (statsCategorias[cliente.comidPref]) {
                    statsCategorias[cliente.comidPref].clientes++;
                }
            });

            // Contar pedidos e receita por categoria
            pedidos.forEach(pedido => {
                // Encontrar a categoria do restaurante
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

    // Função principal para gerar dados completos ALINHADOS
    async gerarDadosCompletos(quantidadeClientes = 20, quantidadePedidos = 50) {
        console.log("🎮 INICIANDO GERAÇÃO DE DADOS DE TESTE ALINHADOS...");
        
        try {
            // 1. Gerar clientes ALINHADOS
            const clientes = await this.gerarClientes(quantidadeClientes);
            
            // 2. Gerar pedidos ALINHADOS
            await this.gerarPedidos(quantidadePedidos, clientes);
            
            // 3. Atualizar estatísticas
            await this.atualizarEstatisticasRestaurantes();
            
            // 4. Verificar compatibilidade
            const compatibilidade = await this.verificarCompatibilidadeDados();
            
            // 5. Gerar dashboard de categorias
            const dashboardCategorias = await this.gerarDashboardCategorias();
            
            // 6. Recarregar dashboard se estiver aberto
            if (typeof carregDashboardFinanceiro !== 'undefined') {
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
            
            alert(mensagem);
            
        } catch (error) {
            alert("❌ Erro ao gerar dados de teste: " + error.message);
        }
    }

    // Limpar todos os dados de teste
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

// Funções globais para acesso via HTML
async function gerarDadosTeste() {
    await geradorDados.gerarDadosCompletos(20, 50);
}

async function limparDadosTeste() {
    await geradorDados.limparDadosTeste();
}