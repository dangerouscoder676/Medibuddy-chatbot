export interface BMIResult {
  bmi: number;
  category: string;
  color: string;
  tip: string;
}

export function calculateBMI(weightKg: number, heightCm: number): BMIResult {
  if (weightKg <= 0 || heightCm <= 0) {
    return {
      bmi: 0,
      category: 'Invalid input',
      color: '#ef4444',
      tip: 'Please enter valid values for weight and height.'
    };
  }

  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  const roundedBmi = Math.round(bmi * 10) / 10;

  let category = '';
  let color = '';
  let tip = '';

  if (roundedBmi < 18.5) {
    category = 'Underweight';
    color = 'var(--info)';
    tip = 'Focus on nutrient-rich foods and consult a nutritionist to help reach a healthy weight.';
  } else if (roundedBmi >= 18.5 && roundedBmi < 25) {
    category = 'Healthy Weight';
    color = 'var(--success)';
    tip = 'Excellent! Keep up the balanced diet, hydration, and regular exercise routine.';
  } else if (roundedBmi >= 25 && roundedBmi < 30) {
    category = 'Overweight';
    color = 'var(--warning)';
    tip = 'Consider incorporating more physical activity and consulting a doctor about dietary adjustments.';
  } else {
    category = 'Obesity';
    color = 'var(--danger)';
    tip = 'We recommend consulting a healthcare professional for a tailored nutrition and fitness guidance plan.';
  }

  return {
    bmi: roundedBmi,
    category,
    color,
    tip,
  };
}
