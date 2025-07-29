const IllustrationLeft = () => {
  return (
    <div className="hidden lg:block lg:w-1/2 bg-blue-50 flex items-center justify-center">
      <div className="max-w-md">
        <svg
          className="w-full h-auto"
          viewBox="0 0 400 300"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Decorative circles */}
          <circle cx="50" cy="50" r="20" fill="#3B82F6" opacity="0.1" />
          <circle cx="350" cy="80" r="15" fill="#3B82F6" opacity="0.1" />
          <circle cx="80" cy="250" r="25" fill="#3B82F6" opacity="0.1" />
          
          {/* Main illustration - Board with cards */}
          <rect x="100" y="100" width="200" height="120" rx="8" fill="#FFFFFF" stroke="#E5E7EB" strokeWidth="2" />
          <rect x="110" y="110" width="180" height="20" rx="4" fill="#F3F4F6" />
          <rect x="110" y="140" width="60" height="30" rx="4" fill="#3B82F6" opacity="0.8" />
          <rect x="180" y="140" width="60" height="30" rx="4" fill="#10B981" opacity="0.8" />
          <rect x="250" y="140" width="40" height="30" rx="4" fill="#F59E0B" opacity="0.8" />
          
          {/* Floating elements */}
          <rect x="50" y="150" width="40" height="25" rx="4" fill="#8B5CF6" opacity="0.6" />
          <rect x="320" y="120" width="35" height="20" rx="4" fill="#EF4444" opacity="0.6" />
          
          {/* Connection lines */}
          <line x1="90" y1="162" x2="110" y2="155" stroke="#3B82F6" strokeWidth="2" opacity="0.3" />
          <line x1="355" y1="130" x2="300" y2="140" stroke="#3B82F6" strokeWidth="2" opacity="0.3" />
        </svg>
        
        <div className="text-center mt-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Quản lý dự án hiệu quả
          </h3>
          <p className="text-gray-600">
            Tổ chức công việc với bảng Kanban trực quan, 
            cộng tác thời gian thực với team của bạn.
          </p>
        </div>
      </div>
    </div>
  )
}

export default IllustrationLeft
