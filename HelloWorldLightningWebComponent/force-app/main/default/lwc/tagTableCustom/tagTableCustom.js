import { LightningElement, track, } from 'lwc';
import getAccounts  from '@salesforce/apex/TagTableCustom.getAccounts';
import getAccountsCount from '@salesforce/apex/TagTableCustom.getAccountsCount';
import AccUpdateModal from 'c/accUpdateModal';
import AccEditModal from 'c/accEditModal';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getAcc from '@salesforce/apex/TagTableCustom.getAcc'

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
  isLoading = false;
  totalLeadCount = 0; // 전체 데이터의 개수
  currentPage = 1; // 현재 페이지
  pageSize = 10; // 한 페이지당 표시할 데이터 개수
  showModal; // 모달 오픈여부
  accId;
  accType;

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

  handleAccTypeChange(e){this.accType = e.detail.value;}
  handleClosedModal() {this.showModal = false; }

  handleOpenModal(event) {
    const recordIdParts = event.target.dataset.recordid.split('/');
    const extractedId = recordIdParts[recordIdParts.length - 1];
    
    this.accId = extractedId;
    console.log(this.accId);

    this.accType = event.target.dataset.type;
    this.showModal = true;
  }

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

  handleSuccess(){
    this.handleClosedModal(); // 모달을 닫음
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
      this.retrieveData();
    }
  }

  // DOM연결
  connectedCallback() {
    this.loadData();
  }

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
      pageSize: this.pageSize
    })
    .then(result => {
      if (result && result.length > 0) {
        this.data = [...(this.data || []), ...result.map(record => ({
          ...record,
          Id: '/' + record.Id
        }))];
        this.error = undefined;
        this.currentPage++;
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
    getAccountsCount()
      .then(result => {
        this.totalLeadCount = result;
      })
      .catch(error => {
        this.totalLeadCount = 0;
      });
  }
}