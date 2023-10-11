import { LightningElement, wire, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getLeads from '@salesforce/apex/LeadDatatable.getLeads';
import getLeadsCount from '@salesforce/apex/LeadDatatable.getLeadsCount';

const columns = [
  {
    label: '이름',
    fieldName: 'Id',
    type: 'url',
    typeAttributes: {
      label: { fieldName: 'LastName' },
      target: '_self', // 현재 창에서 열도록 설정
    },
    sortable: true,
    cellAttributes: { alignment: 'left' },
  },
  { label: '성', fieldName: 'FirstName', sortable: 'true' },
  { label: '회사', fieldName: 'Company', sortable: 'true' },
  { label: '직책', fieldName: 'Title', sortable: 'true' },
  { label: '등급', fieldName: 'Rating', sortable: 'true' },
  { label: 'Email', fieldName: 'Email', type: 'email', sortable: 'true' },
  { label: '리드 상태', fieldName: 'Status', sortable: 'true' },
];

export default class LeadDatatable extends NavigationMixin(LightningElement) {
  @track data;
  @track columns = columns;
  @track sortBy;
  @track sortDirection;
  @track searchTerm = '';
  @track currentPage = 1;

  @wire(getLeadsCount, { searchTerm: '$searchTerm'}) totalLeadCount;
  
  @wire(getLeads, { searchTerm: '$searchTerm', currentPage : '$currentPage'})
  contacts(result) {
    if (result.data) {
      this.data = result.data.map(record => ({
        ...record,
        Id: '/' + record.Id // URL을 올바르게 설정
      }));
      this.error = undefined;
    } else if (result.error) {
      this.error = result.error;
      this.data = undefined;
    }
  }

  handleSearch(event) {
    // 검색어 필드의 값을 업데이트하고 데이터를 새로고침
    this.searchTerm = event.target.value;
    this.currentPage = 1; // 검색을 하고 1페이지로 초기화를 한다.
  }

  doSorting(event) {
    this.sortBy = event.detail.fieldName;
    this.sortDirection = event.detail.sortDirection;
    this.sortData(this.sortBy, this.sortDirection);
  }

  sortData(fieldname, direction) {
    let parseData = JSON.parse(JSON.stringify(this.data));
    let keyValue = (a) => {
      return a[fieldname];
    };
    let isReverse = direction === 'asc' ? 1 : -1;

    parseData.sort((x, y) => {
      x = keyValue(x) ? keyValue(x) : '';
      y = keyValue(y) ? keyValue(y) : '';
      return isReverse * ((x > y) - (y > x));
    });
    this.data = parseData;
  }

  navigateToNewLeadPage() {
    this[NavigationMixin.Navigate]({
      type: 'standard__objectPage',
      attributes: {
        objectApiName: 'Lead',
        actionName: 'new',
      },
    });
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage() { this.currentPage++;}

  get isPreviousButtonDisabled() {
    return this.currentPage === 1;
  }

  get isNextButtonDisabled() {
    const pageSize = 10;
    const totalPages = Math.ceil(this.totalLeadCount.data / pageSize);
    return this.currentPage === totalPages;
  }
}