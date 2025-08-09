/*
 * Script principal pour NovaCheck Web
 *
 * Ce script gère l'affichage des checklists et du backoffice.
 * Les données sont stockées localement dans le navigateur via localStorage,
 * ce qui permet à l'utilisateur de personnaliser les sections et les tâches.
 */

// Modèle de sections par défaut pour le premier chargement
const defaultSections = [
    {
        name: "Chaufferies",
        tasks: [
            "Contrôler la chaudière 1",
            "Contrôler la chaudière 2",
            "Contrôler la chaudière 3",
        ],
    },
    {
        name: "Contrôle général",
        tasks: [
            "Inspection des parties communes",
            "Vérifier l'éclairage de sécurité",
            "Contrôle des alarmes incendie",
        ],
    },
    {
        name: "Piscines et spa",
        tasks: [
            "Relever la température de la piscine extérieure",
            "Prélever un échantillon d'eau de la piscine extérieure",
            "Relever la température de la piscine du spa",
            "Prélever un échantillon d'eau de la piscine du spa",
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
        console.error('Impossible de sauvegarder les sections :', e);
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
            const label = document.createElement('label');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.dataset.sectionIndex = sectionIndex;
            checkbox.dataset.taskIndex = taskIndex;
            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(' ' + task));
            sectionDiv.appendChild(label);
            sectionDiv.appendChild(document.createElement('br'));
        });
        container.appendChild(sectionDiv);
    });
}

/**
 * Affiche le backoffice avec la liste des sections et des tâches, et
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
        // Liste des tâches
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
                sections[sIndex].tasks[tIndex] = this.value;
                saveSections(sections);
            };
            // Bouton de suppression de tâche
            const delTaskBtn = document.createElement('button');
            delTaskBtn.textContent = 'Supprimer';
            delTaskBtn.onclick = function () {
                sections[secIndex].tasks.splice(taskIndex, 1);
                saveSections(sections);
                renderAdmin();
            };
            li.appendChild(input);
            li.appendChild(delTaskBtn);
            ul.appendChild(li);
        });
        sectionDiv.appendChild(ul);
        // Formulaire pour ajouter une tâche
        const addTaskForm = document.createElement('form');
        addTaskForm.onsubmit = function (e) {
            e.preventDefault();
            const newTask = this.querySelector('input').value.trim();
            if (newTask) {
                sections[secIndex].tasks.push(newTask);
                saveSections(sections);
                renderAdmin();
            }
            this.querySelector('input').value = '';
        };
        const newTaskInput = document.createElement('input');
        newTaskInput.type = 'text';
        newTaskInput.placeholder = 'Nouvelle tâche';
        const addTaskBtn = document.createElement('button');
        addTaskBtn.type = 'submit';
        addTaskBtn.textContent = 'Ajouter tâche';
        addTaskForm.appendChild(newTaskInput);
        addTaskForm.appendChild(addTaskBtn);
        sectionDiv.appendChild(addTaskForm);
        // Bouton de suppression de section
        const delSectionBtn = document.createElement('button');
        delSectionBtn.textContent = 'Supprimer section';
        delSectionBtn.onclick = function () {
            sections.splice(secIndex, 1);
            saveSections(sections);
            renderAdmin();
        };
        sectionDiv.appendChild(delSectionBtn);
        container.appendChild(sectionDiv);
    });
    // Gestion de l'ajout de nouvelle section (formulaire global)
    const form = document.getElementById('sectionForm');
    if (form) {
        form.onsubmit = function (e) {
            e.preventDefault();
            const nameInput = document.getElementById('sectionName');
            const newName = nameInput.value.trim();
            if (newName) {
                sections.push({ name: newName, tasks: [] });
                saveSections(sections);
                renderAdmin();
            }
            nameInput.value = '';
        };
    }
}

// Initialisation des pages
document.addEventListener('DOMContentLoaded', function () {
    // Si on est sur la page de checklists
    if (document.getElementById('checklists')) {
        renderChecklists();
        const generateBtn = document.getElementById('generateReport');
        if (generateBtn) {
            generateBtn.addEventListener('click', function () {
                // Simulation de génération de PDF
                alert('Rapport PDF généré (cette fonctionnalité est une démonstration dans la version Web statique).');
            });
        }
    }
    // Si on est sur la page d'admin
    if (document.getElementById('sections')) {
        renderAdmin();
    }
});
