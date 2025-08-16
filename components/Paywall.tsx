
import React from 'react';

interface PaywallProps {
  onResetCounter: () => void;
}

const Paywall: React.FC<PaywallProps> = ({ onResetCounter }) => {
  return (
    <div className="text-center p-4">
      <div className="flex justify-center mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-yellow-500">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-slate-800">Límite gratuito alcanzado</h2>
      <p className="text-slate-600 mt-2 mb-6">
        Has utilizado tus 3 generaciones de sílabos gratuitas. Para continuar creando programas ilimitados, adquiere una licencia de por vida.
      </p>
      <div className="space-y-4">
        <a 
          href="https://buy.stripe.com/URL_DE_TU_ENLACE_DE_PAGO_AQUI"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Comprar licencia vitalicia - $19
        </a>
      </div>
      <div className="mt-8 text-xs text-slate-400 border-t pt-4">
        <p className="font-semibold">Nota para el desarrollador (método fácil):</p>
        <p className="mb-2 text-left">
          Este botón ahora es un enlace directo a un <strong>Enlace de Pago de Stripe</strong>. Para configurarlo:
          <ol className="list-decimal list-inside my-1">
              <li>Ve a tu Dashboard de Stripe &rarr; Productos &rarr; Enlaces de pago.</li>
              <li>Crea un nuevo enlace para tu producto.</li>
              <li>En la sección "Después del pago", activa la opción para <strong>redirigir a los clientes a tu sitio web</strong>.</li>
              <li>Introduce la URL de tu aplicación y añade `?payment_success=true` al final. (Ej: `https://mi-app.com?payment_success=true`)</li>
              <li>Copia la URL del Enlace de Pago y pégala en el `href` del botón de arriba.</li>
          </ol>
          Este método no requiere backend, pero la confirmación es menos segura.
        </p>
        <button
          onClick={onResetCounter}
          className="text-blue-600 underline hover:text-blue-800"
        >
          Reiniciar estado de demostración
        </button>
      </div>
    </div>
  );
};

export default Paywall;