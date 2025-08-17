import { GoogleGenAI, Type } from "@google/genai";
import type { CourseInput, Syllabus, FinalExam } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY no está configurada. Asegúrate de que la variable de entorno API_KEY esté disponible.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const syllabusSchema = {
  type: Type.OBJECT,
  properties: {
    titulo: { type: Type.STRING, description: "El título completo del curso. Debe seguir las normas de capitalización del español (solo mayúscula en la primera palabra y nombres propios)." },
    profesor: { type: Type.STRING, description: "El nombre completo del profesor o instructor a cargo del curso." },
    universidad: { type: Type.STRING, description: "El nombre de la universidad o institución donde se imparte el curso." },
    descripcion: { type: Type.STRING, description: "Un párrafo breve que describa el curso, sus temas principales y su enfoque." },
    objetivos: { 
        type: Type.ARRAY, 
        items: { type: Type.STRING },
        description: "Una lista de 3 a 5 objetivos de aprendizaje clave que los estudiantes alcanzarán al final del curso."
    },
    competencias: { 
        type: Type.ARRAY, 
        items: { type: Type.STRING },
        description: "Una lista de 3 a 5 competencias específicas que los estudiantes desarrollarán."
    },
    evaluacion: {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                tipo: { type: Type.STRING, description: "El tipo de evaluación (ej. 'Examen parcial 1', 'Trabajo final')." },
                porcentaje: { type: Type.INTEGER, description: "El peso porcentual de esta evaluación." }
            },
            required: ["tipo", "porcentaje"]
        },
        description: "Una lista de todos los componentes de la evaluación con sus porcentajes."
    },
    sesiones: {
      type: Type.ARRAY,
      description: "Un array que contiene el plan detallado para cada una de las sesiones del curso.",
      items: {
        type: Type.OBJECT,
        properties: {
          numero: { type: Type.INTEGER, description: "El número de la sesión, comenzando en 1." },
          titulo: { type: Type.STRING, description: "Un título temático y conciso para la sesión, siguiendo las normas de capitalización del español." },
          objetivos: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Una lista de 2-3 objetivos de aprendizaje específicos para esta sesión."
          },
          actividades: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                nombre: { type: Type.STRING, description: "Nombre de la actividad (ej. 'Clase magistral', 'Discusión en grupo', 'Ejercicio práctico')." },
                minutos: { type: Type.INTEGER, description: "Duración de la actividad en minutos." },
                descripcion: { type: Type.STRING, description: "Breve descripción de la actividad." }
              },
              required: ["nombre", "minutos", "descripcion"]
            },
            description: "Desglose de las actividades de la sesión. La suma de los minutos debe ser igual a la duración total de la sesión."
          },
          lecturas: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                citaAPA: { type: Type.STRING, description: "La cita completa de la lectura en formato APA 7." },
                url: { type: Type.STRING, description: "El enlace URL directo y funcional al recurso de acceso abierto (PDF o HTML). DEBE ser un enlace que lleve directamente al contenido completo, no a una página de resumen o 'abstract'." },
                doi: { type: Type.STRING, description: "El DOI del artículo, si está disponible." },
                anotacion: { type: Type.STRING, description: "Una anotación de 1-3 líneas resumiendo la utilidad pedagógica de la lectura para la sesión. Incluir una breve justificación de por qué se considera de acceso abierto (ej. 'publicado en SciELO', 'repositorio de la Universidad X')." },
                paywall: { type: Type.BOOLEAN, description: "Debe ser `false` por defecto. Marcar como `true` ÚNICAMENTE como último recurso absoluto si, tras una búsqueda exhaustiva en repositorios OA, no se encuentra una alternativa viable y el recurso más pertinente está detrás de un muro de pago."}
              },
              required: ["citaAPA", "url", "anotacion", "paywall"]
            },
            description: "Una lista de lecturas asignadas. Priorizar fuertemente artículos, capítulos de libros o informes de acceso abierto verificable."
          }
        },
        required: ["numero", "titulo", "objetivos", "actividades"]
      }
    }
  },
  required: ["titulo", "profesor", "universidad", "descripcion", "objetivos", "competencias", "evaluacion", "sesiones"]
};


export const generateSyllabus = async (formData: CourseInput): Promise<Syllabus> => {
    const prompt = createSyllabusPrompt(formData);

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: syllabusSchema,
                temperature: 0.7,
            },
        });
        
        const jsonText = response.text.trim();
        const parsedSyllabus: Syllabus = JSON.parse(jsonText);
        
        if (parsedSyllabus.sesiones.length !== formData.sessions) {
            console.warn(`Se solicitaron ${formData.sessions} sesiones pero se generaron ${parsedSyllabus.sesiones.length}. Se usará el resultado generado.`);
        }

        return parsedSyllabus;

    } catch (error) {
        console.error("Error en la llamada a Gemini API para generar sílabo:", error);
        throw new Error("No se pudo generar el sílabo desde la API.");
    }
};

const createSyllabusPrompt = (data: CourseInput): string => {
  let prompt = `Eres un experto en diseño curricular y pedagogía universitaria de nivel mundial, con un compromiso ético absoluto con el conocimiento abierto. Tu tarea es generar un programa de estudios (sílabo) impecable, riguroso y práctico en español para un profesor universitario. El fracaso no es una opción; la reputación del profesor depende de la calidad de tu trabajo.

**REGLAS CRÍTICAS E INQUEBRANTABLES:**

1.  **BIBLIOGRAFÍA DE ACCESO ABIERTO VERIFICADO (Regla de Oro):**
    *   **OBLIGACIÓN:** Debes encontrar y proporcionar **únicamente** recursos bibliográficos (artículos, capítulos de libro, informes) que sean de **acceso abierto real y verificable**.
    *   **PROHIBIDO:** No enlaces a páginas de resumen (abstracts), páginas de login, portales de editoriales (como Springer, Elsevier) que pidan pago, ni a ResearchGate o Academia.edu que requieran registro.
    *   **FUENTES VÁLIDAS:** Concéntrate exclusivamente en repositorios institucionales de universidades, archivos de preprints como arXiv, bioRxiv, y plataformas de publicación OA reconocidas como SciELO, Redalyc, DOAJ, OpenStax, PubMed Central.
    *   **VERIFICACIÓN:** Antes de incluir un enlace, actúa como si lo estuvieras abriendo en un navegador en modo incógnito. ¿Puedes leer el texto completo (PDF o HTML) sin hacer clic en "Login", "Register", "Purchase" o "Subscribe"? Si la respuesta es no, el enlace es **inválido** y no debes incluirlo.
    *   **ANOTACIÓN JUSTIFICADA:** En el campo 'anotacion' de cada lectura, además del resumen pedagógico, DEBES añadir una breve frase que justifique por qué el recurso es de acceso abierto. Ejemplos: "Disponible en el repositorio de la Universidad Complutense.", "Publicado en la revista de acceso abierto 'Comunicar'.", "Artículo accesible a través de SciELO."
    *   **PAYWALL COMO ÚLTIMO RECURSO:** Solo si es absolutamente imposible encontrar una fuente OA para un concepto fundamental, puedes marcar 'paywall: true'. Esto debe ser una excepción extremadamente rara.

2.  **FORMATO JSON ESTRICTO:** Tu respuesta debe ser un objeto JSON válido que se ajuste perfectamente al \`responseSchema\` proporcionado. No incluyas ningún texto, explicación o carácter fuera de las llaves \`{...}\` del JSON.

3.  **COHERENCIA PEDAGÓGICA:** El contenido de cada sesión debe ser coherente con los objetivos generales del curso. La suma de los minutos de las actividades planificadas para una sesión debe ser **exactamente igual** a la duración total de la sesión especificada.

4.  **IDIOMA:** Todo el contenido generado debe estar en español académico de alta calidad.

5.  **CAPITALIZACIÓN EN ESPAÑOL:** Todos los títulos que generes (título del curso, títulos de las sesiones, etc.) deben seguir las normas de capitalización del español: solo la primera palabra y los nombres propios se escriben con mayúscula inicial. Por ejemplo: "Historia de la literatura medieval", no "Historia de la Literatura Medieval".

**DATOS DEL CURSO PARA EL SÍLABO:**

-   **Título:** ${data.title}
-   **Profesor/a:** ${data.profesor}
-   **Universidad:** ${data.universidad}
-   **Número de Sesiones:** ${data.sessions}
-   **Duración por Sesión:** ${data.sessionDuration} minutos
-   **Nivel:** ${data.level}
-   **Formato:** ${data.format}
-   **Competencias a desarrollar:** ${data.competencies}
-   **Esquema de Evaluación:**
`;

  data.midtermExams.forEach((exam, index) => {
    prompt += `    - Examen Parcial ${index + 1}: ${exam.percentage}%\n`;
  });
  prompt += `    - Evaluación Final (Examen o Trabajo): ${data.finalPercentage}%\n`;
  if (data.remainingPercentage > 0 && data.remainingAssignment) {
      prompt += `    - ${data.remainingAssignment}: ${data.remainingPercentage}%\n`;
  }

  prompt += `
Genera el sílabo completo siguiendo estas directrices con la máxima precisión y rigor.`;

  return prompt;
};

export const generateCompanionForSyllabus = async (syllabus: Syllabus): Promise<string> => {
    const prompt = createCompanionPrompt(syllabus);
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.8,
            },
        });
        
        // El resultado es directamente el texto HTML
        return response.text.trim();
    } catch (error) {
        console.error("Error en la llamada a Gemini API para generar el companion:", error);
        throw new Error("No se pudo generar el documento de acompañamiento desde la API.");
    }
};

const createCompanionPrompt = (syllabus: Syllabus): string => {
  const sessionDataForPrompt = syllabus.sesiones.map(s => ({
    numero: s.numero,
    titulo: s.titulo,
    objetivos: s.objetivos
  }));

  return `Eres un catedrático experto y un escritor académico excepcional. Tu tarea es redactar un "Documento de Acompañamiento" para el curso "${syllabus.titulo}". Este documento consistirá en una serie de artículos de desarrollo, uno por cada sesión del sílabo. El resultado final debe ser un ÚNICO bloque de código HTML.

**REGLAS FUNDAMENTALES:**

1.  **FORMATO HTML ESTRICTO:** La totalidad de tu respuesta debe ser código HTML bien formado. No incluyas \`<!DOCTYPE html>\`, \`<html>\`, \`<head>\` o \`<body>\`. Comienza directamente con un \`<h1>\` para el título principal y sigue con la estructura. No uses Markdown.
2.  **CONTENIDO PROFUNDO Y ORIGINAL:** Para cada sesión, debes escribir un artículo original y profundo de aproximadamente 1500 palabras. Este artículo debe desarrollar los objetivos y el tema de la sesión, proporcionando contexto, explicaciones detalladas, ejemplos relevantes y análisis crítico. No te limites a repetir los objetivos; expándelos en un texto académico coherente y rico.
3.  **ESTRUCTURA DEL DOCUMENTO:**
    *   El documento debe empezar con un \`<h1>\` que contenga el título del curso: "${syllabus.titulo} - Documento de acompañamiento".
    *   A continuación, para CADA sesión del sílabo, debes seguir esta estructura:
        *   Un \`<h2>\` con el texto "Sesión \${numero}: \${titulo de la sesión}".
        *   Seguido del artículo de ~1500 palabras, utilizando etiquetas HTML semánticas como \`<p>\`, \`<h3>\` para subsecciones, \`<ul>\`, \`<ol>\`, \`<li>\`, \`<strong>\`, \`<em>\` y \`<blockquote>\` para citas.
4.  **TONO Y LENGUAJE:** El lenguaje debe ser académico, claro y en español. La redacción debe ser atractiva y facilitar el aprendizaje.
5.  **CAPITALIZACIÓN EN ESPAÑOL:** Los títulos y subtítulos (\`<h1>\`, \`<h2>\`, \`<h3>\`) deben seguir las reglas de capitalización del español: solo la primera palabra y los nombres propios llevan mayúscula inicial.

**SÍLABO DE REFERENCIA (SOLO TÍTULOS Y OBJETIVOS DE SESIONES):**

${JSON.stringify(sessionDataForPrompt, null, 2)}

Ahora, genera el contenido HTML completo para el Documento de Acompañamiento.`;
};

const examSchema = {
  type: Type.OBJECT,
  properties: {
    preguntasOpcionMultiple: {
      type: Type.ARRAY,
      description: "Una lista de al menos 20 preguntas de opción múltiple.",
      items: {
        type: Type.OBJECT,
        properties: {
          pregunta: { type: Type.STRING, description: "El enunciado de la pregunta." },
          opciones: { 
            type: Type.ARRAY, 
            description: "Un array de exactamente 4 strings con las posibles respuestas.",
            items: { type: Type.STRING }
          },
          respuestaCorrecta: { type: Type.INTEGER, description: "El índice (0-3) de la respuesta correcta en el array de opciones." }
        },
        required: ["pregunta", "opciones", "respuestaCorrecta"]
      }
    },
    preguntasDeEnsayo: {
      type: Type.ARRAY,
      description: "Una lista de exactamente 5 preguntas de desarrollo o ensayo.",
      items: {
        type: Type.OBJECT,
        properties: {
          pregunta: { type: Type.STRING, description: "El enunciado de la pregunta de ensayo." }
        },
        required: ["pregunta"]
      }
    }
  },
  required: ["preguntasOpcionMultiple", "preguntasDeEnsayo"]
};

export const generateFinalExam = async (syllabus: Syllabus): Promise<FinalExam> => {
    const prompt = createExamPrompt(syllabus);

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: examSchema,
                temperature: 0.5,
            },
        });
        
        const jsonText = response.text.trim();
        const parsedExam: FinalExam = JSON.parse(jsonText);
        
        return parsedExam;

    } catch (error) {
        console.error("Error en la llamada a Gemini API para generar examen:", error);
        throw new Error("No se pudo generar el examen desde la API.");
    }
};

const createExamPrompt = (syllabus: Syllabus): string => {
  const sessionTopics = syllabus.sesiones.map(s => ` - Sesión ${s.numero}: ${s.titulo}`).join('\n');

  return `Eres un profesor universitario experto en evaluación educativa. Tu tarea es crear un examen final riguroso y omnicomprensivo para el curso "${syllabus.titulo}".

**REGLAS CRÍTICAS:**
1.  **COBERTURA TOTAL:** El examen DEBE cubrir de manera equitativa los temas de TODAS las sesiones del curso listadas a continuación. No te centres solo en algunas sesiones.
2.  **FORMATO JSON ESTRICTO:** La respuesta debe ser un objeto JSON válido que se ajuste perfectamente al \`responseSchema\` proporcionado. No incluyas ningún texto fuera del JSON.
3.  **ESTRUCTURA DEL EXAMEN:**
    *   Genera **al menos 20 preguntas de opción múltiple**. Cada pregunta debe tener 4 opciones de respuesta plausibles pero solo una correcta.
    *   Genera **exactamente 5 preguntas de ensayo/desarrollo**. Estas preguntas deben requerir que el estudiante sintetice información, compare conceptos o aplique el conocimiento de manera crítica, basándose en el contenido del curso.
4.  **CALIDAD ACADÉMICA:** Las preguntas deben ser claras, precisas y adecuadas para un nivel universitario. Evita ambigüedades.
5.  **IDIOMA:** Todo el contenido debe estar en español.

**TEMARIO DEL CURSO (BASADO EN LAS SESIONES):**
${sessionTopics}

Ahora, genera el examen final completo en formato JSON.`;
};
