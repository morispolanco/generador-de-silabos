
import React, { useState, useCallback } from 'react';
import { CourseInput, Syllabus } from './types';
import SyllabusForm from './components/SyllabusForm';
import SyllabusDisplay from './components/SyllabusDisplay';
import LoadingSpinner from './components/LoadingSpinner';
import { generateSyllabus as callGeminiApi } from './services/geminiService';


const App: React.FC = () => {
  const [syllabus, setSyllabus] = useState<Syllabus | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSyllabusGeneration = useCallback(async (formData: CourseInput) => {
    setIsLoading(true);
    setError(null);
    setSyllabus(null);

    try {
      const generatedSyllabus = await callGeminiApi(formData);
      setSyllabus(generatedSyllabus);
    } catch (err) {
      console.error("Error al generar el sílabo:", err);
      setError("Hubo un error al contactar el servicio de generación. Por favor, inténtelo de nuevo más tarde.");
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const handleReset = () => {
    setSyllabus(null);
    setError(null);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      {isLoading && (
        <div className="fixed inset-0 bg-slate-100 bg-opacity-75 flex items-center justify-center z-50">
          <LoadingSpinner />
        </div>
      )}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-900">
            <span className="text-blue-600">Sílabo</span>Gen
          </h1>
          <p className="text-sm text-slate-500 hidden md:block">Generador de programas universitarios con IA</p>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className={`transition-all duration-500 ${syllabus ? 'lg:col-span-4' : 'lg:col-span-6 lg:col-start-4'}`}>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <SyllabusForm 
                  onSubmit={handleSyllabusGeneration} 
                  disabled={isLoading} 
                  onReset={handleReset} 
                  hasResult={!!syllabus}
                />
            </div>
          </div>

          <div className={`lg:col-span-8 ${syllabus || error ? '' : 'hidden'}`}>
            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
                <p className="font-bold">Error</p>
                <p>{error}</p>
              </div>
            )}
            {syllabus && <SyllabusDisplay syllabus={syllabus} />}
          </div>
        </div>
      </main>
      
      <footer className="text-center py-6 text-slate-500 text-sm">
        <p>Desarrollado con React, Tailwind CSS y Gemini API. © {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
};

export default App;