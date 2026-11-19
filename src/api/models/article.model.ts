export interface Article {
  id: number;
  user_id: number;
  title: string;
  body: string;
  date: string;
  image: string;
}

/** GAD rejects a `date` in the future and expects `YYYY-MM-DDTHH:mm:ssZ`. */
export interface CreateArticlePayload {
  title: string;
  body: string;
  date: string;
  image: string;
}
