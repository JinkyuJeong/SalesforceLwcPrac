import { LightningElement } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class SampleNavigationService extends NavigationMixin(LightningElement) {
  navigateToNewCasePage(){
    this[NavigationMixin.Navigate]({
      type : "standard__objectPage",
      attributes : {
        objectApiName : "Case",
        actionName : "new"
      }
    });
  }
}

