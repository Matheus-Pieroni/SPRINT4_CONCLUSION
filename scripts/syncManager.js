// scripts/syncManager.js - NOVO ARQUIVO
class SyncManager {
    constructor() {
        this.chaveRestaurantes = 'restaurantes_pedidos';
        this.ultimaSincronizacao = null;
        this.initialized = false;
    }

    async initialize() {
        if (this.initialized) return;
        
        console.log("🔄 Inicializando SyncManager...");
        
        // Sincronizar dados iniciais
        await this.sincronizarRestaurantes();
        
        // Configurar listeners em tempo real
        this.setupRealtimeListeners();
        
        this.initialized = true;
        console.log(" SyncManager inicializado!");
    }

    // FUNÇÃO PRINCIPAL DE SINCRONIZAÇÃO
    async sincronizarRestaurantes() {
        try {
            console.log("🔄 Sincronizando restaurantes com Firebase...");
            
            const snapshotRes = await db.collection("restaurantes").get();
            const restaurantes = snapshotRes.docs.map(doc => {
                const data = doc.data();
                return {
                    Nome: data.Nome || "Nome não informado",
                    Pedidos: data.Pedidos != null ? data.Pedidos : 0,
                    receitaTotal: data.receitaTotal || 0,
                    taxaApp: data.taxaApp || 0,
                    id: doc.id
                };
            });

            if (restaurantes.length > 0) {
                // Formatar dados para o gráfico
                const dadosFormatados = restaurantes.map(r => ({
                    Nome: r.Nome,
                    Pedidos: r.Pedidos
                }));

                // Salvar no localStorage
                localStorage.setItem(this.chaveRestaurantes, JSON.stringify(dadosFormatados));
                this.ultimaSincronizacao = new Date();
                
                console.log("✅ Dados sincronizados:", restaurantes.length, "restaurantes");
                
                // Disparar evento de atualização
                this.dispararAtualizacao(dadosFormatados);
                
                return dadosFormatados;
            }
        } catch (err) {
            console.error("❌ Erro na sincronização:", err);
        }
    }

    // OUVIR MUDANÇAS EM TEMPO REAL
    setupRealtimeListeners() {
        console.log("🔊 Configurando listeners em tempo real...");
        
        // Ouvir mudanças nos restaurantes
        db.collection("restaurantes").onSnapshot((snapshot) => {
            console.log("📢 Mudança detectada nos restaurantes!");
            this.sincronizarRestaurantes();
        });

        // Ouvir mudanças nos pedidos (que afetam os restaurantes)
        db.collection("pedidos").onSnapshot((snapshot) => {
            console.log("📢 Mudança detectada nos pedidos!");
            setTimeout(() => this.sincronizarRestaurantes(), 1000);
        });
    }

    // DISPARAR ATUALIZAÇÃO PARA TODOS OS COMPONENTES
    dispararAtualizacao(dados) {
        // Evento para gráficos
        window.dispatchEvent(new CustomEvent('dadosRestaurantesAtualizados', {
            detail: dados
        }));

        // Evento para dashboard
        window.dispatchEvent(new CustomEvent('dadosAtualizados', {
            detail: dados
        }));

        console.log("📢 Eventos de atualização disparados");
    }

    // OBTER DADOS LOCAIS
    obterDadosLocais() {
        try {
            const dados = localStorage.getItem(this.chaveRestaurantes);
            return dados ? JSON.parse(dados) : [];
        } catch {
            return [];
        }
    }

    // VERIFICAR SE PRECISA SINCRONIZAR
    precisaSincronizar() {
        const dadosLocais = this.obterDadosLocais();
        return dadosLocais.length === 0 || 
               !this.ultimaSincronizacao || 
               (new Date() - this.ultimaSincronizacao) > 300000; // 5 minutos
    }
}

// INSTÂNCIA GLOBAL
const syncManager = new SyncManager();

// INICIALIZAR AUTOMATICAMENTE
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        if (typeof db !== 'undefined') {
            syncManager.initialize();
        }
    }, 2000);
});