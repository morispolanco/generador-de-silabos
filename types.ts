
export interface MidtermExam {
  id: number;
  percentage: number;
}

export interface CourseInput {
  title: string;
  sessions: number;
  sessionDuration: number;
  midtermExams: MidtermExam[];
  finalPercentage: number;
  remainingPercentage: number;
  remainingAssignment: string;
  semester: string;
  level: 'grado' | 'posgrado';
  weeklyHours: string;
  format: 'presencial' | 'virtual' | 'hibrido';
  competencies: string;
}

export interface Reading {
  citaAPA: string;
  url: string;
  doi: string;
  anotacion: string;
  verificado: boolean;
  licencia?: string;
  paywall: boolean;
}

export interface Activity {
  nombre: string;
  minutos: number;
  descripcion: string;
}

export interface Session {
  numero: number;
  titulo: string;
  objetivos: string[];
  actividades: Activity[];
  lecturas: Reading[];
}

export interface Evaluation {
  tipo: string;
  porcentaje: number;
}

export interface Syllabus {
  titulo: string;
  descripcion: string;
  objetivos: string[];
  competencias: string[];
  evaluacion: Evaluation[];
  sesiones: Session[];
}
