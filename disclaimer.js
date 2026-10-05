document.addEventListener("DOMContentLoaded", () => {
  const disclaimerHTML = `
    <div id="disclaimerModal" class="modal-overlay">
      <div class="modal-card">
        <div class="modal-title">AVISO DE CONFIDENCIALIDAD Y USO RESTRINGIDO</div>
        <div class="modal-text">
          El presente aplicativo y repositorio constituyen una herramienta de gestión operativa de uso exclusivo para el personal autorizado del <strong>Consorcio Constructor Metro 2 de Lima (CCM2L)</strong>. Queda terminantemente prohibida la reproducción, distribución, comercialización o uso de la presente información para fines ajenos a los contractuales y de supervisión de obra.
        </div>
        <div class="modal-text">
          El acceso no autorizado, la extracción, el uso indebido o la divulgación de los datos contenidos contravienen las normas internas de seguridad de la información, el deber de confidencialidad y la <strong>Ley N° 30096 (Ley de Delitos Informáticos)</strong> y la <strong>Ley N° 29733 (Ley de Protección de Datos Personales)</strong>, quedando el infractor sujeto a las sanciones laborales correspondientes y a las responsabilidades civiles y penales previstas en la legislación de la República del Perú.
        </div>
        <button id="acceptDisclaimer" class="modal-btn">HE LEÍDO Y ACEPTO LOS TÉRMINOS DE CONFIDENCIALIDAD</button>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', disclaimerHTML);

  document.getElementById('acceptDisclaimer').addEventListener('click', () => {
    document.getElementById('disclaimerModal').style.display = 'none';
  });
});
