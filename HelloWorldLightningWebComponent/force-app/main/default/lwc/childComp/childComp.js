import { LightningElement, track, api } from 'lwc';
export default class ChildComp extends LightningElement {
    // @track Message;
    // @api
    // changeMessage(strString) {
    //      this.Message = strString.toUpperCase();
    // }

    // handleChange(event){
    //   const name = event.target.value;
    //   const selectEvent = new CustomEvent('mycustomevent',{
    //     detail : name
    //   });
    //   this.dispatchEvent(selectEvent);
    // }

    handleChange(event){
      const name = event.target.value;
      const selectEvent = new CustomEvent('mycustomevent',{
        detail : name,
        bubbles : true
      });
      this.dispatchEvent(selectEvent);
    }
}