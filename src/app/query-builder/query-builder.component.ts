import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { API_HOST } from '../../assets/api.config';
import { QueryRelatedCodeService } from '../query-related-code.service';
import { Chart, ChartConfiguration, ChartData, ChartType } from 'chart.js';

@Component({
  selector: 'app-query-builder',
  templateUrl: './query-builder.component.html',
  styleUrls: ['./query-builder.component.css']
})
export class QueryBuilderComponent implements OnInit{
  @ViewChild('chartCanvas') chartCanvas?: ElementRef<HTMLCanvasElement>;

  tables: string[] = [];
  selectedColumns: { [tableName: string]: string[] } = {};
  columnAliases: { [columnName: string]: string } = {};
  selectedFields: string[] = [];
  errorMessage: string | null = null;
  isLoading = false;
  whereCondition: string = '';  // Store WHERE input value
  HavingCondition : string = ''; // Store HAVING input value
  joinCondition: string = '';  // Updated: will store selected relations here
  query: string = ''
  Q_Data: any[] = [];
  headers: string[] = []; // To hold the headers
  relations: string[] = [];  // Store all relations
  selectedRelations: string[] = [];  // Track selected relations
  selectedJoinType: string = 'INNER'; // New property to store the selected join type
  showRelationsTable = true; // to track whether the relations table is visible.

  // Properties for main query preview and editing
  selectedColumnsListForQuery: string = ''; // User-editable selected columns
  selectedTablesForQuery: string = '';      // User-editable selected tables

  // New properties for GROUP BY and ORDER BY clauses
  groupByColumns: string = '';  // Stores GROUP BY input
  orderByColumns: string = '';  // Stores ORDER BY input
  orderDirections: { [columnName: string]: string } = {}; // Store order direction for each field

  // New property to store selected aggregation functions
  aggregationFunctions: { [columnName: string]: string } = {}; 

  // Array of join options
  joinOptions = [
    { value: 'INNER', label: 'Inner Join' },
    { value: 'LEFT', label: 'Left Join' },
    { value: 'RIGHT', label: 'Right Join' },
    { value: 'CROSS', label: 'Cross Join' }
  ];

  yAxisSelection: string | null = null; // Selected field for Y-axis
  xAxisSelection: string | null = null; // Selected field for X-axis

  chart!: Chart; // Chart instance
  chartOptionSelection: string | null = 'bar'; // Default chart type

  constructor(private http: HttpClient, public queryRelatedCodeService: QueryRelatedCodeService) {}

  ngOnInit(): void {
    this.queryRelatedCodeService.Q_Data$.subscribe(data => {
      this.Q_Data = data;
    });

    this.queryRelatedCodeService.errorMessage$.subscribe(message => {
      this.errorMessage = message;    
    });

    this.queryRelatedCodeService.headers$.subscribe(headers => {
      this.headers = headers;
    });

    // Mock data for testing
    this.Q_Data = [
      {
        "month_name": "May",
        "total_revenue": 6700.0
    },
    {
        "month_name": "June",
        "total_revenue": 74800.0
    },
    {
        "month_name": "July",
        "total_revenue": 38000.0
    },
    {
        "month_name": "August",
        "total_revenue": 36500.0
    },
    {
        "month_name": "September",
        "total_revenue": 94500.0
    },
    {
        "month_name": "October",
        "total_revenue": 183980.0
    }
    ];
    this.headers = ['month_name', 'total_revenue'];
    
    // Initialize a blank chart
    this.initChart();
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
          this.showRelationsTable = true; // Show relations table when a table is selected
          this.updateMainQueryDisplay(); // Update main query on table selection
        },
        (error) => {
          this.queryRelatedCodeService.showMessage(`Error fetching columns for table: ${tableName}`);
          this.isLoading = false;
        }
      );
    } else {
      delete this.selectedColumns[tableName];
      this.removeAllColumnsFromTable(tableName);
      // Check if there are any selected tables left
      this.showRelationsTable = Object.keys(this.selectedColumns).length > 0;      
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
      const [leftTable, rightTable] = relation.split('=').map(part => part.split('.')[0].trim());
      const formattedRelation = `${rightTable} ON ${relation.trim()}`;  
      if (!this.selectedRelations.includes(formattedRelation)) {
        this.selectedRelations.push(formattedRelation);
      }  
      this.showRelationsTable = Object.keys(this.selectedColumns).length > 0; // Show relations table if tables are selected
      this.updateJoinCondition();  
      this.loadTablesForRelation(relation);  
    } else {
      const index = this.selectedRelations.indexOf(relation);
      if (index > -1) {
        this.selectedRelations.splice(index, 1);
      }      
      // Hide relations table if no tables or relations are selected
      this.showRelationsTable = this.selectedRelations.length > 0 && Object.keys(this.selectedColumns).length > 0;
      this.updateJoinCondition();  
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
    
    // Append WHERE clause if `whereCondition` is provided   
    if (this.groupByColumns.trim()) {
      baseQuery += ` GROUP BY ${this.groupByColumns}`;
    } 

    // Append HAVING clause if `HavingCondition` is provided   
    if (this.HavingCondition.trim()) {
      baseQuery += ` WHERE ${this.HavingCondition}`;
    } 

    this.generateOrderByClause();
    if (this.orderByColumns.length > 0) {
      baseQuery += ` ORDER BY ${this.orderByColumns}`;
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
      const aggrFunc = this.aggregationFunctions[column] || '';
      const alias = this.columnAliases[column];
      if (aggrFunc) {
        return alias ? `${aggrFunc}(${column}) as ${alias}` : `${aggrFunc}(${column})`;
      }
      return alias ? `${column} as ${alias}` : column;
    });
    this.selectedColumnsListForQuery = selectedColumns.join(', ');
      
    // Update to only display the first selected table
    const selectedTables = Object.keys(this.selectedColumns);
    this.selectedTablesForQuery = selectedTables.length > 0 ? selectedTables[0] : ''; // Only take the first table

    // Generate and update ORDER BY clause
    this.generateOrderByClause(); // Update orderByColumns with the latest order directions
  }  

  //Method for creatre order by statements
  generateOrderByClause() {
    // Construct the ORDER BY clause, substituting aliases if present
    const orderByEntries = Object.keys(this.orderDirections)
      .filter(column => this.orderDirections[column]) // Only include columns with a specified order direction
      .map(column => {
        // Check if an alias is available for the column, otherwise use the column name
        const aliasOrColumnName = this.columnAliases[column] || column;
        return `${aliasOrColumnName} ${this.orderDirections[column]}`;
      });
    
    // Update orderByColumns to show in the main query section
    this.orderByColumns = orderByEntries.join(', ');
    
    // Return the orderByColumns
    return this.orderByColumns;
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

  initChart() {
    if (!this.chartCanvas || !this.chartCanvas.nativeElement) {
      console.error('Canvas element is not defined!');
      return;
    }
  
    this.chart = new Chart(this.chartCanvas.nativeElement, {
      type: 'bar', // Default type
      data: {
        labels: [], // Will be set dynamically
        datasets: []
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: true
          }
        }
      }
    });
  }

  // Generate chart based on selected options
  generateChart() {
    if (!this.chartCanvas || !this.chartCanvas.nativeElement) {
      console.error('Canvas element not found! Ensure the chart section is visible.');
      return;
    }
  
    if (!this.xAxisSelection || !this.chartOptionSelection) {
      alert('Please select the X-axis field and a chart type!');
      return;
    }
  
    const xField = this.xAxisSelection;
    const yFields = this.yAxisSelection ? [this.yAxisSelection] : this.headers.filter(header => header !== xField); // Use selected Y-axis or all other fields
    const chartType = this.chartOptionSelection;
  
    // Extract labels (X-axis) and datasets (data for each column)
    const labels = this.Q_Data.map((row) => row[xField]); // X-axis labels
    const datasets = yFields.map((field) => ({
      label: field, // Dataset label
      data: this.Q_Data.map((row) => row[field] || 0), // Data for this field
      backgroundColor: chartType === 'pie' ? this.generateRandomColors(1)[0] : this.generateRandomColors(yFields.length)[0], // Unique color for each dataset
      borderColor: 'rgba(75,192,192,1)', // Optional: border color
      borderWidth: 1 // Optional: border width
    }));
  
    // Destroy the existing chart if it exists
    if (this.chart) {
      this.chart.destroy();
    }
  
    // Recreate the chart with the appropriate configuration
    this.chart = new Chart(this.chartCanvas.nativeElement, {
      type: chartType as any,
      data: {
        labels: labels, // X-axis labels
        datasets: datasets // Data for the chart
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: true
          }
        },
        scales: {
          x: {
            stacked: chartType === 'bar', // Enable stacking for bar charts
            beginAtZero: true // Optional: start from zero
          },
          y: {
            stacked: chartType === 'bar', // Enable stacking for bar charts
            beginAtZero: true // Optional: start from zero
          }
        }
      }
    });
  }
  
  

  // Helper method to generate random colors for pie charts
  generateRandomColors(count: number): string[] {
    const colors = [];
    for (let i = 0; i < count; i++) {
      colors.push(`hsl(${Math.random() * 360}, 70%, 70%)`);
    }
    return colors;
  }

  showChartCreation: boolean = false; // Toggle visibility of the chart section

  toggleChartCreation() {
    this.showChartCreation = !this.showChartCreation;
  
    // Delay chart initialization to ensure the canvas is rendered
    if (this.showChartCreation) {
      setTimeout(() => this.initChart(), 0); // Wait for the view to update
    }
  }
  
  
}
