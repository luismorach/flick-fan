import { CommonModule, DatePipe, NgOptimizedImage } from '@angular/common';
import { Component, computed, inject, input, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Movie } from '../../../../../core/interfaces/movie/movie.interface';
import { IconComponent } from '../../../../icon/icon.component';
import { AutoImagePipe } from '../../../../pipes/autoimage/auto-image.pipe';
import { getKeyTrailer } from '../../../../utils/helpers';
import { FloatTrailerService } from '../../../../../core/services/float-trailer/float-trailer.service';
import { CdkPortalOutlet } from '@angular/cdk/portal';
import { ApiService } from '../../../../../core/services/API/api.service';
import { Videos } from '../../../../../core/interfaces/media/videos.interface';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-card-movie',
  standalone: true,
  imports: [NgOptimizedImage, CommonModule, DatePipe, RouterLink,
    IconComponent, AutoImagePipe, CdkPortalOutlet],
  templateUrl: './card-movie.component.html',
  styleUrls: ['./card-movie.component.css']
})
export class CardMovieComponent {
  readonly movie = input.required<Movie>();
  private readonly floatTrailer = inject(FloatTrailerService);
  private api = inject(ApiService)
  private videosRequest: Subscription | undefined = undefined
  protected readonly hasGenres = computed(() =>
    (this.movie().genres?.length ?? 0) > 0
  );
  protected readonly primaryGenre = computed(() =>
    this.movie().genres?.[0]?.name ?? ''
  );

  private readonly portalHost = viewChild.required<CdkPortalOutlet>(CdkPortalOutlet)
  
  handleMouseEnterCard() {
    this.videosRequest = this.api.getMovieVideos({ dataId: this.movie().id }).subscribe((videos: Videos) => {
      const videoId = getKeyTrailer(videos)
        if (videoId)
          this.floatTrailer.playTrailerEmbed(videoId, this.portalHost())
    })
  }

  handleMouseLeaveCard() {
    this.videosRequest?.unsubscribe()
    this.floatTrailer.detachTrailerEmbed()
  }

}
