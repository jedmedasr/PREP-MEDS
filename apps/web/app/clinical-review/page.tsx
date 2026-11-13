import {notFound} from 'next/navigation';
import ReviewWorkspace from './workspace';
export const dynamic='force-dynamic';
export default function ClinicalReviewPage() {
 if(process.env.PREP_MEDS_CLINICIAN_REVIEW!=='enabled')notFound();
 return <ReviewWorkspace/>;
}
