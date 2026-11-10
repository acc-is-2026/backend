import { MediaType } from "@prisma/client";

export interface AddWatchlistItemInput {
  tmdbId: number;
  mediaType: MediaType;
  title?: string;
  posterPath?: string;
}
