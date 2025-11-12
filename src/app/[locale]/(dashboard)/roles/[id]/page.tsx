export default function RoleDetailPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <h1 className="text-2xl font-bold">Role Details</h1>
      <p>Details for role with ID: {params.id}</p>
    </div>
  );
}
