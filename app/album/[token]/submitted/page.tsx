import Link from "next/link";

export default function SubmittedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-5">
      <section className="w-full max-w-sm rounded-lg border border-line bg-white p-6 text-center shadow-soft">
        <p className="text-sm text-muted">提交成功</p>
        <h1 className="mt-2 text-2xl font-semibold text-ink">选片已提交</h1>
        <p className="mt-3 text-sm leading-6 text-muted">摄影师会根据你选择的照片编号开始后期修图。</p>
        <Link href="/" className="mt-6 inline-flex min-h-11 items-center rounded-md bg-ink px-4 text-sm font-medium text-white">
          完成
        </Link>
      </section>
    </main>
  );
}
