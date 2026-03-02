import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { sf } from '@decaf-ts/logging';
import { KeyValue } from '@decaf-ts/for-angular';

@Component({
  selector: 'app-kibana-dashboard',
  template: `
    <div class="kibana-container">
      <iframe [src]="safeUrl" width="100%" [height]="height" frameborder="0" allowfullscreen></iframe>
    </div>
  `,
  styleUrls: ['./kibana-dashboard.component.scss'],
  standalone: true,
})
export class AppKibanaDashboardComponent implements OnInit {
  @Input({ required: true })
  dashboardId!: string;

  baseUrl = 'https://your-kibana/app/dashboards#/view/{dashboardId}?embed=true';

  @Input()
  height: string = '800px';
  //
  // @Input()
  // authType: 'none' | 'token' | 'basic' = 'none';

  @Input()
  token: string = '';
  //
  // @Input()
  // username: string = '';
  //
  // @Input()
  // password: string = '';

  @Input()
  embed: boolean = true;

  @Input()
  queryParams: KeyValue = {};

  safeUrl: SafeUrl | string = '';

  constructor(private sanitizer: DomSanitizer) {}

  async ngOnInit(): Promise<void> {
    this.updateUrl();
  }

  private updateUrl(): void {
    let finalUrl = sf(this.baseUrl, { dashboardId: this.dashboardId });

    if (this.embed) {
      finalUrl = this.addEmbedParam(finalUrl);
    }

    if (Object.keys(this.queryParams).length > 0) {
      finalUrl = this.addQueryParams(finalUrl, this.queryParams);
    }

    if (this.token) {
      this.sanitizer.bypassSecurityTrustResourceUrl(finalUrl);
    }

    this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(finalUrl);
  }

  private addEmbedParam(url: string): string {
    const parsedUrl = new URL(url);
    parsedUrl.searchParams.set('embed', 'true');
    return parsedUrl.toString();
  }

  private addQueryParams(url: string, params: KeyValue): string {
    const parsedUrl = new URL(url);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        parsedUrl.searchParams.set(key, value.toString());
      }
    });
    return parsedUrl.toString();
  }
}
