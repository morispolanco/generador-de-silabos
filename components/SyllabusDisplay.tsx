import React from 'react';
import type { Syllabus, Session, Reading } from '../types';
import ResultActions from './ResultActions';

const ReadingCard: React.FC<{ reading: Reading }> = ({ reading }) => {
  const googleScholarUrl = `https://scholar.google.com/scholar?q=${encodeURIComponent(reading.citaAPA)}`;
  return (
    <li className="py-3">
      <div className="flex flex-col space-y-1">
        <p className="text-sm text-slate-800" dangerouslySetInnerHTML={{ __html: reading.citaAPA }}></p>
        <p className="text-xs text-slate-500 italic"><strong className="font-semibold">Anotación:</strong> {reading.anotacion}</p>
        <div className="flex items-center flex-wrap gap-x-4 gap-y-2 text-xs mt-1">
          <a href={reading.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-blue-600 hover:underline font-medium">
              Acceder al Recurso
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
                      Posible Paywall
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
          <h5 className="font-semibold text-slate-700 text-sm">Objetivos de la Sesión</h5>
          <ul className="list-disc list-inside text-slate-600 text-sm mt-1 space-y-1">
            {session.objetivos.map((obj, i) => <li key={i}>{obj}</li>)}
          </ul>
        </div>

        <div>
            <h5 className="font-semibold text-slate-700 text-sm">Actividades y Distribución del Tiempo</h5>
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
            <h5 className="font-semibold text-slate-700 text-sm">Lecturas Asignadas</h5>
            <ul className="divide-y divide-slate-200 mt-1">
              {session.lecturas.map((reading, i) => <ReadingCard key={i} reading={reading} />)}
            </ul>
          </div>
        )}
      </div>
    </div>
  </div>
);


const SyllabusDisplay: React.FC<{ syllabus: Syllabus }> = ({ syllabus }) => {
  const allReadings = syllabus.sesiones.flatMap(s => s.lecturas);

  return (
    <article className="bg-white p-6 sm:p-8 rounded-lg shadow-md">
      <header className="border-b pb-6 mb-6">
        <h2 className="text-3xl font-bold text-slate-900">{syllabus.titulo}</h2>
        <p className="mt-2 text-slate-600">{syllabus.descripcion}</p>
        <ResultActions syllabus={syllabus} />
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <aside className="md:col-span-4">
            <div className="sticky top-24">
              <h3 className="text-lg font-semibold text-slate-800 mb-3">Contenido del Curso</h3>
              <ul className="space-y-2 text-sm">
                  <li><a href="#objetivos" className="text-slate-600 hover:text-blue-600 hover:underline">Objetivos</a></li>
                  <li><a href="#competencias" className="text-slate-600 hover:text-blue-600 hover:underline">Competencias</a></li>
                  <li><a href="#evaluacion" className="text-slate-600 hover:text-blue-600 hover:underline">Evaluación</a></li>
                  <li><a href="#calendario" className="text-slate-600 hover:text-blue-600 hover:underline">Calendario de Sesiones</a></li>
                  <li><a href="#bibliografia" className="text-slate-600 hover:text-blue-600 hover:underline">Bibliografía Completa</a></li>
              </ul>
            </div>
        </aside>
        
        <div className="md:col-span-8">
          <section id="objetivos" className="scroll-mt-20">
            <h3 className="text-xl font-semibold text-slate-800 border-b pb-2">Objetivos de Aprendizaje</h3>
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
            <h3 className="text-xl font-semibold text-slate-800 border-b pb-2">Sistema de Evaluación</h3>
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

          <section id="calendario" className="mt-8 scroll-mt-20">
             <h3 className="text-xl font-semibold text-slate-800 border-b pb-2 mb-2">Plan de Sesiones</h3>
             <div className="space-y-4">
                {syllabus.sesiones.map(session => <SessionCard key={session.numero} session={session} />)}
             </div>
          </section>
          
           <section id="bibliografia" className="mt-8 scroll-mt-20">
             <h3 className="text-xl font-semibold text-slate-800 border-b pb-2 mb-2">Bibliografía del Curso</h3>
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