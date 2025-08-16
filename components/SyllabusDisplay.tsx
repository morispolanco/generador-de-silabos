import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import type { Syllabus, Session, Reading } from '../types';
import ResultActions from './ResultActions';
import { generateCompanionForSyllabus } from '../services/geminiService';
import { downloadCompanionHtml } from '../utils/exportUtils';

const SESSION_STORAGE_KEY_SYLLABUS = 'syllabusForCompanionPurchase';

const ReadingCard: React.FC<{ reading: Reading }> = ({ reading }) => {
  const googleScholarUrl = `https://scholar.google.com/scholar?q=${encodeURIComponent(reading.citaAPA)}`;
  return (
    <li className="py-3">
      <div className="flex flex-col space-y-1">
        <p className="text-sm text-slate-800" dangerouslySetInnerHTML={{ __html: reading.citaAPA }}></p>
        <p className="text-xs text-slate-500 italic"><strong className="font-semibold">Anotación:</strong> {reading.anotacion}</p>
        <div className="flex items-center flex-wrap gap-x-4 gap-y-2 text-xs mt-1">
          <a href={reading.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-blue-600 hover:underline font-medium">
              Acceder al recurso
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-4.5 0V6.375c0-.621.504-1.125 1.125-1.125h1.5c.621 0 1.125.504 1.125 1.125v1.5m-4.5 0h4.5" /></svg>
          </a>
          <a href={googleScholarUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-slate-500 hover:text-blue-600 hover:underline font-medium" title="Buscar esta cita en Google Scholar">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M10.53 5.47a.75.75 0 0 0-1.06 0L6.22 8.72a.75.75 0 0 0 1.06 1.06L10 7.06l2.72 2.72a.75.75 0 1 0 1.06-1.06l-3.25-3.25Z" /><path d="M4.75 10.75a.75.75 0 0 0-1.5 0v4.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-4.5a.75.75 0 0 0-1.5 0v4.5a.25.25 0 0 1-.25.25H6a.25.25 0 0 1-.25-.25v-4.5Z" /></svg>
            Buscar alternativa
          </a>
          {reading.doi && <span className="text-slate-400">DOI: {reading.doi}</span>}
          {reading.paywall && (
              <div className="group relative flex items-center">
                  <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full font-medium flex items-center gap-1 cursor-help">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.105 12.247a3 3 0 0 1-2.598 4.5H2.895a3 3 0 0 1-2.598-4.5L9.4 3.003ZM10 6a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 6Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" /></svg>
                      Posible paywall
                  </span>
                  <div className="absolute bottom-full mb-2 w-64 bg-slate-800 text-white text-xs rounded-md p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                      La IA no pudo encontrar una versión de acceso abierto para este recurso. Se recomienda buscar alternativas en la biblioteca de su institución o en otras bases de datos.
                  </div>
              </div>
          )}
        </div>
      </div>
    </li>
  );
};

const SessionCard: React.FC<{ session: Session }> = ({ session }) => (
  <div id={`session-${session.numero}`} className="pt-6 scroll-mt-20">
    <div className="bg-slate-50 rounded-lg p-5">
      <h4 className="text-lg font-semibold text-blue-800">Sesión {session.numero}: {session.titulo}</h4>
      
      <div className="mt-4 space-y-4">
        <div>
          <h5 className="font-semibold text-slate-700 text-sm">Objetivos de la sesión</h5>
          <ul className="list-disc list-inside text-slate-600 text-sm mt-1 space-y-1">
            {session.objetivos.map((obj, i) => <li key={i}>{obj}</li>)}
          </ul>
        </div>

        <div>
            <h5 className="font-semibold text-slate-700 text-sm">Actividades y distribución del tiempo</h5>
            <div className="mt-2 border border-slate-200 rounded-md">
            <table className="w-full text-sm text-left">
                <thead className="bg-slate-100 text-xs text-slate-600 uppercase">
                <tr>
                    <th scope="col" className="px-4 py-2">Actividad</th>
                    <th scope="col" className="px-4 py-2">Duración</th>
                    <th scope="col" className="px-4 py-2 hidden md:table-cell">Descripción</th>
                </tr>
                </thead>
                <tbody>
                {session.actividades.map((act, i) => (
                    <tr key={i} className="border-t border-slate-200">
                    <td className="px-4 py-2 font-medium text-slate-800">{act.nombre}</td>
                    <td className="px-4 py-2 text-slate-600">{act.minutos} min</td>
                    <td className="px-4 py-2 text-slate-600 hidden md:table-cell">{act.descripcion}</td>
                    </tr>
                ))}
                </tbody>
            </table>
            </div>
        </div>

        {session.lecturas && session.lecturas.length > 0 && (
          <div>
            <h5 className="font-semibold text-slate-700 text-sm">Lecturas asignadas</h5>
            <ul className="divide-y divide-slate-200 mt-1">
              {session.lecturas.map((reading, i) => <ReadingCard key={i} reading={reading} />)}
            </ul>
          </div>
        )}
      </div>
    </div>
  </div>
);

const CompanionGenerator: React.FC<{ syllabus: Syllabus }> = ({ syllabus }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [companionHtml, setCompanionHtml] = useState<string | null>(null);
    const [isAdminMode, setIsAdminMode] = useState(false);
    
    const stripeUrl = "https://buy.stripe.com/4gM9AV5IP64q9tdaGa28800";

    const handleGenerateCompanion = useCallback(async (syllabusToProcess: Syllabus) => {
        setIsGenerating(true);
        setError(null);
        try {
            const htmlContent = await generateCompanionForSyllabus(syllabusToProcess);
            setCompanionHtml(htmlContent);
        } catch (err) {
            setError('Hubo un error al generar el documento. Por favor, inténtelo de nuevo.');
            console.error(err);
        } finally {
            setIsGenerating(false);
        }
    }, []);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('admin') === 'true') {
            setIsAdminMode(true);
        }

        if (urlParams.get('companion_payment_success') === 'true') {
            const storedSyllabusJson = sessionStorage.getItem(SESSION_STORAGE_KEY_SYLLABUS);
            if (storedSyllabusJson) {
                const syllabusToProcess: Syllabus = JSON.parse(storedSyllabusJson);
                handleGenerateCompanion(syllabusToProcess);
                sessionStorage.removeItem(SESSION_STORAGE_KEY_SYLLABUS);
                window.history.replaceState(null, '', window.location.pathname);
            } else {
                setError("No se encontró la información del sílabo para generar el documento. Por favor, vuelva a intentarlo desde la página del sílabo.");
            }
        }
    }, [handleGenerateCompanion]);

    const handlePurchaseClick = () => {
        sessionStorage.setItem(SESSION_STORAGE_KEY_SYLLABUS, JSON.stringify(syllabus));
    };

    const handleAdminGenerate = () => {
        handleGenerateCompanion(syllabus);
    };

    if (companionHtml) {
        return (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                <h3 className="text-xl font-bold text-green-800">¡Documento de acompañamiento generado!</h3>
                <p className="text-green-700 mt-2 mb-4">Su material de estudio personalizado está listo para descargar.</p>
                <button
                    onClick={() => downloadCompanionHtml(companionHtml, syllabus.titulo)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white text-base font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
                    Descargar documento
                </button>
            </div>
        );
    }

    if (isGenerating) {
        return createPortal(
            <div className="fixed inset-0 bg-slate-100 bg-opacity-75 flex items-center justify-center z-50">
                <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-md text-center max-w-md mx-4">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <h3 className="text-lg font-semibold text-slate-700">Generando su documento prémium...</h3>
                    <p className="text-slate-500 mt-2">Este proceso puede tardar varios minutos, ya que la IA está redactando contenido original para cada sesión.</p>
                </div>
            </div>,
            document.body
        );
    }

    if (error) {
        return (
             <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
                <p className="font-bold">Error</p>
                <p>{error}</p>
            </div>
        );
    }
    
    return (
        <div className="bg-blue-50 border-2 border-dashed border-blue-200 rounded-lg p-6 text-center">
            <h3 className="text-xl font-bold text-blue-900">✨ Desbloquee el material de estudio prémium</h3>
            <p className="text-blue-800 mt-2 mb-4">
                Obtenga un **Documento de Acompañamiento** completo, con un artículo original de ~1500 palabras desarrollado por la IA para cada una de las {syllabus.sesiones.length} sesiones.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a 
                href={stripeUrl}
                onClick={handlePurchaseClick}
                rel="noopener noreferrer"
                target="_blank"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M10 2a.75.75 0 0 1 .75.75v.518a3.74 3.74 0 0 1 4.232 4.232H15.5a.75.75 0 0 1 0 1.5h-.518a3.74 3.74 0 0 1-4.232 4.232v.518a.75.75 0 0 1-1.5 0v-.518A3.74 3.74 0 0 1 4.982 9.5H4.5a.75.75 0 0 1 0-1.5h.518A3.74 3.74 0 0 1 9.25 3.768V3.25A.75.75 0 0 1 10 2ZM8.5 7.5a.75.75 0 0 0-1.5 0v5a.75.75 0 0 0 1.5 0v-5Z" /><path d="M10 5.5a1 1 0 1 0 0 2 1 1 0 0 0 0-2ZM10 12.5a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z" /></svg>
                Generar documento de acompañamiento - $9
                </a>
                {isAdminMode && (
                    <button 
                        onClick={handleAdminGenerate}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-slate-600 text-white text-sm font-medium rounded-md hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
                    >
                       <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M11.986 4.31a3.75 3.75 0 0 1 5.232 5.232l-1.373 1.373a.75.75 0 0 1-1.061-1.06l1.196-1.196a2.25 2.25 0 0 0-3.182-3.182l-1.927 1.927a.75.75 0 0 1-1.06-1.061l1.175-1.175ZM8.014 15.69a3.75 3.75 0 0 1-5.232-5.232l1.373-1.373a.75.75 0 0 1 1.061 1.06l-1.196 1.196a2.25 2.25 0 0 0 3.182 3.182l1.927-1.927a.75.75 0 1 1 1.06 1.061l-1.175 1.175Z" clipRule="evenodd" /><path d="m6.44 9.131.94-1.882a.75.75 0 1 1 1.342.67l-.94 1.882a.75.75 0 1 1-1.342-.67Zm3.939 3.938-.94 1.882a.75.75 0 1 1-1.342-.67l.94-1.882a.75.75 0 1 1 1.342.67Z" /></svg>
                       Generar (Admin)
                    </button>
                )}
            </div>
             {isAdminMode && (
                <p className="text-xs text-slate-500 mt-4">
                    Modo de administrador activado. El botón "Generar (Admin)" eludirá el pago.
                </p>
            )}
        </div>
    );
};

const SyllabusDisplay: React.FC<{ syllabus: Syllabus }> = ({ syllabus }) => {
  const allReadings = syllabus.sesiones.flatMap(s => s.lecturas || []);

  const handleNavClick = (event: React.MouseEvent<HTMLButtonElement>, targetId: string) => {
    event.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
  };

  return (
    <article className="bg-white p-6 sm:p-8 rounded-lg shadow-md">
      <header className="border-b pb-6 mb-6">
        <h2 className="text-3xl font-bold text-slate-900">{syllabus.titulo}</h2>
        <div className="mt-3 text-sm text-slate-500 flex flex-col sm:flex-row sm:flex-wrap gap-x-6 gap-y-2">
            <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-slate-400">
                    <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-5.5-2.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0ZM10 12a5.99 5.99 0 0 0-4.793 2.39A6.483 6.483 0 0 0 10 16.5a6.483 6.483 0 0 0 4.793-2.11A5.99 5.99 0 0 0 10 12Z" clipRule="evenodd" />
                </svg>
                <span>{syllabus.profesor}</span>
            </div>
            <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-slate-400">
                    <path fillRule="evenodd" d="M1.25 4.5A2.25 2.25 0 0 1 3.5 2.25h.502a2.25 2.25 0 0 1 2.248 2.013l.002.017.002.017a2.25 2.25 0 0 1-2.25 2.483h-.5a.75.75 0 0 0 0 1.5h.5a3.75 3.75 0 0 0 3.75-3.75V4.5a3.75 3.75 0 0 0-3.75-3.75h-.502A3.75 3.75 0 0 0 0 4.5v11A1.5 1.5 0 0 0 1.5 17h17a1.5 1.5 0 0 0 1.5-1.5v-11a3.75 3.75 0 0 0-3.75-3.75h-.502A3.75 3.75 0 0 0 12.5 4.5v.75a3.75 3.75 0 0 0 3.75 3.75h.5a.75.75 0 0 0 0-1.5h-.5a2.25 2.25 0 0 1-2.25-2.25v-.75a2.25 2.25 0 0 1 2.25-2.25h.502A2.25 2.25 0 0 1 18.75 4.5v11a.5.5 0 0 1-.5.5h-17a.5.5 0 0 1-.5-.5v-11Z" clipRule="evenodd" />
                </svg>
                <span>{syllabus.universidad}</span>
            </div>
        </div>
        <p className="mt-4 text-slate-600">{syllabus.descripcion}</p>
        <ResultActions syllabus={syllabus} />
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <aside className="md:col-span-4">
            <div className="sticky top-24">
              <h3 className="text-lg font-semibold text-slate-800 mb-3">Contenido del curso</h3>
              <ul className="space-y-2 text-sm">
                  <li><button onClick={(e) => handleNavClick(e, 'objetivos')} className="text-left w-full text-slate-600 hover:text-blue-600 hover:underline">Objetivos</button></li>
                  <li><button onClick={(e) => handleNavClick(e, 'competencias')} className="text-left w-full text-slate-600 hover:text-blue-600 hover:underline">Competencias</button></li>
                  <li><button onClick={(e) => handleNavClick(e, 'evaluacion')} className="text-left w-full text-slate-600 hover:text-blue-600 hover:underline">Evaluación</button></li>
                  <li><button onClick={(e) => handleNavClick(e, 'companion')} className="text-left w-full text-slate-600 hover:text-blue-600 hover:underline font-bold">Material prémium</button></li>
                  <li><button onClick={(e) => handleNavClick(e, 'calendario')} className="text-left w-full text-slate-600 hover:text-blue-600 hover:underline">Calendario de sesiones</button></li>
                  <li><button onClick={(e) => handleNavClick(e, 'bibliografia')} className="text-left w-full text-slate-600 hover:text-blue-600 hover:underline">Bibliografía completa</button></li>
              </ul>
            </div>
        </aside>
        
        <div className="md:col-span-8">
          <section id="objetivos" className="scroll-mt-20">
            <h3 className="text-xl font-semibold text-slate-800 border-b pb-2">Objetivos de aprendizaje</h3>
            <ul className="mt-4 list-disc list-inside space-y-2 text-slate-700">
              {syllabus.objetivos.map((obj, i) => <li key={i}>{obj}</li>)}
            </ul>
          </section>

          <section id="competencias" className="mt-8 scroll-mt-20">
            <h3 className="text-xl font-semibold text-slate-800 border-b pb-2">Competencias</h3>
            <ul className="mt-4 list-disc list-inside space-y-2 text-slate-700">
              {syllabus.competencias.map((comp, i) => <li key={i}>{comp}</li>)}
            </ul>
          </section>
          
          <section id="evaluacion" className="mt-8 scroll-mt-20">
            <h3 className="text-xl font-semibold text-slate-800 border-b pb-2">Sistema de evaluación</h3>
            <ul className="mt-4 space-y-2 text-slate-700">
              {syllabus.evaluacion.map((ev, i) => (
                <li key={i} className="flex justify-between">
                  <span>{ev.tipo}</span>
                  <span className="font-semibold">{ev.porcentaje}%</span>
                </li>
              ))}
               <li className="flex justify-between border-t pt-2 font-bold">
                  <span>TOTAL</span>
                  <span>100%</span>
                </li>
            </ul>
          </section>
          
          <section id="companion" className="mt-8 scroll-mt-20">
             <CompanionGenerator syllabus={syllabus} />
          </section>

          <section id="calendario" className="mt-8 scroll-mt-20">
             <h3 className="text-xl font-semibold text-slate-800 border-b pb-2 mb-2">Plan de sesiones</h3>
             <div className="space-y-4">
                {syllabus.sesiones.map(session => <SessionCard key={session.numero} session={session} />)}
             </div>
          </section>
          
           <section id="bibliografia" className="mt-8 scroll-mt-20">
             <h3 className="text-xl font-semibold text-slate-800 border-b pb-2 mb-2">Bibliografía del curso</h3>
             <p className="text-sm text-slate-500 mb-4">La IA intenta encontrar enlaces directos a recursos de acceso abierto. Si un enlace no funciona, utilice la opción "Buscar alternativa" para localizar el texto.</p>
             <ul className="divide-y divide-slate-200">
              {allReadings.map((reading, i) => <ReadingCard key={i} reading={reading} />)}
            </ul>
           </section>
        </div>
      </div>
    </article>
  );
};

export default SyllabusDisplay;