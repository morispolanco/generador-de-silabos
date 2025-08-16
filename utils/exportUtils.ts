
import JSZip from 'jszip';
import type { Syllabus } from '../types';

function createHtmlContent(syllabus: Syllabus): string {
  const allReadings = syllabus.sesiones.flatMap(s => s.lecturas);

  const getReadingsHtml = (readings: typeof allReadings) => readings.map(reading => `
    <li class="py-3">
      <p class="text-sm">${reading.citaAPA}</p>
      <p class="text-xs text-slate-600 italic"><strong>Anotación:</strong> ${reading.anotacion}</p>
      <div class="flex items-center space-x-4 text-xs">
        <a href="${reading.url}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">Acceder al Recurso</a>
        ${reading.doi ? `<span class="text-slate-500">DOI: ${reading.doi}</span>` : ''}
        ${reading.paywall ? `<span class="bg-yellow-100 text-yellow-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full">Posible Paywall</span>` : ''}
      </div>
    </li>
  `).join('');

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Sílabo: ${syllabus.titulo}</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <style>
        @media print {
          body { font-size: 10pt; }
          .no-print { display: none; }
          a { text-decoration: none; color: inherit; }
          a[href]:after { content: " (" attr(href) ")"; }
          #main-content {
             box-shadow: none !important;
             border: none !important;
          }
        }
        body {
            font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
        }
      </style>
      <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "Course",
        "name": "${syllabus.titulo}",
        "description": "${syllabus.descripcion}",
        "hasCourseInstance": {
          "@type": "CourseInstance",
          "courseMode": "online"
        }
      }
      </script>
    </head>
    <body class="bg-slate-100 p-4 sm:p-8">
      <div id="main-content" class="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg">
        <header class="border-b pb-6 mb-6">
          <h1 class="text-3xl font-bold text-slate-900">${syllabus.titulo}</h1>
          <p class="mt-2 text-slate-600">${syllabus.descripcion}</p>
        </header>

        <h2 class="text-xl font-semibold text-slate-800 border-b pb-2">Objetivos de Aprendizaje</h2>
        <ul class="mt-4 list-disc list-inside space-y-2 text-slate-700">${syllabus.objetivos.map(o => `<li>${o}</li>`).join('')}</ul>
        
        <h2 class="mt-8 text-xl font-semibold text-slate-800 border-b pb-2">Competencias</h2>
        <ul class="mt-4 list-disc list-inside space-y-2 text-slate-700">${syllabus.competencias.map(c => `<li>${c}</li>`).join('')}</ul>
        
        <h2 class="mt-8 text-xl font-semibold text-slate-800 border-b pb-2">Sistema de Evaluación</h2>
        <ul class="mt-4 space-y-2 text-slate-700">${syllabus.evaluacion.map(e => `<li class="flex justify-between"><span>${e.tipo}</span><span class="font-semibold">${e.porcentaje}%</span></li>`).join('')}<li class="flex justify-between border-t pt-2 font-bold"><span>TOTAL</span><span>100%</span></li></ul>

        <h2 class="mt-8 text-xl font-semibold text-slate-800 border-b pb-2">Plan de Sesiones</h2>
        <div class="space-y-6 mt-4">
        ${syllabus.sesiones.map(session => `
          <div class="pt-4">
            <h3 class="text-lg font-semibold text-blue-800">Sesión ${session.numero}: ${session.titulo}</h3>
            <div class="mt-3 space-y-3">
              <div>
                <h4 class="font-semibold text-slate-700 text-sm">Objetivos de la Sesión</h4>
                <ul class="list-disc list-inside text-slate-600 text-sm mt-1 space-y-1">${session.objetivos.map(o => `<li>${o}</li>`).join('')}</ul>
              </div>
              <div>
                <h4 class="font-semibold text-slate-700 text-sm">Actividades</h4>
                <table class="w-full text-sm text-left mt-2 border">
                  <thead class="bg-slate-50 text-xs text-slate-600 uppercase">
                    <tr><th class="px-4 py-2">Actividad</th><th class="px-4 py-2">Duración</th><th class="px-4 py-2">Descripción</th></tr>
                  </thead>
                  <tbody>${session.actividades.map(a => `<tr class="border-t"><td class="px-4 py-2 font-medium">${a.nombre}</td><td class="px-4 py-2">${a.minutos} min</td><td class="px-4 py-2">${a.descripcion}</td></tr>`).join('')}</tbody>
                </table>
              </div>
              ${session.lecturas && session.lecturas.length > 0 ? `
              <div>
                <h4 class="font-semibold text-slate-700 text-sm">Lecturas Asignadas</h4>
                <ul class="divide-y divide-slate-200 mt-1">${getReadingsHtml(session.lecturas)}</ul>
              </div>` : ''}
            </div>
          </div>
        `).join('')}
        </div>
        
        <h2 class="mt-8 text-xl font-semibold text-slate-800 border-b pb-2">Bibliografía Completa</h2>
        <ul class="divide-y divide-slate-200 mt-4">${getReadingsHtml(allReadings)}</ul>
      </div>
    </body>
    </html>
  `;
}

export function downloadHtml(syllabus: Syllabus) {
  const htmlContent = createHtmlContent(syllabus);
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `silabo-${syllabus.titulo.toLowerCase().replace(/\s+/g, '-')}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function createCsvContent(syllabus: Syllabus): string {
  const headers = ['Sesion_Numero', 'Sesion_Titulo', 'Tipo_Lectura', 'Cita_APA', 'URL', 'DOI'];
  let csvRows = [headers.join(',')];

  syllabus.sesiones.forEach(session => {
    if (session.lecturas && session.lecturas.length > 0) {
      session.lecturas.forEach(reading => {
        const row = [
          session.numero,
          `"${session.titulo.replace(/"/g, '""')}"`,
          'Lectura Obligatoria',
          `"${reading.citaAPA.replace(/"/g, '""')}"`,
          reading.url,
          reading.doi || '',
        ];
        csvRows.push(row.join(','));
      });
    } else {
        const row = [
          session.numero,
          `"${session.titulo.replace(/"/g, '""')}"`,
          'Sin lectura asignada',
          '',
          '',
          '',
        ];
        csvRows.push(row.join(','));
    }
  });

  return csvRows.join('\n');
}

export function downloadCsv(syllabus: Syllabus) {
    const csvContent = createCsvContent(syllabus);
    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sesiones-${syllabus.titulo.toLowerCase().replace(/\s+/g, '-')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function createReadmeContent(syllabus: Syllabus): string {
    return `
# Sílabo del Curso: ${syllabus.titulo}

Este archivo ZIP contiene los materiales generados para el curso.

## Contenido

1.  **silabo.html**: El programa completo del curso en formato HTML, listo para ser visualizado en un navegador web o impreso.
2.  **sesiones.csv**: Un archivo de valores separados por comas (CSV) que detalla las sesiones y las lecturas asignadas. Puede ser importado fácilmente en hojas de cálculo como Excel o Google Sheets.
3.  **README.md**: Este archivo.

## Uso

-   **HTML**: Abre \`silabo.html\` en cualquier navegador web para ver el programa completo.
-   **CSV**: Utiliza \`sesiones.csv\` para gestionar las lecturas o integrarlo con otras herramientas de planificación.

---
Generado por SílaboGen.
`;
}

export async function downloadZip(syllabus: Syllabus) {
    const zip = new JSZip();
    const slug = syllabus.titulo.toLowerCase().replace(/\s+/g, '-');

    zip.file("silabo.html", createHtmlContent(syllabus));
    zip.file("sesiones.csv", createCsvContent(syllabus));
    zip.file("README.md", createReadmeContent(syllabus));

    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = `silabo-${slug}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
