
  
  
  const urlBairros = "https://docs.google.com/spreadsheets/d/e/2PACX-1vR4TZkD-YhQkE9yOJ0rc0AFitqzPI8KUTaGglAljxg2oVDy_GM_9QnZBtEGMJELY_uhhMfPDtKwhspX/pub?gid=579319961&single=true&output=csv";
  const urlCreas = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRWxiE1xElemwD02wqCOATxk-JmhRVz48XvxKoGMfSSqHmo4_fpYiLpaj4ZVvxqB_CCabA9uBC5nbQX/pub?gid=0&single=true&output=csv";

  let dadosBairros = [];
  let dadosCreas = {};

  async function carregarDados() {
    const [resBairros, resCreas] = await Promise.all([fetch(urlBairros), fetch(urlCreas)]);
    const textoBairros = await resBairros.text();
    const textoCreas = await resCreas.text();

    const linhasBairros = textoBairros.trim().split(/\r?\n/);
    for (let i = 1; i < linhasBairros.length; i++) {
      const linha = linhasBairros[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
      const bairro = linha[0]?.replace(/(^"|"$)/g, "").trim();
      const creas = linha[1]?.replace(/(^"|"$)/g, "").trim();
      if (bairro && creas) dadosBairros.push({ bairro, creas });
    }

    const linhasCreas = textoCreas.trim().split(/\r?\n/);
    for (let i = 1; i < linhasCreas.length; i++) {
      const linha = linhasCreas[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.replace(/(^"|"$)/g, "").trim());
      const [nome, bloco, link] = linha;
      if (nome) {
        dadosCreas[nome.toUpperCase()] = { bloco, link };
      }
    }

 //Preencher bairros por CREAS no Select, aba 2, página 2
    function preencherBairrosPorCreas(creasSelecionado) {
      const bairrosPorCreas = {};

      dadosBairros.forEach(item => {
          const creas = item.creas;
          const bairro = item.bairro;

        if (!bairrosPorCreas[creas]) {
          bairrosPorCreas[creas] = [];
        }
        bairrosPorCreas[creas].push(bairro);
      });

      const selectBairro = document.getElementById('selectBairro');
      selectBairro.innerHTML = '<option value="">Selecione um bairro</option>';

      if (bairrosPorCreas[creasSelecionado]) {
        bairrosPorCreas[creasSelecionado].forEach(bairro => {
          const option = document.createElement('option');
          option.value = bairro;
          option.textContent = bairro;
          selectBairro.appendChild(option);
        });
      }
    }
//Termina aqui

    // Preencher o select com nomes dos CREAS
    const creasSet = new Set(dadosBairros.map(d => d.creas));
    const creasSelect1 = document.getElementById("creasSelect1");
    const creasSelect2 = document.getElementById("creasSelect2");
    const creasSelect3 = document.getElementById("creasSelect3");

    const creasArray = [...creasSet].sort();

    creasArray.forEach(creas => {
      const opt1 = document.createElement("option");
      opt1.value = creas;
      opt1.textContent = creas;
      creasSelect1.appendChild(opt1);
    });

    creasArray.forEach(creas => {
      const opt2 = document.createElement("option");
      opt2.value = creas;
      opt2.textContent = creas;
      creasSelect2.appendChild(opt2);
    });

    creasArray.forEach(creas => {
      const opt3 = document.createElement("option");
      opt3.value = creas;
      opt3.textContent = creas;
      creasSelect3.appendChild(opt3);
    });

//Adicionei isso aqui para o preenchimento do 2 select, aba 2, pagina 2
     if (creasSelect2) {
        creasSelect2.addEventListener('change', function () {
        preencherBairrosPorCreas(this.value);
      });
    }
  }


  function mostrarSugestoes() {
    const entrada = document.getElementById("bairroInput").value.trim().toLowerCase();
    const sugestoesEl = document.getElementById("sugestoes");
    const resultadoEl = document.getElementById("resultado");

    sugestoesEl.innerHTML = "";
    resultadoEl.innerHTML = "";

    if (entrada === "") return;

    const sugestoes = dadosBairros
      .filter(item => item.bairro.toLowerCase().includes(entrada))
      .sort((a, b) => a.bairro.localeCompare(b.bairro));

    sugestoes.forEach(item => {
      const li = document.createElement("li");
      li.textContent = item.bairro;
      li.onclick = () => {
        document.getElementById("bairroInput").value = item.bairro;
        sugestoesEl.innerHTML = "";

        const creasNomeOriginal = item.creas;
        const creasNome = creasNomeOriginal.toUpperCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();

        let resultadoTexto = `Esse bairro está na abrangência do <span class="creas-nome">${creasNomeOriginal.toUpperCase()}</span>.<br><br>`;

        let dados = null;
        for (const nome in dadosCreas) {
          const nomeNormalizado = nome.normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
          if (nomeNormalizado.includes(creasNome)) {
            dados = dadosCreas[nome];
            break;
          }
        }

          if (dados) {
            resultadoTexto += dados.bloco;
          
            if (dados.link) {
              resultadoTexto += `<br><br>📍 Localização do CREAS: <a href="${dados.link}" target="_blank">clique aqui</a>`;
            }
          } else {
            resultadoTexto += `Dados do CREAS não encontrados.`;
          }


        const enderecoMapa = `${item.bairro}, Goiânia - GO`.replace(/ /g, "+");
        resultadoTexto += `<br><br><iframe width="100%" height="300" style="border:0" loading="lazy"
          src="https://www.google.com/maps?q=${enderecoMapa}&output=embed"></iframe>`;

        resultadoEl.innerHTML = resultadoTexto;
      };
      sugestoesEl.appendChild(li);
    });
  }

  function mostrarBairrosPorCreas(creasSelect1) {
    const selecionado = document.getElementById("creasSelect1").value;
    const lista = document.getElementById("bairrosPorCreas");
    lista.innerHTML = "";

    if (!selecionado) return;

    const bairros = dadosBairros
      .filter(item => item.creas === selecionado)
      .map(item => item.bairro)
      .sort();

    if (bairros.length === 0) {
      lista.innerHTML = "<li>Nenhum bairro encontrado.</li>";
    } else {
      bairros.forEach(bairro => {
        const li = document.createElement("li");
        li.textContent = bairro;
        lista.appendChild(li);
      });
    }
  }

  function trocarAba(abaId) {
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(div => div.classList.remove('active'));

    document.querySelector(`.tab[onclick="trocarAba('${abaId}')"]`).classList.add('active');
    document.getElementById(abaId).classList.add('active');
  }

  document.addEventListener("DOMContentLoaded", carregarDados);

  