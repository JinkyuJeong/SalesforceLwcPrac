trigger LeadConversionValidation on Lead (before update) {
  for (Lead leadRecord : Trigger.new) {
    if (leadRecord.IsConverted) { // 리드의 변환 유무
      if (leadRecord.Rating != 'Hot') {
        // 리드의 등급이 "Hot"이 아닌 경우, 리드 변환을 막는다.
        leadRecord.addError('등급이 Hot 일 때 변환이 가능합니다.');
      }

      // 변환될 연락처 아이디와 계정 아이디가 둘 다 null일 때 = Web-to-Lead 자동 변환
      if (leadRecord.ConvertedContactId == null && leadRecord.ConvertedAccountId == null) {
        
        // 기존 연락처 테이블에서 변환될 이메일의 정보가 있는지 찾아본다.
        Contact existingContact = [SELECT Id FROM Contact WHERE Email = :leadRecord.Email LIMIT 1];
        if (existingContact != null) {
          leadRecord.addError('해당 이메일은 이미 존재합니다.');
        }
      }
    }
  }
}