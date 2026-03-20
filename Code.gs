const SHEET_NAME = "Respuestas";

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({
      ok: true,
      message: "Web app activa. Usa POST para enviar datos del formulario."
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);

    if (!sheet) {
      throw new Error("No existe la hoja configurada.");
    }

    const row = [
      new Date(),
      safe(data.agenciaEvaluada),
      safe(data.q1DisfrutoTrabajar),
      safe(data.q2Fiables),
      safe(data.q3Colaborativo),
      safe(data.q4CreoValor),
      safe(data.q5BasadoEstrategia),
      safe(data.q6MentalidadCreativa),
      Array.isArray(data.aspectos) ? data.aspectos.join(" | ") : "",
      safe(data.npsRecomendacion),
      safe(data.npsContinuidad),
      safe(data.motivoPuntuacion),
      safe(data.comentariosAdicionales),
      safe(data.nombreApellido),
      safe(data.correo),
      safe(data.organizacion),
      safe(data.cargo),
      safe(data.servicioContratado)
    ];

    sheet.appendRow(row);

    return ContentService
      .createTextOutput(JSON.stringify({
        ok: true,
        message: "Respuesta guardada correctamente."
      }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        ok: false,
        error: error.message || "Error desconocido"
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function safe(value) {
  return value === null || value === undefined ? "" : value;
}
