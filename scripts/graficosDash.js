// scripts/graficosDash.js - VERSÃO COMPLETAMENTE REESCRITA E CORRIGIDA

class GerenciadorGraficos {
    constructor() {
        this.chart = null;
        this.ctx = null;
        this.inicializado = false;
        this.dadosAtuais = [];
        
        console.log("📊 Gerenciador de Gráficos inicializado");
    }

    // ✅ INICIALIZAÇÃO SEGURA
    inicializar() {
        if (this.inicializado) {
            console.log("🔄 Gráfico já inicializado");
            return true;
        }

        try {
            this.ctx = document.getElementById('restaurants-pie');
            if (!this.ctx) {
                console.error("❌ Canvas 'restaurants-pie' não encontrado no DOM");
                return false;
            }

            console.log("✅ Canvas encontrado, inicializando gráfico...");
            this.inicializado = true;
            
            // Configurar event listeners
            this.configurarEventListeners();
            
            // Carregar dados iniciais
            this.carregarDadosIniciais();
            
            return true;

        } catch (error) {
            console.error("❌ Erro na inicialização do gráfico:", error);
            return false;
        }
    }

    // ✅ CONFIGURAR EVENT LISTENERS
    configurarEventListeners() {
        // Evento para dados atualizados
        window.addEventListener('dadosRestaurantesAtualizados', (e) => {
            console.log("🔄 Evento: dadosRestaurantesAtualizados recebido");
            if (e.detail && Array.isArray(e.detail)) {
                this.atualizarGrafico(e.detail);
            }
        });

        // Evento genérico de atualização
        window.addEventListener('dadosAtualizados', (e) => {
            console.log("🔄 Evento: dadosAtualizados recebido");
            if (e.detail && Array.isArray(e.detail)) {
                this.atualizarGrafico(e.detail);
            }
        });

        // Recarregar gráfico quando a seção dashboard for aberta
        window.addEventListener('dashboardAberto', () => {
            console.log("🎯 Dashboard aberto - verificando gráfico...");
            setTimeout(() => {
                if (!this.chart) {
                    this.carregarDadosIniciais();
                }
            }, 500);
        });

        console.log("✅ Event listeners configurados");
    }

    // ✅ CARREGAR DADOS INICIAIS
    async carregarDadosIniciais() {
        console.log("📥 Carregando dados iniciais para o gráfico...");
        
        try {
            // Tentar carregar do localStorage primeiro
            let dados = this.carregarDoLocalStorage();
            
            if (this.dadosValidos(dados)) {
                console.log("✅ Dados locais válidos encontrados:", dados.length);
                this.atualizarGrafico(dados);
                return;
            }

            // Se não há dados locais, tentar carregar do Firestore
            console.log("🔍 Dados locais não encontrados, buscando do Firestore...");
            await this.carregarDoFirestore();

        } catch (error) {
            console.error("❌ Erro ao carregar dados iniciais:", error);
        }
    }

    // ✅ CARREGAR DO LOCALSTORAGE
    carregarDoLocalStorage() {
        try {
            const dadosSalvos = localStorage.getItem('restaurantes_pedidos');
            if (dadosSalvos) {
                const dados = JSON.parse(dadosSalvos);
                console.log("📊 Dados carregados do localStorage:", dados.length, "restaurantes");
                return dados;
            }
            return [];
        } catch (error) {
            console.error("❌ Erro ao carregar do localStorage:", error);
            return [];
        }
    }

    // ✅ CARREGAR DO FIRESTORE (FALLBACK)
    async carregarDoFirestore() {
        try {
            if (typeof db === 'undefined') {
                console.error("❌ Firebase não disponível");
                return;
            }

            console.log("🔥 Buscando dados do Firestore...");
            const snapshot = await db.collection("restaurantes").get();
            const restaurantes = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    Nome: data.Nome || "Nome não informado",
                    Pedidos: data.Pedidos != null ? data.Pedidos : 0
                };
            });

            if (restaurantes.length > 0) {
                console.log("✅ Dados do Firestore carregados:", restaurantes.length);
                
                // Salvar no localStorage para uso futuro
                localStorage.setItem('restaurantes_pedidos', JSON.stringify(restaurantes));
                
                // Atualizar gráfico
                this.atualizarGrafico(restaurantes);
            } else {
                console.warn("⚠️ Nenhum dado encontrado no Firestore");
                this.mostrarMensagemSemDados();
            }

        } catch (error) {
            console.error("❌ Erro ao carregar do Firestore:", error);
            this.mostrarMensagemErro();
        }
    }

    // ✅ VALIDAR DADOS
    dadosValidos(dados) {
        if (!dados || !Array.isArray(dados)) {
            console.warn("⚠️ Dados inválidos:", dados);
            return false;
        }
        
        if (dados.length === 0) {
            console.warn("⚠️ Array de dados vazio");
            return false;
        }

        // Verificar se tem pelo menos um restaurante com pedidos > 0
        const temPedidos = dados.some(item => item.Pedidos > 0);
        if (!temPedidos) {
            console.warn("⚠️ Todos os pedidos são zero");
        }

        return true;
    }

    // ✅ ATUALIZAR GRÁFICO (FUNÇÃO PRINCIPAL)
    atualizarGrafico(dados) {
        console.log("🔄 Atualizando gráfico com", dados.length, "restaurantes");
        
        if (!this.inicializado || !this.ctx) {
            console.error("❌ Gráfico não inicializado, tentando reinicializar...");
            if (!this.inicializar()) {
                console.error("❌ Falha na reinicialização do gráfico");
                return;
            }
        }

        if (!this.dadosValidos(dados)) {
            console.warn("⚠️ Dados inválidos para atualizar gráfico");
            this.mostrarMensagemSemDados();
            return;
        }

        try {
            // Salvar dados atuais
            this.dadosAtuais = dados;

            // Preparar dados para o gráfico
            const { labels, valores } = this.prepararDadosGrafico(dados);
            
            // Destruir gráfico anterior se existir
            this.destruirChart();

            // Criar novo gráfico
            this.criarChart(labels, valores);
            
            console.log("✅ Gráfico atualizado com sucesso!");

        } catch (error) {
            console.error("❌ Erro ao atualizar gráfico:", error);
            this.mostrarMensagemErro();
        }
    }

    // ✅ PREPARAR DADOS PARA O GRÁFICO
    prepararDadosGrafico(dados) {
        // Ordenar por número de pedidos (decrescente)
        const dadosOrdenados = [...dados].sort((a, b) => b.Pedidos - a.Pedidos);
        
        const labels = dadosOrdenados.map(item => item.Nome);
        const valores = dadosOrdenados.map(item => item.Pedidos);

        console.log("📈 Dados preparados - Labels:", labels);
        console.log("📈 Dados preparados - Valores:", valores);

        return { labels, valores };
    }

    // ✅ CRIAR GRÁFICO
    criarChart(labels, valores) {
        try {
            this.chart = new Chart(this.ctx, {
                type: 'polarArea',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Pedidos por Restaurante',
                        data: valores,
                        backgroundColor: [
                            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
                            '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF',
                            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'
                        ],
                        borderWidth: 2,
                        borderColor: '#ffffff',
                        hoverBorderWidth: 3,
                        hoverBorderColor: '#333333'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: {
                            position: 'right',
                            labels: {
                                font: {
                                    size: 12,
                                    family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
                                },
                                color: '#333333',
                                padding: 15
                            }
                        },
                        title: {
                            display: true,
                            text: '📊 Pedidos por Restaurante',
                            font: {
                                size: 16,
                                weight: 'bold'
                            },
                            color: '#b71c1c',
                            padding: 20
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            titleFont: {
                                size: 14
                            },
                            bodyFont: {
                                size: 13
                            },
                            padding: 12,
                            cornerRadius: 8
                        }
                    },
                    scales: {
                        r: {
                            beginAtZero: true,
                            ticks: {
                                stepSize: 1,
                                font: {
                                    size: 11
                                },
                                color: '#666666'
                            },
                            grid: {
                                color: 'rgba(0, 0, 0, 0.1)'
                            },
                            angleLines: {
                                color: 'rgba(0, 0, 0, 0.1)'
                            }
                        }
                    },
                    animation: {
                        duration: 1000,
                        easing: 'easeOutQuart'
                    }
                }
            });

            console.log("✅ Chart.js criado com sucesso!");

        } catch (error) {
            console.error("❌ Erro ao criar Chart.js:", error);
            throw error;
        }
    }

    // ✅ DESTRUIR GRÁFICO ANTERIOR
    destruirChart() {
        if (this.chart) {
            try {
                this.chart.destroy();
                this.chart = null;
                console.log("🗑️ Gráfico anterior destruído");
            } catch (error) {
                console.error("❌ Erro ao destruir gráfico:", error);
            }
        }
    }

    // ✅ MENSAGEM DE SEM DADOS
    mostrarMensagemSemDados() {
        if (!this.ctx) return;
        
        const ctx = this.ctx.getContext('2d');
        ctx.clearRect(0, 0, this.ctx.width, this.ctx.height);
        
        ctx.fillStyle = '#666666';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('📊 Aguardando dados...', this.ctx.width / 2, this.ctx.height / 2);
        
        ctx.font = '14px Arial';
        ctx.fillText('Gere pedidos para ver o gráfico', this.ctx.width / 2, this.ctx.height / 2 + 25);
    }

    // ✅ MENSAGEM DE ERRO
    mostrarMensagemErro() {
        if (!this.ctx) return;
        
        const ctx = this.ctx.getContext('2d');
        ctx.clearRect(0, 0, this.ctx.width, this.ctx.height);
        
        ctx.fillStyle = '#b71c1c';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('❌ Erro ao carregar gráfico', this.ctx.width / 2, this.ctx.height / 2);
        
        ctx.font = '14px Arial';
        ctx.fillText('Recarregue a página ou verifique o console', this.ctx.width / 2, this.ctx.height / 2 + 25);
    }

    // ✅ ATUALIZAR MANUALMENTE
    atualizarManual() {
        console.log("🔧 Atualização manual solicitada");
        this.carregarDadosIniciais();
    }

    // ✅ DESTRUIR COMPLETAMENTE
    destruir() {
        this.destruirChart();
        this.inicializado = false;
        this.dadosAtuais = [];
        console.log("🧹 Gerenciador de gráficos destruído");
    }
}

// ✅ INSTÂNCIA GLOBAL
const gerenciadorGraficos = new GerenciadorGraficos();

// ✅ INICIALIZAÇÃO AUTOMÁTICA
document.addEventListener('DOMContentLoaded', function() {
    console.log("🚀 DOM Carregado - Inicializando gráficos...");
    
    // Aguardar um pouco para garantir que tudo está carregado
    setTimeout(() => {
        if (!gerenciadorGraficos.inicializar()) {
            console.log("⏳ Gráfico não pôde ser inicializado, tentando novamente...");
            
            // Tentar novamente após 2 segundos
            setTimeout(() => {
                gerenciadorGraficos.inicializar();
            }, 2000);
        }
    }, 1000);
});

// ✅ FUNÇÕES GLOBAIS PARA ACESSO EXTERNO
function inicializarGrafico() {
    return gerenciadorGraficos.inicializar();
}

function atualizarGrafico(dados) {
    gerenciadorGraficos.atualizarGrafico(dados);
}

function atualizarGraficoManual() {
    gerenciadorGraficos.atualizarManual();
}

function destruirGrafico() {
    gerenciadorGraficos.destruir();
}

// ✅ DETECTAR QUANDO O DASHBOARD É ABERTO
if (typeof showSection !== 'undefined') {
    const originalShowSection = showSection;
    showSection = function(sectionName) {
        originalShowSection(sectionName);
        
        if (sectionName === 'dashboard') {
            console.log("🎯 Seção dashboard aberta - disparando evento...");
            window.dispatchEvent(new CustomEvent('dashboardAberto'));
            
            // Atualizar gráfico após um delay
            setTimeout(() => {
                if (gerenciadorGraficos.inicializado) {
                    gerenciadorGraficos.atualizarManual();
                } else {
                    gerenciadorGraficos.inicializar();
                }
            }, 1000);
        }
    };
}

console.log("✅ graficosDash.js carregado com sucesso!");