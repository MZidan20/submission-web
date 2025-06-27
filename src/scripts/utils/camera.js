export class Camera {
  constructor(videoElement, canvasElement) {
    this.video = videoElement;
    this.canvas = canvasElement;
    this.stream = null;
    this.photoFile = null;
  }

  async start() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      this.video.srcObject = this.stream;
      this.video.play();
      return true;
    } catch (err) {
      console.error("Error access camera:", err);
      return false;
    }
  }

  stop() {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.video.srcObject = null;
    }
  }

  takePhoto() {
    if (!this.stream) return null;

    const context = this.canvas.getContext("2d");
    this.canvas.width = this.video.videoWidth;
    this.canvas.height = this.video.videoHeight;
    context.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);

    return new Promise((resolve) => {
      this.canvas.toBlob(
        (blob) => {
          this.photoFile = new File([blob], "photo.jpg", {
            type: "image/jpeg",
          });
          resolve(this.photoFile);
        },
        "image/jpeg",
        0.95
      );
    });
  }

  getPhotoFile() {
    return this.photoFile;
  }
}

export default Camera;