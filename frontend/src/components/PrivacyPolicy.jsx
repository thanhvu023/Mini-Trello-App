const PrivacyPolicy = () => {
  return (
    <div className="text-center text-xs text-gray-500 mt-6">
      <p>
        Bằng cách tiếp tục, bạn đồng ý với{' '}
        <a href="#" className="text-blue-600 hover:text-blue-500 underline">
          Điều khoản sử dụng
        </a>{' '}
        và{' '}
        <a href="#" className="text-blue-600 hover:text-blue-500 underline">
          Chính sách bảo mật
        </a>{' '}
        của chúng tôi.
      </p>
      <p className="mt-2">
        Trang web này được bảo vệ bởi reCAPTCHA và tuân theo{' '}
        <a href="#" className="text-blue-600 hover:text-blue-500 underline">
          Chính sách bảo mật
        </a>{' '}
        và{' '}
        <a href="#" className="text-blue-600 hover:text-blue-500 underline">
          Điều khoản dịch vụ
        </a>{' '}
        của Google.
      </p>
    </div>
  )
}

export default PrivacyPolicy
