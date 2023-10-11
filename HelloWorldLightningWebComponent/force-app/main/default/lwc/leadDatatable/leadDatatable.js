import { LightningElement, wire, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import cLead from '@salesforce/apex/LeadDatatable.cLead';
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
  @track showModal = false; // 모달
  @track firstName = '';
  @track lastName = '';
  @track company = '';
  @track title = '';
  @track email = '';
  @track rating = '';
  @track status = '';
  @track leadSource = '';

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

   // 등급 콤보박스 옵션
  ratingOptions = [
    { label: 'Hot', value: 'Hot' },
    { label: 'Warm', value: 'Warm' },
    { label: 'Cold', value: 'Cold' }
  ];

  // 상태 콤보박스 옵션
  statusOptions = [
    { label: 'Open - Not Contacted', value: 'Open - Not Contacted' },
    { label: 'Working - Contacted', value: 'Working - Contacted' },
    { label: 'Closed - Converted', value: 'Closed - Converted' },
    { label: 'Closed - Not Converted', value: 'Closed - Not Converted' }
  ];

  // 리드 소스 콤보박스 옵션
  leadSourceOptions = [
    { label: 'Web', value: 'Web' },
    { label: 'Phone Inquiry', value: 'Phone Inquiry' },
    { label: 'Partner Referral', value: 'Partner Referral' },
    { label: 'Purchased List', value: 'Purchased List' },
    { label: 'Other', value: 'Other' }
  ];

  handleSearch(event) {
    // 검색어 필드의 값을 업데이트하고 데이터를 새로고침
    this.searchTerm = event.target.value;
    this.currentPage = 1; // 검색을 하고 1페이지로 초기화를 한다.
  }

  // 콤보 박스 체인지 핸들함수
  handleFirstNameChange(event) {this.firstName = event.detail.value;}
  handleLastNameChange(event) {this.lastName = event.detail.value;}
  handleCompanyChange(event) {this.company = event.detail.value;}
  handleTitleChange(event) {this.title = event.detail.value;}
  handleEmailChange(event) {this.email = event.detail.value;}
  handleRatingChange(event) {this.rating = event.detail.value;}
  handleStatusChange(event) {this.status = event.detail.value;}
  handleLeadSourceChange(event) {this.leadSource = event.detail.value;}

   // 리드 생성 로직
  createLead() {
    const fields = {
      FirstName: this.firstName,
      LastName: this.lastName,
      Company: this.company,
      Title: this.title,
      Email: this.email,
      Rating: this.rating,
      Status: this.status,
      LeadSource: this.leadSource
    };

    console.log("dddd"+fields.FirstName);

    // Apex 메서드 호출
    cLead({ fields: fields })
    .then(result => {
      if (result) {
        // 리드가 생성되었으므로 레코드 ID를 받아옴
        const leadId = result;
        this.closeModal(); // 리드 생성하고 모달창 닫기

        // 레코드 상세 페이지로 이동
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: leadId,
                actionName: 'view'
            }
        });
      }
    })
    .catch(error => {
        console.error('리드 생성 중 오류 발생: ' + JSON.stringify(error));
    });
  }

  // 정렬을 하기위한 설정
  doSorting(event) {
    this.sortBy = event.detail.fieldName;
    this.sortDirection = event.detail.sortDirection;
    this.sortData(this.sortBy, this.sortDirection);
  }

  // 정렬 함수
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

  // 이전 페이지 이동
  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }
  // 다음 페이지 이동
  nextPage() { this.currentPage++;}

  // 리드생성 모달창 오픈
  openLeadCreationModal() {this.showModal = true;}
  // 리드생성 모달창 클로즈
  closeModal() { 
    this.showModal = false;
    this.firstName = '';
    this.lastName = '';
    this.company = '';
    this.title = '';
    this.email = '';
    this.rating = '';
    this.status = '';
    this.leadSource = '';
  }

  get isPreviousButtonDisabled() {
    return this.currentPage === 1;
  }

  get isNextButtonDisabled() {
    const pageSize = 10;
    const totalPages = Math.ceil(this.totalLeadCount.data / pageSize);
    return this.currentPage === totalPages;
  }
}