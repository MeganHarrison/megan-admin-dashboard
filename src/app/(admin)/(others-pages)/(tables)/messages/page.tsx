import { Metadata } from 'next';
import PageBreadCrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import MessagesTable from '@/components/tables/MessagesTable';

export const metadata: Metadata = {
  title: 'Text Messages | Admin Dashboard',
  description: 'View and manage text messages from the database',
};

const breadcrumbItems = [
  { label: 'Tables', href: '/tables' },
  { label: 'Messages', href: '/messages' }
];

export default function MessagesPage() {
  return (
    <>
      <PageBreadCrumb items={breadcrumbItems} />
      
      <ComponentCard
        title="Text Messages"
        subtitle="View and search through imported text messages from the database"
      >
        <MessagesTable />
      </ComponentCard>
    </>
  );
}