document.addEventListener('DOMContentLoaded', () => {
  const views = document.querySelectorAll('.view');
  const buttons = document.querySelectorAll('.nav-btn');
  function show(viewId) {
    views.forEach(v => v.classList.remove('active'));
    document.getElementById(`view-${viewId}`).classList.add('active');
  }
  buttons.forEach(btn => {
    btn.addEventListener('click', () => show(btn.dataset.view));
  });
  // inicializa dashboard por defecto
  show('dashboard');
});
