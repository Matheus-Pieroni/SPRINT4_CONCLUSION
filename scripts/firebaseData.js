  //Funcionalidade do Firebase!

  function loadClientes() {
    console.log("Carregandi Clienti ;]");

    const clientesList = document.getElementById('clientes-list');

    clientesList.innerHTML = '<p> Carregando Clientes </p>';

    // Getting data from the Firebase database

    db.collection("usuarios").get().then((querySnapshot) => {
      console.log("Found data from", querySnapshot.size, "users.");

      //Limpando a lista de ussr - texto no html
      clientesList.innerHTML = '';

      if (querySnapshot.size === 0) {
        clientesList.innerHTML = '<p> Nenhum cliente para mostrar ou encontrado. </p>';
        return;

      }

      //Criando um 'container' para os clientes >>
      const clienteContainer = document.createElement('div');
      clienteContainer.className = 'clientes-container';

      querySnapshot.forEach(doc => {
        //Pegando as informações de cada usuário inividualmente.
        const userData = doc.data();
        console.log("Info do UseR:", userData);

        //Criando um "Card" para cada cliente
        const clienteCard = document.createElement('div');
        clienteCard.className = 'cliente-card';
        clienteCard.style.border = '1px solid #ddd';
        clienteCard.style.borderRadius = '8px';
        clienteCard.style.padding = '15px';
        clienteCard.style.margin = '10px 0';
        clienteCard.style.backgroundColor = '#f9f9f9';

        //Colocando os cards na página
        clienteCard.innerHTML = `
          <h3 style="color: #b71c1c; margin-bottom: 10px;">Nome: ${userData.Nome || 'Nome não informado!'}</h3>
          <p><strong>Email: ${userData.Email || 'Email não informado!'}</strong></p>
          <p><strong>Comida Preferida: ${userData.comidPref || 'Sem Pedidos Ou Preferência'}</strong></p>
          <p><strong>Restaurante Preferido: ${userData['partner_choice'] || 'Sem Restaurantes Preferenciais'}</strong></p>
        `;

        clienteContainer.appendChild(clienteCard);
      });

      clientesList.appendChild(clienteContainer);
    }).catch((error) => {
      console.error("Erro recebendo os clientes:", error);
      clientesList.innerHTML = "<p> Erro ao carregar os clientes. Verifique o console. </p>"
    });
  }

  // Rececebaba os coiso quando atualiza a pagiginana
  const originalShowSect = showSection;
  showSection = function(sectionName) {
    originalShowSect(sectionName);

    if (sectionName === 'clientes') {
      loadClientes();
    }
  };