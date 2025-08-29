import { ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to VitalWatch
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Privacy Policy
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 prose prose-gray dark:prose-invert max-w-none">
          <h2>Introduction</h2>
          <p>
            VitalWatch ("we," "our," or "us") is committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our emergency monitoring and mental health support application.
          </p>

          <h2>Information We Collect</h2>
          
          <h3>Personal Information</h3>
          <ul>
            <li><strong>Account Information:</strong> Name, email address, phone number, emergency contacts</li>
            <li><strong>Health Data:</strong> Mood entries, mental health assessments, biometric data (heart rate, stress levels)</li>
            <li><strong>Location Data:</strong> GPS coordinates for emergency response and safety zone monitoring</li>
            <li><strong>Audio Recordings:</strong> Emergency audio recordings for crisis analysis and evidence</li>
            <li><strong>Device Information:</strong> Sensor data from connected devices, accelerometer, gyroscope readings</li>
          </ul>

          <h3>Usage Information</h3>
          <ul>
            <li>App usage patterns and feature interactions</li>
            <li>Emergency alert triggers and response times</li>
            <li>Coping tool usage and effectiveness metrics</li>
            <li>Chat messages with our AI support system</li>
          </ul>

          <h2>How We Use Your Information</h2>
          
          <h3>Emergency Response</h3>
          <ul>
            <li>Detect and respond to emergency situations automatically</li>
            <li>Contact emergency services and designated contacts</li>
            <li>Provide location information to first responders</li>
            <li>Analyze audio recordings for threat assessment</li>
          </ul>

          <h3>Mental Health Support</h3>
          <ul>
            <li>Provide personalized mental health insights and recommendations</li>
            <li>Track mood patterns and identify potential crises</li>
            <li>Offer tailored coping strategies and interventions</li>
            <li>Generate AI-powered support responses</li>
          </ul>

          <h3>Service Improvement</h3>
          <ul>
            <li>Improve our AI algorithms for better emergency detection</li>
            <li>Enhance mental health support features</li>
            <li>Analyze usage patterns to optimize user experience</li>
            <li>Conduct research to advance emergency response technology</li>
          </ul>

          <h2>Information Sharing</h2>
          
          <h3>Emergency Situations</h3>
          <p>
            In emergency situations, we may share your information with:
          </p>
          <ul>
            <li>Emergency services (911, police, fire, medical)</li>
            <li>Your designated emergency contacts</li>
            <li>Healthcare providers involved in your care</li>
            <li>Legal authorities when required by law</li>
          </ul>

          <h3>Service Providers</h3>
          <p>
            We work with trusted service providers who assist in delivering our services:
          </p>
          <ul>
            <li><strong>Cloud Storage:</strong> Secure data storage and backup</li>
            <li><strong>AI Processing:</strong> OpenAI for mental health analysis and support</li>
            <li><strong>Communication:</strong> SMS and email service providers for alerts</li>
            <li><strong>Analytics:</strong> Usage analytics to improve our services</li>
          </ul>

          <h2>Data Security</h2>
          <p>
            We implement industry-standard security measures to protect your information:
          </p>
          <ul>
            <li><strong>Encryption:</strong> All data is encrypted in transit and at rest</li>
            <li><strong>Access Control:</strong> Strict access controls and authentication</li>
            <li><strong>Regular Audits:</strong> Security assessments and vulnerability testing</li>
            <li><strong>Compliance:</strong> HIPAA-compliant data handling for health information</li>
          </ul>

          <h2>Your Rights</h2>
          
          <h3>Data Access and Control</h3>
          <ul>
            <li><strong>Access:</strong> View all personal data we have collected</li>
            <li><strong>Correction:</strong> Update or correct inaccurate information</li>
            <li><strong>Deletion:</strong> Request deletion of your personal data</li>
            <li><strong>Portability:</strong> Export your data in a standard format</li>
            <li><strong>Opt-out:</strong> Disable specific features or data collection</li>
          </ul>

          <h3>Emergency Data Retention</h3>
          <p>
            For safety and legal compliance, some emergency-related data may be retained even after account deletion, including:
          </p>
          <ul>
            <li>Emergency incident reports and audio recordings</li>
            <li>Communication logs with emergency services</li>
            <li>Data required for ongoing legal proceedings</li>
          </ul>

          <h2>Children's Privacy</h2>
          <p>
            VitalWatch is not intended for children under 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.
          </p>

          <h2>International Data Transfers</h2>
          <p>
            Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your information in accordance with this Privacy Policy and applicable laws.
          </p>

          <h2>Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any material changes by:
          </p>
          <ul>
            <li>Posting the updated policy in the app</li>
            <li>Sending you an email notification</li>
            <li>Displaying a prominent notice in the app</li>
          </ul>

          <h2>Contact Information</h2>
          <p>
            If you have questions about this Privacy Policy or your personal information, please contact us:
          </p>
          <ul>
            <li><strong>Email:</strong> privacy@vitalwatch.app</li>
            <li><strong>Phone:</strong> 1-800-VITAL-WATCH (1-800-848-2592)</li>
            <li><strong>Address:</strong> VitalWatch Privacy Team, [Your Business Address]</li>
          </ul>

          <h2>Emergency Contact</h2>
          <p>
            <strong>For immediate emergencies, always call 911.</strong> This Privacy Policy does not limit our ability to share information necessary for emergency response and your safety.
          </p>

          <div className="bg-blue-50 dark:bg-blue-950/30 p-6 rounded-lg mt-8">
            <h3 className="text-blue-900 dark:text-blue-100 mb-2">Your Safety Is Our Priority</h3>
            <p className="text-blue-800 dark:text-blue-200 mb-0">
              VitalWatch is designed to protect you in emergency situations. While we are committed to your privacy, your safety always comes first. In life-threatening situations, we will share necessary information with emergency responders to ensure you receive help.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}