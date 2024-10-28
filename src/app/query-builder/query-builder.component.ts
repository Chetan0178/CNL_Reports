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
  columnAliases: { [columnName: string]: string } = {};
  selectedFields: string[] = [];
  errorMessage: string | null = null;
  isLoading = false;

  constructor(private http: HttpClient) {}

  loadTables() {
    this.isLoading = true;
    const apiUrl = `${API_HOST}/api/tables/`;
    this.http.get(apiUrl).subscribe(
      (response: any) => {
        this.tables = response.tables;
        this.isLoading = false;
      },
      (error) => {
        this.showError('Error fetching tables');
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
        (response: any) => {
          this.selectedColumns[tableName] = response.columns;
          this.isLoading = false;
        },
        (error) => {
          this.showError(`Error fetching columns for table: ${tableName}`);
          this.isLoading = false;
        }
      );
    } else {
      delete this.selectedColumns[tableName];
      this.removeAllColumnsFromTable(tableName);
    }
  }

  showError(message: string) {
    this.errorMessage = message;
    setTimeout(() => {
      this.errorMessage = null;
    }, 3000);
  }

  getSelectedColumnKeys(): string[] {
    return Object.keys(this.selectedColumns);
  }

  toggleColumnSelection(tableName: string, column: string, event: any) {
    const isChecked = event.target.checked;
    const columnKey = `${tableName}.${column}`;

    if (isChecked) {
      this.selectedFields.push(columnKey);
    } else {
      this.removeSelectedField(columnKey); // Remove the column when unchecked
    }
  }

  getSelectedColumnsList(): string[] {
     return this.selectedFields;
  }

  updateAlias(column: string, event: any) {
    this.columnAliases[column] = event.target.value;
  }

  // Function to remove a selected field from alias table and uncheck the associated checkbox
  removeSelectedField(columnKey: string) {
    const index = this.selectedFields.indexOf(columnKey);
    if (index > -1) {
      this.selectedFields.splice(index, 1); // Remove from selected fields

      // Uncheck the corresponding checkbox
      const [tableName, column] = columnKey.split('.');
      const checkbox = document.querySelector(
        `input[type="checkbox"][data-table="${tableName}"][data-column="${column}"]`
      ) as HTMLInputElement;

      if (checkbox) {
        checkbox.checked = false;
      }
    }
  }

  // Remove all selected columns of a table when table checkbox is unchecked
  removeAllColumnsFromTable(tableName: string) {
    this.selectedFields = this.selectedFields.filter(
      (field) => !field.startsWith(`${tableName}.`)
    );
  }
}
