'use client';

import { useState } from 'react';

export interface CockcroftGaultInput {
  ageYears: number;
  weightKg: number;
  serumCreatinineMgDl: number;
  sexCoefficient: 1 | 0.85;
}

/** Cockcroft–Gault estimated creatinine clearance, mL/min; not indexed to BSA. */
export function cockcroftGault(input: CockcroftGaultInput): number | null {
  const { ageYears, weightKg, serumCreatinineMgDl, sexCoefficient } = input;
  if (![ageYears, weightKg, serumCreatinineMgDl, sexCoefficient].every(Number.isFinite)
    || ageYears < 18 || ageYears >= 140 || weightKg <= 0 || serumCreatinineMgDl <= 0
    || (sexCoefficient !== 1 && sexCoefficient !== 0.85)) return null;
  return ((140 - ageYears) * weightKg * sexCoefficient) / (72 * serumCreatinineMgDl);
}

export function CreatinineClearanceCalculator() {
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [creatinine, setCreatinine] = useState('');
  const [coefficient, setCoefficient] = useState<'1' | '0.85'>('1');
  const [weightBasis, setWeightBasis] = useState('actual');
  const parsed = [age, weight, creatinine].every(value => value.trim() !== '');
  const result = parsed ? cockcroftGault({
    ageYears: Number(age), weightKg: Number(weight),
    serumCreatinineMgDl: Number(creatinine), sexCoefficient: Number(coefficient) as 1 | 0.85,
  }) : null;
  return (
    <section className="panel" aria-label="Creatinine clearance calculator">
      <div className="section-heading"><div><h2>Creatinine clearance calculator</h2><p>Cockcroft–Gault estimate for medication review</p></div></div>
      <div className="result-grid">
        <label>Age (years)<input aria-label="Age in years" type="number" min="18" max="139" step="1" value={age} onChange={e => setAge(e.target.value)} /></label>
        <label>Weight (kg)<input aria-label="Weight in kilograms" type="number" min="0.1" step="0.1" value={weight} onChange={e => setWeight(e.target.value)} /></label>
        <label>Serum creatinine (mg/dL)<input aria-label="Serum creatinine in milligrams per deciliter" type="number" min="0.01" step="0.01" value={creatinine} onChange={e => setCreatinine(e.target.value)} /></label>
        <label>Sex coefficient used by equation<select aria-label="Cockcroft-Gault sex coefficient" value={coefficient} onChange={e => setCoefficient(e.target.value as '1' | '0.85')}><option value="1">Male coefficient (1.00)</option><option value="0.85">Female coefficient (0.85)</option></select></label>
        <label>Weight used<select aria-label="Weight selection" value={weightBasis} onChange={e => setWeightBasis(e.target.value)}><option value="actual">Actual body weight</option><option value="ideal">Ideal body weight (entered manually)</option><option value="adjusted">Adjusted body weight (entered manually)</option></select></label>
      </div>
      <div className="result-card prominent" aria-live="polite">
        <span className="card-label">Estimated creatinine clearance</span>
        <strong>{result === null ? 'Enter valid inputs' : result.toFixed(1) + ' mL/min'}</strong>
        <p>Formula: (140 − age) × weight (kg) × {coefficient} ÷ (72 × serum creatinine).</p>
      </div>
      <p className="empty-copy">Clinician-only reference. This is an estimate, not measured clearance or indexed eGFR. The entered weight is used exactly as provided; ideal/adjusted weight is not calculated automatically. Interpret cautiously in obesity, underweight, sarcopenia, pregnancy, unstable kidney function or acute kidney injury. Verify the medication-specific labeling and clinical context before selecting an anticoagulant interruption interval. No automatic medication recommendation is generated.</p>
    </section>
  );
}
