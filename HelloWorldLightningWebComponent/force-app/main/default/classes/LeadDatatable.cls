public with sharing class LeadDatatable {
    @AuraEnabled(Cacheable=true)
    public static List<Lead> getLeads(String searchTerm, String field, Integer currentPage, String selectRating, String selectStatus,
                                        String nameSearchTerm, String companySearchTerm, String titleSearchTerm) {
        Integer offset = (currentPage - 1) * 10;
        String name = '%' + nameSearchTerm + '%';
        String company = '%' + companySearchTerm + '%';
        String title = '%' + titleSearchTerm + '%';

        String condition = ' WHERE LastName Like :name and Company Like :company and Title Like :title ';
        
        if (!String.isBlank(field) && !String.isBlank(searchTerm)) {
            String query = '%' + searchTerm +'%';
            condition += ' and ' + field + ' LIKE :query';
        }

        if (!String.isBlank(selectRating)) {
            String rating = '%'+selectRating+'%';
            condition += ' and Rating LIKE :rating';
        }

        if (!String.isBlank(selectStatus)) {
            String status = '%'+selectStatus+'%';
            condition += ' and Status LIKE :status';
        }
    
        String soql = 'SELECT Id, LastName, FirstName, Company, Title, Email, Rating, Status '
                    + ' FROM Lead ' 
                    + condition
                    + ' ORDER BY CreatedDate DESC LIMIT 10 OFFSET :offset';
    
        List<Lead> leadList = Database.query(soql);
    
        return leadList;
    }

    @AuraEnabled(Cacheable=true)
    public static Integer getLeadsCount(String searchTerm, String field, String selectRating, String selectStatus,
    String nameSearchTerm, String companySearchTerm, String titleSearchTerm){
        String name = '%' + nameSearchTerm + '%';
        String company = '%' + companySearchTerm + '%';
        String title = '%' + titleSearchTerm + '%';

        String condition = ' WHERE LastName Like :name and Company Like :company and Title Like :title ';
        
        if (!String.isBlank(field) && !String.isBlank(searchTerm)) {
            String query = '%' + searchTerm +'%';
            condition += ' and ' + field + ' LIKE :query';
        }

        if (!String.isBlank(selectRating)) {
            String rating = '%'+selectRating+'%';
            condition += ' and Rating LIKE :rating';
        }

        if (!String.isBlank(selectStatus)) {
            String status = '%'+selectStatus+'%';
            condition += ' and Status LIKE :status';
        }

        String soql = 'SELECT Id, LastName, FirstName, Company, Title, Email, Rating, Status '
                    + ' FROM Lead ' 
                    + condition;
                    
        List<SObject> result = Database.query(soql);
        Integer cnt = result.size();
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

        try {
            insert newLead;
            return newLead.Id;
        } catch (Exception e) {
            return null;
        }
    }

    // 이메일 중복 검사 로직
    @AuraEnabled(cacheable=true)
    public static Boolean checkEmailDuplication(String email) {
        List<Lead> existingLeads = [SELECT Id FROM Lead WHERE Email = :email LIMIT 1];
        return existingLeads.isEmpty();
    }

    @AuraEnabled
    public static void deleteSelectedLeads(List<Id> selectedIds) {
        try {
            delete [SELECT Id FROM Lead WHERE Id IN :selectedIds];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

}
