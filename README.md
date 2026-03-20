# Encuesta de satisfacción para GitHub Pages + Google Sheets

## Archivos

- `index.html`: formulario
- `styles.css`: estilos
- `app.js`: envío del formulario al Apps Script
- `Code.gs`: código para Google Apps Script

## URL del Apps Script ya configurada

El archivo `app.js` ya incluye esta URL:

`https://script.google.com/macros/s/AKfycbww2zA52qYtuY-hE9qiR2AcOOU7UcKnCNDWGdjx4TVxtUCsFgMpinGH5ZKNmo8A8DrGLw/exec`

## Cómo publicar en GitHub Pages

1. Crea un repositorio en GitHub.
2. Sube `index.html`, `styles.css` y `app.js`.
3. Ve a **Settings > Pages**.
4. En **Build and deployment**, elige **Deploy from a branch**.
5. Selecciona la rama principal y la carpeta raíz `/`.
6. Guarda los cambios.
7. GitHub te dará una URL pública para el formulario.

## Cómo configurar Google Sheets

1. Crea una hoja de cálculo.
2. Crea una pestaña llamada exactamente `Respuestas`.
3. En la fila 1 pega estos encabezados:

```text
fechaEnvio
agenciaEvaluada
periodoEvaluado
correo
nombreApellido
organizacion
cargo
servicioContratado
q1DisfrutoTrabajar
q2Fiables
q3Colaborativo
q4CreoValor
q5BasadoEstrategia
q6MentalidadCreativa
aspectos
npsRecomendacion
npsContinuidad
motivoPuntuacion
comentariosAdicionales
```

4. Abre **Extensiones > Apps Script**.
5. Pega el contenido de `Code.gs`.
6. Implementa como **Web app**.
7. Ejecutar como: **Tú**.
8. Acceso: **Anyone** o **Anyone with the link**.
9. Cada vez que cambies `Code.gs`, vuelve a implementar.

## Importante

Si al abrir la URL del script en el navegador ves un JSON diciendo que la web app está activa, está bien. El guardado real ocurre cuando el formulario hace un POST.
