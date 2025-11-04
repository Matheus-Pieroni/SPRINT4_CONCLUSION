// scripts/mainFuncs.js - COM TRANSIÇÕES

let currentSection = 'main';

function showSection(sectionName) {
    console.log("🔄 Tentando mostrar seção:", sectionName);
    
    // Se já está na mesma seção, não faz nada
    if (currentSection === sectionName) {
        console.log("⏭️  Já está na seção", sectionName);
        return;
    }
    
    const oldSection = currentSection;
    currentSection = sectionName;
    
    // 1. Primeiro, preparamos a transição de saída
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // 2. Adicionamos classe de loading temporariamente
    const targetSection = document.getElementById(sectionName + '-section');
    if (!targetSection) {
        console.error("❌ Seção não encontrada:", sectionName + '-section');
        return;
    }
    
    targetSection.classList.add('loading-content');
    
    // 3. Pequeno delay para a transição de saída
    setTimeout(() => {
        // 4. Removemos loading e ativamos a nova seção
        targetSection.classList.remove('loading-content');
        targetSection.classList.add('active');
        
        console.log("✅ Seção mostrada:", sectionName);
        
        // 5. Carregar dados específicos da seção
        carregarDadosDaSecao(sectionName);
        
    }, 400);
}

// Função para carregar dados específicos de cada seção
function carregarDadosDaSecao(sectionName) {
    console.log("📥 Carregando dados para:", sectionName);
    
    switch(sectionName) {
        case 'dashboard':
            if (typeof carregDashboardFinanceiro !== 'undefined') {
                console.log("🎯 Iniciando carregamento do dashboard...");
                // Adicionar efeito de loading nos cards
                const metricCards = document.querySelectorAll('.metric-card');
                metricCards.forEach(card => {
                    card.classList.add('pulse-loading');
                });
                
                setTimeout(() => {
                    carregDashboardFinanceiro();
                    // Remover loading após carregar
                    metricCards.forEach(card => {
                        card.classList.remove('pulse-loading');
                        card.classList.add('fade-in');
                    });
                }, 300);
            }
            break;
            
        case 'clientes':
            if (typeof loadClientes !== 'undefined') {
                console.log("🎯 Iniciando carregamento de clientes...");
                const clientesList = document.getElementById('clientes-list');
                if (clientesList) {
                    clientesList.classList.add('pulse-loading');
                }
                
                setTimeout(() => {
                    loadClientes();
                    if (clientesList) {
                        clientesList.classList.remove('pulse-loading');
                        clientesList.classList.add('fade-in');
                    }
                }, 300);
            }
            break;
            
        case 'testepedidos':
            console.log("🎯 Seção de teste de pedidos ativada");
            // Aqui podemos adicionar inicializações específicas se necessário
            break;
            
        case 'dados-teste':
            if (typeof atualizarEstatisticas !== 'undefined') {
                console.log("🎯 Atualizando estatísticas da seção de dados...");
                setTimeout(() => {
                    atualizarEstatisticas();
                }, 300);
            }
            break;
            
        case 'configs':
            console.log("🎯 Seção de configurações ativada");
            break;
            
        default:
            console.log("ℹ️  Nenhum carregamento específico para:", sectionName);
    }
}

// Mostrar seção principal quando a página carrega
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Página carregada - inicializando...');
    
    // Pequeno delay para garantir que tudo está carregado
    setTimeout(() => {
        const mainSection = document.getElementById('main-section');
        if (mainSection) {
            mainSection.classList.add('active');
            console.log('✅ Seção principal ativada com transição');
        }
        
        // Inicializar Firebase se disponível
        if (typeof db !== 'undefined') {
            console.log('🔥 Firebase pronto');
        }
    }, 100);
});

// Função para adicionar feedback visual em botões
function addButtonFeedback(button) {
    if (!button) return;
    
    button.style.transition = 'all 0.2s ease';
    button.addEventListener('click', function(e) {
        const btn = e.target;
        btn.style.transform = 'scale(0.95)';
        setTimeout(() => {
            btn.style.transform = 'scale(1)';
        }, 150);
    });
}

// Aplicar feedback visual a todos os botões
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        const buttons = document.querySelectorAll('button, .button');
        buttons.forEach(button => {
            addButtonFeedback(button);
        });
        console.log('🎯 Feedback visual aplicado aos botões');
    }, 500);
});