import { LightningElement, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
 
export default class BasicNavigationLWC extends NavigationMixin(LightningElement) {
  
   efUrl;

  connectedCallback(){      //컴포넌트가 DOM에 연결될 때 실행할 코드를 작성 (오버라이딩)
    this.caseHomePageRef = {
      type : 'standard__objectPage',
      attributes:{
        objectApiName : 'Case',
        actionName : 'home'
      }
    };
    this[NavigationMixin.GenerateUrl](this.caseHomePageRef)
    .then(url => this.refUrl = url);  // GenerateUrl 메서드를 사용해서 url 생성
  }

  handleNavigationClick(event){
    event.preventDefault();   // 기본 동작 막음 (a태그 링크 이동하는거)
    event.stopPropagation();  
    this[NavigationMixin.Navigate](this.caseHomePageRef); // Navigate메서드를 사용해서 페이지 이동
  }
}