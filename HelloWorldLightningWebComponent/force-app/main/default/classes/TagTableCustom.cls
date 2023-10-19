public with sharing class TagTableCustom {
    @AuraEnabled
    public static List<Account> getAccounts(Integer pageNumber, Integer pageSize,String searchTerm, String field) {
        Integer offset = (pageNumber - 1) * pageSize;
        
        String condition = '';
        
        if (!String.isBlank(field) && !String.isBlank(searchTerm)) {
            String query = '%' + searchTerm +'%';
            condition += ' WHERE ' + field + ' LIKE :query';
        }

        String soql = 'SELECT Id, Name, Type, Phone, Website, OwnerId, Owner.Name FROM Account ' 
                        + condition
                        + ' ORDER BY CreatedDate DESC '            
                        +' LIMIT :pageSize OFFSET :offset';
        return Database.query(soql);
    }

    @AuraEnabled
    public static Integer getAccountsCount(String searchTerm, String field){
        String condition = '';
        
        if (!String.isBlank(field) && !String.isBlank(searchTerm)) {
            String query = '%' + searchTerm +'%';
            condition += ' WHERE ' + field + ' LIKE :query';
        }

        String soql = 'SELECT Id FROM Account' + condition;
        List<Account> accList = Database.query(soql);
        Integer cnt = accList.size();
        return cnt;
    }

    @AuraEnabled
    public static Account getAcc(ID id){
        String soql = 'SELECT Id, Name, Type, Phone, Website, OwnerId, Owner.Name FROM Account WHERE Id = :id'; 
        return Database.query(soql);
    }

    @AuraEnabled
    public static Account createdNewRecord() {
        String soql = 'SELECT Id, Name, Type, Phone, Website, OwnerId, Owner.Name FROM Account ORDER BY CreatedDate DESC LIMIT 1'; 
        List<Account> recentAcc = Database.query(soql);
        if (!recentAcc.isEmpty()) {
            return recentAcc[0];
        }
        return null;
    }

    @AuraEnabled
    public static Boolean checkAccNameDuplication(String name){
        List<Account> existingAccounts = [SELECT Id FROM Account WHERE Name = :name LIMIT 1];
        return existingAccounts.isEmpty();
    }

    @AuraEnabled
    public static void delAcc(Id id) {
        try {
            delete [SELECT Id FROM Account WHERE Id = :id];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}