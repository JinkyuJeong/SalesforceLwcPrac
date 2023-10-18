public with sharing class TagTableCustom {
    @AuraEnabled(Cacheable=true)
    public static List<Account> getAccounts(Integer pageNumber, Integer pageSize) {
        Integer offset = (pageNumber - 1) * pageSize; 
        String soql = 'SELECT Id, Name, Type, Phone, Website, OwnerId, Owner.Name FROM Account ' 
                        + ' ORDER BY CreatedDate DESC '            
                        +' LIMIT :pageSize OFFSET :offset';
        return Database.query(soql);
    }

    @AuraEnabled(Cacheable=true)
    public static Integer getAccountsCount(){
        String soql = 'SELECT Id FROM Account';
        List<Account> accList = Database.query(soql);
        Integer cnt = accList.size();
        return cnt;
    }

    @AuraEnabled
    public static Account getAcc(ID id){
        String soql = 'SELECT Id, Name, Type, Phone, Website, OwnerId, Owner.Name FROM Account WHERE Id = :id'; 
        return Database.query(soql);
    }
}