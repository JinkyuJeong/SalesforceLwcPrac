public with sharing class TagTableCustom {
    @AuraEnabled(Cacheable=true)
    public static List<Lead> getAccounts() {
        String soql = 'SELECT Id, Name, Type, Phone, Website, OwnerId FROM Account';
        return Database.query(soql);
    }
}