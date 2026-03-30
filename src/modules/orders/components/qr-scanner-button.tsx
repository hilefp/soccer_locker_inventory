'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { useIsMobile } from '@/shared/hooks/use-mobile';
import { toast } from 'sonner';

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
  const [open, setOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const isMobile = useIsMobile();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
      } catch {
        // Scanner may already be stopped
      }
      scannerRef.current = null;
    }
    setIsScanning(false);
  }, []);

  const startScanner = useCallback(async () => {
    if (!containerRef.current) return;

    // Ensure clean state
    await stopScanner();

    const scannerId = 'qr-scanner-reader';
    containerRef.current.id = scannerId;

    const html5QrCode = new Html5Qrcode(scannerId);
    scannerRef.current = html5QrCode;

    try {
      await html5QrCode.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          const orderNumber = extractOrderNumber(decodedText);
          toast.success(`Scanned order: ${orderNumber}`);
          onScan(orderNumber);
          stopScanner();
          setOpen(false);
        },
        () => {
          // No QR found in frame — keep scanning
        }
      );
      setIsScanning(true);
    } catch {
      toast.error('Unable to access camera. Please check permissions.');
      stopScanner();
      setOpen(false);
    }
  }, [onScan, stopScanner]);

  useEffect(() => {
    if (open) {
      const timer = setTimeout(startScanner, 400);
      return () => clearTimeout(timer);
    } else {
      stopScanner();
    }
  }, [open, startScanner, stopScanner]);

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, [stopScanner]);

  if (!isMobile) return null;

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-1.5"
      >
        <Camera className="size-4" />
        Scan QR
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Scan Order QR Code</DialogTitle>
          </DialogHeader>

          <div className="relative rounded-lg overflow-hidden bg-black min-h-[300px]">
            <div ref={containerRef} className="w-full" />
            {!isScanning && (
              <div className="absolute inset-0 flex items-center justify-center text-white text-sm">
                Starting camera...
              </div>
            )}
          </div>

          <p className="text-sm text-muted-foreground text-center">
            Point the camera at an order QR code to search for it
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
}
