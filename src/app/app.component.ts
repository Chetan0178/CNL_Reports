import { Component } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'report-without-standalone';

  constructor(private router: Router) {}


  isOnChartPage(): boolean {
    return this.router.url === '/chart'; // Check if the current URL is '/chart'
  }
}
