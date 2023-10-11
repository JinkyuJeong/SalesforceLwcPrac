global with sharing class AccountService{     // with sharing : 낮은 데이터 보안수준
    @AuraEnabled(cacheable=true)                // 동일한 요청에 대해 이전에 캐시된 결과를 반환 = 서버 부하를 줄일 수 있음
    global static List<Account> getAccounts(String strAccountName){
        String strKey = '%' + strAccountName + '%';
        List<Account> accList = [select id, name, AccountNumber from account where name like :strKey];
        return accList;
    }
}