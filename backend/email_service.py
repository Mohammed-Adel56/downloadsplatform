import random
import resend

class EmailService:
    def __init__(self, config):
        self.config = config
        resend.api_key = config.RESEND_API_KEY

    def send_email(self, to_email, subject, body):
        try:
            params = {
                "from": "Downloader App <onboarding@resend.dev>",
                "to": [to_email],
                "subject": subject,
                "text": body
            }
            
            response = resend.Emails.send(params)
            print(f"Email sent successfully to {to_email}")
            return True
            
        except Exception as e:
            print(f"Error sending email: {str(e)}")
            return False

    def send_verification_email(self, email, otp):
        subject = "تحقق من بريدك الإلكتروني"
        body = f"""
        مرحباً،
        
        شكراً لتسجيلك معنا. رمز التحقق الخاص بك هو: {otp}
        
        هذا الرمز صالح لمدة 15 دقيقة.
        
        مع تحياتنا،
        فريق العمل
        """
        return self.send_email(email, subject, body)

    def send_reset_password_email(self, email, otp):
        subject = "إعادة تعيين كلمة المرور"
        body = f"""
        مرحباً،
        
        لقد تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بك.
        رمز إعادة التعيين هو: {otp}
        
        هذا الرمز صالح لمدة 15 دقيقة.
        
        إذا لم تطلب إعادة تعيين كلمة المرور، يرجى تجاهل هذا البريد.
        
        مع تحياتنا،
        فريق العمل
        """
        return self.send_email(email, subject, body)

    @staticmethod
    def generate_otp():
        return ''.join([str(random.randint(0, 9)) for _ in range(4)])