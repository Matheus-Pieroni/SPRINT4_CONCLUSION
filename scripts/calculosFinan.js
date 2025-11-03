// scripts/calculosFinan.js

function calcularReceitaRestaurante(restaurante) {
    return {
        nome: restaurante.Nome,
        receitaBruta: restaurante.receitaTotal || 0,
        taxaApp: restaurante.taxaApp || 0,
        receitaLiquida: (restaurante.receitaTotal || 0) - (restaurante.taxaApp || 0),
        pedidosCount: restaurante.Pedidos || 0
    };
}

function calcularMetricasGlobais(pedidos, restaurantes) {
    const totalPedidos = pedidos.length;
    const receitaTotalApp = pedidos.reduce((sum, pedido) => sum + (pedido.taxaApp || 0), 0);
    const ticketMedio = totalPedidos > 0 ? 
        pedidos.reduce((sum, pedido) => sum + (pedido.valor || 0), 0) / totalPedidos : 0;

    return {
        totalPedidos,
        receitaTotalApp,
        ticketMedio,
        restaurantesAtivos: restaurantes.length
    };
}