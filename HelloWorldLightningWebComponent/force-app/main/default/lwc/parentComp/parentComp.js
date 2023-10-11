import { LightningElement, track } from 'lwc';

export default class ParentComp extends LightningElement {
  @track msg;

  constructor(){
    super();
    this.template.addEventListener('mycustomevent',this.handleCustomEvent.bind(this));
  }

  handleCustomEvent(event) {
    const textVal = event.detail;
    this.msg = textVal;
  } 

  // handleCustomEvent(event) {
  //     const textVal = event.detail;
  //     this.msg = textVal;
  // }

  // handleChangeEvent(event){
  //     this.template.querySelector('c-child-Comp').changeMessage(event.target.value);
  // }

}