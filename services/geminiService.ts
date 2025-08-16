
import { GoogleGenAI, Type } from "@google/genai";
import type { CourseInput, Syllabus } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY no está configurada. Asegúrate de que la variable de entorno API_KEY esté disponible.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const syllabusSchema = {
  type: Type.OBJECT,
  properties: {
    titulo: { type: Type.STRING, description: "El título completo del curso." },
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
                tipo: { type: Type.STRING, description: "El tipo de evaluación (ej. 'Examen Parcial 1', 'Trabajo Final')." },
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
          titulo: { type: Type.STRING, description: "Un título temático y conciso para la sesión." },
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
  required: ["titulo", "descripcion", "objetivos", "competencias", "evaluacion", "sesiones"]
};


export const generateSyllabus = async (formData: CourseInput): Promise<Syllabus> => {
    const prompt = createPrompt(formData);

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
        console.error("Error en la llamada a Gemini API:", error);
        throw new Error("No se pudo generar el sílabo desde la API.");
    }
};


const createPrompt = (data: CourseInput): string => {
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

**DATOS DEL CURSO PARA EL SÍLABO:**

-   **Título:** ${data.title}
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
