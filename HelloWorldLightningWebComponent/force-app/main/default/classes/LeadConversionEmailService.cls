public class LeadConversionEmailService {
    public static void sendEmails(List<Id> convertedLeadIds) {
        List<Lead> leadsToSendEmail = [SELECT Id, Name, Email FROM Lead WHERE Id IN :convertedLeadIds];
        
        EmailTemplate emailTemplate = [SELECT Id FROM EmailTemplate WHERE DeveloperName = 'AutoSendEmail' LIMIT 1];
        
        // 이메일 보내기
        List<Messaging.SingleEmailMessage> emailMessages = new List<Messaging.SingleEmailMessage>();
        
        for (Lead lead : leadsToSendEmail) {
            Messaging.SingleEmailMessage emailMessage = new Messaging.SingleEmailMessage();
            emailMessage.setTemplateId(emailTemplate.Id);
            emailMessage.setTargetObjectId(lead.Id);
            emailMessage.setSaveAsActivity(false); // 이메일 기록 저장 여부
            emailMessages.add(emailMessage);
        }
        
        // 이메일 보내기
        List<Messaging.SendEmailResult> emailResults = Messaging.sendEmail(emailMessages);
        
        // 이메일 전송 결과 처리 (에러 핸들링 등)
        for (Messaging.SendEmailResult emailResult : emailResults) {
            if (emailResult.isSuccess()) {
                System.debug('이메일이 성공적으로 보내졌습니다.');
            } else {
                System.debug('이메일 보내기 실패: ' + emailResult.getErrors()[0].getMessage());
            }
        }
    }
}
