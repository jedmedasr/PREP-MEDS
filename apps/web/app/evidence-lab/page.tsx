import { notFound } from 'next/navigation';
import { evidenceLabEnabled } from '../../lib/evidence-lab';
import EvidenceLab from './EvidenceLab';
export const dynamic = 'force-dynamic';
export default function Page() {
  if (!evidenceLabEnabled()) notFound();
  return <EvidenceLab />;
}
