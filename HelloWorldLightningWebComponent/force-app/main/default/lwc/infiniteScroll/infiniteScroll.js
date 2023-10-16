import { LightningElement, track } from 'lwc';
import getLeads from '@salesforce/apex/InfiniteScroll.getLeads';
import getLeadsCount from '@salesforce/apex/InfiniteScroll.getLeadsCount';

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
  { label: '성', fieldName: 'FirstName' },
  { label: '회사', fieldName: 'Company' },
  { label: '직책', fieldName: 'Title'},
  { label: '등급', fieldName: 'Rating'},
  { label: 'Email', fieldName: 'Email', type: 'email' },
  { label: '리드 상태', fieldName: 'Status'},
];

export default class InfiniteScroll extends LightningElement {
  @track data;
  isLoading=false;
  currentPage = 1;
  pageSize = 10;
  columns = columns;
  totalLeadCount=0;

  // DOM연결
  connectedCallback() {
    this.loadData();
    this.isLoading = true;
  }
  
  // 데이터 로드
  loadData(){
    this.retrieveData();
    this.retrieveTotalLeadCount();
  }

  retrieveData() {
    if (this.data && this.data.length >= this.totalLeadCount) {
      return false;
    }

    this.isLoading = true; // 데이터를 가져오는 동안 로딩 표시 활성화

    getLeads({
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
    getLeadsCount()
      .then(result => {
        this.totalLeadCount = result;
      })
      .catch(error => {
        this.totalLeadCount = 0;
      });
  }

  // 스크롤(onloadmore) 이벤트
  loadMoreData(event) {
    const target = event.target;  // 스크롤이 발생한 컨테이너 DOM
    if (target) {
      /* 
        target.scrollHeight는 컨테이너의 전체 스크롤 가능한 높이
        target.clientHeight는 컨테이너의 가시 영역의 높이
        target.scrollTop는 현재 스크롤을 얼마만큼 내렸는지의 px값
      */
      const isScrolledToBottom = target.scrollHeight - target.clientHeight <= target.scrollTop + 1;
      if (isScrolledToBottom) {
        this.retrieveData();
      }
    }
  }
}