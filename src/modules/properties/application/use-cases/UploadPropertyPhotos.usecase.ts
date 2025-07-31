import { IPhotoRepository } from "../../domain/repositories/IPhotoRepository";
import { PropertyPhotosInterface } from "../../domain/valueObjects/propertyPhoto.helpers";
import { PropertyPhoto } from "../../domain/valueObjects/propertyPhotos.vo";
import { IUploader } from "../../infrastructure/supabase/PhotoUploaderInterface";
import { ServiceResult } from "../interfaces/serviceResult";

export class UploadPropertyPhotosUseCase {
  constructor(
    private readonly uploader: IUploader,
    private readonly repo: IPhotoRepository
  ) {}

  async execute(
    propertyId: number,
    files: Express.Multer.File[],
    coverImageIndex: number
  ): Promise<ServiceResult> {
    try {
      const propertyPhotos = await this.prepare(files, propertyId, coverImageIndex);

      await this.upload(propertyPhotos);

      const photosUrl: string[] = await this.getUrls(propertyPhotos);
      const coverUrl: string = await this.getCoverUrl(propertyPhotos);

      await this.save(propertyId, coverUrl, photosUrl);

      return {
        success: true,
        message: "Photos uploaded to property successfully"
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  private async prepare(
    files: Express.Multer.File[],
    propertyId: number,
    coverIndex: number
  ): Promise<PropertyPhotosInterface[]> {
    return new PropertyPhoto(files, propertyId, coverIndex).prepareForUpload();
  }

  private async upload(propertyPhotos: PropertyPhotosInterface[]): Promise<void> {
    await Promise.all(propertyPhotos.map(photo => this.uploader.upload(photo)));
  }

  private async getUrls(propertyPhotos: PropertyPhotosInterface[]): Promise<string[]> {
    const nonMainPhotos = propertyPhotos.filter(photo => !photo.isMain);
    return await Promise.all(nonMainPhotos.map(photo => this.uploader.getUrl(photo.fileName)));
  }

  private async getCoverUrl(propertyPhotos: PropertyPhotosInterface[]): Promise<string> {
    const mainPhoto = propertyPhotos.find(photo => photo.isMain);
    if (!mainPhoto) throw new Error("No main photo found for this property");
    return this.uploader.getUrl(mainPhoto.fileName);
  }

  private async save(propertyId: number, coverUrl: string, photosUrl: string[]): Promise<void> {
    await this.repo.savePropertyCoverPhoto(propertyId, coverUrl);
    await this.repo.savePropertyPhotos(propertyId, photosUrl);
  }

  async validate(propertyId: number, userId: number): Promise<boolean> {
    return this.repo.findPropertyIDandUserID(propertyId, userId);
  }
}
