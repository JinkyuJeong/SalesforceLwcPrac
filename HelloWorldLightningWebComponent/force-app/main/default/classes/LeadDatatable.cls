public with sharing class LeadDatatable {
    @AuraEnabled(Cacheable=true)
    public static List<Lead> getLeads(String searchTerm, Integer currentPage) {
        String query = '%' + searchTerm +'%';
        Integer offset = (currentPage - 1) * 10;
        List<Lead> leadList = [SELECT Id, LastName, FirstName, Company, Title, Email, Rating, Status FROM Lead WHERE LastName LIKE :query ORDER BY CreatedDate DESC Limit 10 Offset :offset];

        return leadList;
    }

    @AuraEnabled(Cacheable=true)
    public static Integer getLeadsCount(String searchTerm){
        String query = '%' + searchTerm +'%';
        Integer cnt = [SELECT count() FROM Lead WHERE LastName LIKE :query];
        return cnt;
    }

    @AuraEnabled
    public static Id cLead(Map<String, String> fields) {
        Lead newLead = new Lead();
        newLead.FirstName = fields.get('FirstName');
        newLead.LastName = fields.get('LastName');
        newLead.Company = fields.get('Company');
        newLead.Title = fields.get('Title');
        newLead.Email = fields.get('Email');
        newLead.Rating = fields.get('Rating');
        newLead.Status = fields.get('Status');
        newLead.LeadSource = fields.get('LeadSource');

        // 리드를 저장하고 생성된 리드의 ID를 반환합니다.
        try {
            insert newLead;
            return newLead.Id;
        } catch (Exception e) {
            // 예외 처리: 리드 생성 중 오류 발생
            return null;
        }
    }

    @AuraEnabled(cacheable=true)
    public static Boolean checkEmailDuplication(String email) {
        // 이메일 중복 검사 로직을 수행
        // 중복되지 않으면 true를 반환, 중복되면 false를 반환
        List<Lead> existingLeads = [SELECT Id FROM Lead WHERE Email = :email LIMIT 1];
        return existingLeads.isEmpty();
    }

    @AuraEnabled
    public static void deleteSelectedLeads(List<Id> selectedIds) {
        try {
            delete [SELECT Id FROM Lead WHERE Id IN :selectedIds];

            // 삭제가 성공했음을 클라이언트에게 알립니다.
            AuraHandledException ex = new AuraHandledException('선택한 Lead 레코드가 성공적으로 삭제되었습니다.');
            ex.setMessage('Lead 삭제 성공');
            throw ex;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

}
