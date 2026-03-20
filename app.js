const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbww2zA52qYtuY-hE9qiR2AcOOU7UcKnCNDWGdjx4TVxtUCsFgMpinGH5ZKNmo8A8DrGLw/exec";

const likertOptions = [
  "Totalmente de acuerdo",
  "De acuerdo",
  "Ni de acuerdo ni en desacuerdo",
  "En desacuerdo",
  "Totalmente en desacuerdo",
];

function renderLikertGroups() {
  const groups = document.querySelectorAll(".radio-group");

  groups.forEach((group) => {
    const fieldName = group.dataset.name;

    likertOptions.forEach((option, index) => {
      const wrapper = document.createElement("label");
      wrapper.className = "radio-option";

      const radio = document.createElement("input");
      radio.type = "radio";
      radio.name = fieldName;
      radio.value = option;
      radio.required = index === 0;

      const text = document.createElement("span");
      text.textContent = option;

      wrapper.appendChild(radio);
      wrapper.appendChild(text);
      group.appendChild(wrapper);
    });
  });
}

function getCheckedValues(name) {
  return Array.from(document.querySelectorAll(`input[name="${name}"]:checked`)).map((el) => el.value);
}

function formToPayload(form) {
  const formData = new FormData(form);

  return {
    agenciaEvaluada: (formData.get("agenciaEvaluada") || "").trim(),
    periodoEvaluado: (formData.get("periodoEvaluado") || "").trim(),
    correo: (formData.get("correo") || "").trim(),
    nombreApellido: (formData.get("nombreApellido") || "").trim(),
    organizacion: (formData.get("organizacion") || "").trim(),
    cargo: (formData.get("cargo") || "").trim(),
    servicioContratado: (formData.get("servicioContratado") || "").trim(),
    q1DisfrutoTrabajar: formData.get("q1DisfrutoTrabajar"),
    q2Fiables: formData.get("q2Fiables"),
    q3Colaborativo: formData.get("q3Colaborativo"),
    q4CreoValor: formData.get("q4CreoValor"),
    q5BasadoEstrategia: formData.get("q5BasadoEstrategia"),
    q6MentalidadCreativa: formData.get("q6MentalidadCreativa"),
    aspectos: getCheckedValues("aspectos"),
    npsRecomendacion: Number(formData.get("npsRecomendacion")),
    npsContinuidad: Number(formData.get("npsContinuidad")),
    motivoPuntuacion: (formData.get("motivoPuntuacion") || "").trim(),
    comentariosAdicionales: (formData.get("comentariosAdicionales") || "").trim(),
  };
}

function setStatus(message, type = "") {
  const status = document.getElementById("status");
  status.textContent = message;
  status.className = type;
}

async function handleSubmit(event) {
  event.preventDefault();

  const form = event.target;
  const submitBtn = document.getElementById("submitBtn");

  if (!form.reportValidity()) return;

  const payload = formToPayload(form);

  submitBtn.disabled = true;
  setStatus("Enviando...", "");

  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok || !result.ok) {
      throw new Error(result.error || "No se pudo guardar la respuesta.");
    }

    form.reset();
    setStatus("Respuesta enviada correctamente.", "success");
  } catch (error) {
    console.error(error);
    setStatus(`Hubo un error al enviar el formulario: ${error.message}`, "error");
  } finally {
    submitBtn.disabled = false;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderLikertGroups();
  document.getElementById("surveyForm").addEventListener("submit", handleSubmit);
});
