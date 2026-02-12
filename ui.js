window.mostrarTela = function(id) {

  document.querySelectorAll(".tela").forEach(tela => {
    tela.classList.remove("ativa");
  });

  document.getElementById(id).classList.add("ativa");
};

// Abrir primeira tela automaticamente
mostrarTela("criar");
