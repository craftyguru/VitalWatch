import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div className="prose prose-xs sm:prose-sm max-w-none text-gray-700 dark:text-gray-300">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Privacy Policy</h1>
      <p className="text-xs sm:text-sm text-gray-500 mb-6 sm:mb-8">Last updated: {new Date().toLocaleDateString()}</p>
      
      <h2>1. Introduction</h2>
      <p>
        VitalWatch ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains 
        how we collect, use, disclose, and safeguard your information when you use our AI-powered vital signs 
        monitoring and mental health support application.
      </p>

      <h2>2. Information We Collect</h2>
      
      <h3>2.1 Personal Information</h3>
      <ul>
        <li>Name, email address, and contact information</li>
        <li>Account credentials and profile information</li>
        <li>Emergency contact details</li>
        <li>Billing and payment information</li>
      </ul>

      <h3>2.2 Health and Sensor Data</h3>
      <ul>
        <li>Vital signs data (heart rate, blood pressure, etc.)</li>
        <li>Device sensor information (accelerometer, gyroscope, ambient light)</li>
        <li>Location data for emergency response and safe zone monitoring</li>
        <li>Audio recordings for crisis detection (when enabled)</li>
        <li>Mood tracking and mental health assessments</li>
        <li>Sleep patterns and activity levels</li>
      </ul>

      <h3>2.3 Usage and Technical Data</h3>
      <ul>
        <li>App usage patterns and feature interactions</li>
        <li>Device information and operating system details</li>
        <li>IP address and network connection data</li>
        <li>Crash reports and performance metrics</li>
        <li>AI interaction logs and response patterns</li>
      </ul>

      <h2>3. How We Use Your Information</h2>
      
      <h3>3.1 Core Service Functionality</h3>
      <ul>
        <li>Provide real-time health monitoring and crisis detection</li>
        <li>Send emergency alerts to designated contacts</li>
        <li>Deliver personalized mental health support and coping tools</li>
        <li>Monitor safe zones and location-based safety features</li>
        <li>Process AI-powered threat assessment and intervention</li>
      </ul>

      <h3>3.2 Service Improvement</h3>
      <ul>
        <li>Analyze usage patterns to improve our AI algorithms</li>
        <li>Enhance emergency response accuracy and speed</li>
        <li>Develop new features and safety tools</li>
        <li>Conduct research for better mental health support</li>
      </ul>

      <h3>3.3 Communication</h3>
      <ul>
        <li>Send service notifications and emergency alerts</li>
        <li>Provide customer support and technical assistance</li>
        <li>Deliver subscription and billing information</li>
        <li>Share important safety updates and feature announcements</li>
      </ul>

      <h2>4. Information Sharing and Disclosure</h2>
      
      <h3>4.1 Emergency Situations</h3>
      <p>
        <strong>In emergencies, we may share your information with:</strong>
      </p>
      <ul>
        <li>Your designated emergency contacts</li>
        <li>Emergency services (911, local authorities)</li>
        <li>Healthcare providers when necessary for your safety</li>
        <li>Family members or caregivers (with your consent)</li>
      </ul>

      <h3>4.2 Service Providers</h3>
      <p>We may share information with trusted service providers who assist us in:</p>
      <ul>
        <li>Cloud hosting and data storage (encrypted)</li>
        <li>Payment processing and billing</li>
        <li>Email and SMS communication services</li>
        <li>AI and analytics platforms (anonymized data only)</li>
      </ul>

      <h3>4.3 Legal Requirements</h3>
      <p>We may disclose information when required by law or to:</p>
      <ul>
        <li>Comply with legal processes or government requests</li>
        <li>Protect our rights, property, or safety</li>
        <li>Prevent fraud or illegal activities</li>
        <li>Enforce our Terms of Service</li>
      </ul>

      <h2>5. Data Security and Protection</h2>
      
      <h3>5.1 Security Measures</h3>
      <ul>
        <li><strong>End-to-end encryption</strong> for all sensitive health data</li>
        <li><strong>Advanced authentication</strong> with multi-factor options</li>
        <li><strong>Regular security audits</strong> and penetration testing</li>
        <li><strong>Secure cloud infrastructure</strong> with industry-standard protections</li>
        <li><strong>Data minimization</strong> - we only collect what's necessary</li>
      </ul>

      <h3>5.2 Data Retention</h3>
      <ul>
        <li>Health data: Retained for 7 years or as legally required</li>
        <li>Emergency logs: Retained for 5 years for safety analysis</li>
        <li>Account data: Retained until account deletion</li>
        <li>Usage analytics: Anonymized and retained for service improvement</li>
      </ul>

      <h2>6. Your Privacy Rights and Choices</h2>
      
      <h3>6.1 Access and Control</h3>
      <ul>
        <li><strong>Data Access:</strong> Request copies of your personal information</li>
        <li><strong>Data Correction:</strong> Update or correct inaccurate information</li>
        <li><strong>Data Deletion:</strong> Request deletion of your account and data</li>
        <li><strong>Data Portability:</strong> Export your data in standard formats</li>
      </ul>

      <h3>6.2 Privacy Settings</h3>
      <ul>
        <li>Control location sharing and tracking preferences</li>
        <li>Manage emergency contact access levels</li>
        <li>Choose notification and communication preferences</li>
        <li>Configure AI analysis and personalization settings</li>
        <li>Set data sharing preferences with healthcare providers</li>
      </ul>

      <h2>7. Cookies and Tracking Technologies</h2>
      <p>
        VitalWatch uses essential cookies for authentication and service functionality. We use analytics 
        cookies to improve our service (you can opt out). We do not use advertising or tracking cookies.
      </p>

      <h2>8. Children's Privacy</h2>
      <p>
        VitalWatch is not intended for children under 13. We do not knowingly collect personal information 
        from children under 13. If you are a parent and believe your child has provided us with personal 
        information, please contact us immediately.
      </p>

      <h2>9. International Data Transfers</h2>
      <p>
        Your information may be stored and processed in countries other than your own. We ensure appropriate 
        safeguards are in place to protect your data in accordance with this Privacy Policy and applicable laws.
      </p>

      <h2>10. California Privacy Rights (CCPA)</h2>
      <p>
        California residents have additional rights including the right to know what personal information 
        is collected, to delete personal information, and to opt-out of the sale of personal information. 
        <strong>We do not sell personal information.</strong>
      </p>

      <h2>11. European Privacy Rights (GDPR)</h2>
      <p>
        EU residents have rights including data access, rectification, erasure, restriction, portability, 
        and objection. You also have the right to withdraw consent and lodge complaints with supervisory authorities.
      </p>

      <h2>12. Health Information (HIPAA)</h2>
      <p>
        While VitalWatch is not a covered entity under HIPAA, we implement HIPAA-level security measures 
        to protect your health information and maintain the highest standards of data protection.
      </p>

      <h2>13. Changes to This Privacy Policy</h2>
      <p>
        We may update this Privacy Policy periodically. We will notify you of any material changes via 
        email or app notification. Your continued use of VitalWatch after changes constitutes acceptance 
        of the updated policy.
      </p>

      <h2>14. Contact Us</h2>
      <p>
        If you have questions about this Privacy Policy or want to exercise your privacy rights, 
        please contact us through the VitalWatch application support system or privacy settings.
      </p>

      <div className="mt-8 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
        <p className="text-sm font-medium text-green-900 dark:text-green-100">
          <strong>Your Privacy Matters:</strong> VitalWatch is committed to protecting your privacy while 
          providing life-saving emergency response and mental health support. We use your data responsibly 
          and only for your safety and wellbeing.
        </p>
      </div>
    </div>
  );
}