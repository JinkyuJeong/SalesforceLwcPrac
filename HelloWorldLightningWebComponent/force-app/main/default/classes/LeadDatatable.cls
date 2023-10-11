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
}
