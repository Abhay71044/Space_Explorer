export async function downloadImage(imageUrl, customFilename, showToast) {
  if (!imageUrl) return;
  if (showToast) showToast("📥 INITIATING DIRECT HD FILE DOWNLOAD...");

  const fileName = customFilename || `COSMA_NASA_Telemetry_${Date.now()}.jpg`;
  let success = false;

  // Strategy 1: Direct Blob Fetch
  try {
    const response = await fetch(imageUrl);
    if (response.ok) {
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 300);
      success = true;
    }
  } catch (e) {
    // CORS block on fetch
  }

  // Strategy 2: Offscreen Canvas Conversion to Data URL
  if (!success) {
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imageUrl;
      });

      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth || img.width || 1200;
      canvas.height = img.naturalHeight || img.height || 800;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);

      const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      success = true;
    } catch (err) {
      // Canvas tainted
    }
  }

  // Strategy 3: Dynamic hidden anchor fallback
  if (!success) {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  if (showToast) showToast("🛰️ HD FILE DOWNLOADED TO DISK");
}
