import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { getFirestore, collection, addDoc, onSnapshot, deleteDoc, doc, query, orderBy } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
  // firebase config
  const firebaseConfig = { /* tu configuración aquí */ };

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  // dom
  const views = document.querySelectorAll('.view');
  const links = document.querySelectorAll('.nav-link');
  let userId = null, selectedReport = null, unsubscribe = null;

  function switchView(id) {
    views.forEach(v => v.classList.remove('active'));
    document.getElementById(`view-${id}`).classList.add('active');
    if (id === 'dashboard') renderDashboard();
  }

  links.forEach(a => a.addEventListener('click', e => {
    e.preventDefault();
    switchView(a.dataset.view);
  }));

  // auth
  onAuthStateChanged(auth, user => {
    if (user) {
      userId = user.uid;
      listenReports();
    } else {
      signInAnonymously(auth);
    }
  });

  // escuchar informes
  function listenReports() {
    if (unsubscribe) unsubscribe();
    const q = query(collection(db, `users/${userId}/reports`), orderBy('createdAt','desc'));
    unsubscribe = onSnapshot(q, snap => {
      const reports = snap.docs.map(d=>({ id:d.id, ...d.data() }));
      renderReportsList(reports);
    });
  }

  function renderReportsList(list) {
    const container = document.getElementById('view-reports');
    container.innerHTML = `<div class="card"><h2>els meus informes</h2><ul>${list.map(r=>`
      <li>${r.name}
        <button onclick="selectReport('${r.id}')">ver</button>
        <button onclick="deleteReport('${r.id}')">x</button>
      </li>`).join('')}</ul></div>`;
  }

  window.selectReport = async (id) => {
    const docSnap = await query(collection(db,`users/${userId}/reports`)).get();
    selectedReport = docSnap.docs.find(d=>d.id===id).data();
    switchView('dashboard');
  };

  window.deleteReport = async (id) => {
    if (!confirm('confirmar eliminación?')) return;
    await deleteDoc(doc(db,`users/${userId}/reports`,id));
  };

  function renderDashboard() {
    const view = document.getElementById('view-dashboard');
    if (!selectedReport) {
      view.innerHTML = `<div class="card"><h2>benvingut</h2><p>selecciona un informe</p></div>`;
      return;
    }
    const data = JSON.parse(selectedReport.data);
    view.innerHTML = `
      <div class="card">
        <h2>dashboard: ${selectedReport.name}</h2>
        <p>empresa: ${data.metadata.company} - data: ${data.metadata.date}</p>
      </div>`;
    // aquí puedes agregar charts o más lógica
  }
});
