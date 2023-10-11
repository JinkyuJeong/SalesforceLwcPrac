public with sharing class LeadDatatable {
    @AuraEnabled(Cacheable=true)
    public static List<Lead> getLeads(String searchTerm, Integer currentPage) {
        String query = '%' + searchTerm +'%';
        Integer offset = (currentPage - 1) * 10;
        List<Lead> leadList = [SELECT LastName, FirstName, Company, Title, Email, Rating, Status FROM Lead WHERE LastName LIKE :query Limit 10 Offset :offset];

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

}
