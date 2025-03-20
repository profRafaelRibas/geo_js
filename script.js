// Inicializa o mapa com uma posição padrão
const mapa = L.map("mapa").setView([0, 0], 2);

// Adiciona o mapa do OpenStreetMap
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '© OpenStreetMap contributors',
}).addTo(mapa);


// Variáveis globais para armazenar a latitude e longitude
let latitude = null;
let longitude = null;
// Captura a referência ao elemento com id "mapa" e "resultado" para poder manipular o conteúdo deles depois
const resultado = document.getElementById("resultado");

// Função chamada ao clicar no botão "📍 Obter Localização"
function pegarLocalizacao() {
    // Verifica se o navegador suporta o recurso de geolocalização
    if (navigator.geolocation) {

        // Se suportar, tenta obter a posição atual do usuário
        // O método getCurrentPosition recebe duas funções:
        // - A primeira (mostrarPosicao) é chamada se a localização for obtida com sucesso
        // - A segunda (mostrarErro) é chamada se houver algum erro ao tentar obter a localização
        // - O terceiro (opcional) permite personalizações 

        navigator.geolocation.getCurrentPosition(mostrarPosicao, mostrarErro, {
            enableHighAccuracy: true, // Pede mais precisão
            timeout: 10000, // Espera até 10 segundos para obter a posição
            maximumAge: 0 // Garante que a posição não seja uma antiga salva em cache
        });
    } else {
        // Caso o navegador não suporte geolocalização, exibe uma mensagem de aviso
        resultado.innerHTML = "Geolocalização não é suportada por este navegador";
    }
}

// Função chamada se houver erro ao tentar obter a localização
function mostrarErro(error) {
    // Usa um "switch" para tratar diferentes tipos de erro que podem ocorrer
    switch (error.code) {
        case error.PERMISSION_DENIED:
            // Erro 1: O usuário negou a permissão para o site acessar a localização
            resultado.innerHTML = "⛔ O usuário negou o acesso à localização.";
            break;
        case error.POSITION_UNAVAILABLE:
            // Erro 2: A localização não está disponível (GPS desligado, sem internet, etc.)
            resultado.innerHTML = "❌ A localização não está disponível.";
            break;
        case error.TIMEOUT:
            // Erro 3: O tempo para obter a localização expirou
            resultado.innerHTML = "⏳ A solicitação expirou.";
            break;
        default:
            // Erro 4: Algum erro desconhecido aconteceu
            resultado.innerHTML = "⚠️ Erro desconhecido ao tentar obter a localização.";
    }
}

// Função chamada quando a localização é obtida com sucesso
function mostrarPosicao(posicao) {
    // `posicao.coords.latitude` e `posicao.coords.longitude` pegam os dados da posição retornada
    latitude = posicao.coords.latitude;
    longitude = posicao.coords.longitude;
    // Insere a latitude e longitude no elemento "resultado"
    resultado.innerHTML = `Latitude: ${latitude}
<br>Longitude: ${longitude}
<br> <a href="https://www.google.com.br/maps/@${latitude},${longitude},20z?entry=ttu" target="_blank">
<h4>🌍 Ver no Google Maps</h4></a>`;
    // O link gerado leva diretamente para o Google Maps com as coordenadas obtidas

    // Centraliza o mapa na localização do usuário e dá zoom
    mapa.setView([latitude, longitude], 18);

    // Adiciona um marcador com popup
    L.marker([latitude, longitude])
        .addTo(mapa)
        .bindPopup("📍 Você está aqui!")
        .openPopup();
}

// Função ao clicar no botão "📌 Buscar Endereço" para buscar o endereço usando a API do OpenStreetMap
async function buscarEndereco() {
    let resultado = document.getElementById("resultado2");

    // Verifica se as coordenadas foram obtidas
    if (latitude === null || longitude === null) {
        resultado.innerHTML = "⚠️ Primeiro obtenha as coordenadas!";
        return;
    }

    // Faz a requisição à API
    try {
        // Monta a URL com as coordenadas obtidas
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=pt-br`;

        // Chama a API e espera pela resposta
        const resposta = await fetch(url);

        // Transforma a resposta em JSON
        const dados = await resposta.json();
        console.log(dados);

        // Extrai as informações de endereço para a variável endereco
        const endereco = dados.address;
        console.log(endereco);

        // Exibe o endereço formatado
        resultado.innerHTML = `
    <h3>📍 Detalhes do endereço:</h3>
    País: ${endereco.country || "N/A"}<br>
    Estado: ${endereco.state || "N/A"}<br>
    Cidade: ${endereco.city || endereco.town || endereco.village || "N/A"}<br>
    Bairro: ${endereco.suburb || "N/A"}<br>
    Rua: ${endereco.road || "N/A"}<br>
    CEP: ${endereco.postcode || "N/A"}<br>
    <a href="https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}" target="_blank">
        <h4>🌍 Ver no OpenStreetMap</h4>
    </a>
`;


    } catch (erro) {
        resultado.innerHTML = "❌ Erro ao buscar o endereço!";
        console.error("Erro ao buscar dados:", erro);
    };
}