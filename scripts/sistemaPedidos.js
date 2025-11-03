// scripts/sistemaPedidos.js - VERSÃO CORRIGIDA
const TAXA_FIXA = 0.15;

// Função para criar um novo pedido - CORRIGIDA
async function createOrder(restaurante, valor, clienteEmail) {
    console.log("🎯 createOrder chamada com:", { restaurante, valor, clienteEmail });
    
    // VALIDAÇÃO CRÍTICA
    if (!valor || isNaN(valor) || valor <= 0) {
        console.error("❌ Valor inválido:", valor);
        alert("Erro: Valor do pedido deve ser um número maior que zero!");
        return false;
    }

    const taxaApp = valor * TAXA_FIXA;
    
    // OBJETO CORRETO - usar 'valor' em português
    const orderData = {
        valor: Number(valor), // ✅ CORRIGIDO: 'valor' em vez de 'value'
        restaurante: restaurante,
        cliente: clienteEmail,
        data: firebase.firestore.FieldValue.serverTimestamp(),
        taxaApp: Number(taxaApp.toFixed(2)),
        status: "concluido"
    };

    console.log("📦 Dados do pedido:", orderData);

    try {
        // 1. Adicionar pedido na collection
        await db.collection("pedidos").add(orderData);
        
        // 2. Atualizar estatísticas do restaurante - ✅ CORRIGIDO
        await updateRestaurantes(restaurante, valor, taxaApp);
        
        console.log("✅ Pedido criado com sucesso!");
        alert("✅ Pedido criado com sucesso!");
        return true;
    } catch (error) {
        console.error("❌ Erro ao criar pedido:", error);
        alert("Erro ao criar pedido: " + error.message);
        return false;
    }
}

// ✅ FUNÇÃO DE ATUALIZAÇÃO CORRETA (já existe no seu código)
async function updateRestaurantes(nomeRestaurante, valorPedido, taxaApp) {
    const restauRef = db.collection('restaurantes').doc(nomeRestaurante);

    await restauRef.update({
        Pedidos: firebase.firestore.FieldValue.increment(1),
        receitaTotal: firebase.firestore.FieldValue.increment(valorPedido),
        taxaApp: firebase.firestore.FieldValue.increment(taxaApp)
    });
}

// ✅ ADICIONAR FUNÇÃO createTestOrder QUE FALTAVA
async function createTestOrder() {
    console.log("🧪 Iniciando createTestOrder...");
    
    // Capturar valores dos inputs
    const restauranteSelect = document.getElementById('test-restaurant');
    const valorInput = document.getElementById('test-order-value');
    const clienteEmailInput = document.getElementById('test-client-email');
    
    if (!restauranteSelect || !valorInput) {
        console.error("❌ Elementos não encontrados!");
        alert("Erro: Elementos do formulário não encontrados!");
        return false;
    }
    
    const restaurante = restauranteSelect.value;
    const valorTexto = valorInput.value;
    const clienteEmail = clienteEmailInput.value || "teste@cliente.com";
    
    console.log("📝 Valores capturados:", { restaurante, valorTexto, clienteEmail });
    
    // Validar e converter valor
    const valor = parseFloat(valorTexto);
    console.log("💰 Valor convertido:", valor);
    
    if (!valor || isNaN(valor) || valor <= 0) {
        alert("❌ Por favor, insira um valor válido para o pedido (maior que R$ 0)!");
        return false;
    }
    
    if (!restaurante) {
        alert("❌ Por favor, selecione um restaurante!");
        return false;
    }
    
    console.log("✅ Dados validados, chamando createOrder...");
    
    // Chamar função principal
    const success = await createOrder(restaurante, valor, clienteEmail);
    
    if (success) {
        // Limpar campos após sucesso
        valorInput.value = '';
        clienteEmailInput.value = '';
    }
    
    return success;
}

console.log("✅ sistemaPedidos.js carregado com createTestOrder!");