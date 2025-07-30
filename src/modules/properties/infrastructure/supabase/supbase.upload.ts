// infrastructure/storage/SupabaseUploader.ts
import { supabase } from "../../../../infrastructure/supbase/supbase.connect";
import { PropertyPhotosInterface } from "../../domain/valueObjects/propertyPhoto.helpers";
import { IUploader } from "./PhotoUploaderInterface";

export class SupabaseUploader implements IUploader {

  async upload(file: PropertyPhotosInterface): Promise<boolean> {

    try {
      const { error } = await supabase.storage
      .from("propertyphotos")
      .upload(file.fileName, file.buffer, {
        contentType: file.mimeType,
      });

    if (error) {
      throw new Error("Upload failed: " + error.message);
    } else {
      return true
    }

    } catch (error:any) {

      throw new Error(`error in uploading photo : ${error.message}`);
    }
  }

  async getUrl(filePath : string) : Promise<string> {
    try {
      const { data: publicUrlData } = supabase.storage
      .from("propertyphotos")
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
    } catch (error:any) {
      throw new Error(`error in uploading photo : ${error.message}`);
    }
  }
}
