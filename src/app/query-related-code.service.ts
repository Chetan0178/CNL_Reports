import { Injectable, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class QueryRelatedCodeService{
  query: string = ''; // Hold the user input query
  responseMessage: string = ''; // To hold the response message after saving
  showModal: boolean = false; // Control modal visibility
  Q_Data: any[] = [];
  errorMessage: string = '';
  headers: string[] = []; // To hold the headers
  saveQueryData = {
    query: '',
    name: '',
    query_id: '',
  }; // Data for saving the query

  private saveApiUrl = 'http://127.0.0.1:8000/api/save_query/';

  constructor(private http: HttpClient){}

  openSaveModal(query: any) 
  {
    // Reset the saveQueryData to empty fields
    this.responseMessage = ''; // Clear previous response message
    this.showModal = true; // Show the modal
    document.body.classList.add('modal-open'); // Disable body scroll
  }

  closeSaveModal() {
    this.showModal = false; // Hide the modal
    document.body.classList.remove('modal-open'); // Enable body scroll
  }

  saveQuery(query: any) {
    console.log(this.saveQueryData)
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
