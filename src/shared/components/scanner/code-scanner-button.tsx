'use client';

import { useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Camera } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { toast } from 'sonner';

interface CodeScannerButtonProps {
  onScan: (decoded: string) => void;
  label?: ReactNode;
  title?: string;
  helperText?: string;
  formats?: Html5QrcodeSupportedFormats[];
  parseDecoded?: (raw: string) => string;
  buttonVariant?: 'outline' | 'mono' | 'ghost';
  buttonClassName?: string;
  scannerId?: string;
}

export function CodeScannerButton({
  onScan,
  label = 'Scan',
  title = 'Scan Code',
  helperText = 'Point the camera at a code',
  formats,
  parseDecoded,
  buttonVariant = 'outline',
  buttonClassName,
  scannerId = 'code-scanner-reader',
}: CodeScannerButtonProps) {
  const [open, setOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
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

    await stopScanner();

    containerRef.current.id = scannerId;

    const html5QrCode = formats
      ? new Html5Qrcode(scannerId, { formatsToSupport: formats, verbose: false })
      : new Html5Qrcode(scannerId);
    scannerRef.current = html5QrCode;

    try {
      await html5QrCode.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          const value = parseDecoded ? parseDecoded(decodedText) : decodedText;
          onScan(value);
          stopScanner();
          setOpen(false);
        },
        () => {
          // No code in frame — keep scanning
        }
      );
      setIsScanning(true);
    } catch {
      toast.error('Unable to access camera. Please check permissions.');
      stopScanner();
      setOpen(false);
    }
  }, [onScan, parseDecoded, formats, scannerId, stopScanner]);

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

  return (
    <>
      <Button
        variant={buttonVariant}
        size="sm"
        onClick={() => setOpen(true)}
        className={buttonClassName ?? 'gap-1.5'}
      >
        <Camera className="size-4" />
        {label}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>

          <div className="relative rounded-lg overflow-hidden bg-black min-h-[300px]">
            <div ref={containerRef} className="w-full" />
            {!isScanning && (
              <div className="absolute inset-0 flex items-center justify-center text-white text-sm">
                Starting camera...
              </div>
            )}
          </div>

          <p className="text-sm text-muted-foreground text-center">{helperText}</p>
        </DialogContent>
      </Dialog>
    </>
  );
}
