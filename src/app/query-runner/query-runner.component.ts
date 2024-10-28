import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { QueryRelatedCodeService } from '../query-related-code.service';

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
  save_query =this.query
  responseMessage: string = ''; // To hold the response message after saving  

  constructor(private http: HttpClient, public queryRelatedCodeService: QueryRelatedCodeService) {}

  ngOnInit(): void {
    this.queryRelatedCodeService.Q_Data$.subscribe(data => {
      this.Q_Data = data;
    });

    this.queryRelatedCodeService.headers$.subscribe(headers => {
      this.headers = headers;
    });
  }

  fetchData() {
    console.log("select * from sales:" ,this.query)
    this.queryRelatedCodeService.fetchData(this.query);    
  }

  openSaveModal() {
    this.queryRelatedCodeService.saveQueryData.query = this.query;
    this.queryRelatedCodeService.openSaveModal(this.query);
  }

  closeSaveModal() {
    this.queryRelatedCodeService.closeSaveModal();    
  }

  saveQuery() {
    this.queryRelatedCodeService.saveQuery(this.query);
  }
}
