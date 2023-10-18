import { api } from 'lwc';
import LightningModal from 'lightning/modal';

import ID_FIELD from "@salesforce/schema/Account.Id";
import NAME_FIELD from "@salesforce/schema/Account.Name";
import TYPE_FIELD from "@salesforce/schema/Account.Type";
import PHONE_FIELD from "@salesforce/schema/Account.PHONE";
import WEBSITE_FIELD from "@salesforce/schema/Account.WEBSITE";

// 세일즈포스 내 업데이트 할 수 있는 메서드
import { updateRecord } from "lightning/uiRecordApi";

export default class AccUpdateModal extends LightningModal {
  @api recordData
  
  accId = '';
  accName = '';
  accType = '';
  accPhone = '';
  accWebsite = '';
  

  connectedCallback() {
    if (this.recordData) {
      // 해당 레코드 데이터가 존재하지 않으면 ''으로
      this.accId = this.recordData.Id || '';
      this.accName = this.recordData.Name || '';
      this.accType = this.recordData.Type || '';
      this.accPhone = this.recordData.Phone || '';
      this.accWebsite = this.recordData.Website || '';
    }
  }

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

  handleAccNameChange(e){this.accName = e.detail.value;}
  handleAccTypeChange(e){this.accType = e.detail.value;}
  handleAccPhoneChange(e){this.accPhone = e.detail.value;}
  handleAccWebsiteChange(e){this.accWebsite = e.detail.value;}

  handleClosedModal() {
    console.log('모달창 닫힘');
    this.close();
  }

  handleUpdate(){
    console.log(this.accId);
    console.log(this.accName);
    console.log(this.accType);
    console.log(this.accPhone);
    console.log(this.accWebsite);
    // this.template.querySelector('lightning-record-edit-form').submit();

    const fields = {};

    fields[ID_FIELD.fieldApiName] = this.accId;
    fields[NAME_FIELD.fieldApiName] = this.accName;
    fields[TYPE_FIELD.fieldApiName] = this.accType;
    fields[PHONE_FIELD.fieldApiName] = this.accPhone;
    fields[WEBSITE_FIELD.fieldApiName] = this.accWebsite;
        
    const recordInput = {
      fields: fields
    };

    updateRecord(recordInput).then((record) => {
      console.log(record);
    });
    
    this.handleClosedModal();
    window.location.reload();
  }
}