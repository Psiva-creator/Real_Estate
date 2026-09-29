'use client';

import React, { useState, useMemo } from 'react';
import { Calculator, IndianRupee, ShieldCheck, ArrowRight, Percent, Calendar } from 'lucide-react';
import { Locale } from '@/lib/i18n';
import { formatINR } from '@/lib/formatters';

interface EmiCalculatorProps {
  propertyPrice: number;
  locale: Locale;
  onConsultFinance?: () => void;
}

export default function EmiCalculator({
  propertyPrice,
  locale,
  onConsultFinance,
}: EmiCalculatorProps) {
  const isTe = locale === 'te';

  // State
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(20);
  const [loanTenureYears, setLoanTenureYears] = useState<number>(20);
  const [interestRateAnnual, setInterestRateAnnual] = useState<number>(8.5);

  // Computed values
  const {
    loanAmount,
    downPaymentAmount,
    monthlyEmi,
    totalInterest,
    totalPayment,
    principalRatio,
    interestRatio,
  } = useMemo(() => {
    const downPayment = Math.round((propertyPrice * downPaymentPercent) / 100);
    const principal = Math.max(0, propertyPrice - downPayment);

    const monthlyRate = interestRateAnnual / (12 * 100);
    const totalMonths = loanTenureYears * 12;

    let emi = 0;
    if (monthlyRate > 0 && totalMonths > 0 && principal > 0) {
      emi = Math.round(
        (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
          (Math.pow(1 + monthlyRate, totalMonths) - 1)
      );
    }

    const totalPaid = emi * totalMonths;
    const interest = Math.max(0, totalPaid - principal);

    const pRatio = totalPaid > 0 ? Math.round((principal / totalPaid) * 100) : 50;
    const iRatio = 100 - pRatio;

    return {
      loanAmount: principal,
      downPaymentAmount: downPayment,
      monthlyEmi: emi,
      totalInterest: interest,
      totalPayment: totalPaid,
      principalRatio: pRatio,
      interestRatio: iRatio,
    };
  }, [propertyPrice, downPaymentPercent, loanTenureYears, interestRateAnnual]);

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E8E2D9] shadow-[0_4px_24px_-4px_rgba(25,21,18,0.04)] space-y-6">
      {/* Header */}
      <div className="border-b border-[#E8E2D9] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#F5F1EA] text-[#8C653E] border border-[#E8E2D9] flex items-center justify-center shrink-0">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#191512]">
              {isTe ? 'హోమ్ & ల్యాండ్ లోన్ EMI కాలిక్యులేటర్' : 'Mortgage & Loan EMI Estimator'}
            </h2>
            <p className="text-xs text-[#8C827A] mt-0.5">
              {isTe
                ? 'తెలంగాణలోని ప్రముఖ జాతీయ బ్యాంకులతో భాగస్వామ్య అంచనా'
                : 'Indicative financing schedule based on SBI, HDFC & ICICI rates in Telangana'}
            </p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full bg-[#FAF8F5] text-[#8C653E] border border-[#E8E2D9] text-xs font-semibold self-start sm:self-auto">
          {interestRateAnnual}% p.a. Avg. Rate
        </span>
      </div>

      {/* Main Grid: Inputs on Left, Visual Outcome on Right */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        {/* Left: Input Controls (7 cols) */}
        <div className="md:col-span-7 space-y-6">
          {/* 1. Down Payment */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-medium text-[#191512]">
              <span>{isTe ? 'డౌన్ పేమెంట్ శాతం' : 'Down Payment'}</span>
              <span className="text-[#8C653E] font-semibold">
                {downPaymentPercent}% ({formatINR(downPaymentAmount)})
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="50"
              step="5"
              value={downPaymentPercent}
              onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
              className="w-full h-2 bg-[#F5F1EA] rounded-lg appearance-none cursor-pointer accent-[#8C653E]"
            />
            <div className="flex justify-between text-[10px] text-[#8C827A]">
              <span>10% (Min)</span>
              <span>20% (Typical)</span>
              <span>50%</span>
            </div>
          </div>

          {/* 2. Loan Tenure */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-medium text-[#191512]">
              <span>{isTe ? 'రుణ కాలవ్యవధి' : 'Loan Tenure'}</span>
              <span className="text-[#8C653E] font-semibold">
                {loanTenureYears} {isTe ? 'సంవత్సరాలు' : 'Years'} ({loanTenureYears * 12} {isTe ? 'నెలలు' : 'Months'})
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="30"
              step="1"
              value={loanTenureYears}
              onChange={(e) => setLoanTenureYears(Number(e.target.value))}
              className="w-full h-2 bg-[#F5F1EA] rounded-lg appearance-none cursor-pointer accent-[#8C653E]"
            />
            <div className="flex justify-between text-[10px] text-[#8C827A]">
              <span>5 Yrs</span>
              <span>15 Yrs</span>
              <span>20 Yrs</span>
              <span>30 Yrs</span>
            </div>
          </div>

          {/* 3. Interest Rate */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-medium text-[#191512]">
              <span>{isTe ? 'వార్షిక వడ్డీ రేటు' : 'Annual Interest Rate'}</span>
              <span className="text-[#8C653E] font-semibold">{interestRateAnnual}%</span>
            </div>
            <input
              type="range"
              min="6.5"
              max="14.0"
              step="0.25"
              value={interestRateAnnual}
              onChange={(e) => setInterestRateAnnual(Number(e.target.value))}
              className="w-full h-2 bg-[#F5F1EA] rounded-lg appearance-none cursor-pointer accent-[#8C653E]"
            />
            <div className="flex justify-between text-[10px] text-[#8C827A]">
              <span>6.5% (Prime)</span>
              <span>8.5% (Standard)</span>
              <span>14.0%</span>
            </div>
          </div>
        </div>

        {/* Right: EMI Card & Proportion Split (5 cols) */}
        <div className="md:col-span-5 bg-[#FAF8F5] border border-[#E8E2D9] rounded-2xl p-6 space-y-5 text-center">
          <div className="space-y-1">
            <span className="text-[11px] font-mono tracking-wider uppercase text-[#8C827A]">
              {isTe ? 'అంచనా వేసిన నెలవారీ EMI' : 'Estimated Monthly EMI'}
            </span>
            <div className="text-2xl sm:text-3xl font-serif font-bold text-[#191512]">
              ₹{monthlyEmi.toLocaleString('en-IN')}
              <span className="text-xs font-sans font-normal text-[#8C827A] ml-1">/ month</span>
            </div>
          </div>

          {/* Ratio bar */}
          <div className="space-y-1.5 text-left">
            <div className="flex justify-between text-[11px]">
              <span className="text-[#191512] font-medium">Principal ({principalRatio}%)</span>
              <span className="text-[#8C653E] font-medium">Interest ({interestRatio}%)</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-[#E8E2D9] overflow-hidden flex">
              <div
                className="bg-[#191512] h-full transition-all duration-300"
                style={{ width: `${principalRatio}%` }}
              />
              <div
                className="bg-[#8C653E] h-full transition-all duration-300"
                style={{ width: `${interestRatio}%` }}
              />
            </div>
          </div>

          {/* Breakdown summary */}
          <div className="pt-2 border-t border-[#E8E2D9] grid grid-cols-2 gap-3 text-left">
            <div>
              <span className="text-[10px] text-[#8C827A] block">
                {isTe ? 'రుణ మొత్తం' : 'Loan Amount'}
              </span>
              <span className="text-xs font-bold text-[#191512]">
                {formatINR(loanAmount)}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-[#8C827A] block">
                {isTe ? 'మొత్తం వడ్డీ' : 'Total Interest'}
              </span>
              <span className="text-xs font-bold text-[#8C653E]">
                {formatINR(totalInterest)}
              </span>
            </div>
          </div>

          {onConsultFinance && (
            <button
              type="button"
              onClick={onConsultFinance}
              className="w-full py-2.5 px-4 rounded-xl bg-[#191512] hover:bg-[#8C653E] text-white text-xs font-semibold tracking-wider uppercase transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              <span>{isTe ? 'బ్యాంక్ లోన్ అడ్వైజర్ సంప్రదింపు' : 'Consult Banking Partner'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
