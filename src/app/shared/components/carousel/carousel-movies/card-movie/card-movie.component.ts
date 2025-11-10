import { CommonModule, DatePipe, NgOptimizedImage } from '@angular/common';
import { Component, computed, inject, input,viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Movie } from '../../../../../core/interfaces/movie/movie.interface';
import { IconComponent } from '../../../../icon/icon.component';
import { AutoImagePipe } from '../../../../pipes/autoimage/auto-image.pipe';
import { MinutesToTimePipe } from '../../../../pipes/minutes-to-time/minutes-to-time.pipe';
import { getKeyTrailer } from '../../../../utils/helpers';
import { FloatTrailerService } from '../../../../../core/services/float-trailer/float-trailer.service';
import { CdkPortalOutlet } from '@angular/cdk/portal';

@Component({
  selector: 'app-card-movie',
  standalone: true,
  imports: [NgOptimizedImage, CommonModule, DatePipe, MinutesToTimePipe, RouterLink,
    IconComponent, AutoImagePipe, CdkPortalOutlet],
  templateUrl: './card-movie.component.html',
  styleUrls: ['./card-movie.component.css']
})
export class CardMovieComponent {
  readonly movie = input.required<Movie>();
  private readonly videoId = computed(() => getKeyTrailer(this.movie()))
  private readonly floatTrailer = inject(FloatTrailerService);
  protected readonly hasGenres = computed(() => 
    (this.movie().genres?.length ?? 0) > 0
  );
  protected readonly primaryGenre = computed(() => 
    this.movie().genres?.[0]?.name ?? ''
  );

  private readonly portalHost = viewChild.required<CdkPortalOutlet>(CdkPortalOutlet)

  handleMouseEnterCard() {
    this.floatTrailer.showTrailerEmbed(this.videoId(), this.portalHost())
  }

  handleMouseLeaveCard() {
    this.floatTrailer.detachTrailerEmbed()
  }

}
