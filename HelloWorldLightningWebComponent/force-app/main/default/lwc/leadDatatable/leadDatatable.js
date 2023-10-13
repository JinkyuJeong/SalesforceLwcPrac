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
  @track sortDirection; // 오름차 / 내림차
  @track searchTerm = ''; // 검색어
  @track currentPage = 1;
  @track pageNumbers = [];  // 페이지 번호 넣는 배열
  @track pageSize = 10; // 페이지당 데이터 개수
  @track isPreviousButtonDisabled = true;
  @track isNextButtonDisabled = false;
  @track next5PageDisabled = false;
  @track isFirstButtonDisabled = false;
  @track isEndButtonDisabled = false;
  @track totalLeadCount;  // 데이터 개수
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
  @track field = 'LastName';
  @track selectRating ='';  // 필터링된 등급 value
  @track selectStatus = ''; // 필터링된 상태 value
  @track startPage;
  @track endPage;

  // DOM연결
  connectedCallback() {
    this.loadData();
  }
  
  // 데이터 로드
  loadData(){
    this.retrieveData();
    this.retrieveTotalLeadCount();
  }

  // 데이터 개수
  retrieveTotalLeadCount() {
    getLeadsCount({ searchTerm: this.searchTerm,
                    field: this.field, 
                    selectRating : this.selectRating,
                    selectStatus : this.selectStatus 
      })
      .then(result => {
        this.totalLeadCount = result;
        this.calculatePageNumbers();
      })
      .catch(error => {
        this.totalLeadCount = 0;
        this.calculatePageNumbers();
      });
  }

  // 데이터
  retrieveData() {
    getLeads({ 
      searchTerm: this.searchTerm, 
      field: this.field, 
      currentPage: this.currentPage, 
      selectRating : this.selectRating,
      selectStatus : this.selectStatus 
    })
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

  // Display할 페이지 번호
  calculatePageNumbers() {
    this.pageNumbers = [];
    const pageCount = Math.ceil(this.totalLeadCount / this.pageSize);
    this.startPage = this.currentPage -(this.currentPage - 1) % 5;
    this.endPage = this.startPage + 4;

    if(this.endPage > pageCount) this.endPage = pageCount;
    for (let i = this.startPage; i <= this.endPage; i++) {
      this.pageNumbers.push(i);
    }

    this.isPreviousButtonDisabled = this.currentPage === 1;
    this.isNextButtonDisabled = this.currentPage === pageCount;
    this.next5PageDisabled = pageCount <= 5;
    this.isFirstButtonDisabled = this.currentPage === 1;
    this.isEndButtonDisabled = this.currentPage === pageCount;
  }
  
  // 해당 페이지 이동
  navigateToPage(event) {
    const pageNumber = event.target.dataset.page;
    if (pageNumber) {
      this.currentPage = parseInt(pageNumber, 10);
      this.loadData();
    }
  }

  // 이전 페이지
  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadData();
    }
  }

  // 다음 페이지
  nextPage() {
    if (this.currentPage < this.pageNumbers.length) {
      this.currentPage++;
      this.loadData();
    }
  }

  // 첫 페이지
  goFirstPage() {
    this.currentPage = 1;
    this.loadData();
  }

  // 5 페이지 이동
  next5Page() {
    const pageCount = Math.ceil(this.totalLeadCount / this.pageSize);
    const nextPage = this.currentPage + 5;
  
    if (nextPage <= pageCount) {
      this.currentPage = nextPage;
    } else {
      this.currentPage = pageCount;
      this.currentPage = prevPage -(this.currentPage - 1) % 5;
    }

    this.loadData();
  }

  // 끝 페이지
  goEndPage() {
    this.currentPage = Math.ceil(this.totalLeadCount / this.pageSize);
    this.loadData();
  }


  // 검색필드 콤보박스 옵션
  fieldOptions = [
    { label : '이름', value : 'LastName'},
    { label : '회사', value : 'Company'},
    { label : '직책', value : 'Title'}
  ];

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
  
  handleFieldChange(event) {this.field = event.detail.value;}
  handleSelectRatingChange(event) { 
    this.selectRating = event.detail.value;
    this.currentPage = 1; // 필터를 하고 1페이지로 초기화를 한다.
    this.loadData();
  }
  handleSelectStatusChange(event) { 
    this.selectStatus = event.detail.value;
    this.currentPage = 1; // 필터를 하고 1페이지로 초기화를 한다.
    this.loadData();
  }

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
      // List<Id>로 변환하여 Apex 메서드에 전달
      const selectedIds = this.selectedRowIds.map(id => id);
      deleteSelectedLeads({ selectedIds: selectedIds })
      .then(result => {
        this.loadData();
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

  resetFilter(){
    this.selectRating = '';
    this.selectStatus = '';
    this.loadData();
  }

   // 리드 생성 로직
  createLead() {
    console.log("createLead들어옴")
    
    if(this.inputCheck()){
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
    }else{
      console.log("[test용] 유효성 검사 실패");
    }
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
    let isReverse = direction === 'asc' ? 1 : -1;

    parseData.sort((x, y) => {
      let valueX = x[fieldname];
      let valueY = y[fieldname];

      if (fieldname === 'Id') {
        // '이름' 컬럼을 'LastName' 값으로 정렬
        valueX = x['LastName'];
        valueY = y['LastName'];
      }

      valueX = valueX ? valueX : '';
      valueY = valueY ? valueY : '';

      return isReverse * ((valueX > valueY) - (valueY > valueX));
    });

    this.data = parseData;
  }

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

}