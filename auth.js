// --- CONFIGURACIÓN DE FIREBASE (PROYECTO CENTRAL: MetroL2-IAM-Central) ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, onAuthStateChanged, signOut, setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyC1XakVAZLUDq3-240Q_KoYYPU5JKCTjzs",
    authDomain: "metrol2-iam-central.firebaseapp.com",
    projectId: "metrol2-iam-central",
    storageBucket: "metrol2-iam-central.firebasestorage.app",
    messagingSenderId: "78845391762",
    appId: "1:78845391762:web:d64611cd7c4ef65a24074b"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

const REPO_ACTUAL = "Estructuras-L2-L4";
const STORAGE_KEY_DISCLAIMER = "ccm2l_estructuras_l2_l4_disclaimer_accepted_v1";
let usuarioActualGlobal = null;
let mapaInicializadoGlobal = false;

setPersistence(auth, browserLocalPersistence).catch(console.warn);

document.addEventListener("DOMContentLoaded", () => {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            usuarioActualGlobal = user;
            ocultarModalLogin();
            await validarPermisosYDisclaimer(user);
        } else {
            usuarioActualGlobal = null;
            mostrarModalLogin();
        }
    });
});

window.loginConGoogle = async function() {
    try {
        await signInWithPopup(auth, googleProvider);
    } catch (err) {
        console.error("Error en Google Auth:", err);
        alert("No se pudo completar el inicio de sesión con Google.");
    }
};

window.loginConCorreoPassword = async function() {
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value.trim();

    if (!email || !password) {
        alert("Por favor ingrese su correo corporativo y contraseña.");
        return;
    }

    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
        console.error("Error en Login corporativo:", err);
        alert("Credenciales incorrectas o usuario no registrado.");
    }
};

function mostrarModalLogin() {
    const modal = document.getElementById('login-modal');
    if (modal) modal.style.display = 'flex';
}

function ocultarModalLogin() {
    const modal = document.getElementById('login-modal');
    if (modal) modal.style.display = 'none';
}

async function validarPermisosYDisclaimer(user) {
    const emailUser = user.email.toLowerCase().trim();

    if (emailUser === "zebaxx@gmail.com" || emailUser === "vcasasp@ccmetrolima.com" || emailUser === "permisosccm2l@gmail.com" || emailUser === "tnoriega.arq@gmail.com") {
        verificarDisclaimerUsuario();
        inicializarAplicacionMapaSiEsNecesario();
        return;
    }

    try {
        const docRef = doc(db, "usuarios", emailUser);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const datosUsuario = docSnap.data();
            const esAdmin = datosUsuario.es_admin || false;
            const reposPermitidos = datosUsuario.repositorios_permitidos || datosUsuario.permisos_escritura || [];

            let usuarioAutorizado = (esAdmin || reposPermitidos.includes("todos") || reposPermitidos.includes(REPO_ACTUAL));

            if (usuarioAutorizado) {
                verificarDisclaimerUsuario();
                inicializarAplicacionMapaSiEsNecesario();
            } else {
                restringirAccesoNoAutorizado();
            }
        } else {
            restringirAccesoNoAutorizado();
        }
    } catch (error) {
        console.error("Error al validar contra Firestore:", error);
        restringirAccesoNoAutorizado();
    }
}

function verificarDisclaimerUsuario() {
    if (!localStorage.getItem(STORAGE_KEY_DISCLAIMER)) {
        mostrarDisclaimer();
    } else {
        ocultarDisclaimer();
    }
}

async function restringirAccesoNoAutorizado() {
    alert("No cuenta con autorización para acceder a este repositorio. Consulte con el administrador.");
    await signOut(auth);
    window.location.href = "https://github.com";
}

function mostrarDisclaimer() {
    const modal = document.getElementById('disclaimer-modal');
    if (modal) modal.style.display = 'flex';
}

function ocultarDisclaimer() {
    const modal = document.getElementById('disclaimer-modal');
    if (modal) {
        modal.style.opacity = '0';
        modal.style.transition = 'opacity 0.3s ease';
        setTimeout(() => { modal.style.display = 'none'; }, 300);
    }
}

window.aceptarDisclaimer = async function() {
    if (!usuarioActualGlobal) return;
    const emailUser = usuarioActualGlobal.email.toLowerCase().trim();
    localStorage.setItem(STORAGE_KEY_DISCLAIMER, "true");

    try {
        const discRef = doc(db, "aceptaciones_disclaimer", emailUser);
        await setDoc(discRef, {
            email: emailUser,
            aceptado: true,
            repositorio: REPO_ACTUAL,
            fecha_aceptacion: serverTimestamp(),
            dispositivo: navigator.userAgent
        }, { merge: true });

        ocultarDisclaimer();
    } catch (err) {
        console.error("Error al registrar aceptación en Firestore:", err);
        ocultarDisclaimer();
    }
};

// --- LÓGICA DE MAPA Y ESTRUCTURAS ---
function inicializarAplicacionMapa() {
    const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQOJZ3-HTVbEGff5qSi85ljxanEgzPkM4AxacQgE-slHciuSB0AYB7Mdz8ia8WIbcHSmA5QPramorj6/pub?gid=0&single=true&output=csv";
    
    const pastelColors = [
      '#fecdd3', '#fed7aa', '#fef08a', '#bbf7d0', '#99f6e4', 
      '#bae6fd', '#c7d2fe', '#f5d0fe', '#fbcfe8', '#e2e8f0', '#ffedd5'
    ];
    const districtColorMap = {};
    let colorIndex = 0;

    function getDistrictColor(district) {
      if (!district) return '#e2e8f0';
      if (!districtColorMap[district]) {
        districtColorMap[district] = pastelColors[colorIndex % pastelColors.length];
        colorIndex++;
      }
      return districtColorMap[district];
    }

    const map = L.map('map', { zoomControl: false }).setView([-12.0464, -77.0428], 12);
    L.control.zoom({ position: 'topright' }).addTo(map);

    L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      attribution: '&copy; Google Maps'
    }).addTo(map);

    let polygonsLayer = L.layerGroup().addTo(map);
    let linesLayer = L.layerGroup().addTo(map);
    let markersLayer = L.layerGroup().addTo(map);

    let allStructures = [];
    let tableRowsMap = new Map();

    fetch('DISTRITOS.geojson')
      .then(res => res.json())
      .then(data => {
        renderDistricts(data);
      })
      .catch(err => console.error("Error al cargar DISTRITOS.geojson:", err));

    function renderDistricts(geojson) {
      polygonsLayer.clearLayers();
      L.geoJSON(geojson, {
        style: function(feature) {
          const distrito = feature.properties.DISTRITO || '';
          return {
            fillColor: getDistrictColor(distrito),
            weight: 1.5,
            opacity: 0.8,
            color: '#64748b',
            fillOpacity: 0.25
          };
        },
        onEachFeature: function(feature, layer) {
          const distrito = feature.properties.DISTRITO;
          if (distrito) {
            const center = layer.getBounds().getCenter();
            L.marker(center, {
              icon: L.divIcon({
                className: 'district-label',
                html: `<div>${distrito}</div>`,
                iconSize: [120, 20]
              })
            }).addTo(polygonsLayer);
          }
        }
      }).addTo(polygonsLayer);
    }

    fetch('Lineas.geojson')
      .then(res => res.json())
      .then(data => {
        renderLines(data);
      })
      .catch(err => console.log("Aviso: El archivo Lineas.geojson se cargará desde la raíz."));

    function renderLines(geojson) {
      linesLayer.clearLayers();
      L.geoJSON(geojson, {
        style: function(feature) {
          const linea = String(feature.properties.LINEA || '').trim();
          let colorLine = '#1A6B11';
          if (linea === '4' || linea.includes('4')) {
            colorLine = '#1C6873';
          } else if (linea === '2' || linea.includes('2')) {
            colorLine = '#1A6B11';
          }
          return {
            color: colorLine,
            weight: 7,
            opacity: 0.9,
            smoothFactor: 1.2
          };
        }
      }).addTo(linesLayer);
    }

    Papa.parse(SHEET_CSV_URL, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: function(results) {
        allStructures = results.data.map(row => {
          const cleanRow = {};
          Object.keys(row).forEach(key => {
            const cleanKey = key.replace(/^\uFEFF/, '').trim();
            cleanRow[cleanKey] = row[key];
          });

          const idVal = cleanRow['ID'] || '';
          const tipoVal = cleanRow['Tipo'] || '';
          const nombreVal = cleanRow['Nombre'] || '';
          const lineaVal = cleanRow['Linea'] || '';
          const obraVal = cleanRow['Obra'] || '';
          const provVal = cleanRow['Provincia'] || '';
          const distVal = cleanRow['Distrito'] || '';
          
          const rawLat = String(cleanRow['Latitud'] || '0').trim().replace(',', '.');
          const rawLong = String(cleanRow['Longitud'] || '0').trim().replace(',', '.');

          return {
            ID: String(idVal).trim(),
            TIPO: String(tipoVal).trim(),
            NOMBRE: String(nombreVal).trim(),
            LINEA: String(lineaVal).trim(),
            OBRA: String(obraVal).trim(),
            PROVINCIA: String(provVal).trim(),
            DISTRITO: String(distVal).trim(),
            LAT: parseFloat(rawLat),
            LONG: parseFloat(rawLong)
          };
        }).filter(item => item.ID !== '' && !isNaN(item.LAT) && !isNaN(item.LONG) && item.LAT !== 0);

        populateFilters(allStructures);
        updateDisplay(allStructures);
      },
      error: function(err) {
        console.error("Error al descargar el CSV:", err);
      }
    });

    function populateFilters(data) {
      const provinces = [...new Set(data.map(item => item.PROVINCIA).filter(Boolean))];
      const districts = [...new Set(data.map(item => item.DISTRITO).filter(Boolean))];
      const obras = [...new Set(data.map(item => item.OBRA).filter(Boolean))];

      const provSelect = document.getElementById('provinceFilter');
      if (provSelect) {
        provSelect.innerHTML = '<option value="">Todas las Provincias</option>';
        provinces.forEach(p => provSelect.innerHTML += `<option value="${p}">${p}</option>`);
      }

      const distSelect = document.getElementById('districtFilter');
      if (distSelect) {
        distSelect.innerHTML = '<option value="">Todos los Distritos</option>';
        districts.forEach(d => distSelect.innerHTML += `<option value="${d}">${d}</option>`);
      }

      const obraSelect = document.getElementById('obraFilter');
      if (obraSelect) {
        obraSelect.innerHTML = '<option value="">Todas las Obras</option>';
        obras.forEach(o => obraSelect.innerHTML += `<option value="${o}">Obra ${o}</option>`);
      }
    }

    function getIconForType(tipo) {
      return L.divIcon({
        className: 'custom-pin',
        html: `<div style="background-color: #2563eb; width: 14px; height: 14px; border: 2.5px solid white; border-radius: 50%; box-shadow: 0 0 6px rgba(0,0,0,0.5);"></div>`,
        iconSize: [14, 14]
      });
    }

    function updateDisplay(data) {
      markersLayer.clearLayers();
      const tbody = document.getElementById('tableBody');
      if (!tbody) return;
      tbody.innerHTML = '';
      tableRowsMap.clear();

      const latLngs = [];

      data.forEach((item) => {
        const lat = item.LAT;
        const lng = item.LONG;
        latLngs.push([lat, lng]);

        const marker = L.marker([lat, lng], { icon: getIconForType(item.TIPO) });
        
        const popupContent = `
          <div class="custom-popup">
            <div class="popup-title">${item.ID}</div>
            <div class="popup-row"><b>TIPO:</b> ${item.TIPO || 'N/A'}</div>
            <div class="popup-row"><b>NOMBRE LÍNEA:</b> ${item.LINEA || 'N/A'}</div>
            <div class="popup-row"><b>OBRA:</b> ${item.OBRA || 'N/A'}</div>
            <div class="popup-row"><b>PROVINCIA:</b> ${item.PROVINCIA || 'N/A'}</div>
            <div class="popup-row"><b>DISTRITO:</b> ${item.DISTRITO || 'N/A'}</div>
          </div>
        `;
        marker.bindPopup(popupContent);

        marker.bindTooltip(item.ID, {
          permanent: true,
          direction: 'top',
          className: 'id-label',
          offset: [0, -6]
        });

        markersLayer.addLayer(marker);

        const tr = document.createElement('tr');
        
        // Manejo de distritos compartidos (si tiene 2 nombres o saltos, formatear con salto de línea)
        let distritoFormateado = item.DISTRITO || '';
        if (distritoFormateado.includes(' y ') || distritoFormateado.includes(' - ') || distritoFormateado.length > 20) {
            // Reemplazar separadores comunes o espacios largos por saltos de línea estilizados
            distritoFormateado = distritoFormateado.replace(/ y | \/ | - /g, '\n');
        }

        tr.innerHTML = `
          <td><b>${item.ID}</b></td>
          <td>${item.TIPO || ''}</td>
          <td>${item.LINEA || ''}</td>
          <td>${item.OBRA || ''}</td>
          <td>${item.PROVINCIA || ''}</td>
          <td class="district-cell">${distritoFormateado}</td>
        `;

        tr.addEventListener('mouseenter', () => {
          tr.classList.add('selected');
          marker.openPopup();
          map.panTo([lat, lng], { animate: true });
        });
        tr.addEventListener('mouseleave', () => {
          tr.classList.remove('selected');
          marker.closePopup();
        });
        tr.addEventListener('click', () => {
          map.setView([lat, lng], 16);
          marker.openPopup();
        });

        marker.on('click', () => {
          document.querySelectorAll('.data-table tr').forEach(row => row.classList.remove('selected'));
          tr.classList.add('selected');
          tr.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });

        marker.on('mouseover', () => {
          tr.classList.add('selected');
        });
        marker.on('mouseout', () => {
          tr.classList.remove('selected');
        });

        tableRowsMap.set(item.ID, tr);
        tbody.appendChild(tr);
      });

      if (latLngs.length > 0) {
        const bounds = L.latLngBounds(latLngs);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      }
    }

    function applyFilters() {
      const query = document.getElementById('searchFilter').value.toLowerCase();
      const prov = document.getElementById('provinceFilter').value;
      const dist = document.getElementById('districtFilter').value;
      const obra = document.getElementById('obraFilter').value;

      const filtered = allStructures.filter(item => {
        const matchQuery = Object.values(item).some(val => String(val).toLowerCase().includes(query));
        const matchProv = !prov || item.PROVINCIA === prov;
        const matchDist = !dist || item.DISTRITO === dist;
        const matchObra = !obra || item.OBRA === obra;
        return matchQuery && matchProv && matchDist && matchObra;
      });

      updateDisplay(filtered);
    }

    const searchInput = document.getElementById('searchFilter');
    const provSelect = document.getElementById('provinceFilter');
    const distSelect = document.getElementById('districtFilter');
    const obraSelect = document.getElementById('obraFilter');

    if (searchInput) searchInput.addEventListener('input', applyFilters);
    if (provSelect) provSelect.addEventListener('change', applyFilters);
    if (distSelect) distSelect.addEventListener('change', applyFilters);
    if (obraSelect) obraSelect.addEventListener('change', applyFilters);

    const legend = L.control({ position: 'bottomright' });
    legend.onAdd = function (map) {
      const div = L.DomUtil.create('div', 'map-legend');
      div.innerHTML = `
        <strong>Leyenda</strong>
        <div class="legend-item"><div class="legend-color" style="background:#2563eb;"></div> Estructura</div>
        <div class="legend-item"><div class="legend-color" style="background:#1A6B11;"></div> Línea 2</div>
        <div class="legend-item"><div class="legend-color" style="background:#1C6873;"></div> Línea 4</div>
      `;
      return div;
    };
    legend.addTo(map);
}

function inicializarAplicacionMapaSiEsNecesario() {
    if (mapaInicializadoGlobal) return;
    mapaInicializadoGlobal = true;
    inicializarAplicacionMapa();
}
