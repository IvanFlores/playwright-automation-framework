import { ApiClient } from '@api/client/ApiClient';
import { PostsEndpoints } from '@api/endpoints/posts.endpoints';
import { CreatePostPayload, Post } from '@api/models/post.model';

export class PostController {
  constructor(private readonly client: ApiClient) {}

  async getAll(): Promise<Post[]> {
    return this.client.get<Post[]>(PostsEndpoints.base);
  }

  async create(payload: CreatePostPayload): Promise<Post> {
    return this.client.post<Post>(PostsEndpoints.base, payload);
  }
}
