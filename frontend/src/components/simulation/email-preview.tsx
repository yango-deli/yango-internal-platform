"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";

export function EmailPreview({ emailText }: { emailText: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(emailText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Email Preview (Hebrew)</CardTitle>
          <Button size="sm" variant="outline" onClick={handleCopy}>
            {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <pre
          dir="rtl"
          className="rtl whitespace-pre-wrap text-sm font-mono text-gray-700 bg-gray-50 rounded-lg p-4 border border-gray-200 max-h-80 overflow-auto leading-relaxed"
        >
          {emailText}
        </pre>
      </CardContent>
    </Card>
  );
}
