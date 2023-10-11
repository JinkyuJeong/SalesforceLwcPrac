trigger PreventLeadStatusBacktrack on Lead (before update) {
  
  // Map객체를 사용하여 리드 상태 단계에 따른 정수값을 할당한다.
  Map<String, Integer> statusLead = new Map<String, Integer>{
    'Open - Not Contacted' => 1,
    'Working - Contacted' => 2,
    'Closed - Converted' => 3,
    'Closed - Not Converted' => 4
  };
  

  for (Lead leadRecord : Trigger.new) {
      Lead oldLead = Trigger.oldMap.get(leadRecord.Id);

      // 현재 상태와 이전 상태가 다르고, 이전 상태로 돌아가려고 할 때
      if (oldLead.Status != leadRecord.Status && statusLead.get(oldLead.Status) > statusLead.get(leadRecord.Status)) {
          leadRecord.addError('이전 단계로 돌아갈 수 없습니다.');
      }
  }
}