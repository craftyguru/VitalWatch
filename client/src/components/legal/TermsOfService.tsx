import React from 'react';

export default function TermsOfService() {
  return (
    <div className="prose prose-xs sm:prose-sm max-w-none text-gray-700 dark:text-gray-300">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Terms of Service</h1>
      <p className="text-xs sm:text-sm text-gray-500 mb-6 sm:mb-8">Last updated: {new Date().toLocaleDateString()}</p>
      
      <h2>1. Acceptance of Terms</h2>
      <p>
        By accessing or using VitalWatch ("the Service"), you agree to be bound by these Terms of Service 
        ("Terms"). If you disagree with any part of these terms, then you may not access the Service.
      </p>

      <h2>2. Description of Service</h2>
      <p>
        VitalWatch is an AI-powered vital signs monitoring and mental health support application that provides 
        real-time crisis detection, emergency alerts, mood tracking, coping tools, and emergency contact management. 
        The Service includes but is not limited to:
      </p>
      <ul>
        <li>Real-time health monitoring and sensor data analysis</li>
        <li>AI-powered threat detection and emergency response</li>
        <li>Mental health support tools and crisis intervention</li>
        <li>Emergency contact notifications and location sharing</li>
        <li>Subscription-based premium features</li>
      </ul>

      <h2>3. Intellectual Property Rights</h2>
      <p>
        <strong>VitalWatch and all its components are proprietary and confidential.</strong> The Service and its 
        original content, features, and functionality are and will remain the exclusive property of VitalWatch 
        and its licensors. The Service is protected by copyright, trademark, and other laws.
      </p>
      
      <h3>3.1 Prohibited Uses</h3>
      <p>You may not:</p>
      <ul>
        <li>Copy, modify, distribute, sell, or lease any part of our Service</li>
        <li>Reverse engineer, decompile, or attempt to extract the source code</li>
        <li>Create derivative works or competing applications</li>
        <li>Use our AI algorithms, sensor integration methods, or proprietary technologies</li>
        <li>Access our Service to build a similar or competitive product or service</li>
        <li>Remove, alter, or obscure any proprietary notices</li>
        <li>Use automated systems to access the Service without permission</li>
      </ul>

      <h2>4. User Accounts and Data</h2>
      <p>
        When you create an account with us, you must provide information that is accurate, complete, and current 
        at all times. You are responsible for safeguarding the password and for your account activity.
      </p>

      <h3>4.1 Health Data and Emergency Services</h3>
      <p>
        VitalWatch processes sensitive health and location data for emergency response purposes. By using the Service, 
        you consent to the collection, processing, and sharing of this data with emergency contacts and services 
        when necessary for your safety.
      </p>

      <h2>5. Subscription and Payment Terms</h2>
      <p>
        VitalWatch offers subscription plans with different feature sets. By subscribing, you agree to pay all 
        applicable fees. Subscriptions automatically renew unless cancelled. Refunds are handled according to 
        our refund policy.
      </p>

      <h2>6. Privacy and Data Protection</h2>
      <p>
        Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the 
        Service, to understand our practices regarding your personal information.
      </p>

      <h2>7. Prohibited Conduct</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Use the Service for any unlawful purpose or to solicit unlawful acts</li>
        <li>Violate any international, federal, provincial, or state regulations or laws</li>
        <li>Infringe upon or violate our intellectual property rights or the rights of others</li>
        <li>Harass, abuse, insult, harm, defame, or discriminate</li>
        <li>Submit false or misleading health information</li>
        <li>Interfere with or circumvent security features of the Service</li>
        <li>Attempt to access other users' accounts or data</li>
      </ul>

      <h2>8. Emergency Services Disclaimer</h2>
      <p>
        <strong>IMPORTANT:</strong> VitalWatch is not a substitute for professional medical care or emergency services. 
        While we provide AI-powered monitoring and alerts, you should always contact emergency services (911) 
        directly in case of a medical emergency. VitalWatch's emergency features are supplementary tools and 
        should not be relied upon as the sole means of emergency communication.
      </p>

      <h2>9. Limitation of Liability</h2>
      <p>
        VitalWatch shall not be liable for any indirect, incidental, special, consequential, or punitive damages, 
        including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting 
        from your use of the Service.
      </p>

      <h2>10. Termination</h2>
      <p>
        We may terminate or suspend your account immediately, without prior notice or liability, for any reason 
        whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use 
        the Service will cease immediately.
      </p>

      <h2>11. Anti-Theft and Misuse Protection</h2>
      <p>
        <strong>VitalWatch employs advanced protection measures against theft and misuse:</strong>
      </p>
      <ul>
        <li>All code, algorithms, and proprietary methods are protected by copyright and trade secret laws</li>
        <li>Unauthorized reproduction, distribution, or commercial use is strictly prohibited</li>
        <li>We monitor for unauthorized access and will pursue legal action against violators</li>
        <li>Users found attempting to steal, copy, or misuse our technology will face immediate termination and legal consequences</li>
        <li>Our AI models, sensor integration techniques, and emergency response algorithms are confidential and proprietary</li>
      </ul>

      <h2>12. Governing Law</h2>
      <p>
        These Terms shall be interpreted and governed by the laws of the United States, without regard to its 
        conflict of law provisions. Any disputes shall be resolved through binding arbitration.
      </p>

      <h2>13. Changes to Terms</h2>
      <p>
        We reserve the right to modify or replace these Terms at any time. If a revision is material, we will 
        try to provide at least 30 days notice prior to any new terms taking effect.
      </p>

      <h2>14. Contact Information</h2>
      <p>
        If you have any questions about these Terms of Service, please contact us through the VitalWatch 
        application support system.
      </p>

      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
          By using VitalWatch, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
        </p>
      </div>
    </div>
  );
}