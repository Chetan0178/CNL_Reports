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

  private apiUrl = 'http://127.0.0.1:8000/api/execute-query/';

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
}
