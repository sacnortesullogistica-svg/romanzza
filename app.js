import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyArm-Nrr571Sd7i9_uYcYEXd4YZ-4DTgig",
  authDomain: "romanzza-b1e66.firebaseapp.com",
  projectId: "romanzza-b1e66",
  storageBucket: "romanzza-b1e66.firebasestorage.app",
  messagingSenderId: "699222370360",
  appId: "1:699222370360:web:a0e3dd49adca842f539ecd"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

//////////////////////////////////////////////////
// CRIAR PEDIDO
//////////////////////////////////////////////////
window.criarPedido = async function () {
  const numero = document.getElementById("numeroPedido").value;
  const total = parseInt(document.getElementById("totalVolumes").value);

  if (!numero || !total) {
    alert("Preencha todos os campos!");
    return;
  }

  await setDoc(doc(db, "pedidos", numero), {
    totalVolumes: total,
    volumesRecebidos: 0,
    volumesSaida: 0
  });

  alert("Pedido criado com sucesso!");
};

//////////////////////////////////////////////////
// REGISTRAR ENTRADA POR VOLUME
//////////////////////////////////////////////////
window.registrarEntrada = async function () {
  const numeroPedido = document.getElementById("pedidoEntrada").value;
  const numeroVolume = parseInt(document.getElementById("numeroVolumeEntrada").value);

  const pedidoRef = doc(db, "pedidos", numeroPedido);
  const pedidoSnap = await getDoc(pedidoRef);

  if (!pedidoSnap.exists()) {
    alert("Pedido não encontrado!");
    return;
  }

  const dados = pedidoSnap.data();

  if (numeroVolume > dados.totalVolumes || numeroVolume <= 0) {
    alert("Número de volume inválido!");
    return;
  }

  const volumeRef = doc(db, "pedidos", numeroPedido, "volumes", numeroVolume.toString());
  const volumeSnap = await getDoc(volumeRef);

  if (volumeSnap.exists()) {
    alert("Esse volume já foi registrado!");
    return;
  }

  await setDoc(volumeRef, {
    numero: numeroVolume,
    status: "recebido",
    dataEntrada: new Date()
  });

  await updateDoc(pedidoRef, {
    volumesRecebidos: dados.volumesRecebidos + 1
  });

  alert("Entrada registrada com sucesso!");
};

//////////////////////////////////////////////////
// REGISTRAR SAÍDA (APENAS BAIXA NO PEDIDO)
//////////////////////////////////////////////////
window.registrarSaida = async function () {
  const numeroPedido = document.getElementById("pedidoSaida").value;

  const pedidoRef = doc(db, "pedidos", numeroPedido);
  const pedidoSnap = await getDoc(pedidoRef);

  if (!pedidoSnap.exists()) {
    alert("Pedido não encontrado!");
    return;
  }

  const dados = pedidoSnap.data();

  const saldo = dados.volumesRecebidos - dados.volumesSaida;

  if (saldo <= 0) {
    alert("Não há volumes disponíveis para saída!");
    return;
  }

  await updateDoc(pedidoRef, {
    volumesSaida: dados.volumesSaida + 1
  });

  alert("Baixa realizada com sucesso!");
};

//////////////////////////////////////////////////
// CONSULTAR PEDIDO (MOSTRA VOLUMES FALTANDO)
//////////////////////////////////////////////////
window.consultarPedido = async function () {
  const numero = document.getElementById("pedidoConsulta").value;
  const pedidoRef = doc(db, "pedidos", numero);
  const pedidoSnap = await getDoc(pedidoRef);

  if (!pedidoSnap.exists()) {
    alert("Pedido não encontrado!");
    return;
  }

  const dados = pedidoSnap.data();

  const volumesRef = collection(db, "pedidos", numero, "volumes");
  const volumesSnap = await getDocs(volumesRef);

  let volumesRecebidosLista = [];

  volumesSnap.forEach((doc) => {
    volumesRecebidosLista.push(parseInt(doc.id));
  });

  // Descobrir quais estão faltando
  let volumesFaltando = [];

  for (let i = 1; i <= dados.totalVolumes; i++) {
    if (!volumesRecebidosLista.includes(i)) {
      volumesFaltando.push(i);
    }
  }

  const saldo = dados.volumesRecebidos - dados.volumesSaida;

  document.getElementById("resultado").innerHTML = `
    Total de Volumes: ${dados.totalVolumes} <br>
    Recebidos: ${dados.volumesRecebidos} <br>
    Saídas: ${dados.volumesSaida} <br>
    Saldo em Estoque: ${saldo} <br><br>
    <strong>Volumes Faltando:</strong> ${volumesFaltando.length > 0 ? volumesFaltando.join(", ") : "Nenhum"}
  `;
};
