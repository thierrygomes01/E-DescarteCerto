/**
 * INÍCIO: CÓDIGO ADICIONADO
 * Este código carrega o script do Google Maps dinamicamente,
 * usando a chave do seu arquivo 'config.js'.
 */
function carregarScriptGoogleMaps() {
  const script = document.createElement("script");
  // Usa a variável GOOGLE_MAPS_API_KEY do config.js
  script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&callback=initMap`;
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);
}

// Chama a função para carregar o mapa
carregarScriptGoogleMaps();

/**
 * FIM: CÓDIGO ADICIONADO
 * O restante do seu arquivo original permanece exatamente igual abaixo.
 */

// -----------------------------------------------------------------

let mapa;
let geocoder;
let infoWindow;

function initMap() {
  const centroGuarulhos = { lat: -23.4538, lng: -46.5333 };

  mapa = new google.maps.Map(document.getElementById("mapa"), {
    zoom: 12,
    center: centroGuarulhos,
  });

  geocoder = new google.maps.Geocoder();

  infoWindow = new google.maps.InfoWindow();

  carregarEcopontos();

  configurarBusca();
}

async function carregarEcopontos() {
  try {
    const resposta = await fetch("ecopontos.json");

    const ecopontos = await resposta.json();

    ecopontos.forEach((ponto) => {
      if (ponto.lat === 0.0 || ponto.horario === "Fechado") {
        return;
      }

      const marker = new google.maps.Marker({
        position: { lat: ponto.lat, lng: ponto.lng },
        map: mapa,
        title: ponto.nome,
      });

      const conteudoPopup = `
                <div style="font-family: Arial, sans-serif; max-width: 250px;">
                    <h3 style="margin: 0 0 5px 0;">${ponto.nome}</h3>
                    <p style="margin: 0 0 5px 0;"><strong>Endereço:</strong> ${
                      ponto.endereco
                    }</p>
                    <p style="margin: 0 0 5px 0;"><strong>Horário:</strong> ${
                      ponto.horario
                    }</p>
                    <p style="margin: 0;"><strong>Obs:</strong> ${
                      ponto.obs || "N/A"
                    }</p>
                </div>
            `;

      marker.addListener("click", () => {
        infoWindow.setContent(conteudoPopup);
        infoWindow.open(mapa, marker);
      });
    });
  } catch (error) {
    console.error("Erro ao carregar o arquivo ecopontos.json:", error);
    alert("Não foi possível carregar os pontos de coleta.");
  }
}

function configurarBusca() {
  const botao = document.getElementById("buscar-btn");
  const input = document.getElementById("endereco-input");

  botao.addEventListener("click", () => {
    const endereco = input.value;

    if (endereco === "") {
      alert("Por favor, digite um endereço ou CEP.");
      return;
    }

    geocoder.geocode(
      { address: endereco + ", Guarulhos" },
      (results, status) => {
        if (status === "OK") {
          const localizacao = results[0].geometry.location;

          mapa.setCenter(localizacao);

          mapa.setZoom(15);

          new google.maps.Marker({
            position: localizacao,
            map: mapa,
            title: "Sua Localização",
            icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png", // (Você pode querer checar esse ícone)
          });
        } else {
          alert("Não foi possível encontrar este endereço: " + status);
        }
      }
    );
  });
}
