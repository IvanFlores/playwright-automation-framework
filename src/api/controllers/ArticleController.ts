import { ApiClient } from '@api/client/ApiClient';
import { ArticlesEndpoints } from '@api/endpoints/articles.endpoints';
import { Article, CreateArticlePayload } from '@api/models/article.model';

export class ArticleController {
  constructor(private readonly client: ApiClient) {}

  async getAll(): Promise<Article[]> {
    return this.client.get<Article[]>(ArticlesEndpoints.base);
  }

  /** Articles whose title or body contains `term` (the same search the list page uses). */
  async search(term: string): Promise<Article[]> {
    return this.client.get<Article[]>(ArticlesEndpoints.base, { q: term });
  }

  async getById(id: number): Promise<Article> {
    return this.client.get<Article>(ArticlesEndpoints.byId(id));
  }

  async create(payload: CreateArticlePayload): Promise<Article> {
    return this.client.post<Article>(ArticlesEndpoints.base, payload);
  }

  async delete(id: number): Promise<void> {
    return this.client.delete(ArticlesEndpoints.byId(id));
  }
}
