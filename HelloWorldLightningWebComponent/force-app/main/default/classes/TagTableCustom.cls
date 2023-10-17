public with sharing class TagTableCustom {
    @AuraEnabled(Cacheable=true)
    public static List<Account> getAccounts(Integer pageNumber, Integer pageSize) {
        Integer offset = (pageNumber - 1) * pageSize; // 페이지 번호와 페이지 크기를 기반으로 오프셋 계산
        String soql = 'SELECT Id, Name, Type, Phone, Website, OwnerId, Owner.Name FROM Account LIMIT :pageSize OFFSET :offset';
        return Database.query(soql);
    }

    @AuraEnabled(Cacheable=true)
    public static Integer getAccountsCount(){
        String soql = 'SELECT Id FROM Account';
        List<Account> accList = Database.query(soql);
        Integer cnt = accList.size();
        return cnt;
    }
}