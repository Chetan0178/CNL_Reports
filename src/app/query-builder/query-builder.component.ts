import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { API_HOST } from '../../assets/api.config';

@Component({
  selector: 'app-query-builder',
  templateUrl: './query-builder.component.html',
  styleUrls: ['./query-builder.component.css']
})
export class QueryBuilderComponent {
  tables: string[] = [];
  selectedColumns: { [tableName: string]: string[] } = {};
  columnAliases: { [columnName: string]: string } = {};
  selectedFields: string[] = [];
  errorMessage: string | null = null;
  isLoading = false;
  whereCondition: string = '';  // Store WHERE input value
  joinCondition: string = '';   // Store JOIN input value

  // Properties for main query preview and editing
  selectedColumnsListForQuery: string = ''; // User-editable selected columns
  selectedTablesForQuery: string = '';      // User-editable selected tables

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
          this.updateMainQueryDisplay(); // Update main query on table selection
        },
        (error) => {
          this.showError(`Error fetching columns for table: ${tableName}`);
          this.isLoading = false;
        }
      );
    } else {
      delete this.selectedColumns[tableName];
      this.removeAllColumnsFromTable(tableName);
      this.updateMainQueryDisplay(); // Update main query on table deselection
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
      this.removeSelectedField(columnKey);
    }
    this.updateMainQueryDisplay(); // Update main query on column selection change
  }

  getSelectedColumnsList(): string[] {
    return this.selectedFields;
  }

  updateAlias(column: string, event: any) {
    this.columnAliases[column] = event.target.value;
    this.updateMainQueryDisplay(); // Update main query when alias changes
  }

  // Function to remove a selected field from alias table and uncheck the associated checkbox
  removeSelectedField(columnKey: string) {
    const index = this.selectedFields.indexOf(columnKey);
    if (index > -1) {
      this.selectedFields.splice(index, 1);

      // Uncheck the corresponding checkbox
      const [tableName, column] = columnKey.split('.');
      const checkbox = document.querySelector(
        `input[type="checkbox"][data-table="${tableName}"][data-column="${column}"]`
      ) as HTMLInputElement;

      if (checkbox) {
        checkbox.checked = false;
      }
    }
    this.updateMainQueryDisplay(); // Update main query on field removal
  }

  removeAllColumnsFromTable(tableName: string) {
    this.selectedFields = this.selectedFields.filter(
      (field) => !field.startsWith(`${tableName}.`)
    );
    this.updateMainQueryDisplay(); // Update main query when columns are cleared
  }

  // Function to update the main query display, editable by the user
  updateMainQueryDisplay() {
    const selectedColumns = this.getSelectedColumnsList().map((column) => {
      return this.columnAliases[column] ? `${column} as ${this.columnAliases[column]}` : column;
    });
    this.selectedColumnsListForQuery = selectedColumns.join(', ');

    // Get selected tables from selectedColumns keys
    this.selectedTablesForQuery = Object.keys(this.selectedColumns).join(', ');
  }

  // Function to build the query and send it to the API
  saveQuery() {
    // Construct query using the editable inputs
    const query = `SELECT ${this.selectedColumnsListForQuery} FROM ${this.selectedTablesForQuery}`;

    console.log('Generated Query:', query); // Debugging output

    // Post the query to the specified endpoint
    this.http.post(`${API_HOST}/api/save_query/`, { query: query }).subscribe({
      next: (response) => {        
        console.log('Query saved successfully', response);
        alert('Query saved successfully');
      },
      error: (error) => {
        this.showError('Error saving query');
      }
    });
  }
}
