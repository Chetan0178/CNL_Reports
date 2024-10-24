import { HttpClient } from '@angular/common/http';
import { Component, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-query-builder',
  templateUrl: './query-builder.component.html',
  styleUrl: './query-builder.component.css'
})
export class QueryBuilderComponent {
  tables: string[] = []; // Holds the list of tables
  isLoading = false; // Indicates if the API call is in progress

  constructor(private http: HttpClient) {}

  // Function to load tables from API
  loadTables() {
    this.isLoading = true;
    this.http.get<any>('http://127.0.0.1:8000/api/tables/').subscribe(
      (response) => {
        this.tables = response.tables;
        this.isLoading = false;
      },
      (error) => {
        console.error('Error fetching tables', error);
        this.isLoading = false;
      }
    );
  }
}