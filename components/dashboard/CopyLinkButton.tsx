"use client";

import { Copy } from "lucide-react";
import { useState } from "react";

export function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  const [showManualCopy, setShowManualCopy] = useState(false);

  async function copy() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        throw new Error("Clipboard API unavailable");
      }
      setCopied(true);
      setShowManualCopy(false);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setShowManualCopy(true);
    }
  }

  return (
    <div className="grid gap-2">
      <button
        onClick={copy}
        type="button"
        className="inline-flex min-h-10 items-center gap-2 rounded-md border border-line bg-white px-3 text-sm hover:border-ink"
      >
        <Copy size={15} />
        {copied ? "已复制" : "复制客户链接"}
      </button>
      {showManualCopy ? (
        <div className="rounded-md border border-line bg-paper p-2">
          <p className="mb-2 text-xs text-muted">浏览器拒绝自动复制，请手动复制下面链接。</p>
          <input
            value={url}
            readOnly
            onFocus={(event) => event.currentTarget.select()}
            className="w-full rounded-md border border-line bg-white px-2 py-2 text-xs outline-none focus:border-ink"
          />
        </div>
      ) : null}
    </div>
  );
}
