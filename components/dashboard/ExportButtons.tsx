import { FileDown, FileText } from "lucide-react";

export function ExportButtons({ albumId }: { albumId: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      <a
        href={`/api/export/csv/${albumId}`}
        className="inline-flex min-h-10 items-center gap-2 rounded-md bg-ink px-3 text-sm font-medium text-white"
      >
        <FileDown size={16} />
        导出 CSV
      </a>
      <a
        href={`/api/export/txt/${albumId}`}
        className="inline-flex min-h-10 items-center gap-2 rounded-md border border-line bg-white px-3 text-sm font-medium text-ink hover:border-ink"
      >
        <FileText size={16} />
        导出 TXT
      </a>
    </div>
  );
}
