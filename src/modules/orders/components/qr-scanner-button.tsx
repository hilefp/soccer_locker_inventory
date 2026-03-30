'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Camera } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
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
  const [isSupported, setIsSupported] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const hasTouchScreen =
      'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const hasBarcodeDetector = 'BarcodeDetector' in window;
    setIsSupported(hasTouchScreen && hasBarcodeDetector);
  }, []);

  const stopCamera = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  }, []);

  const startScanning = useCallback(async () => {
    if (!videoRef.current) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      setIsScanning(true);

      const detector = new BarcodeDetector({ formats: ['qr_code'] });

      const scan = async () => {
        if (!videoRef.current || !streamRef.current) return;

        try {
          const barcodes = await detector.detect(videoRef.current);
          if (barcodes.length > 0) {
            const orderNumber = extractOrderNumber(barcodes[0].rawValue);
            toast.success(`Scanned order: ${orderNumber}`);
            onScan(orderNumber);
            stopCamera();
            setOpen(false);
            return;
          }
        } catch {
          // Frame not ready yet — continue
        }

        rafRef.current = requestAnimationFrame(scan);
      };

      rafRef.current = requestAnimationFrame(scan);
    } catch {
      toast.error('Unable to access camera. Please check permissions.');
      stopCamera();
      setOpen(false);
    }
  }, [onScan, stopCamera]);

  useEffect(() => {
    if (open) {
      const timer = setTimeout(startScanning, 300);
      return () => clearTimeout(timer);
    } else {
      stopCamera();
    }
  }, [open, startScanning, stopCamera]);

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  if (!isSupported) return null;

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

          <div className="relative rounded-lg overflow-hidden bg-black">
            <video
              ref={videoRef}
              className="w-full h-auto"
              playsInline
              muted
            />
            {/* Scan overlay guide */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-56 h-56 border-2 border-white/60 rounded-lg" />
            </div>
            {!isScanning && (
              <div className="absolute inset-0 flex items-center justify-center text-white text-sm min-h-[300px]">
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
