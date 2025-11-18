const ctx = document.getElementById('restaurants-pie');

fetch('json/restaurantes_pedidos.json')
    .then(response => response.json())
    .then(data => {
        // Extrair labels e valores do JSON
        const labels = data.map(item => item.Nome);
        const pedidos = data.map(item => item.Pedidos);

        createChart(labels, pedidos, 'polarArea');
    })
    .catch(err => console.error("Erro ao carregar JSON:", err));

function createChart(labels, values, type) {
    new Chart(ctx, {
        type: type,
        data: {
            labels: labels,   // agora são os nomes dos restaurantes
            datasets: [{
                label: 'Pedidos por Restaurante',
                data: values, // agora são os números de pedidos
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function destroyChart() {
    if (ctx && ctx.chart) {
        ctx.chart.destroy();
    }
}
