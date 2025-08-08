import { PostMainService } from "../application/services/blogMainService";
import { BlogRepositoryImplementation } from "../infrastructure/repositories/BlogRepositoryImpl";
import { PostController } from "../presentation/controller/postController";

export function createPostController(): PostController {
    const PostRepo = new BlogRepositoryImplementation()
    const PostService = new PostMainService(PostRepo)
    return new PostController(PostService)
}
