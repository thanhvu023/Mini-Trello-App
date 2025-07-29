const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Send verification email
const sendVerificationEmail = async (email, name, code) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Mini Trello App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Xác minh email - Mini Trello App',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">Mini Trello App</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Xác minh tài khoản của bạn</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-bottom: 20px;">Xin chào ${name}!</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
              Cảm ơn bạn đã đăng ký tài khoản tại Mini Trello App. Để hoàn tất quá trình đăng ký, 
              vui lòng sử dụng mã xác minh bên dưới:
            </p>
            
            <div style="background: #fff; border: 2px solid #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 25px 0;">
              <h3 style="color: #667eea; margin: 0; font-size: 32px; letter-spacing: 5px; font-weight: bold;">
                ${code}
              </h3>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Mã này sẽ hết hạn sau 10 phút. Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.
            </p>
            
            <div style="background: #e8f4fd; border-left: 4px solid #667eea; padding: 15px; margin: 25px 0;">
              <p style="margin: 0; color: #333; font-size: 14px;">
                <strong>Lưu ý:</strong> Không chia sẻ mã này với bất kỳ ai để bảo vệ tài khoản của bạn.
              </p>
            </div>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
            <p>Email này được gửi từ Mini Trello App</p>
            <p>Nếu bạn có thắc mắc, vui lòng liên hệ hỗ trợ</p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Verification email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Error sending verification email:', error);
    return false;
  }
};

// Send invitation email
const sendInvitationEmail = async (invitation, boardName, inviterName) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Mini Trello App" <${process.env.EMAIL_USER}>`,
      to: invitation.email,
      subject: `Lời mời tham gia bảng - ${boardName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">Mini Trello App</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Lời mời tham gia bảng</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-bottom: 20px;">Xin chào!</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
              <strong>${inviterName}</strong> đã mời bạn tham gia bảng <strong>"${boardName}"</strong> 
              trên Mini Trello App với vai trò <strong>${invitation.role}</strong>.
            </p>
            
            ${invitation.message ? `
              <div style="background: #fff; border: 1px solid #ddd; border-radius: 8px; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; color: #666; font-style: italic;">
                  "${invitation.message}"
                </p>
              </div>
            ` : ''}
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/invitations/${invitation._id}" 
                 style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 0 10px;">
                Chấp nhận lời mời
              </a>
              <a href="${process.env.FRONTEND_URL}/invitations/${invitation._id}/decline" 
                 style="background: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 0 10px;">
                Từ chối
              </a>
            </div>
            
            <div style="background: #e8f4fd; border-left: 4px solid #667eea; padding: 15px; margin: 25px 0;">
              <p style="margin: 0; color: #333; font-size: 14px;">
                <strong>Lưu ý:</strong> Lời mời này sẽ hết hạn sau 7 ngày.
              </p>
            </div>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
            <p>Email này được gửi từ Mini Trello App</p>
            <p>Nếu bạn có thắc mắc, vui lòng liên hệ hỗ trợ</p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Invitation email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Error sending invitation email:', error);
    return false;
  }
};

// Send password reset email (if needed in future)
const sendPasswordResetEmail = async (email, name, resetToken) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Mini Trello App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Đặt lại mật khẩu - Mini Trello App',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">Mini Trello App</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Đặt lại mật khẩu</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-bottom: 20px;">Xin chào ${name}!</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
              Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. 
              Nếu bạn không yêu cầu điều này, vui lòng bỏ qua email này.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/reset-password?token=${resetToken}" 
                 style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Đặt lại mật khẩu
              </a>
            </div>
            
            <div style="background: #e8f4fd; border-left: 4px solid #667eea; padding: 15px; margin: 25px 0;">
              <p style="margin: 0; color: #333; font-size: 14px;">
                <strong>Lưu ý:</strong> Link này sẽ hết hạn sau 1 giờ.
              </p>
            </div>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
            <p>Email này được gửi từ Mini Trello App</p>
            <p>Nếu bạn có thắc mắc, vui lòng liên hệ hỗ trợ</p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Password reset email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Error sending password reset email:', error);
    return false;
  }
};

module.exports = {
  sendVerificationEmail,
  sendInvitationEmail,
  sendPasswordResetEmail
}; 