import { PropertyPhotos } from "../valueObjects/propertyPhoto.helpers"; // likely correct

export class Property {
  private readonly maxPhotos = 10;
  private propertyPhotos: PropertyPhotos[] = []; // ✅ Fixed here

  public addPhoto(photo: PropertyPhotos): void {
    if (this.propertyPhotos.length >= this.maxPhotos) {
      throw new Error("A property can have at most 10 photos.");
    }

    this.propertyPhotos.push(photo);
  }

  public getPhotos(): PropertyPhotos[] {
    return [...this.propertyPhotos];
  }

  public removePhoto(fileName: string): void {
    this.propertyPhotos = this.propertyPhotos.filter(photo => photo.fileName !== fileName);
  }

  public setCover(fileName: string): void {
    this.propertyPhotos = this.propertyPhotos.map(photo => ({
      ...photo,
      isMain: photo.fileName === fileName,
    }));
  }
}
