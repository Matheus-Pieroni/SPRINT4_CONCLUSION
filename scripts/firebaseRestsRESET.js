async function initRestaurante() {
    const restaurantes = [
        {Nome: "McDonalds", tipoComid: "Lanches", Pedidos: 0, receitaTotal: 0, taxaApp: 0.15, valorBase: 19.90},
        {Nome: "BurgerKing", tipoComid: "Lanches", Pedidos: 0, receitaTotal: 0, taxaApp: 0.15, valorBase: 24.90},
        {Nome: "SodieDoces", tipoComid: "Doces", Pedidos: 0, receitaTotal: 0, taxaApp: 0.15, valorBase: 29.90},
        {Nome: "CacauShow", tipoComid: "Doces", Pedidos: 0, receitaTotal: 0, taxaApp: 0.15},
        {Nome: "PizzaHut", tipoComid: "Pizza", Pedidos: 0, receitaTotal: 0, taxaApp: 0.15, valorBase: 29.90},
        {Nome: "Dominos", tipoComid: "Pizza", Pedidos: 0, receitaTotal: 0, taxaApp: 0.15, valorBase: 29.90},
        {Nome: "Gendai", tipoComid: "Japonesa", Pedidos: 0, receitaTotal: 0, taxaApp: 0.15},
        {Nome: "ChinaInBox", tipoComid: "Japonesa", Pedidos: 0, receitaTotal: 0, taxaApp: 0.15},
        {Nome: "Habibs", tipoComid: "Salgados", Pedidos: 0, receitaTotal: 0, taxaApp: 0.15},
        {Nome: "Ragazzo", tipoComid: "Salgados", Pedidos: 0, receitaTotal: 0, taxaApp: 0.15}
    ]

    for (const restaurante of restaurantes) {
        await db.collection("restaurantes").doc(restaurante.Nome).set(restaurante);
        console.log(`${restaurante.Nome} + "adicionado às tabelas!" `);
    }

    alert("Restaurantes inicializados no banco ddados do firestore");
}
