import { useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface ScannerProps {
  onScan: (decodedText: string) => void;
}

export function Scanner({ onScan }: ScannerProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    scannerRef.current = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );

    scannerRef.current.render(
      (decodedText) => {
        onScan(decodedText);
        // Stop scanning after success
        scannerRef.current?.clear();
      },
      (error) => {
        // console.warn(error);
      }
    );

    return () => {
      scannerRef.current?.clear().catch(err => console.error("Failed to clear scanner", err));
    };
  }, [onScan]);

  return (
    <div className="w-full max-w-md mx-auto overflow-hidden rounded-xl bg-white shadow-lg border border-blue-100">
      <div id="reader" className="w-full"></div>
    </div>
  );
}
