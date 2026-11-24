const MAX_SOURCE_BYTES = 10 * 1024 * 1024;
const MAX_OUTPUT_BYTES = 2 * 1024 * 1024;
const MAX_EDGE = 1280;

/** Shrinks supported photos to a bounded JPEG data URL for report submission. */
export async function compressReportImage(file: File): Promise<string> {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    throw new Error('Elegí una imagen JPG, PNG o WebP.');
  }
  if (file.size > MAX_SOURCE_BYTES) throw new Error('La imagen original no puede superar 10 MB.');

  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('No pudimos procesar la imagen.');
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

    for (const quality of [0.82, 0.68, 0.52, 0.38]) {
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((value) => value ? resolve(value) : reject(new Error('No pudimos procesar la imagen.')), 'image/jpeg', quality);
      });
      if (blob.size <= MAX_OUTPUT_BYTES) return await blobToDataUrl(blob);
    }
  } finally {
    bitmap.close();
  }

  throw new Error('La imagen sigue siendo demasiado grande. Elegí una foto más pequeña.');
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('No pudimos leer la imagen.'));
    reader.onerror = () => reject(new Error('No pudimos leer la imagen.'));
    reader.readAsDataURL(blob);
  });
}
