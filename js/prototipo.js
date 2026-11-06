(function () {
  "use strict";

  var MAX_DEMO = 5;
  var NOMES_DISCIPLINA = {
    calculo: "Cálculo I",
    metodos: "Métodos de Pesquisa",
    programacao: "Introdução à Programação"
  };
  var NOMES_DIA = {
    seg: "segunda-feira",
    ter: "terça-feira",
    qua: "quarta-feira",
    qui: "quinta-feira",
    sex: "sexta-feira"
  };
  var NOMES_FILTRO = {
    todas: "todas as disciplinas",
    calculo: "Cálculo I",
    metodos: "Métodos de Pesquisa",
    programacao: "Introdução à Programação"
  };

  var incluirBtn = document.getElementById("incluir");
  var limparBtn = document.getElementById("limpar");
  var tarefaInput = document.getElementById("tarefa");
  var disciplinaSelect = document.getElementById("disciplina");
  var status = document.getElementById("status");
  var errosBox = document.getElementById("erros");
  var contador = document.getElementById("contador");
  var painel = document.getElementById("painel-tarefa");

  if (!incluirBtn || !limparBtn || !tarefaInput || !disciplinaSelect || !status || !painel) {
    return;
  }

  var reduzirMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function elemento(tag, classe, texto) {
    var el = document.createElement(tag);
    if (classe) {
      el.className = classe;
    }
    if (texto != null) {
      el.textContent = texto;
    }
    return el;
  }

  function atualizarContador() {
    contador.textContent = tarefaInput.value.length + " de 80 caracteres.";
  }

  function atualizarVazios() {
    document.querySelectorAll(".dia").forEach(function (dia) {
      var visiveis = dia.querySelectorAll(".tarefa:not([hidden])");
      var vazio = dia.querySelector(".vazio");
      if (vazio) {
        vazio.hidden = visiveis.length > 0;
      }
    });
  }

  function filtroAtual() {
    var marcado = document.querySelector('input[name="filtro"]:checked');
    return marcado ? marcado.value : "todas";
  }

  function aplicarFiltro() {
    var valor = filtroAtual();
    document.querySelectorAll(".tarefa").forEach(function (tarefa) {
      tarefa.hidden = !(valor === "todas" || tarefa.dataset.disciplina === valor);
    });
    atualizarVazios();
    return valor;
  }

  var placeholderStatus = document.getElementById("placeholder-status");

  function mostrarStatus(texto) {
    status.textContent = texto;
    status.classList.toggle("status-visivel", texto.length > 0);
    if (placeholderStatus) {
      placeholderStatus.hidden = texto.length > 0;
    }
  }

  function limparErros() {
    errosBox.replaceChildren();
    ["disciplina", "tarefa", "grupo-dia"].forEach(function (id) {
      var campo = document.getElementById(id);
      campo.removeAttribute("aria-invalid");
    });
    disciplinaSelect.setAttribute("aria-describedby", "ajuda-disciplina");
    tarefaInput.setAttribute("aria-describedby", "ajuda-tarefa contador");
    document.getElementById("grupo-dia").setAttribute("aria-describedby", "ajuda-dia");
    document.querySelectorAll(".mensagem-erro").forEach(function (mensagem) {
      mensagem.hidden = true;
      mensagem.textContent = "";
    });
    mostrarStatus("");
  }

  function mostrarErros(erros) {
    limparErros();
    var alerta = elemento("div", "alerta");
    alerta.setAttribute("role", "alert");
    alerta.tabIndex = -1;
    alerta.appendChild(elemento("p", null, erros.length > 1
      ? "A tarefa não foi incluída. Corrija os campos indicados."
      : "A tarefa não foi incluída. Corrija o campo indicado."));
    var lista = elemento("ul", "lista");
    erros.forEach(function (erro) {
      var item = elemento("li");
      var link = elemento("a", null, erro.msg);
      link.href = "#" + erro.foco;
      item.appendChild(link);
      lista.appendChild(item);
      var campo = document.getElementById(erro.foco);
      campo.setAttribute("aria-invalid", "true");
      var mensagem = document.getElementById(erro.mensagem);
      mensagem.hidden = false;
      mensagem.textContent = erro.msg;
    });
    alerta.appendChild(lista);
    errosBox.appendChild(alerta);

    var described = {
      disciplina: "erro-disciplina ajuda-disciplina",
      tarefa: "erro-tarefa ajuda-tarefa contador",
      "grupo-dia": "erro-dia ajuda-dia"
    };
    erros.forEach(function (erro) {
      document.getElementById(erro.foco).setAttribute("aria-describedby", described[erro.foco]);
    });
    alerta.focus();
  }

  function criarTarefa(dados) {
    var item = elemento("li", "tarefa tarefa-recente");
    item.dataset.disciplina = dados.disciplina;
    item.dataset.origem = "demonstracao";
    item.tabIndex = -1;
    item.appendChild(elemento("p", "tarefa-disciplina", NOMES_DISCIPLINA[dados.disciplina]));
    item.appendChild(elemento("p", "tarefa-titulo", dados.titulo));
    var estado = elemento("p", "tarefa-meta");
    estado.appendChild(elemento("span", "rotulo-meta", "Estado: "));
    estado.appendChild(elemento("span", "estado", "A fazer"));
    item.appendChild(estado);
    item.appendChild(elemento("p", "tarefa-meta", "Origem: Demonstração local, não gravada"));
    return item;
  }

  function incluir() {
    var erros = [];
    var disciplina = disciplinaSelect.value;
    var titulo = tarefaInput.value.trim();
    var diaMarcado = document.querySelector('input[name="dia"]:checked');

    if (!NOMES_DISCIPLINA[disciplina]) {
      erros.push({
        foco: "disciplina",
        mensagem: "erro-disciplina",
        msg: "Erro: escolha uma disciplina da lista."
      });
    }
    if (!titulo) {
      erros.push({
        foco: "tarefa",
        mensagem: "erro-tarefa",
        msg: "Erro: descreva a tarefa em uma frase."
      });
    }
    if (!diaMarcado) {
      erros.push({
        foco: "grupo-dia",
        mensagem: "erro-dia",
        msg: "Erro: escolha o dia em que a tarefa aparece."
      });
    }
    if (erros.length) {
      mostrarErros(erros);
      return;
    }

    if (document.querySelectorAll('.tarefa[data-origem="demonstracao"]').length >= MAX_DEMO) {
      limparErros();
      mostrarStatus("A prévia já tem cinco tarefas de demonstração. Remova alguma para incluir outra. Nada foi gravado.");
      status.focus();
      return;
    }

    var dia = diaMarcado.value;
    limparErros();
    document.querySelectorAll(".tarefa-recente").forEach(function (tarefa) {
      tarefa.classList.remove("tarefa-recente");
    });

    var item = criarTarefa({ disciplina: disciplina, titulo: titulo });
    document.getElementById("lista-" + dia).appendChild(item);
    var filtro = aplicarFiltro();

    disciplinaSelect.value = "";
    tarefaInput.value = "";
    diaMarcado.checked = false;
    atualizarContador();

    var mensagem = "Tarefa incluída só nesta página, na " + NOMES_DIA[dia] + ": " + titulo + ". Os campos foram esvaziados. Nada foi gravado nem enviado.";
    if (item.hidden) {
      mensagem = "Tarefa incluída só nesta página, na " + NOMES_DIA[dia] + ", em " + NOMES_DISCIPLINA[disciplina] + ". O filtro atual (" + NOMES_FILTRO[filtro] + ") esconde esse cartão; escolha Todas para vê-lo. Os campos foram esvaziados. Nada foi gravado nem enviado.";
    }
    mostrarStatus(mensagem);

    if (item.hidden) {
      status.focus();
    } else {
      item.scrollIntoView({
        behavior: reduzirMovimento ? "auto" : "smooth",
        block: "center"
      });
      item.focus({ preventScroll: true });
    }
  }

  function limparDemonstracao() {
    var demonstracao = document.querySelectorAll('.tarefa[data-origem="demonstracao"]');
    demonstracao.forEach(function (tarefa) {
      tarefa.remove();
    });
    aplicarFiltro();
    limparErros();
    if (demonstracao.length) {
      mostrarStatus("Tarefas de demonstração removidas desta página. A amostra fictícia continua. Nada havia sido gravado.");
    } else {
      mostrarStatus("Não havia tarefas de demonstração. A amostra fictícia continua no quadro.");
    }
    status.focus();
  }

  tarefaInput.addEventListener("input", atualizarContador);
  incluirBtn.addEventListener("click", incluir);
  limparBtn.addEventListener("click", limparDemonstracao);

  painel.addEventListener("keydown", function (event) {
    if (event.key !== "Enter" || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
      return;
    }
    var tag = event.target.tagName;
    if (tag === "BUTTON" || tag === "SELECT" || event.target.type === "radio") {
      return;
    }
    event.preventDefault();
    incluir();
  });

  document.querySelectorAll('input[name="filtro"]').forEach(function (radio) {
    radio.addEventListener("change", function () {
      var valor = aplicarFiltro();
      mostrarStatus("O quadro mostra " + NOMES_FILTRO[valor] + ". Isso altera só a prévia desta página.");
    });
  });

  var linksNav = Array.prototype.slice.call(document.querySelectorAll(".cabecalho .nav-secao a[href^='#']"));

  function marcarAtual(id) {
    linksNav.forEach(function (link) {
      if (link.getAttribute("href") === "#" + id) {
        link.setAttribute("aria-current", "true");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  document.querySelectorAll("a[href^='#']").forEach(function (link) {
    link.addEventListener("click", function () {
      var id = link.getAttribute("href").slice(1);
      var destino = document.getElementById(id);
      if (!destino) {
        return;
      }
      if (link.closest(".cabecalho")) {
        marcarAtual(id);
      }
      window.requestAnimationFrame(function () {
        destino.focus({ preventScroll: true });
      });
    });
  });

  if ("IntersectionObserver" in window) {
    var visiveis = new Map();
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        visiveis.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0);
      });
      var escolhido = "";
      var melhor = 0;
      visiveis.forEach(function (ratio, id) {
        if (ratio > melhor) {
          melhor = ratio;
          escolhido = id;
        }
      });
      if (escolhido) {
        marcarAtual(escolhido);
      }
    }, { threshold: [0.2, 0.45, 0.7] });

    linksNav.forEach(function (link) {
      var secao = document.getElementById(link.getAttribute("href").slice(1));
      if (secao) {
        observer.observe(secao);
      }
    });
  }
})();
