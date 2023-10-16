import { LightningElement, track } from 'lwc';
import getAccounts  from '@salesforce/apex/TagTableCustom.getAccounts';

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
  { label: '계정 소유자', fieldName: 'OwnerId'}
];

export default class TagTableCustom extends LightningElement {
  @track data;
  columns = columns;

  // DOM연결
  connectedCallback() {
    this.loadData();
  }

  loadData(){
    this.retrieveData();
  }

  retrieveData(){
    getAccounts()
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
    });
  }
}