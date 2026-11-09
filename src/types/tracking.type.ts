import { TrackingStatus } from "@prisma/client";

export interface TrackMovieInput {
  tmdbId: number;
  title?: string;
  posterPath?: string;
  status: TrackingStatus;
  watchedAt?: Date;
}

export interface TrackShowInput {
  tmdbId: number;
  title?: string;
  posterPath?: string;
  status: TrackingStatus;
  watchedAt?: Date;
}

export interface TrackEpisodeInput {
  tmdbId: number;
  title?: string;
  posterPath?: string;
  seasonNumber: number;
  episodeNumber: number;
  watchedAt?: Date;
}

export interface TrackBulkEpisodesInput {
  tmdbId: number;
  title?: string;
  posterPath?: string;
  status?: TrackingStatus;
  episodes: Array<{ seasonNumber: number; episodeNumber: number }>;
}
