const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbww2zA52qYtuY-hE9qiR2AcOOU7UcKnCNDWGdjx4TVxtUCsFgMpinGH5ZKNmo8A8DrGLw/exec";

const likertOptions = [
  { value: "Totalmente de acuerdo", help: "Experiencia muy positiva" },
  { value: "De acuerdo", help: "En general sí" },
  { value: "Ni de acuerdo ni en desacuerdo", help: "Neutral" },
  { value: "En desacuerdo", help: "Hay puntos a mejorar" },
  { value: "Totalmente en desacuerdo", help: "Experiencia negativa" },
];

const autocompleteOptions = {
  cargo: [
    "Gerente/jefe de Marketing",
    "Coordinador",
    "Brand manager",
    "Director de marketing",
    "Marketing manager",
    "Analista de marketing",
    "Gerente de marca",
    "CEO",
    "CMO",
    "Otro",
  ],
  servicioContratado: [
    "Medios",
    "Planning",
    "Consultoría",
    "Creatividad",
    "BTL (Organización de eventos, logística)",
    "Producción",
    "Social media",
    "Performance",
    "Research",
    "Otro",
  ],
};

const reviewLabels = {
  agenciaEvaluada: "Agencia evaluada",
  q1DisfrutoTrabajar: "Nuestro equipo disfrutó trabajando con la agencia",
  q2Fiables: "El equipo de la agencia fue fiable",
  q3Colaborativo: "La agencia fomentó un ambiente colaborativo",
  q4CreoValor: "La agencia creó valor y mejores prácticas",
  q5BasadoEstrategia: "El trabajo se basó en la estrategia",
  q6MentalidadCreativa: "La agencia permitió una mentalidad creativa",
  aspectos: "Relación de trabajo",
  npsRecomendacion: "Probabilidad de recomendar",
  npsContinuidad: "Probabilidad de continuar contratando",
  motivoPuntuacion: "Motivo de la puntuación",
  comentariosAdicionales: "Comentarios adicionales",
  nombreApellido: "Nombre y apellido",
  correo: "Correo",
  organizacion: "Organización",
  cargo: "Cargo",
  servicioContratado: "Servicio contratado",
  reunionSolicitada: "Solicitud de reunión",
  npsCategoriaRecomendacion: "Categoría NPS recomendación",
  npsCategoriaContinuidad: "Categoría NPS continuidad",
};

const npsProfiles = {
  detractor: {
    title: "Sos un detractor",
    className: "detractor",
    summary: "Hay una experiencia que hoy no alcanza tus expectativas.",
    description: "Los detractores puntúan entre 0 y 6. Indican que hubo fricciones, decepciones o aspectos relevantes que afectan su percepción del servicio y reducen la probabilidad de recomendar o continuar.",
  },
  neutro: {
    title: "Sos neutro",
    className: "neutro",
    summary: "La experiencia fue correcta, pero todavía no suficientemente destacable.",
    description: "Los neutros puntúan 7 u 8. Suelen reconocer valor, pero todavía ven oportunidades claras de mejora antes de recomendar con entusiasmo o consolidar su continuidad.",
  },
  promotor: {
    title: "Sos promotor",
    className: "promotor",
    summary: "La experiencia generó confianza y alto nivel de satisfacción.",
    description: "Los promotores puntúan 9 o 10. Son clientes que valoran el servicio, lo recomendarían activamente y perciben una experiencia diferencial que merece seguir fortalecida.",
  },
};

const form = document.getElementById("surveyForm");
const steps = Array.from(document.querySelectorAll(".step"));
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const submitBtn = document.getElementById("submitBtn");
const statusEl = document.getElementById("status");
const reviewBox = document.getElementById("reviewBox");
const progressFill = document.getElementById("progressFill");
const progressBar = document.getElementById("progressBar");
const stepCounter = document.getElementById("stepCounter");
const progressPercent = document.getElementById("progressPercent");
const currentStepTitle = document.getElementById("currentStepTitle");
const stepListItems = Array.from(document.querySelectorAll("#stepList li"));
const thankYouScreen = document.getElementById("thankYouScreen");
const meetingRequestBtn = document.getElementById("meetingRequestBtn");
const meetingThanksBox = document.getElementById("meetingThanksBox");
const navBar = document.getElementById("navBar");
let currentStep = 0;

function renderLikertGroups() {
  document.querySelectorAll(".likert-grid").forEach((group) => {
    const fieldName = group.dataset.name;
    group.innerHTML = "";

    likertOptions.forEach((option, index) => {
      const card = document.createElement("label");
      card.className = "scale-card";
      card.innerHTML = `
        <input type="radio" name="${fieldName}" value="${option.value}" ${index === 0 ? "required" : ""} />
        <strong>${option.value}</strong>
        <small>${option.help}</small>
      `;
      group.appendChild(card);
    });
  });
}

function renderNpsScales() {
  document.querySelectorAll(".nps-scale").forEach((scale) => {
    const fieldName = scale.dataset.name;
    scale.innerHTML = "";

    for (let i = 0; i <= 10; i += 1) {
      const pill = document.createElement("label");
      const categoryClass = i <= 6 ? "nps-detractor" : i <= 8 ? "nps-neutro" : "nps-promotor";
      pill.className = `nps-pill ${categoryClass}`;
      pill.innerHTML = `
        <input type="radio" name="${fieldName}" value="${i}" required />
        <span>${i}</span>
      `;
      scale.appendChild(pill);
    }
  });
}

function bindSelectableCards() {
  form.addEventListener("change", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) return;

    if (target.type === "radio") {
      document.querySelectorAll(`input[name="${CSS.escape(target.name)}"]`).forEach((input) => {
        input.closest("label")?.classList.toggle("selected", input.checked);
      });
    }

    if (target.type === "checkbox") {
      target.closest("label")?.classList.toggle("selected", target.checked);
    }

    if (target.name === "npsRecomendacion" || target.name === "npsContinuidad") {
      updateNpsFeedback(target.name, Number(target.value));
    }
  });
}

function setupAutocomplete(fieldName) {
  const input = form.querySelector(`input[name="${fieldName}"]`);
  const box = document.getElementById(`${fieldName}Suggestions`);
  const options = autocompleteOptions[fieldName] || [];
  if (!input || !box) return;

  function closeSuggestions() {
    box.hidden = true;
    box.innerHTML = "";
  }

  function renderSuggestions(value) {
    const query = value.trim().toLowerCase();
    if (!query) {
      closeSuggestions();
      return;
    }

    const results = options.filter((option) => option.toLowerCase().includes(query)).slice(0, 6);
    if (!results.length) {
      closeSuggestions();
      return;
    }

    box.innerHTML = results
      .map((option) => {
        const highlighted = option.replace(
          new RegExp(`(${escapeRegExp(value.trim())})`, "ig"),
          "<mark>$1</mark>"
        );
        return `<div class="suggestion" data-value="${escapeHtml(option)}">${highlighted}</div>`;
      })
      .join("");

    box.hidden = false;
  }

  input.addEventListener("input", () => renderSuggestions(input.value));
  input.addEventListener("focus", () => renderSuggestions(input.value));

  box.addEventListener("mousedown", (event) => {
    const option = event.target.closest(".suggestion");
    if (!option) return;
    input.value = option.dataset.value || "";
    closeSuggestions();
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest(`input[name="${fieldName}"]`) && !event.target.closest(`#${box.id}`)) {
      closeSuggestions();
    }
  });
}

function validateStep(stepIndex) {
  const current = steps[stepIndex];
  if (!current) return true;

  const fields = Array.from(current.querySelectorAll("input, textarea"));
  for (const field of fields) {
    if (field instanceof HTMLInputElement && (field.type === "radio" || field.type === "checkbox")) {
      if (field.required) {
        const checked = current.querySelector(`input[name="${CSS.escape(field.name)}"]:checked`);
        if (!checked) {
          statusEl.textContent = "Completa este bloque antes de avanzar.";
          return false;
        }
      }
      continue;
    }

    if (!field.checkValidity()) {
      field.reportValidity();
      statusEl.textContent = "Revisa los datos de este bloque para poder avanzar.";
      return false;
    }
  }

  statusEl.textContent = "";
  return true;
}

function updateProgress() {
  const total = steps.length;
  const percent = Math.round(((currentStep + 1) / total) * 100);
  const title = steps[currentStep]?.dataset.stepTitle || `Paso ${currentStep + 1}`;

  stepCounter.textContent = `Paso ${currentStep + 1} de ${total}`;
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

  if (stepIndex === steps.length - 1) {
    updateReview();
  }

  updateProgress();
  statusEl.textContent = "";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function getCheckedValues(name) {
  return Array.from(document.querySelectorAll(`input[name="${CSS.escape(name)}"]:checked`)).map((el) => el.value);
}

function getNpsProfile(score) {
  if (score >= 9) return npsProfiles.promotor;
  if (score >= 7) return npsProfiles.neutro;
  return npsProfiles.detractor;
}

function updateNpsFeedback(fieldName, score) {
  const box = document.getElementById(`${fieldName}Feedback`);
  if (!box || Number.isNaN(score)) return;
  const profile = getNpsProfile(score);
  box.innerHTML = `
    <span class="nps-feedback-title ${profile.className}">${profile.title}</span>
    <div class="nps-feedback-copy">
      <strong>${profile.summary}</strong>
      <span>${profile.description}</span>
    </div>
  `;
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
    npsCategoriaRecomendacion: formData.get("npsRecomendacion") !== null && formData.get("npsRecomendacion") !== "" ? getNpsProfile(Number(formData.get("npsRecomendacion"))).title : "",
    npsCategoriaContinuidad: formData.get("npsContinuidad") !== null && formData.get("npsContinuidad") !== "" ? getNpsProfile(Number(formData.get("npsContinuidad"))).title : "",
    motivoPuntuacion: formData.get("motivoPuntuacion")?.trim() || "",
    comentariosAdicionales: formData.get("comentariosAdicionales")?.trim() || "",
    nombreApellido: formData.get("nombreApellido")?.trim() || "",
    correo: formData.get("correo")?.trim() || "",
    organizacion: formData.get("organizacion")?.trim() || "",
    cargo: formData.get("cargo")?.trim() || "",
    servicioContratado: formData.get("servicioContratado")?.trim() || "",
    reunionSolicitada: document.getElementById("reunionSolicitada")?.checked ? "Sí" : "No",
  };
}

function updateReview() {
  const payload = formToPayload(form);
  reviewBox.innerHTML = "";

  Object.entries(reviewLabels).forEach(([key, label]) => {
    let value = payload[key];
    if (Array.isArray(value)) value = value.length ? value.join(" | ") : "Sin selección";
    if (value === "" || value === null || value === undefined) value = "—";

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
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    if (!result.ok) throw new Error(result.error || "No se pudo guardar la respuesta.");

    form.hidden = true;
    thankYouScreen.hidden = false;
    navBar.hidden = true;
    statusEl.textContent = "";

    const reunionSolicitada = payload.reunionSolicitada === "Sí";
    meetingThanksBox.innerHTML = reunionSolicitada
      ? `<strong>Solicitud registrada</strong><span>Indicaron que desean una reunión con el comité del cliente para profundizar el feedback.</span>`
      : `<strong>¿Querés profundizar tu feedback?</strong><span>Podés solicitar una reunión con el comité del cliente mediante el botón de abajo.</span>`;
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
  if (currentStep > 0) showStep(currentStep - 1);
});

nextBtn.addEventListener("click", () => {
  if (!validateStep(currentStep)) return;
  if (currentStep < steps.length - 1) showStep(currentStep + 1);
});

meetingRequestBtn.addEventListener("click", () => {
  meetingRequestBtn.textContent = "Solicitud de reunión marcada";
  meetingRequestBtn.disabled = true;
  meetingThanksBox.innerHTML = `<strong>Solicitud registrada</strong><span>Podés usar esta acción como CTA visual. Si querés, después te lo dejo conectado a Calendly, mail o WhatsApp.</span>`;
});

form.addEventListener("submit", handleSubmit);

form.addEventListener("keydown", (event) => {
  if (event.key !== "Enter") return;
  const target = event.target;
  const isTextarea = target instanceof HTMLTextAreaElement;
  if (isTextarea || currentStep === steps.length - 1) return;
  if (target.closest(".autocomplete .suggestions") && !target.closest(".suggestions")?.hidden) return;
  event.preventDefault();
  if (validateStep(currentStep) && currentStep < steps.length - 1) showStep(currentStep + 1);
});

document.addEventListener("DOMContentLoaded", () => {
  renderLikertGroups();
  renderNpsScales();
  bindSelectableCards();
  setupAutocomplete("cargo");
  setupAutocomplete("servicioContratado");
  showStep(0);
});
