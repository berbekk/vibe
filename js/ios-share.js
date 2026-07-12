function canvasToBlob(canvas) {
  return new Promise((resolve) => {
    canvas.toBlob(resolve, 'image/png');
  });
}

export function canShareFiles() {
  if (!navigator.share || !navigator.canShare) {
    return false;
  }

  const probe = new File([''], 'probe.png', { type: 'image/png' });
  return navigator.canShare({ files: [probe] });
}

export async function shareCanvasImage(canvas) {
  if (!navigator.share) {
    return { ok: false, reason: 'unsupported' };
  }

  const blob = await canvasToBlob(canvas);
  if (!blob) {
    return { ok: false, reason: 'empty' };
  }

  const file = new File([blob], 'pattern.png', { type: 'image/png' });
  const payload = {
    title: 'Pattern',
    text: 'Мой паттерн',
    files: [file]
  };

  if (navigator.canShare && navigator.canShare(payload)) {
    await navigator.share(payload);
    return { ok: true };
  }

  await navigator.share({
    title: 'Pattern',
    text: 'Мой паттерн',
    url: window.location.href
  });

  return { ok: true, fallback: true };
}
