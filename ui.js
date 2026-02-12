import { db } from "./app.js";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
  increment
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

window.mostrarTela = function(id){
  document.querySelectorAll(".tela").forEach(t=>t.style.display="none");
  document.getElementById(id).style.display="block";
};

window.criarPedido = async function(){
  const numero = numeroPedido.value.trim();
  const total = parseInt(totalVolumes.value);

  if(!numero || !total) return alert("Preencha os campos!");

  const ref = doc(db,"pedidos",numero);
  if((await getDoc(ref)).exists()) return alert("Pedido já existe!");

  await setDoc(ref,{
    totalVolumes: total,
    volumesRecebidos: 0,
    volumesSaida: 0,
    criadoEm: new Date()
  });

  alert("Pedido criado!");
  listarPedidos();
};

window.registrarEntrada = async function(){
  const pedido = pedidoEntrada.value.trim();
  const volume = parseInt(numeroVolumeEntrada.value);

  if(!pedido || !volume) return alert("Preencha os campos!");

  const ref = doc(db,"pedidos",pedido);
  const snap = await getDoc(ref);
  if(!snap.exists()) return alert("Pedido não encontrado!");

  const volRef = doc(db,"pedidos",pedido,"volumes",volume.toString());
  if((await getDoc(volRef)).exists()) return alert("Volume já registrado!");

  await setDoc(volRef,{numero:volume});
  await updateDoc(ref,{volumesRecebidos: increment(1)});

  alert("Entrada registrada!");
};

window.registrarSaida = async function(){
  const pedido = pedidoSaida.value.trim();
  if(!pedido) return alert("Informe o pedido!");

  const ref = doc(db,"pedidos",pedido);
  const snap = await getDoc(ref);
  if(!snap.exists()) return alert("Pedido não encontrado!");

  const dados = snap.data();
  if(dados.volumesRecebidos - dados.volumesSaida <= 0)
    return alert("Sem saldo!");

  await updateDoc(ref,{volumesSaida: increment(1)});
  alert("Baixa realizada!");
};

window.consultarPedido = async function(){
  const pedido = pedidoConsulta.value.trim();
  if(!pedido) return alert("Informe o pedido!");

  const ref = doc(db,"pedidos",pedido);
  const snap = await getDoc(ref);
  if(!snap.exists()) return alert("Pedido não encontrado!");

  const dados = snap.data();
  const vols = await getDocs(collection(db,"pedidos",pedido,"volumes"));

  let recebidos=[];
  vols.forEach(d=>recebidos.push(parseInt(d.id)));

  let faltando=[];
  for(let i=1;i<=dados.totalVolumes;i++){
    if(!recebidos.includes(i)) faltando.push(i);
  }

  const saldo = dados.volumesRecebidos - dados.volumesSaida;

  resultado.innerHTML = `
    Total: ${dados.totalVolumes}<br>
    Recebidos: ${dados.volumesRecebidos}<br>
    Saídas: ${dados.volumesSaida}<br>
    Saldo: ${saldo}<br><br>
    <strong>Faltando:</strong><br>
    ${faltando.length ? faltando.join(", ") : "Nenhum"}
  `;
};

window.listarPedidos = async function(){
  const lista = document.getElementById("listaPedidos");
  lista.innerHTML="Carregando...";

  const snap = await getDocs(collection(db,"pedidos"));

  if(snap.empty){
    lista.innerHTML="Nenhum pedido.";
    return;
  }

  let html="";
  snap.forEach(d=>{
    const dados=d.data();
    const saldo=dados.volumesRecebidos-dados.volumesSaida;

    html+=`
      <div class="cardPedido">
        <strong>Pedido:</strong> ${d.id}<br>
        Total: ${dados.totalVolumes}<br>
        Recebidos: ${dados.volumesRecebidos}<br>
        Saídas: ${dados.volumesSaida}<br>
        Saldo: ${saldo}
      </div>
    `;
  });

  lista.innerHTML=html;
};

window.onload=listarPedidos;
