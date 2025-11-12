export default function ApplicationDetailPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <h1 className="text-2xl font-bold">Application Details</h1>
      <p>Details for application with ID: {params.id}</p>
    </div>
  );
}
