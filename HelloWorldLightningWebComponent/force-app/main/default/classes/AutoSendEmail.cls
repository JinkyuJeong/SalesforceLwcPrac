public with sharing class AutoSendEmail {
    public static void sendEmail(Id leadId) {
        // 이메일을 보낼 대상 리드 정보 가져오기
        Lead leadToEmail = [SELECT Id, Email, FirstName, LastName FROM Lead WHERE Id = :leadId LIMIT 1];
        
        if (leadToEmail != null) {
            // 이메일 템플릿 설정
            EmailTemplate emailTemplate = [SELECT Id FROM EmailTemplate WHERE DeveloperName = 'AutoSendEmail' LIMIT 1];
            
            if (emailTemplate != null) {
                // SingleEmailMessage 객체 생성
                Messaging.SingleEmailMessage email = new Messaging.SingleEmailMessage();
                
                // 이메일 수신자 설정
                email.setToAddresses(new String[] { leadToEmail.Email });
                
                // 이메일 템플릿 설정
                email.setTemplateId(emailTemplate.Id);
                
                // 템플릿 변수 설정 (예: {!Lead.FirstName})
                email.setTargetObjectId(leadToEmail.Id);
                
                // 이메일 보내기
                Messaging.sendEmail(new Messaging.SingleEmailMessage[] { email });
            } else {
                System.debug('AutoSendEmail 이메일 템플릿을 찾을 수 없습니다.');
            }
        } else {
            System.debug('보낼 리드를 찾을 수 없습니다.');
        }
    }
}