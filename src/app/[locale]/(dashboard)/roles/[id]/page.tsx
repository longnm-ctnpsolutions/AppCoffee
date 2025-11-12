export default function RoleDetailPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <h1 className="text-2xl font-bold">Chi tiết vai trò</h1>
      <p>Chi tiết cho vai trò có ID: {params.id}</p>
    </div>
  );
}
