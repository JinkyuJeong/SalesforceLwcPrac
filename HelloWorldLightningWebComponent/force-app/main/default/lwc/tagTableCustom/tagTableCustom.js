import { LightningElement, track, } from 'lwc';
import getAccounts  from '@salesforce/apex/TagTableCustom.getAccounts';
import getAccountsCount from '@salesforce/apex/TagTableCustom.getAccountsCount';
import AccUpdateModal from 'c/accUpdateModal';
import AccEditModal from 'c/accEditModal';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getAcc from '@salesforce/apex/TagTableCustom.getAcc'
import checkAccNameDuplication from '@salesforce/apex/TagTableCustom.checkAccNameDuplication';
import createdNewRecord from '@salesforce/apex/TagTableCustom.createdNewRecord';
import delAcc from '@salesforce/apex/TagTableCustom.delAcc';

const columns = [
  {
    label: '계정 이름',
    fieldName: 'Id',
    type: 'url',
    typeAttributes: {
      label: { fieldName: 'Name' },
      target: '_self', // 현재 창에서 열도록 설정
    },
    sortable: true,
    cellAttributes: { alignment: 'left' },
  },
  { label: '유형', fieldName: 'Type' },
  { label: '전화번호', fieldName: 'Phone', type: 'Phone' },
  { label: '웹사이트', fieldName: 'Website'},
  { label: '계정 소유자', fieldName: 'Owner.Name'}
];

export default class TagTableCustom extends LightningElement {
  @track data;
  columns = columns;
  acc;
  isLoading = false;
  totalLeadCount = 0; // 전체 데이터의 개수
  currentPage = 1; // 현재 페이지
  pageSize = 10; // 한 페이지당 표시할 데이터 개수
  showEditModal; // 편집 모달 오픈여부
  showCreateModal; // 생성 모달 오픈여부
  showDelModal; // 삭제 모달 오픈여부
  accId; accName; accPhone; accWebsite; accType;  // 계정 변수
  isAccNameDup = true // 계정 이름 중복 여부
  accNameAvaMessage;  // 사용 가능
  accNameDupMessage; // 중복(사용 불가)
  field; // 검색 필드
  searchTerm = ''; // 검색어

  // 검색필드 콤보박스 옵션
  fieldOptions = [
    { label : '계정 이름', value : 'Name'},
    { label : '전화번호', value : 'Phone'},
    { label : '계정 소유자', value : 'Owner.Name'}
  ];

  // 계정 타입 콤보박스 옵션
  accTypeOptions = [
    { label: 'Prospect', value: 'Prospect' },
    { label: 'Customer - Direct', value: 'Customer - Direct' },
    { label: 'Customer - Channel', value: 'Customer - Channel' },
    { label: 'Channel Partner / Reseller', value: 'Channel Partner / Reseller' },
    { label: 'Installation Partner', value: 'Installation Partner' },
    { label: 'Technology Partner', value: 'Technology Partner' },
    { label: 'Other', value: 'Other' }
  ];

  handleFieldChange(event) {this.field = event.detail.value;}

  // 검색 이벤트 핸들 함수
  handleSearch(event) {
    // 검색어 필드의 값을 업데이트하고 데이터를 새로고침
    this.searchTerm = event.target.value;
    if(this.field){
      this.currentPage = 1; // 검색을 하고 1페이지로 초기화를 한다.
      this.loadData();
    }
  }

  handleAccNameChange(e){
    this.accName = e.detail.value.trim();
    if(this.accNameDupMessage){
      this.accNameDupMessage = undefined;
    }
    
    if (!this.accName) {
      this.accNameAvaMessage = '';
      this.accNameDupMessage = '';
    } else {
        checkAccNameDuplication({ name: this.accName.trim() })
        .then(result => {
          if (this.accName === e.detail.value.trim()) { 
            this.isAccNameDup = !result;
            if (result) {
                this.accNameAvaMessage = '사용 가능한 계정 이름 입니다.';
                this.accNameDupMessage = '';
            } else {
                this.accNameAvaMessage = '';
                this.accNameDupMessage = '중복 계정 이름 입니다.';
            }
          }
        })
        .catch(error => {
          console.log("계정 이름 중복 검사 과정에서 오류 발생");
        });
    }
  }
  handleAccTypeChange(e){this.accType = e.detail.value;}
  handleAccPhoneChange(e){this.accPhone = e.detail.value;}
  handleAccWebsiteChange(e){this.accWebsite = e.detail.value;}
  handleClosedEditModal() {this.showEditModal = false; }
  handleClosedCreateModal() {
    this.showCreateModal = false;
    this.accName = '';
    this.accPhone = '';
    this.accWebsite = '';
    this.accNameAvaMessage = '';
    this.accNameDupMessage = '';
  }
  handleClosedDelModal(){this.showDelModal = false; }

  handleEditOpenModal(event) {
    const recordIdParts = event.target.dataset.recordid.split('/');
    const extractedId = recordIdParts[recordIdParts.length - 1];
    
    this.accId = extractedId;
    console.log(this.accId);

    this.accType = event.target.dataset.type;
    this.showEditModal = true;
  }

  handleOpenCreateModal(){
    this.accType = undefined;  // 편집 모달에서 해당 값을 작업하고 남아있기 때문에 초기화시킨다.
    this.showCreateModal = true;
  }

  handleDelOpenModal(event){
    this.showDelModal = true;

    const recordIdParts = event.target.dataset.recordid.split('/');
    const extractedId = recordIdParts[recordIdParts.length - 1];
    
    this.accId = extractedId;
    console.log(this.accId);

    getAcc({ id : this.accId })
      .then( result => {
        console.log(result.Name);
        if(result){
          this.acc = result.Name;
        }
      })
  }

  // 계정 레코드 편집 버튼 클릭 이벤트 함수
  handleUpdate(){
    const fields = {};
    let fieldCmps = this.template.querySelectorAll('lightning-input-field');
    let fieldCombo = this.template.querySelector('lightning-combobox');
    for(let fieldCmp of fieldCmps) {
        fields[fieldCmp.fieldName] = fieldCmp.value;
    }
    fields[fieldCombo.fieldName] = fieldCombo.value;

    this.template.querySelector('lightning-record-edit-form').submit(fields);
  }

  // 계정 레코드 생성 버튼 클릭 이벤트 함수
  handleCreate(){
    if(!this.isAccNameDup){
      const fields = {};
      let fieldCmps = this.template.querySelectorAll('lightning-input-field');
      let fieldCombo = this.template.querySelector('lightning-combobox');
      for(let fieldCmp of fieldCmps) {
          fields[fieldCmp.fieldName] = fieldCmp.value;
      }
      fields[fieldCombo.fieldName] = fieldCombo.value;
  
      this.template.querySelector('lightning-record-edit-form').submit(fields);
    }else{
      this.showToast('생성 실패', '계정 이름 중복 검사가 필요합니다.', 'error');
    }
  }

  handleDelAcc(){
    delAcc({ id : this.accId })
    .then(result => {
      this.data = this.data.filter(item => item.Id !== '/'+this.accId);
      this.handleClosedDelModal();
      this.loadData();
      this.showToast('삭제 성공!', '레코드가 성공적으로 삭제되었습니다.', 'success');
    })
    .catch(error => {
      this.showToast('삭제 오류', '레코드 삭제중 오류가 발생하였습니다.', 'error');
    });
  }

  handleEditSuccess(){
    this.handleClosedEditModal(); // 모달을 닫음
    this.showToast('변경 성공!', '레코드 변경에 성공 하였습니다.', 'success'); // 성공 메시지 표시
    getAcc({ id : this.accId })
      .then( result => {
        if (result && result.Id) {
          const newData = { ...result, Id: '/' + result.Id }; // 기존 레코드와 동일한 형식으로 변환
          // 기존 데이터 배열에서 변경해야 하는 레코드 식별 및 업데이트
          const updatedData = this.data.map(record => {
              if (record.Id === newData.Id) {
                  return newData; // 변경된 레코드로 교체
              }
              return record;
          });
          this.data = updatedData; // 데이터 배열 업데이트
        }
      })
  }

  handleCreateSuccess(){
    this.handleClosedCreateModal(); // 모달을 닫음
    this.showToast('생성 성공!', '레코드 생성에 성공 하였습니다.', 'success'); // 성공 메시지 표시

    createdNewRecord()
    .then(result => {
        if (result && result.Id) {
          const newData = { ...result, Id: '/' + result.Id }; // 기존 레코드와 동일한 형식으로 변환
          this.data = [newData, ...this.data];
          this.loadData();
        }
    })
    .catch(error => {
        console.error('Error creating new record: ' + error);
    });
  }

  // 메시지 표시
  showToast(title, message, variant) {
    const event = new ShowToastEvent({
      title: title,
      message: message,
      variant: variant,
    });
    this.dispatchEvent(event);
  }

  handleOpenClick(event) {
    // id가 하이퍼링크라 '/'를 없앰
    const recordIdParts = event.target.dataset.recordid.split('/');
    const extractedId = recordIdParts[recordIdParts.length - 1];

    // 레코드 정보를 생성
    const recordData = {
        Id: extractedId,
        Name: event.target.dataset.name,
        Type: event.target.dataset.type,
        Phone: event.target.dataset.phone,
        Website: event.target.dataset.website
    };

    // 모달 창 열기 및 레코드 정보 전달
    AccUpdateModal.open({
        size: 'large',
        recordData: recordData // 레코드 정보 전달
    }).then((result) => {
        console.log(result);
    });
  }

  handleOpenClick2(event) {
    // id가 하이퍼링크라 '/'를 없앰
    const recordIdParts = event.target.dataset.recordid.split('/');
    const extractedId = recordIdParts[recordIdParts.length - 1];

    // 레코드 정보를 생성
    const recordData = {
        Id: extractedId,
        Name: event.target.dataset.name,
        Type: event.target.dataset.type,
        Phone: event.target.dataset.phone,
        Website: event.target.dataset.website
    };

    // 모달 창 열기 및 레코드 정보 전달
    AccEditModal.open({
        size: 'large',
        recordData: recordData // 레코드 정보 전달
    }).then((result) => {
        console.log(result);
    });
  }

  // 추가 데이터 로드 및 무한 스크롤 처리
  handleScroll(event) {
    const container = event.target;
    const containerHeight = container.clientHeight;
    const scrollPosition = container.scrollTop;
    const scrollHeight = container.scrollHeight;

    if (containerHeight + scrollPosition >= scrollHeight - 1) {
      setTimeout(() => {  // 스크롤을 빨리 내리다보면 데이터가 이중으로 붙게되어서 딜레이를 주었음
        if(!this.isLoading){
          this.currentPage++;
        }
        this.retrieveData();
      }, 300);
    }
  }

  // DOM연결
  connectedCallback() {
    this.loadData();
  }

  // 데이터 로드
  loadData(){
    this.retrieveData();
    this.retrieveTotalLeadCount();
  }

  retrieveData(){
    if (this.data && this.data.length >= this.totalLeadCount) {
      return false;
    }

    this.isLoading = true; // 데이터를 가져오는 동안 로딩 표시 활성화

    getAccounts({
      pageNumber: this.currentPage,
      pageSize: this.pageSize,
      searchTerm: this.searchTerm, 
      field: this.field
    })
    .then(result => {
      if (result && result.length > 0) {
        this.data = [...(this.data || []), ...result.map(record => ({
          ...record,
          Id: '/' + record.Id
        }))];
        this.error = undefined;
      } else {
        this.error = undefined;
        this.data = undefined;
      }
    })
    .catch(error => {
      this.error = error;
      this.data = undefined;
    })
    .finally(() => {
      this.isLoading = false; // 데이터 로드가 완료되면 로딩 표시 비활성화
    });
  }

  retrieveTotalLeadCount() {
    getAccountsCount({
      searchTerm: this.searchTerm, 
      field: this.field
    })
      .then(result => {
        this.totalLeadCount = result;
      })
      .catch(error => {
        this.totalLeadCount = 0;
      });
  }
}