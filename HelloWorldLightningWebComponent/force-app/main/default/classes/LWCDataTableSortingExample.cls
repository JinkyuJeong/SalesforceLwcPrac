global with sharing class LWCDataTableSortingExample {
    // @AuraEnabled(cacheable=true)
    // public static List<Contact> getContacts(){
    //    List<Contact> conList = [select id, firstName, lastName, Phone, Email from Contact Limit 10];
    //    return conList;  // list로 리턴을 하게된다면 JSON형식의 데이터로 바뀜
    // }

    @AuraEnabled(Cacheable=true)
    public static List <Contact> getContacts(String field, String sortOrder) {
        String query = 'SELECT Id, FirstName, LastName, Phone, Email FROM Contact';
        if(field != null && sortOrder !=null){
            query += ' ORDER BY '+field+' '+sortOrder;
        }
        return Database.query(query);
    }
}