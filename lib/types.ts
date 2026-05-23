export interface Sticker {
  id: string;
  imageUrl: string;
  memo: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export type SortOrder = "newest" | "oldest";
