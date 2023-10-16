public with sharing class InfiniteScroll {
    @AuraEnabled(Cacheable=true)
    public static List<Lead> getLeads(Integer pageNumber, Integer pageSize) {
        Integer offset = (pageNumber - 1) * pageSize; // 페이지 번호와 페이지 크기를 기반으로 오프셋 계산
        String soql = 'SELECT Id, LastName, FirstName, Company, Title, Email, Rating, Status FROM Lead LIMIT :pageSize OFFSET :offset';
        return Database.query(soql);
    }

    @AuraEnabled(Cacheable=true)
    public static Integer getLeadsCount(){
        String soql = 'SELECT Id FROM Lead';
        List<Lead> leadList = Database.query(soql);
        Integer cnt = leadList.size();
        return cnt;
    }

}