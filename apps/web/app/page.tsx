import { ClinicalWorkspace } from '@/components/ClinicalWorkspace';
import { PreparationPlanner } from '@/components/PreparationPlanner';

export default function HomePage() {
  const shadowMode = process.env.PREP_MEDS_CONTENT_MODE === 'shadow';

  return (
    <>
      {shadowMode ? (
        <div
          role="alert"
          style={{
            maxWidth: '1120px',
            margin: '20px auto 0',
            padding: '14px 18px',
            border: '2px solid currentColor',
            borderRadius: '10px',
            fontWeight: 700,
          }}
        >
          SHADOW CLINICAL-REVIEW MODE — candidate Stage 8.5 rules are not clinically approved. Results are for internal validation only; patient instructions are disabled.
        </div>
      ) : null}
      <PreparationPlanner />
      <ClinicalWorkspace />
    </>
  );
}
