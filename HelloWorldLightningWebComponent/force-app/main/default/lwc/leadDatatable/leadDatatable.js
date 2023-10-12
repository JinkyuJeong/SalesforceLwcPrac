import { LightningElement,track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import cLead from '@salesforce/apex/LeadDatatable.cLead';
import getLeads from '@salesforce/apex/LeadDatatable.getLeads';
import getLeadsCount from '@salesforce/apex/LeadDatatable.getLeadsCount';
import checkEmailDuplication from '@salesforce/apex/LeadDatatable.checkEmailDuplication';
import deleteSelectedLeads from '@salesforce/apex/LeadDatatable.deleteSelectedLeads';


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
  @track totalLeadCount;
  @track showModal = false; // 모달
  @track firstName;
  @track lastName;
  @track company;
  @track title;
  @track email;
  @track rating;
  @track status = 'Open - Not Contacted';
  @track leadSource
  @track lastNameError = '';
  @track emailError = '';
  @track RatingError = '';
  @track leadSourceError = '';
  @track isEmailDup;
  @track availableEmail = '';
  @track selectedRowIds;
  @track isDeleteButtonDisabled = true; // 삭제 버튼 비활성화 상태
  @track buttonLabel = '삭제 할거면 체크해유~'; // 삭제 버튼 레이블

  connectedCallback() {
    this.loadData();
  }
  
  loadData(){
    this.retrieveData();
    this.retrieveTotalLeadCount();
  }

  retrieveTotalLeadCount() {
    getLeadsCount({ searchTerm: this.searchTerm })
      .then(result => {
        this.totalLeadCount = result;
      })
      .catch(error => {
        this.totalLeadCount = 0;
      });
  }

  retrieveData() {
    getLeads({ searchTerm: this.searchTerm, currentPage: this.currentPage })
    .then(result => {
      if (result) {
        this.data = result.map(record => ({
          ...record,
          Id: '/' + record.Id
        }));
        this.error = undefined;
      } else {
        this.error = undefined;
        this.data = undefined;
      }
    })
    .catch(error => {
      this.error = error;
      this.data = undefined;
    });
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

   // 데이터 테이블에서 항목을 선택할 때 호출되는 이벤트 핸들러
  handleRowSelection(event) {
    const selectedIds = event.detail.selectedRows.map(row =>{
      // id가 하이퍼링크로 바껴서 다시 추출함
      const url = row.Id;
      const id = url.substring(url.lastIndexOf('/') + 1);
      return id;
    });
    this.selectedRowIds = selectedIds;

    // 하나 이상의 항목이 선택되었는지 확인
    this.isDeleteButtonDisabled = selectedIds.length === 0;
    this.buttonLabel = this.isDeleteButtonDisabled
      ? '삭제 할거면 체크해유~'
      : '일괄 삭제 해유~ (활성화 상태)';
  }

  // 삭제 버튼 클릭 시 호출
  handleDeleteClick() {
    if (!this.isDeleteButtonDisabled) {
      console.log("selectedRowIds : " + this.selectedRowIds);
      deleteSelectedLeads({ selectedIds: this.selectedRowIds })
      .then(result => {
        location.reload();
      })
      .catch(error => {
        console.error('삭제 중 에러:', error);
      });
    }
  }

  // 검색 이벤트 핸들 함수
  handleSearch(event) {
    // 검색어 필드의 값을 업데이트하고 데이터를 새로고침
    this.searchTerm = event.target.value;
    this.currentPage = 1; // 검색을 하고 1페이지로 초기화를 한다.
    this.loadData();
  }

  // 콤보 박스 체인지 핸들함수
  handleFirstNameChange(event) {this.firstName = event.detail.value;}
  handleLastNameChange(event) {
    this.lastName = event.detail.value;
    if(this.lastNameError){
      this.lastNameError = undefined;
    }
  }
  handleCompanyChange(event) {this.company = event.detail.value;}
  handleTitleChange(event) {this.title = event.detail.value;}
  handleEmailChange(event) {
    this.email = event.detail.value;
    if(this.emailError){
      this.emailError = undefined;
    }
    
    if (!this.email) {
      this.availableEmail = '';
      this.emailError = '';
    } else if (!this.isValidEmail(this.email)) {
      this.availableEmail = '';
      this.emailError = '유효한 이메일 형식이 아닙니다.';
    } else {
        checkEmailDuplication({ email: this.email })
        .then(result => {
          this.isEmailDup = !result;
          if (result) {
            this.availableEmail = '사용 가능한 이메일 입니다.';
            this.emailError = '';
          } else {
            this.availableEmail = '';
            this.emailError = '중복 이메일 입니다.';
          }
        })
        .catch(error => {
          console.log("이메일 중복 검사 과정에서 오류 발생");
        });
    }
  }

  // 이메일 유효성 검사
  isValidEmail(email) {
    // 올바른 형식의 이메일이면 true를 반환, 그렇지 않으면 false를 반환
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return emailPattern.test(email);
  }

  handleRatingChange(event) {
    this.rating = event.detail.value;
    if(this.RatingError){
      this.RatingError = undefined;
    }
    
  }
  handleStatusChange(event) {this.status = event.detail.value;}
  handleLeadSourceChange(event) {
    this.leadSource = event.detail.value;
    if(this.leadSourceError){
      this.leadSourceError = undefined;
    }
  }

   // 리드 생성 로직
  createLead() {
    this.inputCheck()
    .then(result =>{
      if(result){
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
            this.loadData();
    
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
    })
  }

  // 필수 입력란 유효성 체크
  inputCheck(){
    if(!this.lastName){
      this.lastNameError = '이름을 입력해주세요.';
      return false;
    }
    if(!this.email){this.emailError = '이메일을 입력해주세요.'; return false;}
    if(!this.rating){this.RatingError = '등급을 선택해주세요.'; return false;}
    if(!this.leadSource){this.leadSourceError = '리드소스를 선택해주세요.'; return false;}

    return true;
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
    this.loadData();
  }
  // 다음 페이지 이동
  nextPage() { this.currentPage++; this.loadData();}

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
    this.leadSource = '';
    this.emailError ='';
    this.availableEmail = '';
    this.isEmailDup = undefined;
    this.lastNameError ='';
    this.RatingError ='';
    this.leadSourceError = '';
  }

  get isPreviousButtonDisabled() {
    return this.currentPage === 1;
  }

  get isNextButtonDisabled() {
    const pageSize = 10;
    const totalPages = Math.ceil(this.totalLeadCount / pageSize);
    return this.currentPage === totalPages;
  }
}