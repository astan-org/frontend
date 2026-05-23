"use client";

import { Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "react-oidc-context";

import DashboardLayout from "@/components/layout/dashboard-layout";
import HomePage from "@/components/home-page";
import AddRequestPage from "@/components/incident-form/add-request-page";
import DeferToPlatform from "@/components/defer-to-platform";
import ConfirmationPage from "@/components/confirmation-page";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  Alert,
  AlertTitle,
  AlertDescription,
} from "@/components/ui/alert";

import { Button } from "@/components/ui/button";
import { useIncidentFlow } from "@/hooks/useIncidentFlow";

function RedirectToVerify({ incidentId }: { incidentId: string }) {
  const router = useRouter();
  useEffect(() => {
    if (incidentId) {
      router.replace(`/verify/${encodeURIComponent(incidentId)}`);
    }
  }, [incidentId, router]);
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 className="h-8 w-8 animate-spin" />
      <p className="mt-3 text-sm text-muted-foreground">Opening identity verification…</p>
    </div>
  );
}

export default function IncidentFlowPage() {
  const auth = useAuth();

  const {
    currentStep,
    isLoading,
    caseId,
    submissionError,
    handleStartReport,
    handleAccountInfoSubmit,
    handleDeferToPlatform,
    handleGoBackFromDefer,
    handleVerificationComplete,
    accountInfoData,
  } = useIncidentFlow();


  useEffect(() => {
  if (auth.isAuthenticated && auth.user?.access_token) {
    localStorage.setItem("accessToken", auth.user.access_token);
  }
}, [auth.isAuthenticated, auth.user]);


  if (auth.isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (auth.error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center">
        <Alert variant="destructive">
          <AlertTitle>Auth Error</AlertTitle>
          <AlertDescription>{auth.error.message}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!auth.isAuthenticated) {
    auth.signinRedirect();
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }



  const renderStepContent = () => {
    switch (currentStep) {
      case "SHOWING_HOMEPAGE":
        return <HomePage onStartReport={handleStartReport} />;
      case "FILLING_ACCOUNT_INFO":
        return (
          <AddRequestPage
            onSubmitAccountInfo={handleAccountInfoSubmit}
            onDeferToPlatform={handleDeferToPlatform}
            initialData={accountInfoData ?? undefined}
          />
        );
      case "DEFER_TO_PLATFORM":
        return <DeferToPlatform onGoBack={handleGoBackFromDefer} />;
      case "PENDING_ID_VERIFICATION":
      if (!accountInfoData || !caseId) {
        return (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="mt-3 text-sm text-muted-foreground">Preparing verification…</p>
          </div>
        );
      }
      return <RedirectToVerify incidentId={caseId} />;

      case "SUBMITTING_INCIDENT":
        return (
          <div className="flex flex-col items-center justify-center text-center py-12">
            <Loader2 className="h-16 w-16 animate-spin text-primary mb-6" />
            <h2 className="text-2xl font-semibold mb-2">Submitting your report…</h2>
            <p className="text-muted-foreground">
              Please wait while we securely submit your information.
            </p>
          </div>
        );
      case "SHOWING_CONFIRMATION":
        return <ConfirmationPage caseId={caseId} onGoHome={handleStartReport} />;
      default:
        return <HomePage onStartReport={handleStartReport} />;
    }
  };

  return (
    <DashboardLayout currentStep={currentStep}>
      {renderStepContent()}
    </DashboardLayout>
  );
}
