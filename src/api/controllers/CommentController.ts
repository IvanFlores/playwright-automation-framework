import { ApiClient } from '@api/client/ApiClient';
import { CommentsEndpoints } from '@api/endpoints/comments.endpoints';
import { Comment, CreateCommentPayload } from '@api/models/comment.model';

export class CommentController {
  constructor(private readonly client: ApiClient) {}

  async create(payload: CreateCommentPayload): Promise<Comment> {
    return this.client.post<Comment>(CommentsEndpoints.base, payload);
  }

  async delete(id: number): Promise<void> {
    return this.client.delete(CommentsEndpoints.byId(id));
  }
}
