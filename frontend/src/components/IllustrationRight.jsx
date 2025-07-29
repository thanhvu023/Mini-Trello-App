const IllustrationRight = () => {
  return (
    <div className="hidden xl:block xl:w-1/2 bg-green-50 flex items-center justify-center">
      <div className="max-w-md">
        <svg
          className="w-full h-auto"
          viewBox="0 0 400 300"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Decorative elements */}
          <circle cx="60" cy="60" r="15" fill="#10B981" opacity="0.1" />
          <circle cx="340" cy="100" r="20" fill="#10B981" opacity="0.1" />
          <circle cx="100" cy="240" r="18" fill="#10B981" opacity="0.1" />
          
          {/* Task management illustration */}
          <rect x="120" y="80" width="160" height="140" rx="8" fill="#FFFFFF" stroke="#E5E7EB" strokeWidth="2" />
          
          {/* Task items */}
          <rect x="130" y="90" width="140" height="15" rx="3" fill="#F3F4F6" />
          <rect x="130" y="115" width="140" height="15" rx="3" fill="#F3F4F6" />
          <rect x="130" y="140" width="140" height="15" rx="3" fill="#F3F4F6" />
          <rect x="130" y="165" width="140" height="15" rx="3" fill="#F3F4F6" />
          <rect x="130" y="190" width="140" height="15" rx="3" fill="#F3F4F6" />
          
          {/* Checkboxes */}
          <rect x="135" y="92" width="8" height="8" rx="1" fill="#10B981" />
          <rect x="135" y="117" width="8" height="8" rx="1" fill="#10B981" />
          <rect x="135" y="142" width="8" height="8" rx="1" fill="#10B981" />
          <rect x="135" y="167" width="8" height="8" rx="1" fill="#6B7280" />
          <rect x="135" y="192" width="8" height="8" rx="1" fill="#6B7280" />
          
          {/* Progress bar */}
          <rect x="130" y="220" width="140" height="8" rx="4" fill="#E5E7EB" />
          <rect x="130" y="220" width="84" height="8" rx="4" fill="#10B981" />
          
          {/* Floating icons */}
          <circle cx="80" cy="120" r="12" fill="#10B981" opacity="0.8" />
          <circle cx="320" cy="180" r="10" fill="#10B981" opacity="0.6" />
          
          {/* Connection dots */}
          <circle cx="200" cy="50" r="3" fill="#10B981" opacity="0.4" />
          <circle cx="220" cy="50" r="3" fill="#10B981" opacity="0.4" />
          <circle cx="240" cy="50" r="3" fill="#10B981" opacity="0.4" />
        </svg>
        
        <div className="text-center mt-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Theo dõi tiến độ
          </h3>
          <p className="text-gray-600">
            Quản lý nhiệm vụ, theo dõi tiến độ và 
            hoàn thành mục tiêu một cách hiệu quả.
          </p>
        </div>
      </div>
    </div>
  )
}

export default IllustrationRight
