import { PropertyPhotosInterface } from "./propertyPhoto.helpers";

export class PropertyPhoto {
  private maxPhotos: number = 10;
  private maxFileSize: number = 1 * 1024 * 1024; // 1 MB
  private readonly propertyId: number;
  private coverImageIndex: number;
  private allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

  constructor(
    private readonly files: Express.Multer.File[],
    propertyId: number,
    coverImageIndex: number
  ) {
    this.propertyId = propertyId;
    this.coverImageIndex = coverImageIndex;

    this.validateCount();
    this.validateSize();
    this.validateType();
  }

  private validateCount() {
    if (this.files.length > this.maxPhotos) {
      throw new Error(`Maximum of ${this.maxPhotos} photos allowed per upload.`);
    }
  }

  private validateSize() {
    const oversized = this.files.filter(file => file.size > this.maxFileSize);
    if (oversized.length > 0) {
      throw new Error(`Each photo must be less than ${this.maxFileSize / 1024 / 1024}MB.`);
    }
  }

  private validateType() {
    const invalidFiles = this.files.filter(file => !this.allowedMimeTypes.includes(file.mimetype));
    if (invalidFiles.length > 0) {
      throw new Error(`Only JPEG, PNG, and WebP formats are allowed.`);
    }
  }

  private generateFilename(fileExtension: string): string {
    const uniqueSuffix = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    return `property-${this.propertyId}-${uniqueSuffix}.${fileExtension}`;
  }

  public prepareForUpload():PropertyPhotosInterface [] {
    return this.files.map((file, index) => {
      const extension = file.originalname.split('.').pop();
      const filename = this.generateFilename(extension!);
      return {
        buffer: file.buffer,
        mimeType: file.mimetype,
        size: file.size,
        fileName: filename,
        isMain: index === this.coverImageIndex
      };
    });
  }
}
