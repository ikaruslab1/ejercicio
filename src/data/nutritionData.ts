export interface SupplementInfo {
  name: string;
  dosage: string;
  timing: string;
  rationale: string;
  iconName: string;
  badge: string;
}

export const defaultNutritionProfile = {
  age: 27,
  weightKg: 90,
  heightCm: 175,
  activityFactor: 1.55, // Moderately active (3-5 days lifting + teaching/research)
  bmr: 1860,
  tdee: 2890,
  hypertrophyMin: 3150,
  hypertrophyMax: 3300,
  proteinMinG: 144, // 1.6 g/kg
  proteinMaxG: 198, // 2.2 g/kg
  fatsMinG: 70,     // 0.8 g/kg
  fatsMaxG: 90,     // 1.0 g/kg
  carbsTargetG: 420 // Remaining calories (~50-55% of TDEE)
};

export const supplementPlan: SupplementInfo[] = [
  {
    name: 'Proteína Total (Alimentos + Suplemento)',
    dosage: '144g - 198g / día (1.6 - 2.2 g/kg)',
    timing: 'Distribuida en 4 a 5 comidas cada 3-4 horas (~35-40g por toma)',
    rationale: 'La distribución homogénea es crítica para mantener la síntesis proteica muscular (MPS) elevada durante las 24 horas y alcanzar el umbral de leucina en cada ingesta.',
    iconName: 'Utensils',
    badge: 'Pilar Fundamental'
  },
  {
    name: 'Creatina Monohidrato (Creapure®)',
    dosage: '3 - 5g diarios continuos (0.04 - 0.05 g/kg)',
    timing: 'Cualquier momento del día (post-entreno o desayuno con hidratos para mejor absorción)',
    rationale: 'Incrementa las reservas intramusculares de fosfocreatina (PCr), permitiendo mantener la máxima producción de potencia e intensidad en las últimas repeticiones efectivas.',
    iconName: 'Zap',
    badge: 'Evidencia Grado A'
  },
  {
    name: 'Whey Protein Isolate / Concentrado',
    dosage: '1 scoop (25 - 30g de proteína de alto valor biológico)',
    timing: 'Post-entrenamiento inmediato o entre clases en la UNAM',
    rationale: 'Herramienta de máxima conveniencia para asegurar el umbral de leucina (~3g) necesario para disparar la vía mTOR post-entrenamiento cuando el tiempo de cocción es limitado.',
    iconName: 'Coffee',
    badge: 'Conveniencia'
  },
  {
    name: 'Hidratación & Electrolitos',
    dosage: '3.5 - 4.5 Litros de agua / día',
    timing: '500ml al despertar, 750ml durante el entreno, resto durante el día',
    rationale: 'Una deshidratación del 2% del peso corporal reduce la fuerza máxima isométrica hasta un 15% y acelera la fatiga del sistema nervioso central.',
    iconName: 'Droplet',
    badge: 'Rendimiento'
  }
];

export const calculateMetabolism = (weightKg: number, heightCm: number, age: number, activityFactor: number) => {
  // Ecuación de Mifflin-St Jeor para varones: BMR = (10 × peso en kg) + (6.25 × altura en cm) - (5 × edad) + 5
  const bmr = Math.round((10 * weightKg) + (6.25 * heightCm) - (5 * age) + 5);
  const tdee = Math.round(bmr * activityFactor);
  const cleanSurplus = Math.round(tdee * 1.10); // +10% surplus (~250-300 kcal)
  const aggressiveSurplus = Math.round(tdee * 1.15); // +15%
  const deficit = Math.round(tdee * 0.80); // -20%
  
  // Macros recomendados
  const proteinLow = Math.round(weightKg * 1.6);
  const proteinHigh = Math.round(weightKg * 2.2);
  const fatsTarget = Math.round(weightKg * 0.9);
  
  // Carbs for surplus
  const surplusCalories = cleanSurplus;
  const proteinCal = ((proteinLow + proteinHigh) / 2) * 4;
  const fatsCal = fatsTarget * 9;
  const carbsCal = Math.max(0, surplusCalories - proteinCal - fatsCal);
  const carbsTarget = Math.round(carbsCal / 4);

  return {
    bmr,
    tdee,
    cleanSurplus,
    aggressiveSurplus,
    deficit,
    proteinLow,
    proteinHigh,
    fatsTarget,
    carbsTarget
  };
};
