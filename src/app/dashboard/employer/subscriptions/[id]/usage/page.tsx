import UsageClient from "./UsageClient";

export default async function UsagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <UsageClient id={id} />
    </div>
  );
}
