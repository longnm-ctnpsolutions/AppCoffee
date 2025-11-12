export default function ApplicationDetailPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <h1 className="text-2xl font-bold">Chi tiết ứng dụng</h1>
      <p>Chi tiết cho ứng dụng có ID: {params.id}</p>
    </div>
  );
}
