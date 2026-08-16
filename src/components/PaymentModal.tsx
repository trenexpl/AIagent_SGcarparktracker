import React, { useState } from 'react';
import { 
  X, 
  Check, 
  CreditCard, 
  ShieldCheck, 
  Sparkles, 
  Star, 
  Lock, 
  ArrowRight, 
  Zap, 
  QrCode, 
  CheckCircle2, 
  ChevronLeft,
  DollarSign,
  Smartphone,
  AlertCircle
} from 'lucide-react';
import { UserAccount, SubscriptionPlan, PaymentDetails } from '../types/carpark';
import { storageService, SUBSCRIPTION_PLANS } from '../services/storageService';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount | null;
  initialPlan?: 'basic' | 'pro';
  onPaymentSuccess: (updatedUser: UserAccount) => void;
  onOpenAuth: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  initialPlan = 'basic',
  onPaymentSuccess,
  onOpenAuth,
}) => {
  // Navigation inside payment modal: 'select_plan' | 'checkout' | 'success'
  const [viewStep, setViewStep] = useState<'select_plan' | 'checkout' | 'success'>(
    initialPlan ? 'checkout' : 'select_plan'
  );
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'pro'>(initialPlan || 'basic');
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'paynow' | 'apple_pay'>('credit_card');

  // Form Fields
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardholderName, setCardholderName] = useState(currentUser?.name || 'Singapore Driver');
  const [expiryDate, setExpiryDate] = useState('12/28');
  const [cvc, setCvc] = useState('888');
  const [postalCode, setPostalCode] = useState('238801');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const planDetails = SUBSCRIPTION_PLANS[selectedPlan];
  const basicPlan = SUBSCRIPTION_PLANS.basic;
  const proPlan = SUBSCRIPTION_PLANS.pro;

  const handleProceedToCheckout = (planId: 'basic' | 'pro') => {
    setSelectedPlan(planId);
    setViewStep('checkout');
    setErrorMsg(null);
  };

  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth();
      return;
    }

    setErrorMsg(null);
    setIsProcessing(true);

    setTimeout(() => {
      try {
        const paymentInfo: Partial<PaymentDetails> = {
          planId: selectedPlan,
          amount: planDetails.price,
          paymentMethod: paymentMethod,
          cardNumber: cardNumber.replace(/\s+/g, ''),
          cardholderName,
          billingEmail: currentUser.email,
        };

        const result = storageService.updateUserPlan(selectedPlan, paymentInfo);
        setIsProcessing(false);
        setViewStep('success');
        onPaymentSuccess(result.user);
      } catch (err: any) {
        setIsProcessing(false);
        setErrorMsg(err.message || 'Payment failed. Please try again.');
      }
    }, 800);
  };

  const handleFillDemoCard = (brand: string) => {
    if (brand === 'visa') {
      setCardNumber('4242 4242 4242 4242');
      setExpiryDate('08/29');
      setCvc('123');
      setPostalCode('238801');
    } else if (brand === 'mastercard') {
      setCardNumber('5555 5555 5555 4444');
      setExpiryDate('11/28');
      setCvc('888');
      setPostalCode('018956');
    }
  };

  return (
    <div
      id="payment-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
    >
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-150">
        
        {/* TOP MODAL HEADER */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-sky-950 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            {viewStep === 'checkout' && (
              <button
                onClick={() => setViewStep('select_plan')}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Back to Plans"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950">
                  Favorites Membership
                </span>
                <span className="text-xs text-sky-300 font-mono">Monthly Subscription</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                {viewStep === 'select_plan' && 'Choose Your Favorites Plan'}
                {viewStep === 'checkout' && 'Secure Payment Checkout'}
                {viewStep === 'success' && 'Subscription Activated!'}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer shrink-0"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY CONTENT BASED ON STEP */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">

          {/* STEP 1: PLAN SELECTOR */}
          {viewStep === 'select_plan' && (
            <div className="space-y-6">
              <div className="text-center max-w-md mx-auto space-y-1">
                <p className="text-sm text-slate-600">
                  Unlock favorited carpark slots with real-time lot tracking and 1-tap navigation across Singapore.
                </p>
              </div>

              {/* Plan Options Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. BASIC PLAN */}
                <div
                  id="plan-card-basic"
                  className={`rounded-2xl border-2 p-5 transition-all flex flex-col justify-between relative ${
                    selectedPlan === 'basic'
                      ? 'border-sky-500 bg-sky-50/30 ring-2 ring-sky-500/20 shadow-md'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-sky-600 bg-sky-100 px-2 py-0.5 rounded-md">
                          Basic Plan
                        </span>
                        <h3 className="text-xl font-black text-slate-900 mt-1">Basic Driver</h3>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-black text-slate-900">$2.99</div>
                        <div className="text-xs text-slate-500 font-medium">per month</div>
                      </div>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200">
                      <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                        <span>Able to save 5 locations</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Ideal for daily commuters saving home, office, and go-to mall parking.
                      </p>
                    </div>

                    <ul className="space-y-2 text-xs text-slate-600">
                      {basicPlan.features.map((feat, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-sky-600 shrink-0 font-bold" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => handleProceedToCheckout('basic')}
                    id="btn-choose-basic-plan"
                    className="mt-6 w-full py-3 bg-sky-600 hover:bg-sky-700 active:scale-98 text-white font-black text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Purchase Basic · $2.99/mo</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* 2. PRO PLAN */}
                <div
                  id="plan-card-pro"
                  className={`rounded-2xl border-2 p-5 transition-all flex flex-col justify-between relative ${
                    selectedPlan === 'pro'
                      ? 'border-amber-400 bg-amber-50/20 ring-2 ring-amber-400/30 shadow-md'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  {/* Popular Badge */}
                  <div className="absolute -top-3 right-4 px-3 py-0.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-[10px] font-black uppercase tracking-wider rounded-full shadow-sm">
                    Most Popular
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                          Pro Plan
                        </span>
                        <h3 className="text-xl font-black text-slate-900 mt-1">Pro Unlimited</h3>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-black text-slate-900">$5.99</div>
                        <div className="text-xs text-slate-500 font-medium">per month</div>
                      </div>
                    </div>

                    <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200">
                      <div className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-amber-600 fill-amber-400" />
                        <span>Able to save UNLIMITED locations</span>
                      </div>
                      <p className="text-[11px] text-amber-800 mt-1">
                        Save all your favorite carparks across Singapore with no limits.
                      </p>
                    </div>

                    <ul className="space-y-2 text-xs text-slate-600">
                      {proPlan.features.map((feat, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-amber-600 shrink-0 font-bold" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => handleProceedToCheckout('pro')}
                    id="btn-choose-pro-plan"
                    className="mt-6 w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-98 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Purchase Pro · $5.99/mo</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Trust Footer */}
              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Cancel anytime with no penalties
                </span>
                <span className="flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-sky-600" />
                  256-bit encrypted checkout
                </span>
              </div>
            </div>
          )}

          {/* STEP 2: PAYMENT PAGE / CHECKOUT FORM */}
          {viewStep === 'checkout' && (
            <div className="space-y-6">
              {/* Order Summary Box */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase text-sky-600 bg-sky-100 px-2 py-0.5 rounded-md">
                      Selected Plan
                    </span>
                    <h3 className="font-extrabold text-base text-slate-900">
                      {selectedPlan === 'basic' ? 'Basic Plan ($2.99/mo)' : 'Pro Plan ($5.99/mo)'}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {selectedPlan === 'basic' 
                      ? 'Able to save 5 locations to your account favorites.' 
                      : 'Able to save unlimited locations to your account favorites.'}
                  </p>
                </div>

                <div className="text-right shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200">
                  <div className="text-2xl font-black text-slate-900">
                    SGD ${planDetails.price.toFixed(2)}
                  </div>
                  <div className="text-[11px] text-slate-500">Billed monthly (recurring)</div>
                </div>
              </div>

              {/* Payment Methods Tabs */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Select Payment Method:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('credit_card')}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                      paymentMethod === 'credit_card'
                        ? 'border-sky-500 bg-sky-50 text-sky-800 ring-2 ring-sky-500/20'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Credit / Debit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('paynow')}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                      paymentMethod === 'paynow'
                        ? 'border-sky-500 bg-sky-50 text-sky-800 ring-2 ring-sky-500/20'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <QrCode className="w-4 h-4 text-purple-600" />
                    <span>PayNow SG</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('apple_pay')}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                      paymentMethod === 'apple_pay'
                        ? 'border-sky-500 bg-sky-50 text-sky-800 ring-2 ring-sky-500/20'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <Smartphone className="w-4 h-4 text-slate-800" />
                    <span>Apple / GPay</span>
                  </button>
                </div>
              </div>

              {/* Payment Details Form */}
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {paymentMethod === 'credit_card' && (
                <form onSubmit={handleProcessPayment} className="space-y-4">
                  {/* Card Quick Fill for testing */}
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500">Test Autofill:</span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleFillDemoCard('visa')}
                        className="px-2 py-0.5 bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-sky-700 border border-slate-200 rounded text-[11px] font-bold cursor-pointer"
                      >
                        Autofill Visa
                      </button>
                      <button
                        type="button"
                        onClick={() => handleFillDemoCard('mastercard')}
                        className="px-2 py-0.5 bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-sky-700 border border-slate-200 rounded text-[11px] font-bold cursor-pointer"
                      >
                        Autofill Mastercard
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Card Number
                    </label>
                    <div className="relative">
                      <CreditCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="4242 4242 4242 4242"
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-mono text-slate-900 focus:outline-hidden focus:border-sky-500 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Expires (MM/YY)
                      </label>
                      <input
                        type="text"
                        required
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(e.target.value)}
                        placeholder="MM/YY"
                        className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-mono text-slate-900 focus:outline-hidden focus:border-sky-500 transition-all text-center"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        CVC / CVV
                      </label>
                      <input
                        type="text"
                        required
                        value={cvc}
                        onChange={(e) => setCvc(e.target.value)}
                        placeholder="888"
                        className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-mono text-slate-900 focus:outline-hidden focus:border-sky-500 transition-all text-center"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        SG Postal Code
                      </label>
                      <input
                        type="text"
                        required
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        placeholder="238801"
                        className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-mono text-slate-900 focus:outline-hidden focus:border-sky-500 transition-all text-center"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      required
                      value={cardholderName}
                      onChange={(e) => setCardholderName(e.target.value)}
                      placeholder="Name on card"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-hidden focus:border-sky-500 transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessing}
                    id="btn-complete-payment"
                    className="w-full py-3.5 bg-sky-600 hover:bg-sky-700 active:scale-98 text-white font-black text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        Processing SGD ${planDetails.price.toFixed(2)} Payment...
                      </span>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>Pay SGD ${planDetails.price.toFixed(2)} / Month</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {paymentMethod === 'paynow' && (
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-4">
                  <div className="w-40 h-40 mx-auto bg-white p-3 rounded-2xl border-2 border-purple-300 shadow-sm flex flex-col items-center justify-center">
                    <QrCode className="w-28 h-28 text-purple-900" />
                    <span className="text-[10px] font-black text-purple-700 mt-1">SCAN VIA DBS/OCBC/UOB</span>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-500">PayNow UEN: 202618999W (What The Park SG)</div>
                    <div className="text-sm font-black text-slate-900 mt-0.5">Amount: SGD ${planDetails.price.toFixed(2)}</div>
                  </div>
                  <button
                    onClick={handleProcessPayment}
                    disabled={isProcessing}
                    className="w-full py-3 bg-purple-700 hover:bg-purple-800 text-white font-black text-sm rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    {isProcessing ? 'Verifying PayNow Transfer...' : 'I have completed PayNow transfer'}
                  </button>
                </div>
              )}

              {paymentMethod === 'apple_pay' && (
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-4">
                  <Smartphone className="w-12 h-12 text-slate-800 mx-auto" />
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900">1-Tap Fast Checkout</h4>
                    <p className="text-xs text-slate-500 mt-1">Biometric confirmation with Apple Pay / Google Wallet</p>
                  </div>
                  <button
                    onClick={handleProcessPayment}
                    disabled={isProcessing}
                    className="w-full py-3.5 bg-black hover:bg-slate-900 text-white font-black text-sm rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Pay with Apple Pay / GPay (${planDetails.price.toFixed(2)})</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: PAYMENT SUCCESS CONFIRMATION */}
          {viewStep === 'success' && (
            <div className="py-6 text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto ring-8 ring-emerald-50">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-2 max-w-md mx-auto">
                <h3 className="text-2xl font-black text-slate-900">
                  Welcome to {planDetails.name}!
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Your monthly subscription is active. You can now save{' '}
                  <strong>
                    {selectedPlan === 'basic' ? 'up to 5 favorite locations' : 'unlimited favorite locations'}
                  </strong>{' '}
                  to your account with live availability sync.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 max-w-sm mx-auto text-left space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Plan:</span>
                  <span className="font-bold text-slate-900">{planDetails.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Favorite Allowance:</span>
                  <span className="font-black text-emerald-700">
                    {selectedPlan === 'basic' ? '5 Locations' : 'Unlimited Locations'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Billed:</span>
                  <span className="font-bold text-slate-900">${planDetails.price.toFixed(2)} / Month</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status:</span>
                  <span className="font-bold text-emerald-600">Active</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="py-3 px-8 bg-sky-600 hover:bg-sky-700 active:scale-95 text-white font-black text-sm rounded-xl shadow-lg transition-all cursor-pointer"
              >
                Go to Favorites &amp; Explore
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
