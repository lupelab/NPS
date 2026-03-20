const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbww2zA52qYtuY-hE9qiR2AcOOU7UcKnCNDWGdjx4TVxtUCsFgMpinGH5ZKNmo8A8DrGLw/exec";

const likertOptions = [
  "Totalmente de acuerdo",
  "De acuerdo",
  "Ni de acuerdo ni en desacuerdo",
  "En desacuerdo",
  "Totalmente en desacuerdo",
];

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
const form = document.getElementById("surveyForm");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const submitBtn = document.getElementById("submitBtn");
const statusEl = document.getElementById("status");
const stepCounter = document.getElementById("stepCounter");
const progressPercent = document.getElementById("progressPercent");
const progressFill = document.getElementById("progressFill");
const progressBar = document.querySelector(".progress-bar");
const reviewBox = document.getElementById("reviewBox");

let currentStep = 0;

function renderLikertGroups() {
  const groups = document.querySelectorAll(".radio-group");

  groups.forEach((group) => {
    const fieldName = group.dataset.name;

    likertOptions.forEach((option) => {
      const wrapper = document.createElement("label");
      wrapper.className = "radio-option";

      const radio = document.createElement("input");
      radio.type = "radio";
      radio.name = fieldName;
      radio.value = option;
      radio.required = true;

      const span = document.createElement("span");
      span.textContent = option;

      wrapper.appendChild(radio);
      wrapper.appendChild(span);
      group.appendChild(wrapper);
    });
  });
}

function getStepFields(step) {
  return Array.from(step.querySelectorAll("input, select, textarea"));
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

function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function showStep(stepIndex) {
  currentStep = stepIndex;

  steps.forEach((step, index) => {
    step.classList.toggle("active", index === stepIndex);
  });

  const total = steps.length;
  const percent = Math.round(((stepIndex + 1) / total) * 100);
  stepCounter.textContent = `Paso ${stepIndex + 1} de ${total}`;
  progressPercent.textContent = `${percent}%`;
  progressFill.style.width = `${percent}%`;
  progressBar.setAttribute("aria-valuenow", String(percent));

  prevBtn.hidden = stepIndex === 0;
  nextBtn.hidden = stepIndex === total - 1;
  submitBtn.hidden = stepIndex !== total - 1;

  if (stepIndex === total - 1) {
    updateReview();
  }

  statusEl.textContent = "";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function getCheckedValues(name) {
  return Array.from(document.querySelectorAll(`input[name="${name}"]:checked`)).map((el) => el.value);
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
    npsRecomendacion: formData.get("npsRecomendacion")?.trim() || "",
    npsContinuidad: formData.get("npsContinuidad")?.trim() || "",
    motivoPuntuacion: formData.get("motivoPuntuacion")?.trim() || "",
    comentariosAdicionales: formData.get("comentariosAdicionales")?.trim() || "",
    nombreApellido: formData.get("nombreApellido")?.trim() || "",
    correo: formData.get("correo")?.trim() || "",
    organizacion: formData.get("organizacion")?.trim() || "",
    cargo: formData.get("cargo")?.trim() || "",
    servicioContratado: formData.get("servicioContratado")?.trim() || "",
  };
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

document.addEventListener("change", () => {
  if (currentStep === steps.length - 1) {
    updateReview();
  }
});

document.addEventListener("DOMContentLoaded", () => {
  renderLikertGroups();
  showStep(0);
});
