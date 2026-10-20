import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/layout/Layout';

import { HomePage } from './pages/HomePage';
import { WorkspacePage } from './pages/WorkspacePage';
import { GuidesIndexPage } from './pages/GuidesIndexPage';
import { GuideDetailPage } from './pages/GuideDetailPage';
import { EditorialAdminPage } from './pages/EditorialAdminPage';
import { DocumentationSourcesPage } from './pages/DocumentationSourcesPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';
import { MethodologyPage } from './pages/MethodologyPage';
import { EditorialPolicyPage } from './pages/EditorialPolicyPage';
import { NotFoundPage } from './pages/NotFoundPage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="troubleshoot" element={<WorkspacePage />} />
            <Route path="guides" element={<GuidesIndexPage />} />
            <Route path="guides/:slug" element={<GuideDetailPage />} />
            <Route path="docs/sources" element={<DocumentationSourcesPage />} />
            <Route path="editorial" element={<EditorialAdminPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="privacy" element={<PrivacyPage />} />
            <Route path="terms" element={<TermsPage />} />
            <Route path="methodology" element={<MethodologyPage />} />
            <Route path="editorial-policy" element={<EditorialPolicyPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
