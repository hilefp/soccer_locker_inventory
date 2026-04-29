'use client';

import { Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { toast } from 'sonner';
import { CodeScannerButton } from '@/shared/components/scanner/code-scanner-button';

interface QrScannerButtonProps {
  onScan: (orderNumber: string) => void;
}

function extractOrderNumber(decodedText: string): string {
  try {
    const url = new URL(decodedText);
    const search = url.searchParams.get('search');
    if (search) return search;
  } catch {
    // Not a URL — use raw text
  }
  return decodedText;
}

export function QrScannerButton({ onScan }: QrScannerButtonProps) {
  return (
    <CodeScannerButton
      label="Scan QR"
      title="Scan Order QR Code"
      helperText="Point the camera at an order QR code to search for it"
      formats={[Html5QrcodeSupportedFormats.QR_CODE]}
      parseDecoded={extractOrderNumber}
      scannerId="qr-scanner-reader"
      onScan={(value) => {
        toast.success(`Scanned order: ${value}`);
        onScan(value);
      }}
    />
  );
}
