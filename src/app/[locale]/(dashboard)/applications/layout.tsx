import { ApplicationsProvider } from '@/shared/context/applications-context';

export default function ApplicationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ApplicationsProvider>{children}</ApplicationsProvider>;
}