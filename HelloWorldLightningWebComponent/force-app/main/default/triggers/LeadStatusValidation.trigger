trigger LeadStatusValidation on Lead (before update) {
  for (Lead leadRecord : Trigger.new) {
      // 이전 리드 레코드 정보를 가져온다.
      Lead oldLead = Trigger.oldMap.get(leadRecord.Id);

      // 리드 상태가 'Working - Contacted'로 변경되려고 할 때
      if (leadRecord.Status == 'Working - Contacted' && oldLead.Status != 'Working - Contacted') {
          // 이메일 필드가 비어있으면 오류 메시지 추가
          if (String.isBlank(leadRecord.Email)) {
              leadRecord.addError('Working - Contacted 단계로 가기 위해서는 Email 필드에 값이 존재해야 합니다.');
          }
      }
  }
}
