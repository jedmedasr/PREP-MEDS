import { ClinicalWorkspace } from '@/components/ClinicalWorkspace';

export default function HomePage() {
  return (
    <>
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
        PREP-MEDS DEMO — DRAFT / REVIEW_REQUIRED — NOT FOR CLINICAL USE. This preview demonstrates medication identity resolution and fail-closed clinician review. It does not provide approved patient instructions, hold/restart timing, dosing, substitution, or local-policy decisions.
      </div>
      <ClinicalWorkspace />
    </>
  );
}
