import { LightningElement, track } from 'lwc';
import getAccounts  from '@salesforce/apex/TagTableCustom.getAccounts';
import getAccountsCount from '@salesforce/apex/TagTableCustom.getAccountsCount';
import AccUpdateModal from 'c/accUpdateModal';

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