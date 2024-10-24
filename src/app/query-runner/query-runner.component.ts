import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-query-runner',
  templateUrl: './query-runner.component.html',
  styleUrls: ['./query-runner.component.css']
})
export class QueryRunnerComponent implements OnInit {
  Q_Data: any[] = [];
  errorMessage: string = '';
  query: string = ''; // Hold the user input query
  headers: string[] = []; // To hold the headers
  showModal: boolean = false; // Control modal visibility
  saveQueryData = {
    query: '',
    name: '',
    query_id: '',
  }; // Data for saving the query
  responseMessage: string = ''; // To hold the response message after saving

  private apiUrl = 'http://127.0.0.1:8000/api/execute_query/';
  private saveApiUrl = 'http://127.0.0.1:8000/api/save_query/';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    // No default query is set
  }

  fetchData() {
    // Clear previous results
    this.Q_Data = [];
    this.headers = [];
    this.errorMessage = ''; // Clear any previous error messages

    this.http.post<any>(this.apiUrl, { query: this.query }).subscribe(
      (resp) => {
        this.Q_Data = resp;
        // Extract headers from the first object in the response
        if (this.Q_Data.length > 0) {
          this.headers = Object.keys(this.Q_Data[0]);
        }
      },
      (error) => {
        // Check if the error response has a message and display it
        this.errorMessage = error.error?.error || 'Error fetching Query data';
      }
    );
  }

  openSaveModal() {
    // Reset the saveQueryData to empty fields
    this.saveQueryData = {
      query: this.query, // Pre-fill the query
      name: '',
      query_id: '',
    };
    this.responseMessage = ''; // Clear previous response message
    this.showModal = true; // Show the modal
    document.body.classList.add('modal-open'); // Disable body scroll
  }

  closeSaveModal() {
    this.showModal = false; // Hide the modal
    document.body.classList.remove('modal-open'); // Enable body scroll
  }

  saveQuery() {
    this.http.post<any>(this.saveApiUrl, this.saveQueryData).subscribe(
      (response) => {
        this.responseMessage = 'Query saved successfully! Response: ' + JSON.stringify(response);
        this.closeSaveModal(); // Optionally close the modal after saving
      },
      (error) => {
        console.error('Error saving query:', error);
        this.errorMessage = error.error?.error || 'Error saving Query data';
      }
    );
  }
}
