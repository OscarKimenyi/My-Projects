class BarcodeScanner {
  constructor() {
    this.isScanning = false;
    this.videoElement = null;
    this.canvasElement = null;
    this.canvasContext = null;
    this.mediaStream = null;
  }

  async init() {
    // Create video and canvas elements
    this.videoElement = document.createElement("video");
    this.canvasElement = document.createElement("canvas");
    this.canvasContext = this.canvasElement.getContext("2d");

    // Set up video element
    this.videoElement.setAttribute("autoplay", "");
    this.videoElement.setAttribute("playsinline", "");

    try {
      // Get camera access
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      this.videoElement.srcObject = this.mediaStream;
      return true;
    } catch (error) {
      console.error("Error accessing camera:", error);
      return false;
    }
  }

  startScan(containerElement, onBarcodeDetected) {
    if (!this.mediaStream) {
      alert("Camera access not available");
      return;
    }

    this.isScanning = true;

    // Add video to container
    containerElement.innerHTML = "";
    containerElement.appendChild(this.videoElement);

    // Start scanning loop
    this.scanLoop(onBarcodeDetected);
  }

  stopScan() {
    this.isScanning = false;
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
    }
    if (this.videoElement) {
      this.videoElement.remove();
    }
  }

  scanLoop(onBarcodeDetected) {
    if (!this.isScanning) return;

    // Set canvas size to video size
    this.canvasElement.width = this.videoElement.videoWidth;
    this.canvasElement.height = this.videoElement.videoHeight;

    // Draw video frame to canvas
    this.canvasContext.drawImage(
      this.videoElement,
      0,
      0,
      this.canvasElement.width,
      this.canvasElement.height
    );

    // Get image data for barcode detection
    const imageData = this.canvasContext.getImageData(
      0,
      0,
      this.canvasElement.width,
      this.canvasElement.height
    );

    // Simple barcode detection (for demo - in real app use a library like QuaggaJS)
    this.simulateBarcodeDetection(onBarcodeDetected);

    // Continue scanning
    requestAnimationFrame(() => this.scanLoop(onBarcodeDetected));
  }

  simulateBarcodeDetection(onBarcodeDetected) {
    // Simulate barcode detection - in real implementation, use QuaggaJS or similar
    // For now, we'll simulate detection after 3 seconds
    if (!this.detectionSimulated) {
      this.detectionSimulated = setTimeout(() => {
        if (this.isScanning) {
          const mockBarcode = "PROD" + Math.floor(1000 + Math.random() * 9000);
          onBarcodeDetected(mockBarcode);
          this.stopScan();
        }
      }, 3000);
    }
  }

  // Method to manually enter barcode
  static manualBarcodeEntry() {
    const barcode = prompt("Enter barcode manually:");
    if (barcode) {
      return barcode;
    }
    return null;
  }
}

// Global barcode scanner instance
window.barcodeScanner = new BarcodeScanner();

// Initialize barcode scanner when page loads
document.addEventListener("DOMContentLoaded", async () => {
  await window.barcodeScanner.init();
});
