import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { API_HOST } from '../../assets/api.config';


@Component({
  selector: 'app-query-builder',
  templateUrl: './query-builder.component.html',
  styleUrls: ['./query-builder.component.css'] // Corrected styleUrls here
})
export class QueryBuilderComponent {
  tables: string[] = [];
  selectedColumns: { [tableName: string]: string[] } = {};
  isLoading = false;

  constructor(private http: HttpClient) {}

  loadTables() {
    this.isLoading = true;
    const apiUrl = `${API_HOST}/api/tables/`;
    this.http.get(apiUrl).subscribe(
      (response:any) => {
        this.tables = response.tables;
        this.isLoading = false;
      },
      (error) => {
        console.error('Error fetching tables', error);
        this.isLoading = false;
      }
    );
  }

  loadColumns(tableName: string, event: any) {
    const isChecked = event.target.checked;

    if (isChecked) {
      this.isLoading = true;
      const columns_api_url = `${API_HOST}/api/tables/${tableName}/columns/`;
      this.http.get(columns_api_url).subscribe(
        (response:any) => {
          this.selectedColumns[tableName] = response.columns;
          this.isLoading = false;
        },
        (error) => {
          console.error('Error fetching columns for table:', tableName, error);
          this.isLoading = false;
        }
      );
    } else {
      delete this.selectedColumns[tableName];
    }
  }

  // Method to return the keys of the selectedColumns object
  getSelectedColumnKeys(): string[] {
    return Object.keys(this.selectedColumns);
  }
}
