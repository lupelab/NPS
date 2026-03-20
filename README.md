# Encuesta NPS para GitHub Pages + Google Sheets

## Archivos
- `index.html`
- `styles.css`
- `app.js`
- `Code.gs`

## Google Sheets
La pestaña debe llamarse exactamente:

`Respuestas`

## Encabezados sugeridos
En la fila 1 de la hoja usa estos encabezados:

fechaEnvio
agenciaEvaluada
q1DisfrutoTrabajar
q2Fiables
q3Colaborativo
q4CreoValor
q5BasadoEstrategia
q6MentalidadCreativa
aspectos
npsRecomendacion
npsCategoriaRecomendacion
npsContinuidad
npsCategoriaContinuidad
motivoPuntuacion
comentariosAdicionales
nombreApellido
correo
organizacion
cargo
servicioContratado
reunionSolicitada

## Apps Script
1. Abre Google Sheets
2. Ve a Extensiones > Apps Script
3. Reemplaza el contenido por `Code.gs`
4. Implementa como Web App
5. Vuelve a desplegar si cambias el script

## GitHub Pages
1. Sube estos archivos a tu repo
2. Activa GitHub Pages
3. El frontend ya apunta a tu URL de Apps Script

## Nota
El botón final de reunión quedó preparado como CTA visual. Si quieres, en una siguiente versión se puede conectar a Calendly, WhatsApp o un correo real.


## Últimos ajustes
- NPS con colores por tramo: 0–6 rojo, 7–8 amarillo, 9–10 verde.
- Mejoras responsive para mobile.
- Navegación inferior sticky en pantallas chicas.
