import { CreatePostRequest } from "../dto/requests/CreatePostRequest.dto";
import { IBlogRepository } from "../repositories/IBlogRepository";
import { validatePostCreation } from "../validators/blog.validate";

export class PostMainService {
    constructor(
        private readonly blogRepo : IBlogRepository
    ) {}

    async createPost(props : CreatePostRequest , adminId : number) : Promise<{id : number , message : string}> {
        try {
            const { error } = validatePostCreation.validate(props);
            if (error) {
                throw new Error(error.details[0].message);
            }
    
            return await this.blogRepo.create(props , adminId)   
        } catch (error:any) {
            throw new Error(error.message);
        }
    }

    async validate(props : CreatePostRequest) {
        return validatePostCreation.validate(props)
    }
}
