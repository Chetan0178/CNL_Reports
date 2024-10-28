import { Injectable, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';



@Injectable({
  providedIn: 'root'
})
export class QueryRelatedCodeService{
  query: string = ''; // Hold the user input query
  responseMessage: string = ''; // To hold the response message after saving
  showModal: boolean = false; // Control modal visibility
  errorMessage: string = '';
  saveQueryData = {
    query: '',
    name: '',
    query_id: ''  
  }; // Data for saving the query

  private Q_DataSubject = new BehaviorSubject<any[]>([]);
  private headersSubject = new BehaviorSubject<string[]>([]);
  Q_Data$ = this.Q_DataSubject.asObservable();
  headers$ = this.headersSubject.asObservable();
  
  

  private saveApiUrl = 'http://127.0.0.1:8000/api/save_query/';
  private apiUrl = 'http://127.0.0.1:8000/api/execute_query/';


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

  //Run Query Code
  fetchData(query: string) {
    // Clear previous results
    this.Q_DataSubject.next([]);
    this.headersSubject.next([]);

    this.http.post<any>(this.apiUrl, { query }).subscribe(
      (resp) => {
        this.Q_DataSubject.next(resp);
        // Extract headers from the first object in the response
        if (resp.length > 0) {
          this.headersSubject.next(Object.keys(resp[0]));
        }
      },
      (error) => {
        // Handle error as necessary
        console.error(error);
      }
    );
  }


}
