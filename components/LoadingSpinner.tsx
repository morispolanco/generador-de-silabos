
import React, { useState, useEffect } from 'react';

const messages = [
  "Consultando modelos pedagógicos...",
  "Buscando bibliografía de acceso abierto...",
  "Estructurando el plan de clases...",
  "Verificando la calidad de las fuentes...",
  "Compilando los objetivos de aprendizaje...",
  "Casi listo, puliendo los detalles finales..."
];

const LoadingSpinner: React.FC = () => {
  const [message, setMessage] = useState(messages[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessage(prevMessage => {
        const currentIndex = messages.indexOf(prevMessage);
        const nextIndex = (currentIndex + 1) % messages.length;
        return messages[nextIndex];
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-md text-center">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      <h3 className="text-lg font-semibold text-slate-700">Generando su sílabo...</h3>
      <p className="text-slate-500 mt-2 transition-opacity duration-500">{message}</p>
      <p className="text-xs text-slate-400 mt-4">Este proceso puede tardar hasta un minuto.</p>
    </div>
  );
};

export default LoadingSpinner;
