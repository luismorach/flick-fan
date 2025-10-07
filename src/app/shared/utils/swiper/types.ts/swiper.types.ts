import { InputSignal, OutputEmitterRef } from "@angular/core";
import { MovieList } from "../../../../core/interfaces/movie/movie.interface";
import { SerieList } from "../../../../core/interfaces/serie/serie.interface";

export interface LayoutDimensions {
  containerWidth: number;
  slideWidth: number;
  padding: number;
}

export interface DataLoaderConfig {
  data: InputSignal<MovieList | SerieList | undefined>;
  requestMoreData: OutputEmitterRef<void>;
}