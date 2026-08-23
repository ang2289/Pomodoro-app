import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop';
import 'react-easy-crop/react-easy-crop.css';

export type ImageCropperProps = {
  imageUrl: string;
  aspect: number | undefined;
  crop: { x: number; y: number };
  zoom: number;
  onCropChange: (location: { x: number; y: number }) => void;
  onZoomChange: (zoom: number) => void;
  onCropComplete: (croppedArea: Area, croppedAreaPixels: Area) => void;
};

/**
 * react-easy-crop 包裝：比例可由上層切換（含自由裁切 aspect 為 undefined）。
 */
export function ImageCropper({
  imageUrl,
  aspect,
  crop,
  zoom,
  onCropChange,
  onZoomChange,
  onCropComplete,
}: ImageCropperProps) {
  return (
    <div className="relative h-[min(70vh,440px)] w-full overflow-hidden rounded-lg bg-neutral-900">
      <Cropper
        image={imageUrl}
        crop={crop}
        zoom={zoom}
        aspect={aspect}
        onCropChange={onCropChange}
        onZoomChange={onZoomChange}
        onCropComplete={onCropComplete}
        showGrid
      />
    </div>
  );
}
