trigger ReqRatingAndSource on Lead (before insert) {
  for (Lead leadRecord : Trigger.new) {
  if (String.isBlank(leadRecord.Rating) || String.isBlank(leadRecord.LeadSource)) {
      leadRecord.addError('등급 또는 리드 소스를 입력해주세요.');
    }
  }
}