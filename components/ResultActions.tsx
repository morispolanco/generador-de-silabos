
import React from 'react';
import { downloadHtml, downloadCsv, downloadZip } from '../utils/exportUtils';
import type { Syllabus } from '../types';

interface ResultActionsProps {
  syllabus: Syllabus;
}

const ResultActions: React.FC<ResultActionsProps> = ({ syllabus }) => {
  const handleDownloadHtml = () => {
    downloadHtml(syllabus);
  };

  const handleDownloadCsv = () => {
    downloadCsv(syllabus);
  };
  
  const handleDownloadZip = () => {
    downloadZip(syllabus);
  };

  return (
    <div className="mt-6 flex flex-wrap items-center gap-3">
      <button
        onClick={handleDownloadZip}
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.03 1.125 0 1.131.094 1.976 1.057 1.976 2.192V7.5m-9 3.75h9v7.5a1.5 1.5 0 0 1-1.5 1.5h-6a1.5 1.5 0 0 1-1.5-1.5v-7.5Z" />
        </svg>
        Descargar ZIP
      </button>
      <div className="text-sm text-slate-500 hidden sm:block">o por separado:</div>
      <div className="flex gap-2">
          <button
            onClick={handleDownloadHtml}
            title="Descargar solo HTML"
            className="inline-flex items-center gap-2 p-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-md hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m.75 12 3 3m0 0 3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
            <span className="hidden sm:inline">HTML</span>
          </button>
          <button
            onClick={handleDownloadCsv}
            title="Descargar solo CSV"
            className="inline-flex items-center gap-2 p-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-md hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 21h17.25c1.035 0 1.875-.84 1.875-1.875V5.625c0-1.036-.84-1.875-1.875-1.875H3.375C2.34 3.75 1.5 4.59 1.5 5.625v13.5C1.5 20.16 2.34 21 3.375 21Z" />
            </svg>
            <span className="hidden sm:inline">CSV</span>
          </button>
      </div>
    </div>
  );
};

export default ResultActions;
