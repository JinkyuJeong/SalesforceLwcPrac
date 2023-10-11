trigger LeadConversionTrigger on Lead (after update) {
  List<Id> convertedLeadIds = new List<Id>();
  
  for (Lead lead : Trigger.new) {
      if (lead.IsConverted && Trigger.oldMap.get(lead.Id).IsConverted == false) {
          // 리드가 변환될 때만 Id를 추가
          convertedLeadIds.add(lead.Id);
      }
  }
  
  if (!convertedLeadIds.isEmpty()) {
      // Apex 클래스의 sendEmails 메소드 호출
      LeadConversionEmailService.sendEmails(convertedLeadIds);
  }
}
