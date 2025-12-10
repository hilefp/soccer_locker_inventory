import { ReactNode, useRef } from 'react';

export interface ImageInputFile {
  dataURL?: string;
  file?: File;
}

export interface ImageInputProps {
  value: ImageInputFile[];
  onChange?: (files: ImageInputFile[]) => void;
  maxFiles?: number;
  maxSize?: number;
  accept?: string;
  className?: string;
  children?: ReactNode | ((props: { onImageUpload: () => void }) => ReactNode);
}

export function ImageInput({
  value,
  onChange,
  maxFiles = 1,
  className = '',
  children,
}: ImageInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles: ImageInputFile[] = files.map((file) => ({
      file,
      dataURL: URL.createObjectURL(file),
    }));
    onChange?.(imageFiles);
  };

  const onImageUpload = () => {
    inputRef.current?.click();
  };

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={maxFiles > 1}
        onChange={handleFileChange}
        className="hidden"
      />
      {typeof children === 'function' ? (
        children({ onImageUpload })
      ) : (
        <label onClick={onImageUpload} className="cursor-pointer">
          {children || (
            <div className="border-2 border-dashed rounded-lg p-4 text-center">
              Click to upload image
            </div>
          )}
        </label>
      )}
    </div>
  );
}

