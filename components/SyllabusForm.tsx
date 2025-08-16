
import React, { useState, useEffect } from 'react';
import type { CourseInput, MidtermExam } from '../types';

interface SyllabusFormProps {
  onSubmit: (formData: CourseInput) => void;
  disabled: boolean;
  onReset: () => void;
  hasResult: boolean;
  isPremium: boolean;
  remainingGenerations: number;
}

const initialFormData: CourseInput = {
  title: 'Seminario de Literatura Comparada',
  sessions: 12,
  sessionDuration: 90,
  midtermExams: [
    { id: 1, percentage: 30 },
    { id: 2, percentage: 30 },
  ],
  finalPercentage: 40,
  remainingPercentage: 0,
  remainingAssignment: '',
  semester: '2024-2',
  level: 'grado',
  weeklyHours: '3',
  format: 'presencial',
  competencies: 'Análisis crítico de textos literarios, argumentación escrita, investigación bibliográfica.',
};

const SyllabusForm: React.FC<SyllabusFormProps> = ({ onSubmit, disabled, onReset, hasResult, isPremium, remainingGenerations }) => {
  const [formData, setFormData] = useState<CourseInput>(initialFormData);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  
  const totalPercentage = formData.midtermExams.reduce((sum, exam) => sum + (exam.percentage || 0), 0) + (formData.finalPercentage || 0);
  const remainingPercentage = 100 - totalPercentage;

  useEffect(() => {
    const newErrors: { [key: string]: string } = {};
    if (totalPercentage > 100) {
      newErrors.percentage = `La suma de porcentajes (${totalPercentage}%) no puede superar el 100%.`;
    }
    setErrors(newErrors);
  }, [totalPercentage]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMidtermChange = (id: number, value: string) => {
    const percentage = value === '' ? 0 : parseInt(value, 10);
    setFormData(prev => ({
      ...prev,
      midtermExams: prev.midtermExams.map(exam =>
        exam.id === id ? { ...exam, percentage: isNaN(percentage) ? 0 : percentage } : exam
      ),
    }));
  };

  const addMidterm = () => {
    setFormData(prev => ({
      ...prev,
      midtermExams: [...prev.midtermExams, { id: Date.now(), percentage: 0 }],
    }));
  };

  const removeMidterm = (id: number) => {
    setFormData(prev => ({
      ...prev,
      midtermExams: prev.midtermExams.filter(exam => exam.id !== id),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.keys(errors).length === 0) {
      const finalData = {
        ...formData,
        remainingPercentage: remainingPercentage > 0 ? remainingPercentage : 0,
      }
      onSubmit(finalData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-xl font-semibold text-slate-700">{hasResult ? 'Ajustar Parámetros' : 'Crear Nuevo Sílabo'}</h2>
      
      {/* Basic Info */}
      <fieldset className="space-y-4">
        <legend className="text-lg font-medium text-slate-600 border-b pb-2 mb-2">Información Básica</legend>
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-slate-700">Título del Curso</label>
          <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"/>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="sessions" className="block text-sm font-medium text-slate-700">Nº de Sesiones</label>
            <input type="number" id="sessions" name="sessions" value={formData.sessions} onChange={handleChange} required min="1" max="60" className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"/>
          </div>
          <div>
            <label htmlFor="sessionDuration" className="block text-sm font-medium text-slate-700">Duración (min)</label>
            <input type="number" id="sessionDuration" name="sessionDuration" value={formData.sessionDuration} onChange={handleChange} required min="30" className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"/>
          </div>
        </div>
      </fieldset>

      {/* Evaluation */}
      <fieldset className="space-y-4">
        <legend className="text-lg font-medium text-slate-600 border-b pb-2 mb-2">Evaluación</legend>
        {formData.midtermExams.map((exam, index) => (
          <div key={exam.id} className="flex items-center gap-2">
            <label htmlFor={`midterm-${exam.id}`} className="flex-grow text-sm font-medium text-slate-700">Parcial {index + 1} (%)</label>
            <input id={`midterm-${exam.id}`} type="number" value={exam.percentage || ''} onChange={(e) => handleMidtermChange(exam.id, e.target.value)} min="0" max="100" className="w-24 px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"/>
            <button type="button" onClick={() => removeMidterm(exam.id)} className="p-2 text-slate-400 hover:text-red-600" aria-label="Eliminar parcial">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
            </button>
          </div>
        ))}
        <button type="button" onClick={addMidterm} className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
            Añadir Parcial
        </button>

        <div className="flex items-center gap-2">
          <label htmlFor="finalPercentage" className="flex-grow text-sm font-medium text-slate-700">Examen/Trabajo Final (%)</label>
          <input id="finalPercentage" type="number" name="finalPercentage" value={formData.finalPercentage} onChange={handleChange} min="0" max="100" className="w-24 px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"/>
           <div className="w-5 h-5"></div>
        </div>
        
        <div className={`p-3 rounded-md text-sm ${errors.percentage ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-600'}`}>
          <strong>Total Asignado:</strong> {totalPercentage}%
          {remainingPercentage >= 0 && !errors.percentage && <span className="ml-4"><strong>Restante:</strong> {remainingPercentage}%</span>}
          {errors.percentage && <p>{errors.percentage}</p>}
        </div>

        {remainingPercentage > 0 && !errors.percentage && (
          <div>
            <label htmlFor="remainingAssignment" className="block text-sm font-medium text-slate-700">Asignar el {remainingPercentage}% restante a:</label>
            <input type="text" id="remainingAssignment" name="remainingAssignment" value={formData.remainingAssignment} onChange={handleChange} placeholder="Ej: Actividades, participación, etc." className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"/>
          </div>
        )}
      </fieldset>
      
      {/* Optional Info */}
      <fieldset className="space-y-4">
        <legend className="text-lg font-medium text-slate-600 border-b pb-2 mb-2">Información Opcional</legend>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="semester" className="block text-sm font-medium text-slate-700">Semestre</label>
            <input type="text" id="semester" name="semester" value={formData.semester} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"/>
          </div>
          <div>
            <label htmlFor="level" className="block text-sm font-medium text-slate-700">Nivel</label>
            <select id="level" name="level" value={formData.level} onChange={handleChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
              <option value="grado">Grado</option>
              <option value="posgrado">Posgrado</option>
            </select>
          </div>
          <div>
            <label htmlFor="weeklyHours" className="block text-sm font-medium text-slate-700">Carga Horaria Semanal</label>
            <input type="text" id="weeklyHours" name="weeklyHours" value={formData.weeklyHours} onChange={handleChange} placeholder="Ej: 3 teóricas, 2 prácticas" className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"/>
          </div>
          <div>
            <label htmlFor="format" className="block text-sm font-medium text-slate-700">Formato</label>
            <select id="format" name="format" value={formData.format} onChange={handleChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
              <option value="presencial">Presencial</option>
              <option value="virtual">Virtual</option>
              <option value="hibrido">Híbrido</option>
            </select>
          </div>
        </div>
        <div>
          <label htmlFor="competencies" className="block text-sm font-medium text-slate-700">Competencias del Curso</label>
          <textarea id="competencies" name="competencies" value={formData.competencies} onChange={handleChange} rows={3} placeholder="Describa las principales competencias que desarrollarán los estudiantes. Separar por comas." className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"></textarea>
        </div>
      </fieldset>
      
      <div className="pt-4 border-t space-y-4">
        {!isPremium && remainingGenerations > 0 && (
          <div className="text-center text-sm text-slate-500">
            {remainingGenerations > 1 && `Te quedan ${remainingGenerations} generaciones gratuitas.`}
            {remainingGenerations === 1 && 'Esta es tu última generación gratuita.'}
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-4">
            <button type="submit" disabled={disabled || Object.keys(errors).length > 0} className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-400 disabled:cursor-not-allowed">
            {disabled ? 'Generando...' : hasResult ? 'Volver a Generar' : 'Generar Sílabo'}
            </button>
            {hasResult && (
            <button type="button" onClick={onReset} className="w-full inline-flex justify-center items-center px-4 py-2 border border-slate-300 text-base font-medium rounded-md shadow-sm text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                Empezar de Nuevo
            </button>
            )}
        </div>
      </div>

    </form>
  );
};

export default SyllabusForm;
