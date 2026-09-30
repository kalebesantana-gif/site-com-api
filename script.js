const cidadeInput = document.getElementById("cidade");
const btnPesquisar = document.getElementById("btnPesquisar");
const mensagem = document.getElementById("mensagem");

async function buscarClima() {
    const cidade = cidadeInput.value.trim();

    if (!cidade) {
        mensagem.textContent = "Digite o nome de uma cidade.";
        cidadeInput.focus();
        return;
    }

    mensagem.textContent = "Buscando informações...";
    btnPesquisar.disabled = true;

    try {
        const urlLocalizacao =
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cidade)}&count=1&language=pt&format=json`;

        const respostaLocalizacao = await fetch(urlLocalizacao);

        if (!respostaLocalizacao.ok) {
            throw new Error("Erro na busca da cidade.");
        }

        const dadosLocalizacao = await respostaLocalizacao.json();

        if (!dadosLocalizacao.results || dadosLocalizacao.results.length === 0) {
            mensagem.textContent = "Cidade não encontrada. Tente outro nome.";
            limparResultado();
            return;
        }

        const local = dadosLocalizacao.results[0];

        const urlClima =
            `https://api.open-meteo.com/v1/forecast?latitude=${local.latitude}&longitude=${local.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code&timezone=auto`;

        const respostaClima = await fetch(urlClima);

        if (!respostaClima.ok) {
            throw new Error("Erro ao buscar o clima.");
        }

        const clima = await respostaClima.json();
        const atual = clima.current;

        document.getElementById("nomeCidade").textContent =
            `${local.name}${local.country_code ? ", " + local.country_code : ""}`;

        document.getElementById("temperatura").textContent =
            Math.round(atual.temperature_2m);

        document.getElementById("sensacao").textContent =
            `${Math.round(atual.apparent_temperature)} °C`;

        document.getElementById("umidade").textContent =
            `${atual.relative_humidity_2m} %`;

        document.getElementById("vento").textContent =
            `${Math.round(atual.wind_speed_10m)} km/h`;

        const climaInfo = interpretarClima(atual.weather_code);
        document.getElementById("condicao").textContent = climaInfo.texto;
        document.getElementById("icone").textContent = climaInfo.icone;

        mensagem.textContent = "";

    } catch (erro) {
        console.error(erro);
        mensagem.textContent =
            "Não foi possível carregar os dados. Verifique sua conexão.";
    } finally {
        btnPesquisar.disabled = false;
    }
}

function limparResultado() {
    document.getElementById("nomeCidade").textContent = "Pesquise uma cidade";
    document.getElementById("temperatura").textContent = "--";
    document.getElementById("sensacao").textContent = "-- °C";
    document.getElementById("umidade").textContent = "-- %";
    document.getElementById("vento").textContent = "-- km/h";
    document.getElementById("condicao").textContent = "Aguardando pesquisa...";
    document.getElementById("icone").textContent = "🌤️";
}

function interpretarClima(codigo) {
    if (codigo === 0) return { texto: "Céu limpo", icone: "☀️" };
    if ([1, 2].includes(codigo)) return { texto: "Parcialmente nublado", icone: "🌤️" };
    if (codigo === 3) return { texto: "Nublado", icone: "☁️" };
    if ([45, 48].includes(codigo)) return { texto: "Neblina", icone: "🌫️" };
    if ([51, 53, 55].includes(codigo)) return { texto: "Chuvisco", icone: "🌧️" };
    if ([61, 63, 65].includes(codigo)) return { texto: "Chuva", icone: "🌧️" };
    if ([71, 73, 75].includes(codigo)) return { texto: "Neve", icone: "❄️" };
    if ([80, 81, 82].includes(codigo)) return { texto: "Pancadas de chuva", icone: "🌦️" };
    if ([95, 96, 99].includes(codigo)) return { texto: "Tempestade", icone: "⛈️" };
    return { texto: "Condição desconhecida", icone: "🌡️" };
}

btnPesquisar.addEventListener("click", buscarClima);

cidadeInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        buscarClima();
    }
});
