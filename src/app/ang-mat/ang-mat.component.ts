import { Component , ViewEncapsulation} from '@angular/core';

@Component({
  selector: 'app-ang-mat',
  templateUrl: './ang-mat.component.html',
  styleUrls: ['./ang-mat.component.css'],
  encapsulation: ViewEncapsulation.Emulated  // This is the default, but you can also use None or ShadowDom

})
export class AngMatComponent {
  message: string = ''; // Initialize the message

  // Method to update the message when the button is clicked
  showMessage() {
    this.message = 'Hii Chetan';
  }
}
