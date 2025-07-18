import React, { Component } from 'react'
import Logo from '../components/Logo';
import EmailInputForm from '../components/EmailInputForm';
import PrivacyPolicy from '../components/PrivacyPolicy';
import IllustationRight from '../components/IllustrationRight';
export default function LoginPage() {
    return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 relative">
          <div className="absolute left-0 bottom-0">
            <IllustrationLeft />
          </div>
          <div className="absolute right-0 bottom-0">
            <IllustrationRight />
          </div>
          <div className="w-full max-w-sm mx-auto bg-white rounded-lg shadow p-8 z-10">
            <Logo />
            <div className="text-center text-gray-700 mt-2 mb-6">Log in to continue</div>
            <EmailInputForm />
            <PrivacyPolicy className="mt-6" />
          </div>
        </div>
      )
}
