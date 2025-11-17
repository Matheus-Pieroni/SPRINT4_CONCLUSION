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
    
    // 1. Primeiro, preparamos a transição de saída - OCULTAR TODAS
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.classList.remove('active');
        section.style.display = 'none';
    });
    
    // 2. Obter a seção alvo
    const targetSection = document.getElementById(sectionName + '-section');
    if (!targetSection) {
        console.error("❌ Seção não encontrada:", sectionName + '-section');
        return;
    }
    
    // 3. Mostrar a seção com display block
    targetSection.style.display = 'block';
    targetSection.classList.add('loading-content');
    
    // 4. Pequeno delay para a transição de saída
    setTimeout(() => {
        // 5. Removemos loading e ativamos a nova seção
        targetSection.classList.remove('loading-content');
        targetSection.classList.add('active');
        
        console.log("✅ Seção mostrada:", sectionName);
        
        // 6. Carregar dados específicos da seção
        carregarDadosDaSecao(sectionName);
        
    }, 100);
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
        // 1. Ocultar todas as seções
        const sections = document.querySelectorAll('.content-section');
        sections.forEach(section => {
            section.style.display = 'none';
            section.classList.remove('active');
        });
        
        // 2. Mostrar a seção principal
        const mainSection = document.getElementById('main-section');

        if (mainSection) {
            mainSection.style.display = 'block';
            mainSection.classList.add('active');
            console.log('🎯 Seção principal exibida');
        }
        
        // 3. Inicializar Firebase se disponível
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