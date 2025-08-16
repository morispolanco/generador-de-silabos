
import React, { useState, useCallback, useEffect } from 'react';
import { CourseInput, Syllabus } from './types';
import SyllabusForm from './components/SyllabusForm';
import SyllabusDisplay from './components/SyllabusDisplay';
import LoadingSpinner from './components/LoadingSpinner';
import Paywall from './components/Paywall';
import { generateSyllabus as callGeminiApi } from './services/geminiService';


const FREE_GENERATION_LIMIT = 3;
const COUNT_STORAGE_KEY = 'syllabusGenerationCount';
const PREMIUM_STORAGE_KEY = 'syllabusPremiumUser';

const App: React.FC = () => {
  const [syllabus, setSyllabus] = useState<Syllabus | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [generationCount, setGenerationCount] = useState<number>(0);
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [showPurchaseSuccess, setShowPurchaseSuccess] = useState<boolean>(false);

  const handleUnlockAccess = useCallback(() => {
    setIsPremium(true);
    localStorage.setItem(PREMIUM_STORAGE_KEY, 'true');
    setShowPurchaseSuccess(true);
  }, []);
  
  useEffect(() => {
    try {
      const savedCount = localStorage.getItem(COUNT_STORAGE_KEY);
      setGenerationCount(savedCount ? parseInt(savedCount, 10) : 0);

      const savedPremiumStatus = localStorage.getItem(PREMIUM_STORAGE_KEY);
      if (savedPremiumStatus === 'true') {
        setIsPremium(true);
      }
    } catch (e) {
      console.error("No se pudo leer desde localStorage.", e);
    }
    
    // Comprobar si la URL contiene una señal de pago exitoso
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('payment_success') && urlParams.get('payment_success') === 'true') {
        if (!isPremium) {
            handleUnlockAccess();
        }
        // Limpiar la URL para evitar que el banner aparezca de nuevo al recargar
        window.history.replaceState(null, '', window.location.pathname);
    }
  }, [handleUnlockAccess, isPremium]);

  const handleSyllabusGeneration = useCallback(async (formData: CourseInput) => {
    if (generationCount >= FREE_GENERATION_LIMIT && !isPremium) {
        setError("Has alcanzado el límite de generaciones gratuitas.");
        return;
    }

    setIsLoading(true);
    setError(null);
    setSyllabus(null);

    try {
      const generatedSyllabus = await callGeminiApi(formData);
      setSyllabus(generatedSyllabus);
      
      if (!isPremium) {
        const newCount = generationCount + 1;
        setGenerationCount(newCount);
        localStorage.setItem(COUNT_STORAGE_KEY, newCount.toString());
      }

    } catch (err) {
      console.error("Error al generar el sílabo:", err);
      setError("Hubo un error al contactar el servicio de generación. Por favor, inténtelo de nuevo más tarde.");
    } finally {
      setIsLoading(false);
    }
  }, [generationCount, isPremium]);
  
  const handleReset = () => {
    setSyllabus(null);
    setError(null);
    setIsLoading(false);
  };

  const handleResetCounter = () => {
    setGenerationCount(0);
    localStorage.setItem(COUNT_STORAGE_KEY, '0');
    setIsPremium(false);
    localStorage.removeItem(PREMIUM_STORAGE_KEY);
    alert("Contador de demostración reiniciado. Vuelves a tener 3 usos gratuitos.");
  };

  const isLocked = generationCount >= FREE_GENERATION_LIMIT && !isPremium;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      {showPurchaseSuccess && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 relative" role="alert">
          <strong className="font-bold">¡Éxito! </strong>
          <span className="block sm:inline">Gracias por su compra. Ha desbloqueado el acceso ilimitado.</span>
          <button onClick={() => setShowPurchaseSuccess(false)} className="absolute top-0 bottom-0 right-0 px-4 py-3" aria-label="Cerrar">
            <svg className="fill-current h-6 w-6 text-green-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Cerrar</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
          </button>
        </div>
      )}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-900">
            <span className="text-blue-600">Sílabo</span>Gen
          </h1>
          <p className="text-sm text-slate-500 hidden md:block">Generador de Programas Universitarios con IA</p>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className={`transition-all duration-500 ${syllabus ? 'lg:col-span-4' : 'lg:col-span-6 lg:col-start-4'}`}>
            <div className="bg-white p-6 rounded-lg shadow-md">
               {isLocked ? (
                <Paywall 
                  onResetCounter={handleResetCounter} 
                />
              ) : (
                <SyllabusForm 
                  onSubmit={handleSyllabusGeneration} 
                  disabled={isLoading} 
                  onReset={handleReset} 
                  hasResult={!!syllabus}
                  isPremium={isPremium}
                  remainingGenerations={FREE_GENERATION_LIMIT - generationCount}
                />
              )}
            </div>
          </div>

          <div className={`lg:col-span-8 ${!syllabus && !isLoading && !error ? 'hidden' : ''}`}>
            {isLoading && <LoadingSpinner />}
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
