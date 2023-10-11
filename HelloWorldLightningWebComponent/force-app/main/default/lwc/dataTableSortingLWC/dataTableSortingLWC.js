import { LightningElement, wire, track } from 'lwc';
import getContacts from '@salesforce/apex/LWCDataTableSortingExample.getContacts';

const columns = [
  { label : 'First Name', fieldName : 'FirstName', sortable : "true"},
  { label : 'Last Name', fieldName : 'LastName', sortable : "true"},
  { label : 'Phone', fieldName : 'Phone', type:'phone', sortable : "true"},
  { label : 'Email', fieldName : 'Email', type:'email', sortable : "true"}
]

/* 
  colums로 열을 구성하였고, data로 apex 메서드를 호출하여서 데이터를 list로 전달 받음
*/ 

export default class DataTableSortingLWC extends LightningElement {
  @track data;
  @track columns = columns;
  // @track sortBy;
  // @track sortDirection;
  @track sortBy='FirstName';
  @track sortDirection='asc';

  // @wire(getContacts)
  // contacts(result){     // getContacts() 메서드를 호출 후 data에 담기
  //   if(result.data){
  //     this.data = result.data;
  //     this.error = undefined;
  //     console.log("데이터가 있음: " + JSON.stringify(this.data));
  //   }else{
  //     this.data = undefined;
  //     this.error = result.error;
  //     console.log("데이터가 없음");
  //   }
  // }

  @wire(getContacts, {field : '$sortBy', sortOrder : '$sortDirection'})
  contacts(result){
    if (result.data) {
      this.data = result.data;
      this.error = undefined;
    } else if (result.error) {
      this.error = result.error;
      this.data = undefined;
    }
  }

  // doSorting(event){
  //   this.sortBy = event.detail.fieldName;
  //   this.sortDirection = event.detail.sortDirection;
  //   this.sortData(this.sortBy, this.sortDirection);
  // }

  doSorting(event){
    this.sortBy = event.detail.fieldName;
    this.sortDirection = event.detail.sortDirection;
  }

  sortData(fieldName, direction){
    let parseData = JSON.parse(JSON.stringify(this.data));
    // let parseData = this.data 이렇게 해버리면 parseData와 data가 같은 객체를 참조하게 되어버림
    // this.data(원본 데이터)를 변경하지 않으면서 정렬 작업이 가능하다.

    let keyValue = (a) => {
      return a[fieldName];
    };
    // keyValue 함수는 a라는 객체를 매개변수로 받아서 필드네임(속성)에 해당하는 값을 반환한다.

    let isReverse = direction === 'asc' ? 1: -1; // 오름차순 / 내림차순 여부

    parseData.sort((x, y) => {
      x = keyValue(x) ? keyValue(x) : ''; 
      y = keyValue(y) ? keyValue(y) : '';
      return isReverse * ((x > y) - (y > x));
    });
    this.data = parseData;
  }
}