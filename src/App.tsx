import { Suspense, lazy } from 'react';
import { BrowserRouter, Navigate, Outlet, Route, Routes, useParams } from 'react-router';
import { Loader } from '@/pages/_components/Loader';
import RootLayout from '@/pages/layout';
import AuthLayout from '@/pages/auth/layout';
import LoginLayout from '@/pages/auth/login/login/layout';
import LoginPage from '@/pages/auth/login/login/page';
import ConfirmMFAPage from '@/pages/auth/login/confirm-mfa/page';
import SignUpPage from '@/pages/auth/signup/signup/page';
import ConfirmSetupMFAPage from '@/pages/auth/signup/confirm/page';
import SetupMFAPage from '@/pages/auth/signup/mfa/page';
import ResetPasswordLayout from '@/pages/auth/reset-password/layout';
import ForgotPasswordPage from '@/pages/auth/reset-password/forgot-password/page';
import ForgotPasswordConfirmPage from '@/pages/auth/reset-password/confirm-password/page';
import ResetMFAPage from '@/pages/auth/reset-mfa/page';
import AuthenticatedLayout from '@/pages/authenticated/layout';
import AuthenticatedDefaultLayout from '@/pages/authenticated/layout_default';
import DashboardLayout from '@/pages/authenticated/layout_dashboard';
// ログイン後の画面はlazyload
const JobList = lazy(async () => await import('@/pages/authenticated/jobs/page'));
const JobDetail = lazy(async () => await import('@/pages/authenticated/jobs/detail/page'));
const JobForm = lazy(async () => await import('@/pages/authenticated/jobs/form/page'));
const HowTo = lazy(async () => await import('@/pages/authenticated/howto/page'));
const Dashboard = lazy(async () => await import('@/pages/authenticated/dashboard/page'));
const Composer = lazy(async () => await import('@/pages/authenticated/composer/page'));
const DeviceList = lazy(async () => await import('@/pages/authenticated/device/page'));
const DeviceDetail = lazy(async () => await import('@/pages/authenticated/device/detail/page'));
const Announcements = lazy(async () => await import('@/pages/authenticated/dashboard/_components/Announcements'));

export const App: React.FunctionComponent = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootLayout />}>
          <Route element={<AuthLayout />} /* 認証関連 */>
            <Route /* login flow */>
              <Route element={<LoginLayout />}>
                <Route path="login" element={<LoginPage />} />
              </Route>
              <Route path="confirm-mfa" element={<ConfirmMFAPage />} />
            </Route>

            <Route /* signup flow */>
              <Route path="signup" element={<SignUpPage />} />
              <Route path="confirm" element={<ConfirmSetupMFAPage />} />
              <Route path="mfa" element={<SetupMFAPage />} />
            </Route>

            <Route element={<ResetPasswordLayout />} /* reset password flow */>
              <Route path="forgot-password" element={<ForgotPasswordPage />} />
              <Route path="confirm-password" element={<ForgotPasswordConfirmPage />} />
            </Route>

            {/* reset password flow */}
            <Route path="mfa-reset" element={<ResetMFAPage />} />
          </Route>

          <Route
            element={
              <Suspense fallback={<Loader />}>
                <Outlet />
              </Suspense>
            } /* 認証後画面を lazyload */
          >
            <Route element={<AuthenticatedLayout />} /* 認証後画面 */>
              <Route element={<AuthenticatedDefaultLayout />}>
                <Route index element={<Navigate to="/dashboard" />} />
                <Route path="jobs">
                  <Route index element={<JobList />} />
                  <Route path=":id" element={<JobDetail />} />
                  <Route path="form" element={<JobForm />} />
                </Route>
                <Route path="howto" element={<HowTo />} />
                <Route path="*" element={<p>Page Not Found</p>} />
                <Route path="composer" element={<Composer />} />
                <Route path="device" element={<DeviceList />} />
                <Route path="device/:id" element={<DeviceDetail />} />
                <Route path="announcements" element={<Announcements />} />
              </Route>

              <Route path="dashboard" element={<DashboardLayout />}>
                <Route index element={<Dashboard />} />
              </Route>
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
