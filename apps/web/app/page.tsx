import { ClinicalWorkspace } from '@/components/ClinicalWorkspace';
import { PreparationPlanner } from '@/components/PreparationPlanner';

export default function HomePage() {
  const shadowMode = true;

  return (
    <>
      <div style={{ maxWidth: '1120px', margin: '18px auto 0', padding: '0 18px', textAlign: 'right' }}>
        <a href="/owner" style={{ fontWeight: 700 }}>Owner Dashboard →</a>
      </div>
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
