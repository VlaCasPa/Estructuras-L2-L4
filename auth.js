document.addEventListener("DOMContentLoaded", () => {
  // Verificamos si ya está autenticado en sesión
  if (sessionStorage.getItem('ccm2l_authenticated') === 'true') return;

  const authHTML = `
    <div id="authModal" class="modal-overlay" style="z-index: 10000;">
      <div class="modal-card" style="text-align: center;">
        <div class="modal-title">CONTROL DE ACCESO INSTITUCIONAL</div>
        <div class="modal-text" style="text-align: center;">
          Acceso autorizado únicamente para colaboradores de la <strong>Línea 2 del Metro de Lima (CCM2L)</strong>. Inicie sesión con su correo corporativo o cuenta institucional.
        </div>
        <div style="margin-bottom: 15px;">
          <input type="email" id="corpEmail" placeholder="usuario@ccmetrolima.com" class="filter-input" style="text-align: center; margin-bottom: 10px;" />
          <button id="btnCorpLogin" class="modal-btn">Validar Dominio Corporativo</button>
        </div>
        <div style="border-top: 1px solid #334155; padding-top: 12px; margin-top: 12px;">
          <span style="font-size: 0.75rem; color: #94a3b8; display: block; margin-bottom: 8px;">O autentíquese mediante:</span>
          <button id="btnGoogleLogin" class="modal-btn google-btn">
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.2v3.15C3.16 21.32 7.22 24 12 24z"/><path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.2C.44 8.13 0 9.99 0 12s.44 3.87 1.2 5.42l4.08-3.15z"/><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.22 0 3.16 2.68 1.2 6.58l4.08 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/></svg>
            Acceder con Cuenta Google
          </button>
        </div>
        <div id="authError" style="color: #f87171; font-size: 0.75rem; margin-top: 10px; display: none;"></div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', authHTML);

  document.getElementById('btnCorpLogin').addEventListener('click', () => {
    const email = document.getElementById('corpEmail').value.trim().toLowerCase();
    const errorDiv = document.getElementById('authError');
    if (email.endsWith('@ccmetrolima.com')) {
      sessionStorage.setItem('ccm2l_authenticated', 'true');
      document.getElementById('authModal').remove();
    } else {
      errorErrorVisible(errorDiv, "Acceso denegado. Debe utilizar un correo del dominio @ccmetrolima.com");
    }
  });

  document.getElementById('btnGoogleLogin').addEventListener('click', () => {
    // Simulación de autenticación OAuth Google exitosa para entorno interno/GitHub Pages
    sessionStorage.setItem('ccm2l_authenticated', 'true');
    document.getElementById('authModal').remove();
  });

  function errorErrorVisible(el, msg) {
    el.innerText = msg;
    el.style.display = 'block';
  }
});
