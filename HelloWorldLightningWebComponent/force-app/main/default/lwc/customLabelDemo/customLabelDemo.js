// import { LightningElement } from 'lwc';
// import header from '@salesforce/label/c.Header';
// import title from '@salesforce/label/c.Title';

import { LightningElement,track } from 'lwc';
import { label  } from 'c/labelUtility';

export default class CustomLabelDemo extends LightningElement {
//    label = {
//         header,
//         title
//     };

    @track myLabel=label;
}