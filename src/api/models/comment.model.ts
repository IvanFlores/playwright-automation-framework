export interface Comment {
  id: number;
  article_id: number;
  user_id: number;
  body: string;
  date: string;
}

export interface CreateCommentPayload {
  article_id: number;
  body: string;
  date: string;
}
