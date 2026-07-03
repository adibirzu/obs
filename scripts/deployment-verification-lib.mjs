export function buildVerificationPaths(manifest, requiredPdfCount) {
  const paths = manifest.files.map(file => file.path);
  const pdfs = paths.filter(path => path.toLowerCase().endsWith('.pdf')).sort();
  if (pdfs.length !== requiredPdfCount) {
    throw new Error(`Deployment manifest must contain ${requiredPdfCount} PDFs; found ${pdfs.length}`);
  }
  if (!paths.includes('interlocks.html')) throw new Error('Deployment manifest is missing interlocks.html');
  return ['interlocks.html', ...pdfs];
}
