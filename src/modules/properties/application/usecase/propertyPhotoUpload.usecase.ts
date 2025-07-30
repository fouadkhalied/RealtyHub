// useCases/UploadPhotos.useCase.ts
import { IPhotoRepository } from "../../domain/repositories/IPhotoRepository";
import { PropertyPhotosInterface } from "../../domain/valueObjects/propertyPhoto.helpers";
import { PropertyPhoto } from "../../domain/valueObjects/propertyPhotos.vo";
import { IUploader } from "../../infrastructure/supabase/PhotoUploaderInterface";

export class UploadPhotosUseCase {
  constructor(
    private readonly uploader: IUploader ,
    private readonly propertyId: number,
    private readonly files: Express.Multer.File[],
    private readonly coverIndex : number,
    private readonly repo : IPhotoRepository  
  ) {

  }

  async prepare() : Promise <PropertyPhotosInterface[]> {
    return new PropertyPhoto(this.files , this.propertyId , this.coverIndex).prepareForUpload();
  }  

  async execute() : Promise<boolean> {
    const propertyPhotos = await this.prepare();
    
    await this.upload(propertyPhotos)

    const photosUrl : string[] = await this.getUrls(propertyPhotos);

    const coverUrl : string = await this.getCoverUrl(propertyPhotos);

    await this.save(coverUrl , photosUrl)
    
    return true
  }

  async upload(propertyPhotos : PropertyPhotosInterface[]) {
    await Promise.all(propertyPhotos.map(photo => this.uploader.upload(photo)));
  }

  async getUrls(propertyPhotos : PropertyPhotosInterface[]): Promise<string[]> {
    const nonMainPhotos = propertyPhotos.filter(photo => !photo.isMain);
    return await Promise.all(nonMainPhotos.map(photo => this.uploader.getUrl(photo.fileName)));
  }
  

  async getCoverUrl(propertyPhotos : PropertyPhotosInterface[]): Promise<string> {
    const mainPhoto = propertyPhotos.find(photo => photo.isMain);
    if (!mainPhoto) throw new Error("No main photo found for this property");
    return this.uploader.getUrl(mainPhoto.fileName);
  }
  

  async save(coverUrl : string , photosUrl : string[]) {

    const result = await this.repo.savePropertyCoverPhoto(this.propertyId,coverUrl)

    await this.repo.savePropertyPhotos(this.propertyId , photosUrl)
  }
}
