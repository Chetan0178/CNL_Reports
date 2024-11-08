import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { API_HOST } from '../../assets/api.config';
import { QueryRelatedCodeService } from '../query-related-code.service';

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
  joinCondition: string = '';  // Updated: will store selected relations here
  query: string = ''
  Q_Data: any[] = [];
  headers: string[] = []; // To hold the headers
  relations: string[] = [];  // Store all relations
  selectedRelations: string[] = [];  // Track selected relations
  selectedJoinType: string = ''; // New property to store the selected join type
  showRelationsTable = true; // to track whether the relations table is visible.

  // Properties for main query preview and editing
  selectedColumnsListForQuery: string = ''; // User-editable selected columns
  selectedTablesForQuery: string = '';      // User-editable selected tables

  constructor(private http: HttpClient, public queryRelatedCodeService: QueryRelatedCodeService) {}

  ngOnInit(): void {
    this.queryRelatedCodeService.Q_Data$.subscribe(data => {
      this.Q_Data = data;
    this.queryRelatedCodeService.errorMessage$.subscribe(message => {
      this.errorMessage = message;
    });
    });

    this.queryRelatedCodeService.headers$.subscribe(headers => {
      this.headers = headers;
    });
  }

  loadTables() {
    this.isLoading = true;
    const apiUrl = `${API_HOST}/api/tables/`;
    this.http.get(apiUrl).subscribe(
      (response: any) => {
        this.tables = response.tables;
        this.isLoading = false;
      },
      (error) => {
        this.queryRelatedCodeService.showMessage('Error fetching tables'); // Call service method to show message
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
          this.relations = response.Relation || []; // Assign relations from response
          this.isLoading = false;
          this.updateMainQueryDisplay(); // Update main query on table selection
        },
        (error) => {
          this.queryRelatedCodeService.showMessage(`Error fetching columns for table: ${tableName}`); // Call service method to show message
          // this.showMessage(`Error fetching columns for table: ${tableName}`);
          this.isLoading = false;
        }
      );
    } else {
      delete this.selectedColumns[tableName];
      this.removeAllColumnsFromTable(tableName);
      this.updateMainQueryDisplay(); // Update main query on table deselection
    }
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

  // Method to toggle relation selection and load tables if needed
  toggleRelationSelection(relation: string, event: any) {
    const isChecked = event.target.checked;
    if (isChecked) {
        // Extract table names and format as "table_name ON relation"
        const [leftTable, rightTable] = relation.split('=').map(part => part.split('.')[0].trim());
        const formattedRelation = `${rightTable} ON ${relation.trim()}`; // Format relation with "ON"
        
        // Only add formattedRelation if it doesn’t already exist
        if (!this.selectedRelations.includes(formattedRelation)) {
            this.selectedRelations.push(formattedRelation);
        }

        this.updateJoinCondition();  // Update joinCondition after selection change
        this.loadTablesForRelation(relation);  // Load columns for tables in this relation if needed
    } else {
        // Remove relation from selectedRelations if unchecked
        const index = this.selectedRelations.indexOf(relation);
        if (index > -1) {
            this.selectedRelations.splice(index, 1);
        }
        this.updateJoinCondition();  // Update joinCondition after deselection
    }
 }


 loadTablesForRelation(relation: string) {
  const tables = relation.split('=').map(part => part.trim().split('.')[0].trim());
  tables.forEach(tableName => {
      // Check if the table is already in the selectedColumns list
      if (!this.selectedColumns[tableName]) {  
          this.loadColumns(tableName, { target: { checked: true } });
      }
    });
  }

  updateJoinCondition() {
    // Join all formatted join conditions with "AND" for display in the textarea
    this.joinCondition = this.selectedRelations.join(' AND ');
  }

  updateAlias(column: string, event: any) {
    this.columnAliases[column] = event.target.value;
    this.updateMainQueryDisplay(); // Update main query when alias changes
  }

  // Modify the final query construction to include the selected join type
  finalquery() {
    if (!this.selectedColumnsListForQuery || !this.selectedTablesForQuery) {
      return ''; // Ensure tables/columns are selected
    }

    let baseQuery = `SELECT ${this.selectedColumnsListForQuery} FROM ${this.selectedTablesForQuery}`;

    // Append JOIN clause based on selected join type and condition
    if (this.selectedJoinType && this.joinCondition.trim()) {
      baseQuery += ` ${this.selectedJoinType} JOIN ${this.joinCondition}`;
    }

    // Append WHERE clause if `whereCondition` is provided   
    if (this.whereCondition.trim()) {
      baseQuery += ` WHERE ${this.whereCondition}`;
    }  

    this.query = baseQuery; // Update preview variable
    return this.query;
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

  // Update the query display method to include the selected join type
  updateMainQueryDisplay() {
    const selectedColumns = this.getSelectedColumnsList().map((column) => {
        return this.columnAliases[column] ? `${column} as ${this.columnAliases[column]}` : column;
    });
    this.selectedColumnsListForQuery = selectedColumns.join(', ');
      
    // Update to only display the first selected table
    const selectedTables = Object.keys(this.selectedColumns);
    this.selectedTablesForQuery = selectedTables.length > 0 ? selectedTables[0] : ''; // Only take the first table
  }  

  openSaveModal() {
    this.queryRelatedCodeService.saveQueryData.query = this.finalquery();
    this.queryRelatedCodeService.openSaveModal();
  }

  closeSaveModal() {
    this.queryRelatedCodeService.closeSaveModal();    
  }

  // Function to build the query and send it to the API
  saveQuery() {
    this.queryRelatedCodeService.saveQuery();
  }

  fetchData() {
    this.queryRelatedCodeService.fetchData(this.finalquery());    
  }

  resetPage() {
    window.location.reload();
  }  

  // Method to remove a specific table's columns from the selectedColumns list
  removeColumnTable(tableName: string) {
    delete this.selectedColumns[tableName];
  }
}
