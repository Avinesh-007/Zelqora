import React, { useState } from 'react';
import { Mail, MessageSquare, Send, CheckCircle2, AlertCircle, ExternalLink, Loader2 } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Textarea } from '../components/ui/Input';
import { SEO } from '../components/common/SEO';
import { api } from '../services/api';

export const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await api.submitContact({
        name,
        email,
        subject,
        message
      });
      setSubmitted(true);
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (err: any) {
      setError(err.message || 'Failed to send inquiry. Please try again or submit an issue on GitHub.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <SEO
        title="Contact Zelqora Engineering & Issue Reporting"
        description="Get in touch with the Zelqora technical team to report an issue, suggest a guide correction, or submit technical feedback."
        canonicalPath="/contact"
      />
      
      <div className="space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
          Communications & Technical Inquiries
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Contact Zelqora Engineering
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
          Have feedback on a diagnostic workflow, noticed an error in a technical guide, or want to contribute to our approved documentation registry?
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Contact Info & Details */}
        <div className="space-y-6">
          <Card padding="md" className="border-slate-200 bg-white space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-600" />
              <span>Get in Touch</span>
            </h3>

            <div className="space-y-3.5 text-xs">
              <div>
                <span className="text-slate-400 font-medium block mb-1">Official Contact Email:</span>
                <a
                  href="mailto:aviavinesh1785@gmail.com"
                  className="font-mono text-blue-600 hover:text-blue-800 hover:underline font-semibold break-all inline-flex items-center gap-1.5 text-[13px]"
                >
                  <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>aviavinesh1785@gmail.com</span>
                </a>
              </div>

              <div>
                <span className="text-slate-400 font-medium block">Project Maintainer:</span>
                <span className="font-semibold text-slate-800">Avinesh & Open Source Contributors</span>
              </div>

              <div>
                <span className="text-slate-400 font-medium block">Public Issue Tracker:</span>
                <a
                  href="https://github.com/Avinesh-007/Zelqora/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-mono text-blue-600 hover:text-blue-800 hover:underline"
                >
                  <span>github.com/Avinesh-007/Zelqora</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div>
                <span className="text-slate-400 font-medium block">Direct Web Inquiries:</span>
                <span className="text-slate-700">Submit directly using the secure message form on this page.</span>
              </div>
            </div>
          </Card>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <AlertCircle className="w-4 h-4 text-blue-600" />
              <span>Operational Notice</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-500">
              Zelqora is an open-source technical troubleshooting platform. Direct inquiries submitted through this form are logged in our internal system and reviewed by project maintainers. If you prefer to write to us directly, you can email <a href="mailto:aviavinesh1785@gmail.com" className="text-blue-600 hover:underline font-medium">aviavinesh1785@gmail.com</a>. Sensitive tokens or passwords included in messages are automatically redacted before storage.
            </p>
          </div>
        </div>

        {/* Message Form */}
        <div className="md:col-span-2">
          <Card padding="lg" className="border-slate-200 bg-white">
            {submitted ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <h3 className="text-base font-bold text-slate-900">Message Received</h3>
                <p className="text-xs text-slate-600 max-w-sm mx-auto">
                  Thank you for contacting Zelqora Engineering. Your inquiry has been recorded and will be reviewed by our maintainers.
                </p>
                <Button size="sm" variant="outline" onClick={() => setSubmitted(false)}>
                  Send Another Message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Your Name"
                    placeholder="Alex Morgan"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                  />
                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="alex@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </div>

                <Input
                  label="Subject"
                  placeholder="e.g. Correction for Docker 137 Guide or Feature Suggestion"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  required
                />

                <Textarea
                  label="Message"
                  placeholder="Provide technical feedback, questions, or suggestions..."
                  rows={5}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  required
                />

                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    size="md"
                    variant="primary"
                    disabled={loading}
                    icon={loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  >
                    {loading ? 'Sending...' : 'Send Inquiry'}
                  </Button>
                </div>
              </form>
            )}
          </Card>
        </div>

      </div>

    </div>
  );
};
