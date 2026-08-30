import type { ContingencyItem } from '../types/workout';

export const contingencyData: ContingencyItem[] = [
  {
    id: 'c-1',
    muscleGroup: 'Piernas',
    primaryMachine: 'Linear Hack Squat (Máquina 10)',
    primaryExercise: 'Hack Squat con carga lineal',
    alternative: 'Sentadilla Búlgara con Mancuernas en Banco Plano',
    altEquipment: 'Mancuerna',
    biomechanicalLogic: 'Mantiene una flexión profunda de rodilla y estiramiento del cuádriceps sin necesidad de soporte en máquina.',
    smartFitTip: 'Toma 2 mancuernas del rack de peso libre y usa cualquier banco libre o el borde del área de estiramiento.'
  },
  {
    id: 'c-2',
    muscleGroup: 'Piernas',
    primaryMachine: 'Seated Leg Curl (Máquina 04)',
    primaryExercise: 'Curl de Isquios Sentado',
    alternative: 'Peso Muerto Rumano (RDL) con Barra o Mancuernas',
    altEquipment: 'Barra',
    biomechanicalLogic: 'Mantiene el estímulo en la cadena posterior bajo posición de máximo estiramiento excéntrico.',
    smartFitTip: 'Si las barras olímpicas están ocupadas, usa las barras precargadas de 20kg a 40kg del rack negro.'
  },
  {
    id: 'c-3',
    muscleGroup: 'Pectorales',
    primaryMachine: 'Pectoral Fly (Máquina 21)',
    primaryExercise: 'Aperturas / Cristos en Máquina',
    alternative: 'Cruce de Poleas Medias o Cristos en Banco con Mancuernas',
    altEquipment: 'Polea',
    biomechanicalLogic: 'Mantiene el vector de aducción horizontal y la tensión sostenida en posición de estiramiento.',
    smartFitTip: 'Dirígete al Área Gris (torre de 4 u 8 poleas) usando agarres D simples.'
  },
  {
    id: 'c-4',
    muscleGroup: 'Pectorales',
    primaryMachine: 'Chest Press (Máquina 20)',
    primaryExercise: 'Press de Pecho en Máquina',
    alternative: 'Press Plano o Inclinado con Mancuernas en Banco 27',
    altEquipment: 'Mancuerna',
    biomechanicalLogic: 'Permite mayor libertad en la trayectoria glenohumeral y convergencia natural de brazos.',
    smartFitTip: 'Si todos los bancos están ocupados, realiza flexiones / pushups lastradas o press con disco en suelo.'
  },
  {
    id: 'c-5',
    muscleGroup: 'Espalda',
    primaryMachine: 'Lat Pulldown (Máquina 22)',
    primaryExercise: 'Jalón al Pecho',
    alternative: 'Dominadas con Agarre Neutro en Jaula o Torre Funcional',
    altEquipment: 'Peso Corporal',
    biomechanicalLogic: 'Tracción vertical con idéntica activación del dorsal ancho y redondos.',
    smartFitTip: 'Usa una banda elástica de asistencia si requieres ajustar la intensidad para el rango 8-12 reps.'
  },
  {
    id: 'c-6',
    muscleGroup: 'Espalda',
    primaryMachine: 'Seated Row (Máquina 23)',
    primaryExercise: 'Remo Sentado en Máquina',
    alternative: 'Remo en Polea Baja con Agarre V o Remo con Mancuerna Unilateral',
    altEquipment: 'Polea',
    biomechanicalLogic: 'Retracción escapular horizontal manteniendo la alineación de la columna vertebral.',
    smartFitTip: 'La polea baja del Área Gris suele tener menor rotación de usuarios que la Máquina 23.'
  },
  {
    id: 'c-7',
    muscleGroup: 'Hombros',
    primaryMachine: 'Shoulder Press (Máquina 50)',
    primaryExercise: 'Press de Hombro en Máquina',
    alternative: 'Press Militar Sentado con Mancuernas a 75°',
    altEquipment: 'Mancuerna',
    biomechanicalLogic: 'Empuje vertical en plano escapular con libertad de rotación articular.',
    smartFitTip: 'No uses el respaldo a 90° exactos; inclínalo un punto (75°-80°) para cuidar el manguito rotador.'
  },
  {
    id: 'c-8',
    muscleGroup: 'Brazos',
    primaryMachine: 'Bíceps Curl (Máquina 52)',
    primaryExercise: 'Curl de Bíceps en Máquina Guiada',
    alternative: 'Curl de Bíceps con Barra Z o Curl Martillo con Mancuernas',
    altEquipment: 'Barra',
    biomechanicalLogic: 'Flexión de codo estricta con apoyo para evitar balanceo del hombro anterior.',
    smartFitTip: 'Apóyate contra una columna o pared en el área de peso libre para emular el soporte del predicador.'
  }
];
