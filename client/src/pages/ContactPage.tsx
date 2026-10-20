import React, { useState } from 'react';
import { Mail, MessageSquare, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Textarea } from '../components/ui/Input';

export const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      
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
              <span>Direct Channels</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 font-medium block">Technical Inquiries:</span>
                <span className="font-mono text-slate-800">support@zelqora.example.com</span>
              </div>

              <div>
                <span className="text-slate-400 font-medium block">Editorial Corrections:</span>
                <span className="font-mono text-slate-800">editorial@zelqora.example.com</span>
              </div>

              <div>
                <span className="text-slate-400 font-medium block">Security & Disclosure:</span>
                <span className="font-mono text-slate-800">security@zelqora.example.com</span>
              </div>
            </div>
          </Card>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <AlertCircle className="w-4 h-4 text-blue-600" />
              <span>Honest Operational Notice</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-500">
              Zelqora is operated by an independent engineering team. We do not maintain a physical customer walk-in center or phone call center. All inquiries receive responses via email.
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
                  Thank you for contacting Zelqora Engineering. Your message has been routed to our technical reviewers.
                </p>
                <Button size="sm" variant="outline" onClick={() => setSubmitted(false)}>
                  Send Another Message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
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
                  <Button type="submit" size="md" variant="primary" icon={<Send className="w-4 h-4" />}>
                    Send Inquiry
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
