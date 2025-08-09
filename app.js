/*
 * Script principal pour NovaCheck Web
 *
 * Ce script gère l'affichage des checklists, du backoffice et du scan QR.
 * Les données sont stockées localement dans le navigateur via localStorage,
 * ce qui permet à l'utilisateur de personnaliser les sections et les tâches.
 */

// Modèle de sections par défaut pour le premier chargement
const defaultSections = [
  {
    name: "Chaufferies",
    tasks: [
      "Contrôler la chaufferie 1",
      "Contrôler la chaufferie 2",
      "Contrôler la chaufferie 3",
    ],
  },
  {
    name: "Contrôle général",
    tasks: [
      "Inspection des parties communes",
      "Vérifier l'éclairage de sécurité",
      "Contrôler des alarmes incendie",
    ],
  },
  {
    name: "Piscines et spa",
    tasks: [
      "Contrôler la piscine extérieure",
      "Relever la température de la piscine extérieure",
      "Prélèvement d'un échantillon d'eau de la piscine du spa",
    ],
  },
  {
    name: "Pompes de relevage",
    tasks: [
      "Vérifier la pompe de relevage 1",
      "Vérifier la pompe de relevage 2",
    ],
  },
];

/**
 * Récupère les sections enregistrées dans localStorage ou installe
 * les valeurs par défaut si aucune donnée n'est stockée.
 */
function loadSections() {
  try {
    const stored = localStorage.getItem('novacheck_sections');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.warn('Impossible de charger les sections :', e);
  }
  // Enregistrer les valeurs par défaut
  localStorage.setItem('novacheck_sections', JSON.stringify(defaultSections));
  return [...defaultSections];
}

/**
 * Sauvegarde les sections dans localStorage.
 * @param {Array} sections - Liste des sections à sauvegarder
 */
function saveSections(sections) {
  try {
    localStorage.setItem('novacheck_sections', JSON.stringify(sections));
  } catch (e) {
    console.warn('Impossible de sauvegarder les sections :', e);
  }
}

/**
 * Récupère le logo enregistré dans localStorage, s'il existe.
 * @returns {string|null} Data URL de l'image
 */
function getLogo() {
  try {
    const stored = localStorage.getItem('novacheck_logo');
    return stored || null;
  } catch (e) {
    return null;
  }
}

/**
 * Affiche les checklists sur la page principale.
 */
function renderChecklists() {
  const sections = loadSections();
  const container = document.getElementById('checklists');
  if (!container) return;
  container.innerHTML = '';
  sections.forEach((section, sectionIndex) => {
    const sectionDiv = document.createElement('section');
    const heading = document.createElement('h3');
    heading.textContent = section.name;
    sectionDiv.appendChild(heading);

    section.tasks.forEach((task, taskIndex) => {
      const taskContainer = document.createElement('div');
      taskContainer.className = 'taskContainer';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.dataset.sectionIndex = sectionIndex;
      checkbox.dataset.taskIndex = taskIndex;

      const label = document.createElement('label');
      label.appendChild(checkbox);
      label.appendChild(document.createTextNode(' ' + task));

      // champ commentaire
      const comment = document.createElement('input');
      comment.type = 'text';
      comment.placeholder = 'Commentaire...';
      comment.className = 'comment';
      comment.dataset.sectionIndex = sectionIndex;
      comment.dataset.taskIndex = taskIndex;

      // champ photo
      const photo = document.createElement('input');
      photo.type = 'file';
      photo.accept = 'image/*';
      photo.className = 'photo';
      photo.dataset.sectionIndex = sectionIndex;
      photo.dataset.taskIndex = taskIndex;

      taskContainer.appendChild(label);
      taskContainer.appendChild(comment);
      taskContainer.appendChild(photo);
      sectionDiv.appendChild(taskContainer);
    });

    container.appendChild(sectionDiv);
  });
}

/**
 * Affiche le backoffice avec la liste des sections et des tâches,
 * permet l'ajout/la suppression/la modification.
 */
function renderAdmin() {
  const sections = loadSections();
  const container = document.getElementById('sections');
  if (!container) return;
  container.innerHTML = '';
  sections.forEach((section, secIndex) => {
    const sectionDiv = document.createElement('div');
    const heading = document.createElement('h3');
    heading.textContent = section.name;
    sectionDiv.appendChild(heading);

    // liste des tâches
    const ul = document.createElement('ul');
    section.tasks.forEach((task, taskIndex) => {
      const li = document.createElement('li');
      const input = document.createElement('input');
      input.type = 'text';
      input.value = task;
      input.dataset.sectionIndex = secIndex;
      input.dataset.taskIndex = taskIndex;
      input.onchange = function () {
        const sIndex = parseInt(this.dataset.sectionIndex);
        const tIndex = parseInt(this.dataset.taskIndex);
        const updated = loadSections();
        updated[sIndex].tasks[tIndex] = this.value;
        saveSections(updated);
      };
      li.appendChild(input);

      // bouton de suppression de tâche
      const delTaskBtn = document.createElement('button');
      delTaskBtn.textContent = 'Supprimer';
      delTaskBtn.onclick = function () {
        const updated = loadSections();
        updated[secIndex].tasks.splice(taskIndex, 1);
        saveSections(updated);
        renderAdmin();
      };
      li.appendChild(delTaskBtn);
      ul.appendChild(li);
    });
    sectionDiv.appendChild(ul);

    // formulaire d'ajout de tâche
    const addTaskForm = document.createElement('form');
    const newTaskInput = document.createElement('input');
    newTaskInput.type = 'text';
    newTaskInput.placeholder = 'Nouvelle tâche';
    const addTaskBtn = document.createElement('button');
    addTaskBtn.type = 'submit';
    addTaskBtn.textContent = 'Ajouter tâche';
    addTaskForm.appendChild(newTaskInput);
    addTaskForm.appendChild(addTaskBtn);
    addTaskForm.onsubmit = function (e) {
      e.preventDefault();
      const newTask = newTaskInput.value.trim();
      if (newTask) {
        const updated = loadSections();
        updated[secIndex].tasks.push(newTask);
        saveSections(updated);
        renderAdmin();
        newTaskInput.value = '';
      }
    };
    sectionDiv.appendChild(addTaskForm);

    // bouton de suppression de section
    const delSectionBtn = document.createElement('button');
    delSectionBtn.textContent = 'Supprimer section';
    delSectionBtn.onclick = function () {
      const updated = loadSections();
      updated.splice(secIndex, 1);
      saveSections(updated);
      renderAdmin();
    };
    sectionDiv.appendChild(delSectionBtn);

    container.appendChild(sectionDiv);
  });
}

/**
 * Initialise la capture de la signature sur un canvas.
 */
function initSignature() {
  const canvas = document.getElementById('signaturePad');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let drawing = false;

  function startDraw(e) {
    drawing = true;
    ctx.beginPath();
    ctx.moveTo(e.offsetX, e.offsetY);
  }
  function draw(e) {
    if (!drawing) return;
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
  }
  function endDraw() {
    drawing = false;
  }

  canvas.addEventListener('mousedown', startDraw);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mouseup', endDraw);
  canvas.addEventListener('mouseleave', endDraw);
}

/**
 * Efface la signature.
 */
function clearSignature() {
  const canvas = document.getElementById('signaturePad');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}

/**
 * Lit un fichier et renvoie sa Data URL.
 * @param {File} file 
 * @returns {Promise<string>}
 */
function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
}

/**
 * Génère un PDF avec les données des checklists, la signature et les photos.
 */
async function generatePDF() {
  const doc = new jsPDF();
  let y = 20;

  // logo si présent
  const logo = getLogo();
  if (logo) {
    const img = new Image();
    img.src = logo;
    await new Promise((res) => { img.onload = res; });
    const ratio = img.height / img.width;
    const width = 40;
    const height = width * ratio;
    doc.addImage(logo, 'PNG', 20, y, width, height);
    y += height + 5;
  }

  doc.setFontSize(18);
  doc.text('Rapport quotidien NovaCheck', 20, y);
  y += 12;

  const sections = loadSections();
  for (let secIndex = 0; secIndex < sections.length; secIndex++) {
    const section = sections[secIndex];
    doc.setFontSize(14);
    doc.text(section.name, 20, y);
    y += 8;
    for (let taskIndex = 0; taskIndex < section.tasks.length; taskIndex++) {
      const task = section.tasks[taskIndex];
      const checkbox = document.querySelector(`input[type="checkbox"][data-section-index="${secIndex}"][data-task-index="${taskIndex}"]`);
      const status = checkbox && checkbox.checked ? 'OK' : 'KO';
      const commentInput = document.querySelector(`input.comment[data-section-index="${secIndex}"][data-task-index="${taskIndex}"]`);
      const comment = commentInput ? commentInput.value.trim() : '';
      doc.setFontSize(12);
      doc.text(`- ${task}: ${status}`, 25, y);
      y += 6;
      if (comment) {
        doc.setFontSize(10);
        doc.text(`Commentaire: ${comment}`, 30, y);
        y += 6;
      }
      // photo
      const photoInput = document.querySelector(`input.photo[data-section-index="${secIndex}"][data-task-index="${taskIndex}"]`);
      if (photoInput && photoInput.files && photoInput.files[0]) {
        const dataUrl = await readFileAsDataURL(photoInput.files[0]);
        const img = new Image();
        img.src = dataUrl;
        await new Promise((res) => { img.onload = res; });
        const maxWidth = 60;
        const imgRatio = img.height / img.width;
        const imgWidth = maxWidth;
        const imgHeight = imgRatio * maxWidth;
        doc.addImage(dataUrl, 'PNG', 30, y, imgWidth, imgHeight);
        y += imgHeight + 4;
      }
    }
    y += 4;
    if (y > 260) {
      doc.addPage();
      y = 20;
    }
  }

  // signature
  const signatureCanvas = document.getElementById('signaturePad');
  if (signatureCanvas) {
    const signatureData = signatureCanvas.toDataURL();
    doc.setFontSize(12);
    doc.text('Signature:', 20, y);
    y += 4;
    doc.addImage(signatureData, 'PNG', 20, y, 60, 20);
    y += 30;
  }

  // mention légale
  doc.setFontSize(8);
  doc.text('NovaCheck est créé par la société NovaSoft, appartenant au groupe Berry&Co.', 20, 285);

  doc.save('rapport_novacheck.pdf');
}

/**
 * Traite l'import de logo et l'enregistre dans localStorage.
 */
function handleLogoUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (e) {
    const dataUrl = e.target.result;
    try {
      localStorage.setItem('novacheck_logo', dataUrl);
    } catch (err) {
      console.warn("Impossible d'enregistrer le logo :", err);
    }
    const preview = document.getElementById('logoPreview');
    if (preview) {
      preview.src = dataUrl;
      preview.style.display = 'block';
    }
  };
  reader.readAsDataURL(file);
}

/**
 * Initialise le scanner QR sur la page de scan.
 */
function initQrScanner() {
  const qrContainer = document.getElementById('qr-reader');
  if (!qrContainer) return;
  if (typeof Html5Qrcode === 'undefined') {
    console.error('html5-qrcode library is not loaded');
    return;
  }
  const html5QrCode = new Html5Qrcode(qrContainer);
  const config = { fps: 10, qrbox: 250 };
  html5QrCode.start(
    { facingMode: "environment" },
    config,
    (decodedText, decodedResult) => {
      alert(`QR code détecté: ${decodedText}`);
      html5QrCode.stop().catch(err => console.error(err));
    },
    (error) => {
      console.warn(`Erreur de scan: ${error}`);
    }
  ).catch(err => {
    console.error('Impossible de démarrer le scanner:', err);
  });
}

/**
 * Initialisation au chargement du document pour chaque page.
 */
document.addEventListener('DOMContentLoaded', function () {
  // page checklists
  if (document.getElementById('checklists')) {
    renderChecklists();
    initSignature();
    const clearBtn = document.getElementById('clearSignature');
    if (clearBtn) {
      clearBtn.addEventListener('click', clearSignature);
    }
    const generateBtn = document.getElementById('generateReport');
    if (generateBtn) {
      generateBtn.addEventListener('click', generatePDF);
    }
  }

  // page admin
  if (document.getElementById('sections')) {
    renderAdmin();
    const form = document.getElementById('sectionForm');
    if (form) {
      form.onsubmit = function (e) {
        e.preventDefault();
        const nameInput = document.getElementById('sectionName');
        const newName = nameInput ? nameInput.value.trim() : '';
        if (newName) {
          const sections = loadSections();
          sections.push({ name: newName, tasks: [] });
          saveSections(sections);
          renderAdmin();
          nameInput.value = '';
        }
      };
    }
    const logoInput = document.getElementById('logoUpload');
    if (logoInput) {
      logoInput.addEventListener('change', handleLogoUpload);
      const preview = document.getElementById('logoPreview');
      const stored = getLogo();
      if (stored && preview) {
        preview.src = stored;
        preview.style.display = 'block';
      }
    }
  }

  // page scan
  if (document.getElementById('qr-reader')) {
    initQrScanner();
  }
});
