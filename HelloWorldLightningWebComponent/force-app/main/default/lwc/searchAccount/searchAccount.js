import { LightningElement, wire, track } from 'lwc';
import getAccounts from '@salesforce/apex/AccountService.getAccounts';

export default class SearchAccount extends LightningElement {
  
  // @track searchKey;   // 변수가 변경될 때 자동으로 렌더링(ajax같은 느낌??)
  @track accounts;
  @track error;


  // @wire(getAccounts,{strAccountName : '$searchKey'}) accounts;    // getAccounts 메서드에 매개변수를 넣고 반환값을 accounts에 저장한다.

  // @wire(getAccounts,{strAccountName : '$searchKey'})
  // wiredAccounts({data, error}){
  //   if(data){
  //     this.accounts = data;
  //     this.error = undefined;
  //   }else{
  //     this.accounts = undefined;
  //     this.error = error;
  //   }
  // }

  handleKeyChange(event){
    const searchKey = event.target.value;
    getAccounts({strAccountName : searchKey})
    .then(result => {
      this.accounts = result;
      this.error = undefined;
    })
    .catch(error => {
      this.accounts = undefined;
      this.error = error;
    })
  }

  
  // handleKeyChange(event){
  //   this.searchKey = event.target.value; 
  // }
}