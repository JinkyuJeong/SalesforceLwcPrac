import { api } from 'lwc';
import LightningModal from 'lightning/modal';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class AccEditModal extends LightningModal {
  @api recordData
  
  accId = '';
  accType = '';

  connectedCallback() {
    if (this.recordData) {
      // 해당 레코드 데이터가 존재하지 않으면 ''으로
      this.accId = this.recordData.Id || '';
      this.accType = this.recordData.Type || '';
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

  handleAccTypeChange(e){this.accType = e.detail.value;}

  handleClosedModal() {
    console.log('모달창 닫힘');
    this.close();
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
}