function carregarScriptGoogleMaps() {
  const script = document.createElement("script");
  script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&callback=initMap&libraries=geometry`;
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);
}

carregarScriptGoogleMaps();

let mapa;
let geocoder;
let infoWindow;
let listaDeEcopontos = [];

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

    listaDeEcopontos = await resposta.json();

    listaDeEcopontos.forEach((ponto) => {
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

  const resultadosDiv = document.getElementById("resultados-container");

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
          if (results[0].partial_match) {
            alert(
              "Não foi possível encontrar este endereço específico. Verifique o CEP ou endereço digitado."
            );
            resultadosDiv.classList.remove("visivel");
          } else {
            const localizacaoUsuario = results[0].geometry.location;

            mapa.setCenter(localizacaoUsuario);
            mapa.setZoom(15);

            new google.maps.Marker({
              position: localizacaoUsuario,
              map: mapa,
              title: "Sua Localização",
              icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
            });

            const ecopontosComDistancia = [];

            listaDeEcopontos.forEach((ponto) => {
              if (ponto.lat === 0.0 || ponto.horario === "Fechado") {
                return;
              }

              const localizacaoEcoponto = new google.maps.LatLng(
                ponto.lat,
                ponto.lng
              );

              const distanciaEmMetros =
                google.maps.geometry.spherical.computeDistanceBetween(
                  localizacaoUsuario,
                  localizacaoEcoponto
                );

              ecopontosComDistancia.push({
                nome: ponto.nome,
                distancia: distanciaEmMetros,
              });
            });

            ecopontosComDistancia.sort((a, b) => a.distancia - b.distancia);

            const maisProximos = ecopontosComDistancia.slice(0, 3);
            console.log("Ecopontos mais próximos:", maisProximos);

            const listaResultadosUL =
              document.getElementById("lista-resultados");
            listaResultadosUL.innerHTML = "";

            if (maisProximos.length > 0) {
              maisProximos.forEach((ponto) => {
                const distanciaKm = (ponto.distancia / 1000).toFixed(1);

                const itemLista = document.createElement("li");
                itemLista.innerHTML = `<strong>${ponto.nome}</strong><br>Aprox. ${distanciaKm} km de distância`;

                listaResultadosUL.appendChild(itemLista);
              });
            } else {
              listaResultadosUL.innerHTML =
                "<li>Não foi encontrado nenhum ecoponto próximo.</li>";
            }

            resultadosDiv.classList.add("visivel");
          }
        } else {
          alert("Não foi possível encontrar este endereço: " + status);
          resultadosDiv.classList.remove("visivel");
        }

      }
    );
  });
}
