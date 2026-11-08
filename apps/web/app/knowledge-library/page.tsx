import { notFound } from 'next/navigation';
import { knowledgeLibraryEnabled } from '../../lib/knowledge-library';
import KnowledgeLibrary from './KnowledgeLibrary';
export const dynamic='force-dynamic';
export default function Page(){if(!knowledgeLibraryEnabled())notFound();return <KnowledgeLibrary/>;}
