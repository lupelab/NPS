const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbww2zA52qYtuY-hE9qiR2AcOOU7UcKnCNDWGdjx4TVxtUCsFgMpinGH5ZKNmo8A8DrGLw/exec";

const likertOptions = [
  { value: "Totalmente de acuerdo", hint: "Experiencia muy positiva" },
  { value: "De acuerdo", hint: "En general sí" },
  { value: "Ni de acuerdo ni en desacuerdo", hint: "Neutral" },
  { value: "En desacuerdo", hint: "Hay puntos a mejorar" },
  { value: "Totalmente en desacuerdo", hint: "Experiencia negativa" },
];

const autocompleteOptions = {
  cargo: [
    "Gerente/jefe de Marketing",
    "Coordinador",
    "Brand Manager",
    "Director de Marketing",
    "Analista de Marketing",
    "Trade Marketing",
    "Producto",
    "Gerente Comercial",
    "Project Manager",
    "Otro",
  ],
  servicioContratado: [
    "Medios",
    "Planning",
    "Consultoría",
    "Creatividad",
    "BTL (Organización de eventos, logística)",
    "Social Media",
    "Producción",
    "Research",
    "Estrategia",
    "Otro",
  ],
};

const reviewLabels = {
  agenciaEvaluada: "Agencia evaluada",
  q1DisfrutoTrabajar: "Disfrutó trabajando con la agencia",
  q2Fiables: "Equipo fiable",
  q3Colaborativo: "Ambiente colaborativo",
  q4CreoValor: "Creó valor para el equipo",
  q5BasadoEstrategia: "Trabajo basado en estrategia",
  q6MentalidadCreativa: "Mentalidad creativa",
  aspectos: "Aspectos destacados",
  npsRecomendacion: "Probabilidad de recomendación",
  npsContinuidad: "Probabilidad de continuidad",
  motivoPuntuacion: "Motivo de la puntuación",
  comentariosAdicionales: "Comentarios adicionales",
  nombreApellido: "Nombre y apellido",
  correo: "Correo",
  organizacion: "Organización",
  cargo: "Cargo",
  servicioContratado: "Servicio contratado",
};

const steps = Array.from(document.querySelectorAll(".step"));
const stepListItems = Array.from(document.querySelectorAll("#stepList li"));
const form = document.getElementById("surveyForm");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const submitBtn = document.getElementById("submitBtn");
const statusEl = document.getElementById("status");
const stepCounter = document.getElementById("stepCounter");
const progressPercent = document.getElementById("progressPercent");
const progressFill = document.getElementById("progressFill");
const progressBar = document.querySelector(".progress-track");
const currentStepTitle = document.getElementById("currentStepTitle");
const reviewBox = document.getElementById("reviewBox");

let currentStep = 0;

function renderLikertGroups() {
  const groups = document.querySelectorAll(".likert-grid");

  groups.forEach((group) => {
    const fieldName = group.dataset.name;
    likertOptions.forEach((option) => {
      const label = document.createElement("label");
      label.className = "scale-card";
      label.innerHTML = `
        <input type="radio" name="${fieldName}" value="${option.value}" required />
        <strong>${option.value}</strong>
        <small>${option.hint}</small>
      `;
      group.appendChild(label);
    });
  });
}

function renderNpsScales() {
  const scales = document.querySelectorAll(".nps-scale");

  scales.forEach((scale) => {
    const fieldName = scale.dataset.name;
    for (let value = 0; value <= 10; value += 1) {
      const label = document.createElement("label");
      label.className = "nps-pill";
      label.innerHTML = `
        <input type="radio" name="${fieldName}" value="${value}" required />
        <span>${value}</span>
      `;
      scale.appendChild(label);
    }
  });
}

function bindSelectableCards() {
  document.addEventListener("change", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) return;

    if (target.type === "radio") {
      const group = document.querySelectorAll(`input[name="${CSS.escape(target.name)}"]`);
      group.forEach((input) => input.closest("label")?.classList.remove("selected"));
      target.closest("label")?.classList.add("selected");
    }

    if (target.type === "checkbox") {
      target.closest("label")?.classList.toggle("selected", target.checked);
    }

    if (currentStep === steps.length - 1) {
      updateReview();
    }
  });
}

function setupAutocomplete(inputName) {
  const input = form.querySelector(`input[name="${inputName}"]`);
  const box = input?.parentElement?.querySelector(".suggestions");
  const options = autocompleteOptions[inputName] || [];
  if (!input || !box) return;

  let currentItems = [];

  const close = () => {
    box.hidden = true;
    box.innerHTML = "";
    currentItems = [];
  };

  const render = (term) => {
    const cleanTerm = term.trim().toLowerCase();
    currentItems = options
      .filter((option) => option.toLowerCase().includes(cleanTerm))
      .slice(0, 6);

    if (!cleanTerm || currentItems.length === 0) {
      close();
      return;
    }

    box.innerHTML = currentItems
      .map((option, index) => {
        const regex = new RegExp(`(${escapeRegExp(term)})`, "ig");
        const html = option.replace(regex, "<mark>$1</mark>");
        return `<div class="suggestion" data-index="${index}" data-value="${escapeHtml(option)}">${html}</div>`;
      })
      .join("");
    box.hidden = false;
  };

  const pick = (value) => {
    input.value = value;
    close();
    input.focus();
  };

  input.addEventListener("input", () => render(input.value));
  input.addEventListener("focus", () => render(input.value));

  input.addEventListener("keydown", (event) => {
    if (event.key === "Escape") close();
    if (event.key === "Enter" && !box.hidden && currentItems.length) {
      event.preventDefault();
      pick(currentItems[0]);
    }
  });

  box.addEventListener("mousedown", (event) => {
    const item = event.target.closest(".suggestion");
    if (!item) return;
    event.preventDefault();
    pick(item.dataset.value || item.textContent || "");
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".autocomplete")) {
      close();
    }
  });
}

function getStepFields(step) {
  return Array.from(step.querySelectorAll("input, textarea"));
}

function validateStep(stepIndex) {
  const fields = getStepFields(steps[stepIndex]);
  for (const field of fields) {
    if (!field.checkValidity()) {
      field.reportValidity();
      return false;
    }
  }
  return true;
}

function updateProgress() {
  const total = steps.length;
  const percent = Math.round(((currentStep + 1) / total) * 100);
  const title = steps[currentStep].dataset.stepTitle || `Bloque ${currentStep + 1}`;

  stepCounter.textContent = `Bloque ${currentStep + 1} de ${total}`;
  progressPercent.textContent = `${percent}%`;
  currentStepTitle.textContent = title;
  progressFill.style.width = `${percent}%`;
  progressBar.setAttribute("aria-valuenow", String(percent));

  stepListItems.forEach((item, index) => {
    item.classList.toggle("active", index === currentStep);
  });
}

function showStep(stepIndex) {
  currentStep = stepIndex;
  steps.forEach((step, index) => {
    step.classList.toggle("active", index === stepIndex);
  });

  prevBtn.hidden = stepIndex === 0;
  nextBtn.hidden = stepIndex === steps.length - 1;
  submitBtn.hidden = stepIndex !== steps.length - 1;

  updateProgress();

  if (stepIndex === steps.length - 1) {
    updateReview();
  }

  statusEl.textContent = "";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function getCheckedValues(name) {
  return Array.from(document.querySelectorAll(`input[name="${CSS.escape(name)}"]:checked`)).map((el) => el.value);
}

function formToPayload(formElement) {
  const formData = new FormData(formElement);
  return {
    agenciaEvaluada: formData.get("agenciaEvaluada")?.trim() || "",
    q1DisfrutoTrabajar: formData.get("q1DisfrutoTrabajar") || "",
    q2Fiables: formData.get("q2Fiables") || "",
    q3Colaborativo: formData.get("q3Colaborativo") || "",
    q4CreoValor: formData.get("q4CreoValor") || "",
    q5BasadoEstrategia: formData.get("q5BasadoEstrategia") || "",
    q6MentalidadCreativa: formData.get("q6MentalidadCreativa") || "",
    aspectos: getCheckedValues("aspectos"),
    npsRecomendacion: formData.get("npsRecomendacion") || "",
    npsContinuidad: formData.get("npsContinuidad") || "",
    motivoPuntuacion: formData.get("motivoPuntuacion")?.trim() || "",
    comentariosAdicionales: formData.get("comentariosAdicionales")?.trim() || "",
    nombreApellido: formData.get("nombreApellido")?.trim() || "",
    correo: formData.get("correo")?.trim() || "",
    organizacion: formData.get("organizacion")?.trim() || "",
    cargo: formData.get("cargo")?.trim() || "",
    servicioContratado: formData.get("servicioContratado")?.trim() || "",
  };
}

function updateReview() {
  const payload = formToPayload(form);
  reviewBox.innerHTML = "";

  Object.entries(reviewLabels).forEach(([key, label]) => {
    let value = payload[key];
    if (Array.isArray(value)) {
      value = value.length ? value.join(" | ") : "Sin selección";
    }
    if (value === "" || value === null || value === undefined) {
      value = "—";
    }

    const item = document.createElement("div");
    item.className = "review-item";
    item.innerHTML = `<span class="review-label">${label}</span><div>${escapeHtml(String(value))}</div>`;
    reviewBox.appendChild(item);
  });
}

async function handleSubmit(event) {
  event.preventDefault();
  if (!validateStep(currentStep)) return;

  const payload = formToPayload(form);
  submitBtn.disabled = true;
  prevBtn.disabled = true;
  statusEl.textContent = "Enviando...";

  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    if (!result.ok) {
      throw new Error(result.error || "No se pudo guardar la respuesta.");
    }

    form.reset();
    document.querySelectorAll(".selected").forEach((el) => el.classList.remove("selected"));
    showStep(0);
    statusEl.textContent = "Respuesta enviada correctamente.";
  } catch (error) {
    console.error(error);
    statusEl.textContent = "Hubo un error al enviar el formulario.";
  } finally {
    submitBtn.disabled = false;
    prevBtn.disabled = false;
  }
}

function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

prevBtn.addEventListener("click", () => {
  if (currentStep > 0) {
    showStep(currentStep - 1);
  }
});

nextBtn.addEventListener("click", () => {
  if (!validateStep(currentStep)) return;
  if (currentStep < steps.length - 1) {
    showStep(currentStep + 1);
  }
});

form.addEventListener("submit", handleSubmit);

form.addEventListener("keydown", (event) => {
  if (event.key !== "Enter") return;
  const target = event.target;
  const isTextarea = target instanceof HTMLTextAreaElement;
  if (isTextarea || currentStep === steps.length - 1) return;
  if (target.closest(".autocomplete .suggestions") && !target.closest(".suggestions")?.hidden) return;
  event.preventDefault();
  if (validateStep(currentStep) && currentStep < steps.length - 1) {
    showStep(currentStep + 1);
  }
});

document.addEventListener("DOMContentLoaded", () => {
  renderLikertGroups();
  renderNpsScales();
  bindSelectableCards();
  setupAutocomplete("cargo");
  setupAutocomplete("servicioContratado");
  showStep(0);
});
