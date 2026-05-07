import QRCode from "qrcode";

const options = {
  errorCorrectionLevel: "M" as const,
  margin: 2,
  scale: 6,
  color: {
    dark: "#111111",
    light: "#ffffff",
  },
};

export async function generateQrPngDataUrl(url: string): Promise<string> {
  return QRCode.toDataURL(url, options);
}

export async function generateQrSvgString(url: string): Promise<string> {
  return QRCode.toString(url, { ...options, type: "svg" });
}

