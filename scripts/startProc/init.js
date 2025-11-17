document.addEventListener('DOMContentLoaded', function() {
    console.log('Dando start em todos os scripts...');

    const dashboardSection = document.getElementById('dashboard-section');
    const clientesSection = document.getElementById('clientes-section');
    const testepedidosSection = document.getElementById('testepedidos-section');

    dashboardSection.style.display = 'none';
    clientesSection.style.display = 'none';
    testepedidosSection.style.display = 'none';

    // Verificando a integridade do banco de dados do Firebase... ;-;
    if (typeof db !== 'undefined') {
        console.log("Firebase conectado com sucesso!");

        // Inicio automático do RESET do DB se algo der errado.
        initDBRestaurante_Check();

        showSection('dashboard');
    } else {
        console.error("Firebase não conectou... :( -- Verifique os coiso ;] ");
        console.log(typeof db);
        alert("A Conexão com o Firebase Firestore não ocorreu com sucesso, verifique o console.");
    }

    //Refresh do dashboard adicionado!
    setupDashboardAutoRefresh();
});

async function initDBRestaurante_Check() {
    const snapshotRestau = await db.collection("restaurantes").get();
    if (snapshotRestau.empty) {
        console.log(`Documento "RESTAURANTES" VAZIO, RESTAURANDO INFO'S BASICAS `);
        initRestaurante();
    }
}