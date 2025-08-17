
import React, { useState } from 'react';
import { downloadHtml, downloadCsv, downloadZip, downloadExamHtml } from '../utils/exportUtils';
import type { Syllabus } from '../types';
import { generateFinalExam } from '../services/geminiService';

interface ResultActionsProps {
  syllabus: Syllabus;
}

const ResultActions: React.FC<ResultActionsProps> = ({ syllabus }) => {
  const [isGeneratingExam, setIsGeneratingExam] = useState(false);
  const [examError, setExamError] = useState<string | null>(null);

  const handleDownloadHtml = () => {
    downloadHtml(syllabus);
  };

  const handleDownloadCsv = () => {
    downloadCsv(syllabus);
  };
  
  const handleDownloadZip = () => {
    downloadZip(syllabus);
  };

  const handleGenerateExam = async () => {
    setIsGeneratingExam(true);
    setExamError(null);
    try {
      const exam = await generateFinalExam(syllabus);
      downloadExamHtml(exam, syllabus.titulo);
    } catch (error) {
      console.error("Failed to generate exam:", error);
      setExamError("Hubo un error al generar el examen. Por favor, inténtelo de nuevo.");
    } finally {
      setIsGeneratingExam(false);
    }
  };

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={handleDownloadZip}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.03 1.125 0 1.131.094 1.976 1.057 1.976 2.192V7.5m-9 3.75h9v7.5a1.5 1.5 0 0 1-1.5 1.5h-6a1.5 1.5 0 0 1-1.5-1.5v-7.5Z" />
          </svg>
          Descargar ZIP
        </button>
        <button
          onClick={handleGenerateExam}
          disabled={isGeneratingExam}
          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-slate-400 disabled:cursor-not-allowed"
        >
          {isGeneratingExam ? (
            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
            </svg>
          )}
          {isGeneratingExam ? 'Generando...' : 'Generar Examen Final'}
        </button>

        <div className="border-l border-slate-300 h-6 mx-2 hidden sm:block"></div>
        
        <div className="flex gap-2">
            <button
              onClick={handleDownloadHtml}
              title="Descargar sílabo en HTML"
              className="inline-flex items-center gap-2 p-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-md hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m.75 12 3 3m0 0 3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
              </svg>
              <span className="hidden sm:inline">Sílabo HTML</span>
            </button>
            <button
              onClick={handleDownloadCsv}
              title="Descargar sesiones en CSV"
              className="inline-flex items-center gap-2 p-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-md hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 21h17.25c1.035 0 1.875-.84 1.875-1.875V5.625c0-1.036-.84-1.875-1.875-1.875H3.375C2.34 3.75 1.5 4.59 1.5 5.625v13.5C1.5 20.16 2.34 21 3.375 21Z" />
              </svg>
              <span className="hidden sm:inline">Sesiones CSV</span>
            </button>
        </div>
      </div>
      {examError && (
        <div className="mt-3 text-sm text-red-600 bg-red-50 p-3 rounded-md" role="alert">
          {examError}
        </div>
      )}
    </div>
  );
};

export default ResultActions;
