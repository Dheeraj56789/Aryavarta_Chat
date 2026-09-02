import QRCode from "qrcode";

/**
 * Generates an authentic, 100% scannable QR Code Data URL
 * @param {string} text - The content/URL to encode
 * @param {object} options - Optional styling parameters
 * @returns {Promise<string>} - Base64 Data URL of the generated QR code image
 */
export const generateQRCodeDataUrl = async (text, options = {}) => {
  try {
    const opts = {
      errorCorrectionLevel: options.errorCorrectionLevel || "H", // High error correction for logo overlays
      type: "image/png",
      quality: 0.95,
      margin: options.margin !== undefined ? options.margin : 2,
      width: options.width || 360,
      color: {
        dark: options.darkColor || "#111b21",
        light: options.lightColor || "#ffffff"
      },
      ...options
    };

    const dataUrl = await QRCode.toDataURL(text || "https://aryavarta.app", opts);
    return dataUrl;
  } catch (err) {
    console.error("Error generating QR code:", err);
    return null;
  }
};
